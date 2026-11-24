window.initPortalPage = function ({ C, $, $$, fmt }) {
  var wf = $('#wf'), tip = $('#wfTip');
  var W = 960, H = 440, x0 = 64, x1 = 952, yT = 34, yB = 360, max = 1500;
  function y(v) { return yB - (v / max) * (yB - yT); }
  var n = C.waterfall.length, bw = (x1 - x0) / n, w = bw * .56, run = 0;
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="造价核减瀑布图：申报 1,400 万元，逐项核减后核定 1,210 万元">';
  [0, 500, 1000, 1500].forEach(function (v) {
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(244,243,241,' + (v ? .1 : .35) + ')"/>';
    s += '<text x="' + (x0 - 12) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="12" fill="rgba(244,243,241,.5)" font-family="Archivo,Arial">' + fmt(v) + '</text>';
  });
  s += '<text x="' + (x0 - 12) + '" y="' + (yT - 18) + '" text-anchor="end" font-size="12" fill="rgba(244,243,241,.5)">万元</text>';
  var pr = C.priceRange;
  s += '<rect class="wf-fade" style="transition-delay:1.2s" x="' + x0 + '" width="' + (x1 - x0) + '" y="' + y(pr[1]) + '" height="' + (y(pr[0]) - y(pr[1])) + '" fill="rgba(203,249,2,.08)"/>';
  C.waterfall.forEach(function (d, i) {
    var cx = x0 + bw * i + bw / 2, bx = cx - w / 2, top, bot, cls = 'wf-bar', fill, stroke = 'none', lab, col = 'rgba(244,243,241,.92)';
    if (d.type === 'total') { run = d.v; top = y(d.v); bot = y(0); fill = 'rgba(244,243,241,.9)'; lab = fmt(d.v); }
    else if (d.type === 'final') { top = y(d.v); bot = y(0); fill = '#CBF902'; lab = fmt(d.v); col = '#CBF902'; }
    else { top = y(run); bot = y(run + d.v); run += d.v; fill = 'rgba(244,243,241,.14)'; stroke = 'rgba(244,243,241,.6)'; cls += ' down'; lab = '−' + fmt(-d.v); }
    d._lab = lab;
    var dl = (i * .12).toFixed(2);
    s += '<rect class="' + cls + '" data-i="' + i + '" tabindex="0" aria-label="' + d.k + ' ' + lab + ' 万元" x="' + bx + '" y="' + top + '" width="' + w + '" height="' + Math.max(2, bot - top) + '" fill="' + fill + '" stroke="' + stroke + '" style="transition-delay:' + dl + 's"/>';
    s += '<text class="wf-fade" style="transition-delay:' + (+dl + .6).toFixed(2) + 's" x="' + cx + '" y="' + (top - 10) + '" text-anchor="middle" font-size="17" font-weight="800" fill="' + col + '" font-family="Archivo,Arial">' + lab + '</text>';
    s += '<text x="' + cx + '" y="' + (yB + 30) + '" text-anchor="middle" font-size="14" font-weight="700" fill="rgba(244,243,241,.9)">' + d.k + '</text>';
    s += '<text x="' + cx + '" y="' + (yB + 50) + '" text-anchor="middle" font-size="12" fill="rgba(244,243,241,.5)">' + d.sub + '</text>';
    if (i < n - 1) s += '<line class="wf-fade" style="transition-delay:' + (+dl + .4).toFixed(2) + 's" x1="' + (bx + w) + '" x2="' + (bx + bw) + '" y1="' + y(run) + '" y2="' + y(run) + '" stroke="rgba(244,243,241,.35)" stroke-dasharray="3 4"/>';
  });
  s += '</svg>';
  wf.insertAdjacentHTML('afterbegin', s);
  function show(el) {
    var d = C.waterfall[+el.dataset.i], b = el.getBoundingClientRect(), wb = wf.getBoundingClientRect();
    tip.innerHTML = '<b>' + d.k + '　' + d._lab + ' 万元</b>' + d.tip + (d.ev ? '<small>证据编号 ' + d.ev + '</small>' : '');
    var left = Math.max(0, Math.min(wb.width - 270, b.left - wb.left + b.width / 2 - 135));
    tip.style.left = left + 'px';
    tip.style.top = Math.max(-10, b.top - wb.top - tip.offsetHeight - 14) + 'px';
    tip.classList.add('on');
  }
  $$('.wf-bar', wf).forEach(function (el) {
    el.addEventListener('pointerenter', function () { show(el); });
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('pointerleave', function () { tip.classList.remove('on'); });
    el.addEventListener('blur', function () { tip.classList.remove('on'); });
  });
};
