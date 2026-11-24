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
  var inquiry = window.ConferenceData;
  var quoteList = document.getElementById('featuredQuotes');
  ['14574', '14577'].forEach(function (id) {
    var record = inquiry.quotes.find(function (q) { return q.id === id; });
    if (!record || record.unitPrice == null) return;
    var link = document.createElement('a');
    link.href = 'database.html#quote-' + id;
    var label = document.createElement('span');
    label.textContent = '凭证 ' + id;
    var price = document.createElement('strong');
    price.textContent = '¥' + record.unitPrice.toLocaleString('zh-CN');
    var suffix = document.createElement('small');
    suffix.textContent = ' / ' + (record.unit || '单位未提供') + ' ↗';
    link.append(label, price, suffix);
    quoteList.append(link);
  });
  var parameterCount = inquiry.quotes.reduce(function (n, q) { return n + q.parameters.length; }, 0);
  [['询价项', inquiry.items.length], ['询价凭证', inquiry.quotes.length], ['参数对照', parameterCount]].forEach(function (pair) {
    var metric = document.createElement('div');
    var label = document.createElement('dt');
    var value = document.createElement('dd');
    label.textContent = pair[0];
    value.textContent = pair[1];
    metric.append(label, value);
    document.getElementById('inquiryMetrics').append(metric);
  });
};
