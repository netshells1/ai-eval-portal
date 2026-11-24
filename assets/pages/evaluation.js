window.initPortalPage = function ({ C, $, $$, fine, pad }) {
  $('#dims').innerHTML = C.dims.map(function (d) {
    return '<div class="dim" tabindex="0" aria-label="' + d.full + '，权重 ' + d.w + '，包含：' + d.ind.join('、') + '">' +
      '<div class="dim-f"><div class="dim-top"><span class="dim-code">' + d.code + '</span><span class="dim-code">' + d.ind.length + ' 项指标</span></div>' +
      '<h3 class="dim-name">' + d.name + '</h3>' +
      '<div><div class="dim-w"><span class="num">' + d.w + '</span><small>权重</small></div><div class="dim-bar"><i style="--w:' + d.w + '"></i></div></div></div>' +
      '<div class="dim-b"><div class="dim-top"><h4>' + d.full + '</h4><span class="num">' + d.w + '</span></div>' +
      '<ul>' + d.ind.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';
  }).join('');
  if (!fine) $$('.dim').forEach(function (el) { el.addEventListener('click', function () { el.classList.toggle('open'); }); });
  $('#steps').insertAdjacentHTML('beforeend', C.steps.map(function (s, i) {
    return '<div class="step' + (s.auto ? ' auto' : '') + '" style="--d:' + (i * .28 + .2).toFixed(2) + 's"><div class="step-dot"></div><span class="num">' + pad(i + 1) + '</span>' +
      '<h3>' + s.name + '</h3><p><b>' + s.owner + '</b>' + s.out + '</p>' + (s.auto ? '<span class="auto-tag">系统自动</span>' : '') + '</div>';
  }).join(''));
};
