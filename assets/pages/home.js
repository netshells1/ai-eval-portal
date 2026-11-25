window.initPortalPage = function ({ C, $, $$, fine, reduced, pageUrl }) {
  const hero = $('#hero');
  $('#idxList').innerHTML = C.pages.slice(1).map(function (p) {
    return '<a href="' + pageUrl(p.id) + '" data-id="' + p.id + '"><span class="en">' + p.en + '</span><b>' + (p.nav || p.name) + '</b><p>' + p.d + '</p><i aria-hidden="true">→</i></a>';
  }).join('');
  $('#idxFloatIn').innerHTML = C.pages.slice(1).map(function (p) { return '<img src="' + p.img + '" alt="" data-id="' + p.id + '" loading="lazy">'; }).join('');
  $('#newsGrid').innerHTML = C.news.map(function (col) {
    return '<div class="rv"><div class="news-h"><h3>' + col.title + '</h3><a href="index.html">MORE →</a></div>' +
      '<a class="news-feat" href="index.html"><div class="ph"><img src="' + col.feat.img + '" alt="" loading="lazy"></div><div><time>' + col.feat.date + '</time><h4>' + col.feat.t + '</h4><p>' + col.feat.d + '</p></div></a>' +
      '<div class="news-list">' + col.items.map(function (it) { return '<a href="index.html"><span>' + it.t + '</span><time>' + it.date + '</time></a>'; }).join('') + '</div></div>';
  }).join('');

  var idxFloat = $('#idxFloat');
  if (fine && !reduced) (function () {
    var list = $('#idxList'), x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
    list.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; x = tx; y = ty; idxFloat.classList.add('on'); }
      var a = e.target.closest('a');
      if (a) $$('img', idxFloat).forEach(function (im) { im.classList.toggle('on', im.dataset.id === a.dataset.id); });
      if (!raf) raf = requestAnimationFrame(tick);
    });
    list.addEventListener('pointerleave', function () { on = false; idxFloat.classList.remove('on'); });
    function tick() {
      x += (tx - x) * .15; y += (ty - y) * .15;
      idxFloat.style.setProperty('--x', x + 'px'); idxFloat.style.setProperty('--y', y + 'px');
      if (on || Math.abs(tx - x) + Math.abs(ty - y) > .5) raf = requestAnimationFrame(tick); else raf = 0;
    }
  })();
  if (fine && !reduced) (function () {
    var hm = $('#heroMedia'), mx = 0, my = 0, x = 0, y = 0, x2 = 0, y2 = 0, r = 0, tr = 0, raf = 0, inside = false;
    hero.addEventListener('pointermove', function (e) {
      var b = hero.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top;
      if (!inside) { inside = true; x = x2 = mx; y = y2 = my; }
      tr = Math.min(b.width, b.height) * .19; kick();
    });
    hero.addEventListener('pointerleave', function () { inside = false; tr = 0; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function tick(t) {
      x += (mx - x) * .14; y += (my - y) * .14; x2 += (mx - x2) * .055; y2 += (my - y2) * .055; r += (tr - r) * .08;
      var w1 = 1 + .07 * Math.sin(t / 240), w2 = 1 + .1 * Math.cos(t / 310);
      hm.style.setProperty('--mx', x + 'px'); hm.style.setProperty('--my', y + 'px'); hm.style.setProperty('--r', (r * w1) + 'px');
      hm.style.setProperty('--mx2', x2 + 'px'); hm.style.setProperty('--my2', y2 + 'px'); hm.style.setProperty('--r2', (r * .62 * w2) + 'px');
      if (inside || r > .5) raf = requestAnimationFrame(tick);
      else { raf = 0; hm.style.setProperty('--r', '0px'); hm.style.setProperty('--r2', '0px'); }
    }
  })();
};
