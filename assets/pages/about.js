window.initPortalPage = function ({ C, $, $$, pad, reduced }) {
  var ring = $('#ring'), svg = '', html = '', N = C.five.length;
  var DEF = 2;   /* 默认落在【综合评分】——评估流程第 3 步 */
  C.five.forEach(function (f, i) {
    var a = (-90 + i * 360 / N) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var cx = 300 + 220 * c, cy = 300 + 220 * s;
    svg += '<line class="spoke" data-i="' + i + '" x1="' + (300 + 150 * c) + '" y1="' + (300 + 150 * s) + '" x2="' + cx + '" y2="' + cy + '" stroke="rgba(244,243,241,.18)"/>';
    svg += '<circle class="ndot" data-i="' + i + '" cx="' + cx + '" cy="' + cy + '" r="7"/>';
    var tx = c > .3 ? '0%' : (c < -.3 ? '-100%' : '-50%');
    var ty = s < -.7 ? '-100%' : (s > .7 ? '0%' : '-50%');
    html += '<button class="node" data-i="' + i + '" style="left:' + (50 + 45 * c) + '%;top:' + (50 + 45 * s) + '%;transform:translate(' + tx + ',' + ty + ')">' + f.t + '</button>';
  });
  $('#spokes').innerHTML = svg;
  ring.insertAdjacentHTML('beforeend', html);
  var cur = DEF, paused = false, bar = $('#rpBar'), body = $('#rpBody');
  var tip = $('#ringTip'), idx = $('#rpIdx'), tEl = $('#rpT'), dEl = $('#rpD');
  var noteEl = $('#rpNote'), anchorEl = $('#rpAnchor');
  function sel(i) {
    cur = i;
    $$('.node').forEach(function (n) { n.classList.toggle('on', +n.dataset.i === i); });
    $$('.ndot').forEach(function (n) { n.classList.toggle('on', +n.dataset.i === i); });
    $$('.spoke').forEach(function (n) {
      n.classList.toggle('on', +n.dataset.i === i);
      n.setAttribute('stroke', +n.dataset.i === i ? 'rgba(203,249,2,.55)' : 'rgba(244,243,241,.18)');
    });
    body.classList.add('swap');
    setTimeout(function () {
      idx.innerHTML = pad(i + 1) + '<small>/' + pad(N) + '</small>';
      tEl.textContent = C.five[i].t;
      dEl.textContent = C.five[i].d;
      if (noteEl) {
        var totalInd = C.dims.reduce(function (sum, d) { return sum + d.ind.length; }, 0);
        noteEl.textContent = '25 项二级评估指标';
      }
      /* 锚点说明只在综合评分环节出现 */
      if (anchorEl) anchorEl.style.display = (C.five[i].t === '综合评分') ? '' : 'none';
      body.classList.remove('swap');
    }, reduced ? 0 : 220);
    /* 进度条标记当前环节位置 */
    bar.style.setProperty('--p', ((i + 1) / N).toFixed(3));
  }

  /* ---- 定时轮播：默认停在【综合评分】，依次推进到下一步 ---- */
  var timer = null, DWELL = 2800;   /* 每个环节停留时长(ms) */
  function stopAuto() {
    if (timer) { clearTimeout(timer); timer = null; }
  }
  function startAuto() {
    stopAuto();
    if (paused || reduced) return;
    timer = setTimeout(function () {
      sel((cur + 1) % N);          /* 滚动到下一步 */
      startAuto();                  /* 继续下一轮 */
    }, DWELL);
  }
  ring.addEventListener('pointerenter', function () { paused = true; stopAuto(); });
  ring.addEventListener('pointerleave', function () { paused = false; sel(cur); startAuto(); });
  ring.addEventListener('click', function (e) {
    var b = e.target.closest('.node');
    if (b) { paused = true; stopAuto(); sel(+b.dataset.i); }
  });
  ring.addEventListener('focusin', function (e) {
    var b = e.target.closest('.node');
    if (b) { paused = true; stopAuto(); sel(+b.dataset.i); }
  });
  /* 节点 hover 提示：简短 tooltip */
  $$('.node', ring).forEach(function (n) {
    var f = C.five[+n.dataset.i];
    if (!f || !f.tip || !tip) return;
    n.addEventListener('mouseenter', function () {
      tip.textContent = f.tip; tip.classList.add('on');
    });
    n.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    n.addEventListener('focus', function () {
      tip.textContent = f.tip; tip.classList.add('on');
    });
    n.addEventListener('blur', function () { tip.classList.remove('on'); });
  });
  /* 锚点问号浮窗 */
  var q = $('.rp-q'), pop = $('#rpPop');
  if (q && pop) {
    q.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = pop.classList.toggle('on');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () {
      pop.classList.remove('on'); q.setAttribute('aria-expanded', 'false');
    });
  }
  sel(DEF);
  /* 进入视口后再启动轮播，离开时暂停，避免用户看不到时也在跑 */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { paused = false; startAuto(); }
        else { paused = true; stopAuto(); }
      });
    }, { threshold: .3 });
    io.observe(ring);
  } else {
    startAuto();
  }
};
