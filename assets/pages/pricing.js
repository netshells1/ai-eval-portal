window.initPortalPage = function ({ C, $, $$, fmt, countTo, reduced }) {
  var projects = C.bidProjects || [];
  if (!projects.length) return;

  var wf = $('#wf'), tip = $('#wfTip'), note = $('#wfNote'), sel = $('#priceProj');
  var kvDeclared = $('#kvDeclared'), kvPrice = $('#kvPrice'), kvRange = $('#kvRange'), kvCut = $('#kvCut'), chips = $('#priceChips');
  var W = 960, H = 440, x0 = 64, x1 = 952, yT = 34, yB = 360;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function cutRate(p) {
    return ((p.declared - p.price) / p.declared * 100);
  }
  function niceMax(v) {
    if (v <= 600) return 600;
    if (v <= 900) return 900;
    if (v <= 1200) return 1200;
    if (v <= 1500) return 1500;
    return Math.ceil((v + 50) / 100) * 100;
  }
  function axisTicks(max) {
    var step = max / 3;
    return [0, Math.round(step / 50) * 50 || Math.round(step), Math.round((step * 2) / 50) * 50 || Math.round(step * 2), max]
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  sel.innerHTML = projects.map(function (p) {
    return '<option value="' + p.id + '">' + esc(p.name) + '（' + esc(p.unit) + '）</option>';
  }).join('');

  function renderSide(p, animate) {
    var cut = cutRate(p);
    var pr = p.priceRange || [p.price, p.price];
    note.textContent = '浅绿色横带为核定价区间 ' + fmt(pr[0]) + '—' + fmt(pr[1]) + ' 万元（P25—P75）。将鼠标移到柱子上查看核减理由和证据编号。';
    kvRange.textContent = '区间 ' + fmt(pr[0]) + '—' + fmt(pr[1]) + ' 万元';
    chips.innerHTML = (p.chips || []).map(function (c) {
      return '<span class="chip">' + esc(c) + '</span>';
    }).join('');

    function setCount(el, to, dec, suffix) {
      el.dataset.count = String(to);
      if (dec != null) el.dataset.dec = String(dec);
      else delete el.dataset.dec;
      if (suffix) el.dataset.suffix = suffix;
      else delete el.dataset.suffix;
      if (animate && countTo) {
        if (suffix) {
          el.innerHTML = '0';
          countTo(el, to, dec || 0);
        } else {
          el.innerHTML = '0<small>万元</small>';
          countTo(el, to, dec || 0);
        }
      } else {
        if (suffix) el.textContent = fmt(to, dec || 0) + suffix;
        else el.innerHTML = fmt(to) + '<small>万元</small>';
      }
    }
    setCount(kvDeclared, p.declared, 0, null);
    setCount(kvPrice, p.price, 0, null);
    setCount(kvCut, +cut.toFixed(1), 1, '%');
  }

  function renderWaterfall(p) {
    var data = (p.waterfall || []).map(function (d) {
      return { k: d.k, sub: d.sub, v: d.v, type: d.type, tip: d.tip, ev: d.ev };
    });
    var max = niceMax(Math.max(p.declared, p.price));
    function y(v) { return yB - (v / max) * (yB - yT); }
    var n = data.length, bw = (x1 - x0) / n, w = bw * .56, run = 0;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="造价核减瀑布图：申报 ' +
      fmt(p.declared) + ' 万元，逐项核减后核定 ' + fmt(p.price) + ' 万元">';
    axisTicks(max).forEach(function (v) {
      s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(244,243,241,' + (v ? .1 : .35) + ')"/>';
      s += '<text x="' + (x0 - 12) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="12" fill="rgba(244,243,241,.5)" font-family="Archivo,Arial">' + fmt(v) + '</text>';
    });
    s += '<text x="' + (x0 - 12) + '" y="' + (yT - 18) + '" text-anchor="end" font-size="12" fill="rgba(244,243,241,.5)">万元</text>';
    var pr = p.priceRange || [p.price, p.price];
    s += '<rect class="wf-fade" style="transition-delay:1.2s" x="' + x0 + '" width="' + (x1 - x0) + '" y="' + y(pr[1]) + '" height="' + (y(pr[0]) - y(pr[1])) + '" fill="rgba(203,249,2,.08)"/>';
    data.forEach(function (d, i) {
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

    var old = wf.querySelector('svg');
    if (old) old.remove();
    tip.classList.remove('on');
    wf.insertAdjacentHTML('afterbegin', s);
    wf.classList.remove('in');
    /* 强制重播柱状动画 */
    void wf.offsetWidth;
    if (reduced) wf.classList.add('in');
    else requestAnimationFrame(function () { wf.classList.add('in'); });

    $$('.wf-bar', wf).forEach(function (el) {
      function show() {
        var d = data[+el.dataset.i], b = el.getBoundingClientRect(), wb = wf.getBoundingClientRect();
        tip.innerHTML = '<b>' + d.k + '　' + d._lab + ' 万元</b>' + d.tip + (d.ev ? '<small>证据编号 ' + d.ev + '</small>' : '');
        var left = Math.max(0, Math.min(wb.width - 270, b.left - wb.left + b.width / 2 - 135));
        tip.style.left = left + 'px';
        tip.style.top = Math.max(-10, b.top - wb.top - tip.offsetHeight - 14) + 'px';
        tip.classList.add('on');
      }
      el.addEventListener('pointerenter', show);
      el.addEventListener('focus', show);
      el.addEventListener('pointerleave', function () { tip.classList.remove('on'); });
      el.addEventListener('blur', function () { tip.classList.remove('on'); });
    });
  }

  function apply(id, animate) {
    var p = projects.filter(function (x) { return x.id === id; })[0] || projects[0];
    renderSide(p, animate);
    renderWaterfall(p);
  }

  sel.addEventListener('change', function () { apply(sel.value, true); });
  apply(sel.value || projects[0].id, false);
};
