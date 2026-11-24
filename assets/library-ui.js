/* Offline resource catalogue. All inquiry records come from the local export. */
(function () {
  'use strict';

  const labels = {
    companies: '企业库', technology: '技术与底座库', projects: '项目与场景库',
    cases: '案例库', prices: '软硬件价格库'
  };
  const hints = {
    companies: '企业名称、能力或服务场景', technology: '技术名称、底座或适用项目',
    projects: '项目名称、场景或申报单位', cases: '案例名称、场景或询价设备',
    prices: '询价项、设备、品牌、型号或凭证编号'
  };
  const demo = '平台演示数据';
  const evidence = '询价导出数据';
  const caseId = 'video-conference';
  const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 6 });
  const showNumber = value => value == null || value === '' ? '未提供' : number.format(value);
  const text = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fallback = value => value == null || value === '' ? '未提供' : String(value);
  const attr = text;
  const sourceLink = (url, caption) => /^https?:\/\//i.test(String(url || ''))
    ? `<a class="lib-source" href="${attr(url)}" target="_blank" rel="noopener noreferrer">${text(caption)} <span aria-hidden="true">↗</span></a>` : '';
  const blank = { project: {}, items: [], quotes: [] };
  let host, state, entries, conf, config;
  let byItem, quotesByItem;
  let trail = [];
  let queued;

  function makeRows() {
    const lists = { companies: [], technology: [], projects: [], cases: [], prices: [] };
    const projects = config.projects || [];
    const tech = new Map();
    for (const [key, company] of Object.entries(config.enterprises || {})) {
      const matches = projects.flatMap((p, index) => {
        const match = p.matches.find(m => m.ent === key);
        return match ? [{ project: p, index, match }] : [];
      });
      lists.companies.push({ id: key, title: company.name, sub: company.profile, group: '候选企业',
        source: demo, terms: matches.map(m => [m.project.name, ...m.match.reasons].join(' ')).join(' '), data: matches });
    }
    projects.forEach((p, index) => {
      lists.projects.push({ id: 'p-' + index, title: p.name, sub: p.scenes.join(' · '), group: '评估项目',
        source: demo, terms: [p.unit, ...p.tags, ...p.reuse].join(' '), data: p });
      [['可复用底座与组件', p.reuse], ['需求能力', p.tags]].forEach(([type, names]) => {
        names.forEach(name => {
          if (!tech.has(name)) tech.set(name, { id: 't-' + tech.size, title: name, group: type, source: demo, projects: [] });
          tech.get(name).projects.push({ project: p, index });
        });
      });
    });
    for (const row of tech.values()) {
      row.sub = row.projects.map(x => x.project.scenes.join(' / ')).join(' · ');
      row.terms = row.projects.map(x => x.project.name).join(' ');
      lists.technology.push(row);
    }
    (config.scenes || []).forEach((s, i) => lists.projects.push({ id: 'scene-' + i,
      title: s.name, sub: s.d, group: '业务场景', source: demo,
      data: projects.map((p, index) => ({ project: p, index })).filter(x => x.project.scenes.includes(s.name)) }));
    const video = conf.items.length > 0;
    if (video) {
      const subject = { id: caseId, title: conf.project.name || '视频会议系统',
        sub: `${conf.items.length} 个询价项 · ${conf.quotes.length} 条凭证`, source: evidence,
        terms: conf.items.map(i => i.name).join(' ') };
      lists.cases.push({ ...subject, group: '询价档案' });
      lists.projects.unshift({ ...subject, group: '询价项目' });
    }
    (config.cases || []).forEach((c, i) => lists.cases.push({ id: 'case-' + i, title: c.name,
      sub: c.scene + ' · ' + c.verdict, group: '评估案例', source: demo, terms: c.unit, data: c }));
    for (const q of conf.quotes) {
      const item = byItem.get(q.itemId);
      const identity = [q.brand, q.model].filter(Boolean).join(' · ');
      lists.prices.push({ id: String(q.id), title: q.deviceName || q.rawName || '设备信息未提供',
        sub: [item?.name, identity || '品牌型号未提供'].filter(Boolean).join(' / '),
        group: q.priceType || '待确认', source: evidence,
        terms: [q.id, q.code, q.rawName, q.sourceTitle, q.unitPrice, item?.category].filter(v => v != null).join(' '), data: q });
    }
    return lists;
  }

  function rowById(group, id) { return entries[group]?.find(e => e.id === id); }
  function fieldGrid(pairs) {
    return '<dl class="lib-fields">' + pairs.map(([label, value]) =>
      `<div><dt>${text(label)}</dt><dd>${text(fallback(value))}</dd></div>`).join('') + '</dl>';
  }
  function cross(group, id, label) {
    return `<button type="button" class="lib-link" data-go="${attr(group)}" data-id="${attr(id)}">${text(label)} <span aria-hidden="true">↗</span></button>`;
  }
  function chips(values) { return '<div class="lib-chips">' + values.map(v => `<span>${text(v)}</span>`).join('') + '</div>'; }
  function links(items) { return '<div class="lib-links">' + items.join('') + '</div>'; }
  function section(title, html) { return `<section class="lib-section"><h4>${text(title)}</h4>${html}</section>`; }
  function note(s) { return `<p class="lib-note">${text(s)}</p>`; }
  function newState(group, id) { return { group, id: id == null ? '' : String(id), query: '', filter: '', page: 0, item: '', paramStatus: '' }; }
  function allGroups(group) { return [...new Set(entries[group].map(e => e.group))]; }
  function labelPrice(q) {
    if (q.unitPrice == null) return '单价未提供';
    return showNumber(q.unitPrice) + ' 元' + (q.unit ? '/' + q.unit : '（计量单位未提供）');
  }

  function inquiryCase() {
    const item = byItem.get(state.item) || conf.items[0];
    if (!item) return note('未找到询价条目。');
    const quoted = quotesByItem.get(item.id) || [];
    const count = conf.quotes.filter(q => q.unitPrice != null).length;
    const params = conf.quotes.reduce((sum, q) => sum + q.parameters.length, 0);
    const options = conf.items.map(i =>
      `<option value="${attr(i.id)}" ${i.id === item.id ? 'selected' : ''}>${text(i.name)}</option>`).join('');
    const table = quoted.map(q => `<tr><th scope="row">${text(q.deviceName || q.rawName || '设备信息未提供')}<small>${text([q.brand, q.model].filter(Boolean).join(' · ') || '品牌型号未提供')}</small></th>
      <td class="lib-number">${text(labelPrice(q))}</td><td>${q.parameters.length ? q.parameters.filter(p => p.status === 1 || p.status === 2).length + ' / ' + q.parameters.length : '未提供'}</td><td>${cross('prices', String(q.id), q.code || '凭证明细')}<small>#${text(q.id)}</small></td></tr>`).join('');
    return `<div class="lib-metrics"><div><strong>${conf.items.length}</strong><span>询价项</span></div><div><strong>${count}<em> / ${conf.quotes.length}</em></strong><span>有单价的凭证</span></div><div><strong>${params}</strong><span>参数比对明细</span></div></div>
      <div class="lib-section"><div class="lib-sectionhead"><h4>按询价项核对凭证</h4><label class="lib-selectwrap"><span class="lib-a11y">选择询价项</span><select data-inquiry>${options}</select></label></div>
      <p class="lib-inline">申报数量 ${text(fallback(item.quantity))}${item.applicationUnit ? ' ' + text(item.applicationUnit) : ''} · ${quoted.length} 条来源凭证</p>
      <div class="lib-tablebox"><table><thead><tr><th>设备 / 型号</th><th>凭证单价</th><th>符合或优于 / 参数总数</th><th>凭证编号</th></tr></thead><tbody>${table}</tbody></table></div>
      ${note('点击凭证编号查看来源、报价口径以及逐项匹配结果。相同设备名称可能有不同型号、配置和计量单位。')}</div>
      ${sourceLink(item.sourceUrl || conf.project.sourceUrl, '在 AI 询价喵查看该询价项')}`;
  }

  function quoteDetail(row) {
    const q = row.data;
    const item = byItem.get(q.itemId);
    const counts = new Map();
    for (const p of q.parameters) counts.set(p.statusLabel, 1 + (counts.get(p.statusLabel) || 0));
    const chosen = state.paramStatus || '';
    const parameters = q.parameters.filter(p => !chosen || p.statusLabel === chosen);
    const filter = counts.size ? `<label class="lib-selectwrap"><span class="lib-a11y">筛选参数匹配结果</span><select data-param-filter><option value="">全部结果（${q.parameters.length}）</option>${[...counts].map(([s, n]) => `<option value="${attr(s)}" ${s === chosen ? 'selected' : ''}>${text(s)}（${n}）</option>`).join('')}</select></label>` : '';
    const parametersHTML = parameters.map(p =>
      `<li><div><span class="lib-paramstatus" data-status="${attr(p.status)}">${text(p.statusLabel)}</span><strong>${text(fallback(p.description))}</strong></div>${p.remark ? `<p>${text(p.remark)}</p>` : ''}<small>原表第 ${text(p.row)} 行</small></li>`).join('');
    const rate = q.matchRate == null ? '未提供' : number.format(Math.round(q.matchRate * 10000) / 100) + '%';
    return `<div class="lib-price-readout"><div><small>凭证单价</small><strong>${text(q.unitPrice == null ? '未提供' : showNumber(q.unitPrice))}</strong><span>${q.unitPrice == null ? '' : '元' + (q.unit ? ' / ' + text(q.unit) : '（计量单位未提供）')}</span></div>
      <div><small>凭证编号 · #${text(q.id)}</small><b>${text(fallback(q.code))}</b></div></div>
      ${fieldGrid([['询价项', item?.name], ['品牌 / 型号', [q.brand, q.model].filter(Boolean).join(' · ')],
        ['凭证数量 / 单位', [q.quantity == null ? '数量未提供' : q.quantity, q.unit || '单位未提供'].join(' ')], ['凭证总价', q.totalPrice == null ? null : showNumber(q.totalPrice) + ' 元'],
        ['来源日期', q.sourceDate], ['来源匹配率', rate]])}
      ${note('软硬件分类按设备描述整理。价格按凭证的原始数量和计量单位展示，仅作询价参考。')}
      ${section('凭证来源', `<p class="lib-bodycopy">${text(q.sourceTitle || '导出凭证未列来源标题')}</p>${note('附件 inquiry_vouchers.csv · 第 ' + q.row + ' 行，参数明细见 param_match_detail.csv。')}${sourceLink(q.sourceUrl, '打开原始来源')} ${sourceLink(item?.sourceUrl || conf.project.sourceUrl, '打开询价项')}`)}
      <div class="lib-section"><div class="lib-sectionhead"><h4>技术参数比对</h4>${filter}</div>${parametersHTML ? `<ol class="lib-params">${parametersHTML}</ol>` : note('这条凭证没有导出参数比对明细。')}</div>
      ${links([cross('cases', caseId, '返回视频会议询价档案')])}`;
  }

  function detailBody(row) {
    if (state.group === 'prices') return quoteDetail(row);
    if (row.id === caseId && state.group === 'cases') return inquiryCase();
    if (row.id === caseId && state.group === 'projects') return fieldGrid([
      ['业务场景', '视频会议系统询价'], ['询价项', conf.items.length + ' 个'], ['凭证数量', conf.quotes.length + ' 条']
    ]) + section('询价范围', chips(conf.items.map(i => i.name))) + links([cross('cases', caseId, '查阅询价档案与价格依据')]);
    if (state.group === 'companies') {
      return note(row.sub) + section('在不同项目中的匹配记录', row.data.map(({ project, index, match }) =>
        `<div class="lib-rel">${cross('projects', 'p-' + index, project.name)}${chips(match.reasons)}<p>待核验 · ${text(match.risk)}</p></div>`).join(''));
    }
    if (state.group === 'technology') {
      return fieldGrid([['资源类型', row.group], ['关联项目', row.projects.length + ' 项']]) +
        section('适用项目与需求', row.projects.map(({ project, index }) =>
          `<div class="lib-rel">${cross('projects', 'p-' + index, project.name)}<p>${text(project.scenes.join(' / '))}</p></div>`).join(''));
    }
    if (state.group === 'projects') {
      if (row.group === '业务场景') {
        return note(row.sub) + section('关联申报项目', row.data.length
          ? links(row.data.map(x => cross('projects', 'p-' + x.index, x.project.name))) : note('当前申报样本中尚无关联项目。'));
      }
      const p = row.data;
      const capabilities = [...p.tags, ...p.reuse].map(name => entries.technology.find(t => t.title === name)).filter(Boolean);
      return fieldGrid([['申报单位', p.unit], ['评估状态', p.status], ['申报金额', showNumber(p.declared) + ' 万元'], ['业务场景', p.scenes.join(' / ')]]) +
        section('需求能力与复用对象', links(capabilities.map(t => cross('technology', t.id, t.title)))) +
        section('候选企业', links(p.matches.map(m => cross('companies', m.ent, config.enterprises[m.ent].name))));
    }
    const c = row.data;
    const project = entries.projects.find(p => p.title === row.title);
    return fieldGrid([['申报单位', c.unit], ['场景', c.scene], ['申报金额', showNumber(c.from) + ' 万元'], ['核定金额', showNumber(c.to) + ' 万元'],
      ['核减率', c.cut + '%'], ['综合得分', c.score], ['评估建议', c.verdict]]) +
      section(c.veto ? '风险说明' : '候选企业', c.veto ? note(c.veto) : links(c.ents.map(name => {
        const company = entries.companies.find(e => e.title === name);
        return company ? cross('companies', company.id, name) : text(name);
      }))) + (project ? links([cross('projects', project.id, '查看对应申报项目')]) : '');
  }

  function matchingRows() {
    const input = state.query.normalize('NFKC').trim().toLocaleLowerCase();
    return entries[state.group].filter(row => {
      if (state.filter && row.group !== state.filter) return false;
      return input.split(/\s+/).every(q => [row.title, row.sub, row.group, row.source, row.terms].join(' ').normalize('NFKC').toLocaleLowerCase().includes(q));
    });
  }
  const pageSize = 6;
  function renderDetail(row) {
    const content = host.querySelector('.lib-detail');
    content.innerHTML = row ? `<header class="lib-detailhead"><div class="lib-type"><i></i>${text(row.group)}<span>${text(row.source)}</span></div>
      <h3 tabindex="-1">${text(row.title)}</h3></header>${detailBody(row)}` :
      '<div class="lib-detailblank">选择一条记录即可查看详情</div>';
  }
  function renderResults() {
    const records = matchingRows();
    const pages = Math.max(1, Math.ceil(records.length / pageSize));
    state.page = Math.max(0, Math.min(state.page, pages - 1));
    const start = state.page * pageSize;
    const visible = records.slice(start, start + pageSize);
    if (!visible.some(r => r.id === state.id)) {
      state.id = visible[0]?.id || '';
      state.item = state.paramStatus = '';
    }
    host.querySelector('.lib-count').textContent = `共 ${records.length} 条`;
    host.querySelector('.lib-list').innerHTML = visible.length ? visible.map(row =>
      `<button type="button" class="lib-row" data-pick="${attr(row.id)}" aria-pressed="${row.id === state.id}">
      <span class="lib-rowtype">${text(row.group)}${state.group === 'prices' ? ' · ' + text(labelPrice(row.data)) : ''}</span>
      <strong>${text(row.title)}</strong><small>${text(row.sub)}</small><i aria-hidden="true">↗</i></button>`).join('') :
      '<div class="lib-empty"><strong>没有找到记录</strong><p>试试更短的关键词，或清除分类。</p><button type="button" class="lib-link" data-reset>清空筛选 ↺</button></div>';
    host.querySelector('.lib-pager').innerHTML = pages > 1 ? `<button type="button" data-page="-1" aria-label="上一页" ${state.page === 0 ? 'disabled' : ''}>←</button>
      <span>${state.page + 1} / ${pages}</span><button type="button" data-page="1" aria-label="下一页" ${state.page + 1 === pages ? 'disabled' : ''}>→</button>` : '';
    renderDetail(rowById(state.group, state.id));
  }
  function render() {
    const tabs = Object.entries(labels).map(([key, label]) => `<button type="button" role="tab" id="lib-tab-${key}" aria-controls="lib-tabpanel" data-group="${key}" aria-selected="${state.group === key}" tabindex="${key === state.group ? '0' : '-1'}">${label}<small>${entries[key].length}</small></button>`).join('');
    const filters = allGroups(state.group).map(f => `<option value="${attr(f)}" ${f === state.filter ? 'selected' : ''}>${text(f)}</option>`).join('');
    host.innerHTML = `<div class="lib-inner"><nav class="lib-tabs" role="tablist" aria-label="选择资源库">${tabs}</nav>
      <div id="lib-tabpanel" role="tabpanel" aria-labelledby="lib-tab-${state.group}"><div class="lib-tools">
      <div class="lib-heading"><h2>${labels[state.group]}</h2><span class="lib-count" role="status"></span></div>
      <div class="lib-controls"><label class="lib-search"><span class="lib-glass" aria-hidden="true"></span><input type="search" data-query autocomplete="off" aria-label="搜索${labels[state.group]}" placeholder="${hints[state.group]}" value="${attr(state.query)}"></label>
      ${allGroups(state.group).length > 1 ? `<label class="lib-selectwrap"><span class="lib-a11y">筛选记录分类</span><select data-filter><option value="">全部分类</option>${filters}</select></label>` : ''}</div></div>
      ${trail.length ? '<button type="button" class="lib-back" data-back>← 返回上一条浏览记录</button>' : ''}
      <div class="lib-layout"><div class="lib-results"><div class="lib-list"></div><div class="lib-pager"></div></div>
      <article class="lib-detail" aria-label="记录详情"></article></div></div></div>`;
    renderResults();
  }
  function jump(group, id, fromLink) {
    if (!labels[group]) return;
    if (fromLink) trail.push({ ...state });
    else trail = [];
    const via = state;
    state = newState(group, id);
    if (id) {
      const index = entries[group].findIndex(r => r.id === state.id);
      state.page = Math.floor(Math.max(0, index) / pageSize);
      if (via.group === 'prices' && group === 'cases' && id === caseId) state.item = rowById('prices', via.id)?.data?.itemId || '';
    }
    render();
  }
  function focusDetail(scroll) {
    const title = host.querySelector('.lib-detail h3');
    if (!title) return;
    title.focus({ preventScroll: true });
    if (scroll && (matchMedia('(max-width: 800px)').matches || title.getBoundingClientRect().top < 60)) {
      title.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }
  function mount() {
    host = document.getElementById('library-app');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = 'true';
    conf = window.ConferenceData || blank;
    config = window.CONFIG || {};
    byItem = new Map(conf.items.map(i => [i.id, i]));
    quotesByItem = new Map(conf.items.map(i => [i.id, conf.quotes.filter(q => q.itemId === i.id)]));
    entries = makeRows();
    state = newState('cases', caseId);
    if (queued && labels[queued.group]) { jump(queued.group, queued.id, false); queued = null; }
    else render();
    host.addEventListener('input', e => {
      if (!e.target.matches('[data-query]')) return;
      state.query = e.target.value; state.page = 0; renderResults();
    });
    host.addEventListener('change', e => {
      if (e.target.matches('[data-filter]')) { state.filter = e.target.value; state.page = 0; renderResults(); }
      if (e.target.matches('[data-inquiry],[data-param-filter]')) {
        const item = e.target.matches('[data-inquiry]');
        if (item) state.item = e.target.value;
        else state.paramStatus = e.target.value;
        renderDetail(rowById(state.group, state.id));
        host.querySelector(item ? '[data-inquiry]' : '[data-param-filter]')?.focus({ preventScroll: true });
      }
    });
    host.addEventListener('keydown', e => {
      const tab = e.target.closest('[data-group]');
      if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
        e.preventDefault(); e.stopPropagation();
        const keys = Object.keys(labels);
        const current = keys.indexOf(state.group);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? keys.length - 1 :
          (current + (e.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
        jump(keys[next], null, false);
        host.querySelector('[aria-selected="true"]').focus();
      } else if (e.target.closest('input,select,button,a')) e.stopPropagation();
    });
    host.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button) return;
      if (button.matches('[data-group]')) {
        jump(button.dataset.group, null, false);
        host.querySelector('[aria-selected="true"]').focus({ preventScroll: true });
      } else if (button.matches('[data-go]')) {
        jump(button.dataset.go, button.dataset.id, true);
        focusDetail(true);
      } else if (button.matches('[data-back]') && trail.length) {
        state = trail.pop(); render(); focusDetail(true);
      } else if (button.matches('[data-pick]')) {
        state.id = button.dataset.pick; state.item = state.paramStatus = '';
        host.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === state.id)));
        renderDetail(rowById(state.group, state.id)); focusDetail(true);
      } else if (button.matches('[data-reset]')) {
        state = newState(state.group, null); render(); host.querySelector('[data-query]').focus();
      } else if (button.matches('[data-page]')) {
        state.page += Number(button.dataset.page);
        state.id = matchingRows()[state.page * pageSize]?.id || '';
        state.item = state.paramStatus = ''; renderResults();
        host.querySelector('[data-pick]')?.focus({ preventScroll: true });
      }
    });
  }
  window.PortalLibrary = { open(group, id) {
    if (!host?.dataset.ready) { queued = { group, id }; return; }
    jump(group, id, false);
  } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();

