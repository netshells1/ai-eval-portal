/* Prepare local media before the tour, then play only the visible background. */
(function () {
  'use strict';
  const config = window.CONFIG;
  const page = document.querySelector('#main').dataset.page;
  const pageClip = {home: 'home', about: 'about', database: 'database', standards: 'standards'}[page];
  const previewClip = {home: 'city-mist', database: 'database-preview'};
  const allClips = ['home', 'about', 'database', 'standards', 'city-mist', 'database-preview'];
  const banner = document.querySelector('#heroMedia, .lb-media, .library-mast');
  const menuPic = document.querySelector('#menuPic');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 901px)');
  const clips = new Map();
  let entered = false, bannerVisible = false, leaving = false, active;

  function imageReady(url) {
    const img = new Image();
    img.src = url;
    return img.decode();
  }

  function getClip(name) {
    if (clips.has(name)) return clips.get(name);
    const video = document.createElement('video');
    video.className = 'portal-film';
    video.muted = video.defaultMuted = true;
    video.playsInline = video.loop = true;
    video.disablePictureInPicture = true;
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'auto';
    const ready = new Promise((resolve, reject) => {
      function cleanup() {
        clearTimeout(timer);
        for (const event of ['progress','canplaythrough','loadeddata']) video.removeEventListener(event, check);
        video.removeEventListener('error', failed);
      }
      function check() {
        const range = video.buffered;
        if (video.readyState >= 2 && range.length && range.start(0) < .05 &&
            range.end(0) >= video.duration - .05) { cleanup(); resolve(); }
      }
      function failed() { cleanup(); reject(new Error('Video unavailable: ' + name)); }
      const timer = setTimeout(failed, 8000);
      for (const event of ['progress','canplaythrough','loadeddata']) video.addEventListener(event, check);
      video.addEventListener('error', failed);
    });
    video.addEventListener('playing', () => video.classList.toggle('playing', active === video));
    video.addEventListener('error', () => video.classList.remove('playing'));
    clips.set(name, {video, ready});
    video.src = 'assets/motion/' + name + '.mp4';
    return clips.get(name);
  }

  function refresh() {
    const menuOpen = document.querySelector('#menu').classList.contains('open');
    const blocked = !entered || leaving || document.hidden || motion.matches ||
      document.querySelector('.presentation-frame, #keys.open');
    const selected = menuPic.querySelector('img.on')?.dataset.id;
    const name = blocked ? null : menuOpen ? (wide.matches && previewClip[selected]) : (bannerVisible && pageClip);
    const slot = menuOpen ? menuPic : banner;
    const clip = name && slot ? getClip(name) : null;
    const next = clip ? clip.video : null;
    if (next === active) return;
    if (active) { active.pause(); active.classList.remove('playing'); active.remove(); }
    active = next;
    if (!active) return;
    slot.append(active);
    clip.ready.catch(() => {}); // A slow connection can still start playback behind the poster.
    next.play().catch(() => next.classList.remove('playing'));
  }

  if (banner) {
    const observer = new IntersectionObserver(entries => {
      bannerVisible = entries[0].isIntersecting; refresh();
    });
    observer.observe(banner);
  }
  for (const target of [document.querySelector('#menu'), document.querySelector('#keys'), menuPic]) {
    new MutationObserver(refresh).observe(target, {attributes:true, attributeFilter:['class'], subtree:target === menuPic});
  }
  new MutationObserver(refresh).observe(document.body, {childList:true});
  document.addEventListener('visibilitychange', refresh);
  for (const query of [motion,wide]) query.addEventListener('change',refresh);
  window.addEventListener('pagehide', () => { leaving = true; refresh(); });
  window.addEventListener('pageshow', () => { leaving = false; refresh(); });

  function createOpening() {
    document.body.insertAdjacentHTML('afterbegin', `
<!-- ========== 开场加载页 ========== -->
<div class="pre" id="pre" role="status" aria-label="正在准备演示素材">
  <div class="pre-top"><span class="en">District AI Project Evaluation</span><span class="en">V0.3</span></div>
  <div class="pre-mid">
    <div class="pre-num num"><span id="preNum">0</span><i>%</i></div>
  </div>
  <div class="pre-foot">
    <div class="pre-bar"><i id="preBar"></i></div>
    <div class="pre-cap"><span>正在准备演示素材</span><span>点击或按任意键跳过</span></div>
  </div>
</div>`);
    return document.getElementById('pre');
  }

  async function enter(start) {
    const sessionKey = 'aiEvalAssets-20261124-' + (motion.matches ? 'still' : 'motion');
    const openingKey = 'aiEvalOpeningSeen';
    let warmed = false, seen = false;
    try {
      warmed = sessionStorage.getItem(sessionKey) === '1';
      seen = sessionStorage.getItem(openingKey) === '1';
      sessionStorage.setItem(openingKey, '1');
    } catch {}
    const pre = !warmed && !seen && window.name !== 'portal-presentation' ? createOpening() : null;
    let timer;
    function finish() {
      if (entered) return;
      entered = true;
      if (pre) {
        clearTimeout(timer);
        window.removeEventListener('keydown', finish);
        pre.remove();
      }
      start();
      refresh();
    }
    if (!pre) finish();
    if (warmed) return;
    const pictures = [...new Set([...config.pages, ...config.scenes, ...config.cases]
      .map(r => r.img).concat('assets/footer.jpg', 'assets/opening-city.jpg'))];
    const jobs = pictures.map(url => () => imageReady(url));
    if (!motion.matches) jobs.push(...allClips.map(name => () => getClip(name).ready));
    let done = 0, index = 0, failures = 0;
    const counter = pre?.querySelector('#preNum'), bar = pre?.querySelector('#preBar');
    if (pre) {
      pre.addEventListener('click', finish, {once: true});
      window.addEventListener('keydown', finish);
      timer = setTimeout(finish, 12000);
    }
    async function worker() {
      while (index < jobs.length) {
        const run = jobs[index++];
        try { await run(); } catch { failures++; }
        const ratio = ++done / jobs.length;
        if (pre && !entered) {
          counter.textContent = Math.floor(ratio * 100);
          bar.style.transform = 'scaleX(' + ratio + ')';
        }
      }
    }
    await Promise.all([worker(), worker()]);
    if (!failures) { try { sessionStorage.setItem(sessionKey, '1'); } catch {} }
    finish();
  }
  window.PortalMedia = {enter};
})();
