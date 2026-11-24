window.initPortalPage = function ({ C, $, $$, pad, reduced }) {
  var ring = $('#ring'), svg = '', html = '', N = C.five.length;
  C.five.forEach(function (f, i) {
    var a = (-90 + i * 360 / N) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var cx = 300 + 220 * c, cy = 300 + 220 * s;
    svg += '<line x1="' + (300 + 150 * c) + '" y1="' + (300 + 150 * s) + '" x2="' + cx + '" y2="' + cy + '" stroke="rgba(244,243,241,.18)"/>';
    svg += '<circle class="ndot" data-i="' + i + '" cx="' + cx + '" cy="' + cy + '" r="7"/>';
    var tx = c > .3 ? '0%' : (c < -.3 ? '-100%' : '-50%');
    var ty = s < -.7 ? '-100%' : (s > .7 ? '0%' : '-50%');
    html += '<button class="node" data-i="' + i + '" style="left:' + (50 + 45 * c) + '%;top:' + (50 + 45 * s) + '%;transform:translate(' + tx + ',' + ty + ')">' + f.t + '</button>';
  });
  $('#spokes').innerHTML = svg;
  ring.insertAdjacentHTML('beforeend', html);
  var cur = 0, paused = false, bar = $('#rpBar'), body = $('#rpBody');
  function sel(i) {
    cur = i;
    $$('.node').forEach(function (n) { n.classList.toggle('on', +n.dataset.i === i); });
    $$('.ndot').forEach(function (n) { n.classList.toggle('on', +n.dataset.i === i); });
    body.classList.add('swap');
    setTimeout(function () {
      $('#rpIdx').innerHTML = pad(i + 1) + '<small>/' + pad(N) + '</small>';
      $('#rpT').textContent = C.five[i].t;
      $('#rpD').textContent = C.five[i].d;
      body.classList.remove('swap');
    }, reduced ? 0 : 220);
    bar.classList.remove('run'); void bar.offsetWidth;
    if (!paused && !reduced) bar.classList.add('run');
  }
  bar.addEventListener('animationend', function () { if (!paused) sel((cur + 1) % N); });
  ring.addEventListener('pointerenter', function () { paused = true; bar.classList.remove('run'); });
  ring.addEventListener('pointerleave', function () { paused = false; sel(cur); });
  ring.addEventListener('click', function (e) { var b = e.target.closest('.node'); if (b) { paused = true; sel(+b.dataset.i); } });
  ring.addEventListener('focusin', function (e) { var b = e.target.closest('.node'); if (b) { paused = true; sel(+b.dataset.i); } });
  sel(0);
};
