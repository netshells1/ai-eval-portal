window.initPortalPage = function ({ C, $, $$, fine, fmt }) {
  var VC = { '直接支持': 'v1', '支持': 'v2', '有条件支持': 'v3', '整改后支持': 'v4', '不予支持': 'v5' };
  $('#caseGrid').innerHTML = C.cases.map(function (c, i) {
    var ents = c.ents.length ? c.ents.map(function (e) { return '<span class="tag">' + e + '</span>'; }).join('') : '<span class="tag">' + c.veto + '</span>';
    return '<article class="case ph rv" tabindex="0" style="--d:' + ((i % 3) * .08).toFixed(2) + 's"><img src="' + c.img + '" alt="" loading="lazy"><span class="case-scene">' + c.scene + '</span>' +
      '<div class="case-f"><h3>' + c.name + '</h3><small>' + c.unit + '</small><span class="v ' + VC[c.verdict] + '">' + c.verdict + '</span></div>' +
      '<div class="case-b"><h4>' + c.name + '</h4><div><div class="case-flow"><span class="num">' + fmt(c.from) + '</span><i>→</i><span class="num to">' + fmt(c.to) + '</span><small>申报 → 核定（万元）</small></div>' +
      '<div class="case-rows"><div><span>核减率</span><b>' + fmt(c.cut, 1) + '%</b></div><div><span>综合得分</span><b>' + fmt(c.score, 1) + '</b></div><div><span>评估结论</span><b>' + c.verdict + '</b></div></div></div>' +
      '<div><small style="font-size:12px;color:rgba(244,243,241,.55)">' + (c.ents.length ? '建议承接方（仅供参考）' : '处理方式') + '</small><div class="case-ent">' + ents + '</div></div></div></article>';
  }).join('');
  if (!fine) $$('.case').forEach(function (el) { el.addEventListener('click', function () { el.classList.toggle('open'); }); });
  const {devices, samples} = window.HardwareCase;
  const grades = {A: '成交样本支撑', B: '市场参考，待询价', C: '类比估算'};
  const money = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 4 });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  const subtotal = d => d.unitPrice * d.quantity;
  const sum = items => items.reduce((total, d) => total + subtotal(d), 0);
  const groups = new Map();
  for (const d of devices) {
    if (!groups.has(d.category)) groups.set(d.category, []);
    groups.get(d.category).push(d);
  }
  const counts = Object.keys(grades).map(k =>
    k + ' 类 ' + devices.filter(d => d.grade === k).length + ' 项（' + grades[k] + '）');
  $('#hwSummary').innerHTML = `<div><span>独立硬件方案测算</span><strong>${money.format(sum(devices)/10000)} <small>万元</small></strong></div>
    <div><b>${groups.size} 类设备 · ${devices.length} 项配置</b><p>${counts.join('　')}</p></div>`;
  function equipment(d) {
    const checks = d.checks.map(p => `<li><b>${esc(p.requirement)}</b>
      <span class="hw-status" data-pending="${p.status === '需核验'}">${esc(p.status)}</span><p>${esc(p.remark)}</p></li>`).join('');
    return `<details class="hw-device" id="hardware-${d.id}" ${d.id === 1 ? 'open' : ''}>
      <summary><span>${esc(d.name)}</span><span class="hw-grade">${esc(d.grade)} 类</span><b>${money.format(subtotal(d))} 元</b></summary>
      <div class="hw-detail"><dl>
        <div><dt>数量 × 测算单价</dt><dd>${d.quantity} ${esc(d.unit)} × ${money.format(d.unitPrice)} 元/${esc(d.unit)}</dd></div>
        <div><dt>参考单价区间（原表）</dt><dd>${esc(d.range)}</dd></div>
        <div><dt>用途</dt><dd>${esc(d.use)}</dd></div>
        <div><dt>参考品牌</dt><dd>${esc(d.brand)}</dd></div>
        <div><dt>规格 / 关键参数</dt><dd>${esc(d.spec)}</dd></div>
        <div><dt>计价依据 · ${esc(grades[d.grade])}</dt><dd>${esc(d.basis)}</dd></div>
      </dl>${checks ? '<h4>参数核对记录（依工作簿）</h4><ul class="hw-checks">' + checks + '</ul>' : ''}</div></details>`;
  }
  $('#hwGroups').innerHTML = [...groups].map(([name, items], i) => `
    <details class="hw-group" ${i === 0 ? 'open' : ''}><summary><strong>${esc(name)}</strong><small>${items.length} 项</small><b>${money.format(sum(items)/10000)} 万元</b></summary>
      <div>${items.map(equipment).join('')}</div></details>`).join('');
  $('#hwSampleList').innerHTML = samples.map(s => {
    const url = s.description.match(/https?:\/\/\S+$/)?.[0];
    const description = url ? s.description.slice(0,-url.length).trim() : s.description;
    return `<li><b>${esc(s.id)}</b> ${esc(description)} ${url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">查看公告 ↗</a>' : ''}</li>`;
  }).join('');
  function revealDevice() {
    if (!/^#hardware-\d+$/.test(location.hash)) return;
    const selected = document.getElementById(location.hash.slice(1));
    if (!selected) return;
    selected.closest('.hw-group').open = selected.open = true;
  }
  document.querySelector('.hw-review').addEventListener('click', e => {
    const id = e.target.closest('a')?.hash;
    if (id) {
      const selected = document.getElementById(id.slice(1));
      selected.closest('.hw-group').open = selected.open = true;
    }
  });
  window.addEventListener('hashchange',revealDevice);
  revealDevice();
};
