/* Offline catalogue built from the workbook snapshot and the inquiry export. */
(function () {
  'use strict';

  const labels = {
    companies: '企业库', technology: '技术与底座库', projects: '项目与场景库',
    prices: '软硬件价格库'
  };
  const hints = {
    companies: '企业名称、能力或服务场景', technology: '技术名称、底座或适用项目',
    projects: '项目名称、场景或申报单位',
    prices: '询价项、设备、品牌、型号或凭证编号'
  };
  const evidence = '询价导出数据';
  const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 6 });
  const showNumber = value => value == null || value === '' ? '未提供' : number.format(value);
  const text = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fallback = value => value == null || value === '' ? '未提供' : String(value);
  const attr = text;
  const sourceLink = (url, caption) => /^https?:\/\//i.test(String(url || ''))
    ? `<a class="lib-source" href="${attr(url)}" target="_blank" rel="noopener noreferrer">${text(caption)} <span aria-hidden="true">↗</span></a>` : '';
  const blank = { project: {}, items: [], quotes: [] };
  let host, state, entries, conf;
  let byItem, quotesByItem;
  let trail = [];
  let queued;

  function makeRows() {
    const book = window.ResourceData;
    const lists = { companies: [], technology: [], projects: [], prices: [] };
    function add(list, record, id, title, sub, group, source, kind) {
      lists[list].push({ id, title, sub, group, source, kind, data: record,
        terms: Object.values(record).filter(value => value != null).join(' ') });
    }
    for (const r of book.companies) {
      add('companies', r, r.企业ID, r.企业名称, r['方案/能力名称'], r.方案领域, '企业库工作表', 'company');
      add('technology', r, r.企业ID, r.核心技术标签.split('；')[0], r.企业名称,
        '企业技术能力', '企业库工作表', 'capability');
    }
    for (const r of book.projects) {
      add('projects', r, r.场景ID, r.场景名称, r.需求单位, r.场景领域, '场景库工作表', 'project');
    }
    for (const r of book.cases) {
      add('technology', r, r.案例ID, r.可复用要素, r.案例名称, '案例复用要素', '案例库工作表', 'reuse');
    }
    for (const r of book.prices) {
      add('prices', r, r.设备ID, r.设备名称, [r.品牌, r['型号/规格']].filter(Boolean).join(' · '),
        '设备价格基准', '设备价格库工作表', 'price');
      if (r.复用属性.startsWith('部分可复用')) {
        add('technology', r, r.设备ID, r.设备名称, r.复用属性,
          '可共享设备', '设备价格库工作表', 'shared');
      }
    }
    for (const q of conf.quotes) {
      const item = byItem.get(q.itemId);
      const identity = [q.brand, q.model].filter(Boolean).join(' · ');
      lists.prices.push({ id: String(q.id), title: q.deviceName || q.rawName || '设备信息未提供',
        sub: [item?.name, identity || '品牌型号未提供'].filter(Boolean).join(' / '),
        group: '询价凭证 · ' + (q.priceType || '待确认'), source: evidence,
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
  function links(items) { return '<div class="lib-links">' + items.join('') + '</div>'; }
  function section(title, html) { return `<section class="lib-section"><h4>${text(title)}</h4>${html}</section>`; }
  function note(s) { return `<p class="lib-note">${text(s)}</p>`; }
  function newState(group, id) { return { group, id: id == null ? '' : String(id), query: '', filter: '', page: 0, paramStatus: '' }; }
  function allGroups(group) { return [...new Set(entries[group].map(e => e.group))]; }
  function labelPrice(q) {
    if (q.unitPrice == null) return '单价未提供';
    return showNumber(q.unitPrice) + ' 元' + (q.unit ? '/' + q.unit : '（计量单位未提供）');
  }

  function inquiryCase(itemId) {
    const item = byItem.get(itemId) || conf.items[0];
    if (!item) return note('未找到询价条目。');
    const quoted = quotesByItem.get(item.id) || [];
    const options = conf.items.map(i =>
      `<option value="${attr(i.id)}" ${i.id === item.id ? 'selected' : ''}>${text(i.name)}</option>`).join('');
    const table = quoted.map(q => `<tr><th scope="row">${text(q.deviceName || q.rawName || '设备信息未提供')}<small>${text([q.brand, q.model].filter(Boolean).join(' · ') || '品牌型号未提供')}</small></th>
      <td class="lib-number">${text(labelPrice(q))}</td><td>${q.parameters.length ? q.parameters.filter(p => p.status === 1 || p.status === 2).length + ' / ' + q.parameters.length : '未提供'}</td><td><a class="lib-link" href="database.html#quote-${attr(q.id)}">${text(q.code || "凭证明细")} ↗</a><small>#${text(q.id)}</small></td></tr>`).join('');
    return `<div class="lib-section"><div class="lib-sectionhead"><h4>按询价项核对凭证</h4><label class="lib-selectwrap"><span class="lib-a11y">选择询价项</span><select data-inquiry>${options}</select></label></div>
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
      <a class="lib-link" href="cases.html?item=${encodeURIComponent(q.itemId)}#conference-archive">返回视频会议询价档案 ↗</a>`;
  }

  const percentFields = new Set(['离散度(±%)', '年降幅(%)', '运维费率(年)']);
  function formatCell(key, value) {
    if (typeof value !== 'number') return fallback(value);
    if (percentFields.has(key)) return number.format(value * 100) + '%';
    if (key.endsWith('年份')) return String(value);
    return number.format(value);
  }
  function workbookFields(record, keys) {
    return fieldGrid(keys.map(key => [key, formatCell(key, record[key])]));
  }

  function detailBody(row) {
    if (!row.kind) return quoteDetail(row);
    const r = row.data;
    const status = r['状态/待核项'] || r.状态;
    const meta = [row.id, r.证据等级, r.采集时间].filter(Boolean).join(' · ');
    const verification = '<div class="lib-evidence"><b>' + text(meta) + '</b><p>' + text(status) + '</p></div>';
    const groups = [];
    const related = [];
    function add(title, keys) { groups.push(section(title, workbookFields(r, keys))); }
    function reference(key, group) {
      const raw = r[key] || '';
      const id = raw.match(/(?:QY|CJ|AL|SB)-\d+/)?.[0];
      if (id && rowById(group, id)) related.push(cross(group, id, key + ' · ' + raw));
    }
    if (row.kind === 'company' || row.kind === 'capability') {
      add('方案与技术能力', ['方案/能力名称','核心技术标签','技术路线成熟度','产品线/交付形态','方案领域','细分行业','服务类型']);
      if (row.kind === 'company') {
        add('企业与交付', ['统一社会信用代码','注册地','园区关系','成立年限','人员规模','关键人员/驻场能力','本地机构']);
        add('资质与履约（含模拟数据）', ['高新/专精特新','体系认证','信用记录','涉诉与处罚','政务案例数','代表案例ID','报价历史（万元）','履约评价']);
        related.push(cross('technology', row.id, '查看企业技术能力'));
      } else {
        related.push(cross('companies', row.id, '查看企业 · ' + r.企业名称));
      }
      add('评估依据', ['主要挂接指标']);
      reference('代表案例ID', 'technology');
    } else if (row.kind === 'project') {
      groups.push(section('场景需求', note(r['场景描述（痛点）'])));
      add('立项信息', ['需求单位','场景领域','细分领域','所处阶段','拟投资金额（万元）','建设周期起','建设周期止','拟建设地点']);
      add('技术与对接', ['核心技术标签','能力需求标签','匹配能力数','对接意向数','浏览量']);
      add('绩效与对标', ['痛点基线（有无）','覆盖规模（可量化）','绩效目标（可量化）','与既有系统边界','主要挂接指标','对标案例ID']);
      reference('对标案例ID', 'technology');
    } else if (row.kind === 'reuse') {
      add('复用依据', ['案例名称','可复用要素','技术标签','场景领域','细分领域','场景方','方案方','规模/功能点','可对标场景ID','关联企业ID']);
      reference('可对标场景ID', 'projects');
      reference('关联企业ID', 'companies');
    } else if (row.kind === 'shared') {
      add('复用条件与规格', ['设备名称','复用属性','设备类别','品牌','型号/规格','计量单位','备注']);
      related.push(cross('prices', row.id, '查看设备估价与来源'));
    } else {
      groups.push(section(window.ResourceData.targetYear + ' 年估算单价（元 / ' + r.计量单位 + '）',
        workbookFields(r, ['区间下限 P25（元）','估算单价 P50（元）','区间上限 P75（元）'])));
      add('价格基准', ['设备类别','品牌','型号/规格','计量单位','基准单价（元）','基准年份','价格来源类型','样本数','备注']);
      add('估算参数与费用归属', ['规格系数','数量规模系数','地区系数','风险系数P50','离散度(±%)','年降幅(%)','运维费率(年)','复用属性','计入科目']);
      if (rowById('technology', row.id)) related.push(cross('technology', row.id, '查看设备复用条件'));
    }
    return verification + groups.join('') + (related.length ? section('关联记录', links(related)) : '') +
      sourceLink(r.来源链接 || r.数据来源, '打开工作表所列来源');
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
      state.paramStatus = '';
    }
    host.querySelector('.lib-count').textContent = `共 ${records.length} 条`;
    host.querySelector('.lib-list').innerHTML = visible.length ? visible.map(row =>
      `<button type="button" class="lib-row" data-pick="${attr(row.id)}" aria-pressed="${row.id === state.id}">
      <span class="lib-rowtype">${text(row.group)}${state.group === 'prices' ? ' · ' + text(row.kind ? showNumber(row.data['基准单价（元）']) + ' 元/' + row.data.计量单位 : labelPrice(row.data)) : ''}</span>
      <strong>${text(row.title)}</strong><small>${text(row.sub)}</small><i aria-hidden="true">↗</i></button>`).join('') :
      '<div class="lib-empty"><strong>没有找到记录</strong><p>试试更短的关键词，或清除分类。</p><button type="button" class="lib-link" data-reset>清空筛选 ↺</button></div>';
    host.querySelector('.lib-pager').innerHTML = pages > 1 ? `<button type="button" data-page="-1" aria-label="上一页" ${state.page === 0 ? 'disabled' : ''}>←</button>
      <span>${state.page + 1} / ${pages}</span><button type="button" data-page="1" aria-label="下一页" ${state.page + 1 === pages ? 'disabled' : ''}>→</button>` : '';
    renderDetail(rowById(state.group, state.id));
  }
  function render() {
    const tabs = Object.entries(labels).map(([key, label]) => `<button type="button" role="tab" id="lib-tab-${key}" aria-controls="lib-tabpanel" data-group="${key}" aria-selected="${state.group === key}" tabindex="${key === state.group ? '0' : '-1'}">${label}<small>${entries[key].length}</small></button>`).join('');
    let context = '';
    if (state.group === 'technology') {
      context = '按企业能力、案例中的可复用要素和可共享设备检索，每条记录可追溯到原表。';
    } else if (state.group === 'prices') {
      context = '工作表收录 ' + window.ResourceData.prices.length + ' 项设备价格基准，视频会议系统另有 ' +
        conf.quotes.length + ' 条询价凭证。可按分类分开查看。';
    }
    const filters = allGroups(state.group).map(f => `<option value="${attr(f)}" ${f === state.filter ? 'selected' : ''}>${text(f)}</option>`).join('');
    host.innerHTML = `<div class="lib-inner"><nav class="lib-tabs" role="tablist" aria-label="选择资源库">${tabs}</nav>
      <div id="lib-tabpanel" role="tabpanel" aria-labelledby="lib-tab-${state.group}"><div class="lib-tools">
      <div class="lib-heading"><h2>${labels[state.group]}</h2><span class="lib-count" role="status"></span></div>
      <div class="lib-controls"><label class="lib-search"><span class="lib-glass" aria-hidden="true"></span><input type="search" data-query autocomplete="off" aria-label="搜索${labels[state.group]}" placeholder="${hints[state.group]}" value="${attr(state.query)}"></label>
      ${allGroups(state.group).length > 1 ? `<label class="lib-selectwrap"><span class="lib-a11y">筛选记录分类</span><select data-filter><option value="">全部分类</option>${filters}</select></label>` : ''}</div></div>
      ${context ? note(context) : ''}
      ${trail.length ? '<button type="button" class="lib-back" data-back>← 返回上一条浏览记录</button>' : ''}
      <div class="lib-layout"><div class="lib-results"><div class="lib-list"></div><div class="lib-pager"></div></div>
      <article class="lib-detail" aria-label="记录详情"></article></div></div></div>`;
    renderResults();
  }
  function jump(group, id, fromLink) {
    if (!labels[group]) return;
    if (fromLink) trail.push({ ...state });
    else trail = [];
    state = newState(group, id);
    if (id) {
      const index = entries[group].findIndex(r => r.id === state.id);
      state.page = Math.floor(Math.max(0, index) / pageSize);
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
  function mountArchive(container) {
    function renderItem(itemId) { container.innerHTML = inquiryCase(itemId); }
    renderItem(new URLSearchParams(location.search).get('item'));
    container.addEventListener('change', event => {
      if (!event.target.matches('[data-inquiry]')) return;
      renderItem(event.target.value);
      container.querySelector('select').focus({ preventScroll: true });
    });
  }

  function mount() {
    host = document.getElementById('library-app');
    const archive = document.getElementById('conference-items');
    if ((!host && !archive) || host?.dataset.ready) return;
    conf = window.ConferenceData || blank;
    byItem = new Map(conf.items.map(i => [i.id, i]));
    quotesByItem = new Map(conf.items.map(i => [i.id, conf.quotes.filter(q => q.itemId === i.id)]));
    if (archive) { mountArchive(archive); return; }
    host.dataset.ready = 'true';
    entries = makeRows();
    state = newState('companies', null);
    if (queued && labels[queued.group]) { jump(queued.group, queued.id, false); queued = null; }
    else render();
    host.addEventListener('input', e => {
      if (!e.target.matches('[data-query]')) return;
      state.query = e.target.value; state.page = 0; renderResults();
    });
    host.addEventListener('change', e => {
      if (e.target.matches('[data-filter]')) { state.filter = e.target.value; state.page = 0; renderResults(); }
      if (e.target.matches('[data-param-filter]')) {
        state.paramStatus = e.target.value;
        renderDetail(rowById(state.group, state.id));
        host.querySelector('[data-param-filter]')?.focus({ preventScroll: true });
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
        state.id = button.dataset.pick; state.paramStatus = '';
        host.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === state.id)));
        renderDetail(rowById(state.group, state.id)); focusDetail(true);
      } else if (button.matches('[data-reset]')) {
        state = newState(state.group, null); render(); host.querySelector('[data-query]').focus();
      } else if (button.matches('[data-page]')) {
        state.page += Number(button.dataset.page);
        state.id = matchingRows()[state.page * pageSize]?.id || '';
        state.paramStatus = ''; renderResults();
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

