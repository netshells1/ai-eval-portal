window.initPortalPage = function ({ C, $, $$, pad, fmt, reduced, countTo }) {
  const EASE = 'cubic-bezier(.16,1,.3,1)';
  const r1 = value => Math.round(value * 10 + 1e-6) / 10;
  $('.hs-end').insertAdjacentHTML('beforebegin', C.scenes.map(function (s) {
    return '<article class="scard"><div class="scard-cap"><span>已评估 ' + s.n + ' 项</span><span>可复用底座 ' + s.b + ' 个</span></div>' +
      '<div class="scard-img ph"><img src="' + s.img + '" alt="' + s.alt + '" loading="lazy"></div><h3>' + s.name + '</h3><p>' + s.d + '</p></article>';
  }).join(''));
  var hs = $('#hs'), hsTrack = $('#hsTrack'), hsDist = 0;
  function measureStrip() {
    if (innerWidth < 900 || !hs.offsetParent) { hs.style.height = ''; hsTrack.style.transform = ''; hsDist = 0; return; }
    hsDist = Math.max(0, hsTrack.scrollWidth - innerWidth);
    hs.style.height = (innerHeight + hsDist) + 'px';
    updateStrip();
  }
  function updateStrip() {
    if (!hsDist) return;
    var r = hs.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    hsTrack.style.transform = 'translate3d(' + (-p * hsDist).toFixed(1) + 'px,0,0)';
  }

  /* ================= 评估对接台 ================= */
  var FAC = ['技术匹配', '同类案例', '交付能力', '本地服务', '价格合理性'], WTS = [.35, .25, .2, .1, .1];
  var SEG = ['#CBF902', 'rgba(244,243,241,.8)', 'rgba(244,243,241,.55)', 'rgba(244,243,241,.34)', 'rgba(244,243,241,.18)'];
  $('#legend').innerHTML = FAC.map(function (f, i) { return '<span><i style="background:' + SEG[i] + '"></i>' + f + '</span>'; }).join('');
  $('#projList').insertAdjacentHTML('beforeend', C.projects.map(function (p, i) {
    return '<button class="proj" role="tab" aria-selected="false" data-i="' + i + '"><b>' + p.name + '</b><small>' + p.unit + '｜' + p.scenes.join('、') + '</small>' +
      '<span class="proj-row"><span>申报 <span class="num">' + fmt(p.declared) + '</span> 万元</span><span class="st' + (p.status === '已出具结论' ? ' done' : '') + '">' + p.status + '</span></span></button>';
  }).join(''));
  function candHTML(m, k) {
    var e = C.enterprises[m.ent], con = m.f.map(function (v, i) { return v * WTS[i]; });
    var score = r1(con.reduce(function (a, b) { return a + b; }, 0));
    return '<span class="cand-rank">' + pad(k + 1) + '</span>' +
      '<div class="cand-n"><b>' + e.name + '</b><small>' + e.profile + '</small><div>' + m.reasons.map(function (r) { return '<span class="tag">' + r + '</span>'; }).join('') + '</div></div>' +
      '<div class="cand-mid"><div class="sbar" role="img" aria-label="' + FAC.map(function (f, i) { return f + ' ' + m.f[i] + ' 分'; }).join('，') + '">' +
      con.map(function (c, i) { return '<i data-w="' + c.toFixed(2) + '" style="background:' + SEG[i] + '"></i>'; }).join('') + '</div>' +
      '<div class="cand-meta"><span>报价偏离核定价 <em>' + m.dev + '</em></span><span>' + m.risk + '</span></div></div>' +
      '<div class="cand-s"><span class="num" data-to="' + score + '">0</span><small>适配度</small></div>';
  }
  function pick(i) {
    var p = C.projects[i];
    $$('.proj').forEach(function (b) { var on = +b.dataset.i === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    $('#profile').innerHTML = [['能力标签', p.tags], ['数据依赖', p.data], ['可复用对象', p.reuse]].map(function (g) {
      return '<div><h5>' + g[0] + '</h5>' + g[1].map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>';
    }).join('');
    $('#folded').textContent = '另有 ' + p.folded + ' 家未过合规门槛或适配度低于阈值，已折叠';
    var box = $('#cands'), first = {}, old = {};
    $$('.cand', box).forEach(function (el) { first[el.dataset.id] = el.getBoundingClientRect().top; old[el.dataset.id] = el; });
    var els = p.matches.map(function (m, k) {
      var el = old[m.ent];
      if (el) delete old[m.ent]; else { el = document.createElement('div'); el.className = 'cand'; el.dataset.id = m.ent; }
      el.innerHTML = candHTML(m, k);
      return el;
    });
    Object.keys(old).forEach(function (id) { old[id].remove(); });
    els.forEach(function (el) { box.appendChild(el); });
    els.forEach(function (el, k) {
      if (reduced || !el.animate) return;
      var f = first[el.dataset.id];
      if (f != null) {
        var dy = f - el.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 850, easing: EASE });
      } else {
        el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 120 + k * 70, easing: EASE, fill: 'backwards' });
      }
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$('.sbar i', box).forEach(function (b) { b.style.width = b.dataset.w + '%'; }); }); });
    els.forEach(function (el) { var nEl = $('.cand-s .num', el); countTo(nEl, +nEl.dataset.to, 1, 900); });
  }
  $('#projList').addEventListener('click', function (e) { var b = e.target.closest('.proj'); if (b) pick(+b.dataset.i); });
  pick(0);
  measureStrip();
  window.addEventListener('resize', measureStrip);
  window.addEventListener('scroll', updateStrip, {passive: true});
};
