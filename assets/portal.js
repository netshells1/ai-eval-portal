(function () {
'use strict';
var C = window.CONFIG;
var $ = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var root = document.documentElement;
var reduced = root.classList.contains('rm');
var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const view = $('#main');
const curPage = view.dataset.page;
function pageUrl(id, target) { return (id === 'home' ? 'index' : id) + '.html' + (target ? '#' + target : ''); }
var PIDS = C.pages.map(function (p) { return p.id; });
var PAGE = {}; C.pages.forEach(function (p, i) { p.i = i; PAGE[p.id] = p; });
function fmt(n, d) { d = d || 0; return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function pad(n) { return String(n).padStart(2, '0'); }
$('#nav').innerHTML = C.pages.map(function (p) { return '<a href="' + pageUrl(p.id) + '" data-id="' + p.id + '">' + (p.nav || p.name) + '</a>'; }).join('');
$('#menuList').innerHTML = C.pages.map(function (p) { return '<a href="' + pageUrl(p.id) + '" data-id="' + p.id + '"><small>' + pad(p.i + 1) + '</small>' + (p.nav || p.name) + '</a>'; }).join('');
$('#menuPic').insertAdjacentHTML('afterbegin', C.pages.map(function (p) { return '<img src="' + (p.id === 'home' ? 'assets/footer.jpg' : p.img) + '" alt="" data-id="' + p.id + '" loading="lazy">'; }).join(''));
if (window.initPortalPage) window.initPortalPage({ C, $, $$, pad, fmt, reduced, fine, countTo, pageUrl });

/* ================= 图片缺失时显示占位 ================= */
$$('img').forEach(function (img) {
  function mark() { var h = img.closest('.ph'); if (h) { h.classList.add('missing'); h.setAttribute('data-file', img.getAttribute('src')); } img.style.visibility = 'hidden'; }
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) mark(); else img.addEventListener('error', mark, { once: true });
});

/* ================= 数字计数 ================= */
function countTo(el, to, dec, dur) {
  dec = dec || 0; dur = dur || 1600;
  var suf = el.dataset.suffix || '', node = (el.firstChild && el.firstChild.nodeType === 3 && el.children.length) ? el.firstChild : null;
  function set(v) { var t = fmt(v, dec) + suf; if (node) node.nodeValue = t; else el.textContent = t; }
  if (reduced) { set(to); return; }
  var t0 = performance.now();
  (function f(now) { var p = Math.min(1, (now - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); set(to * e); if (p < 1) requestAnimationFrame(f); })(t0);
}

/* ================= 进入视口时显现（每次进入页面都会重播） ================= */
var SEL = '.rl,.rv,[data-count],#dims,#steps,#wf';
function targetsIn(el) { return $$(SEL, el).filter(function (x) { return !x.closest('.hero'); }); }
function reveal(el) { el.classList.add('in'); if (el.dataset.count != null) countTo(el, parseFloat(el.dataset.count), +(el.dataset.dec || 0)); }
var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
  es.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -10% 0px', threshold: .12 }) : null;
function armIn(el) { targetsIn(el).forEach(function (x) { if (reduced || !io) reveal(x); else io.observe(x); }); }

/* ================= 平滑滚动 ================= */
var S = { y: scrollY, t: scrollY, raf: 0, on: fine && !reduced };
function maxY() { return root.scrollHeight - innerHeight; }
function loop() {
  S.y += (S.t - S.y) * .1;
  if (Math.abs(S.t - S.y) < .5) { S.y = S.t; scrollTo(0, S.y); S.raf = 0; return; }
  scrollTo(0, S.y); S.raf = requestAnimationFrame(loop);
}
function goY(y) { S.t = Math.max(0, Math.min(maxY(), y)); if (!S.raf) { S.y = scrollY; S.raf = requestAnimationFrame(loop); } }
function scrollToY(y) { if (S.on) goY(y); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
function stopScroll() { if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; } }
var menu = $('#menu'), keys = $('#keys');
function overlayOpen() { return menu.classList.contains('open') || keys.classList.contains('open'); }
if (S.on) addEventListener('wheel', function (e) {
  if (e.defaultPrevented || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if (e.target.closest && e.target.closest('dialog,[role="dialog"],textarea,select,[data-native-scroll]')) return;
  e.preventDefault();
  if (overlayOpen()) return;
  var d = e.deltaY * (e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? innerHeight : 1));
  if (!S.raf) S.t = scrollY;
  goY(S.t + d);
}, { passive: false });

/* Standalone documents use native navigation and retain legacy index.html#page bookmarks. */
var top = $('#top'), hdThr = 200;
function calcHeader() { hdThr = view.firstElementChild.offsetHeight - 160; }
function followLegacyBookmark() {
  if (curPage !== 'home') return false;
  const [key, target] = location.hash.slice(1).split('/');
  const id = key === 'service' ? 'standards' : key;
  if (!PIDS.includes(id) || id === 'home') return false;
  location.replace(pageUrl(id, target));
  return true;
}
function positionTarget() {
  const target = location.hash.slice(1);
  if (!target) return;
  let el = document.getElementById(target);
  if (curPage === 'cases' && target === 'conference-archive') {
    location.replace('database.html' + location.search + '#conference-archive');
    return;
  }
  if (curPage === 'database' && target === 'conference-archive' && !$('#lib-tab-prices[aria-selected="true"]')) {
    window.PortalLibrary.open('prices');
  }
  if (curPage === 'database' && target === 'library-case-entry') {
    location.replace('database.html#conference-archive');
    return;
  }
  if (curPage === 'database' && /^quote-\d+$/.test(target)) {
    window.PortalLibrary.open('prices', target.slice(6));
    el = (matchMedia('(max-width:800px)').matches && $('#library-app .lib-detail')) || $('#library-app');
  }
  if (el && view.contains(el)) {
    stopScroll();
    scrollTo(0, el.getBoundingClientRect().top + scrollY - top.offsetHeight - 12);
    S.y = S.t = scrollY;
  }
}
function go(id) {
  if (id !== curPage) navigateTo(pageUrl(id));
  else { closeMenu(true); closeKeys(); scrollToY(0); }
}
addEventListener('hashchange', function () { if (!followLegacyBookmark()) positionTarget(); });
function onScroll() {
  if (!S.raf) S.y = S.t = scrollY;
  top.classList.toggle('solid', scrollY > hdThr);
}
var ticking = false;
addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
addEventListener('resize', function () { calcHeader(); onScroll(); });
/* ================= 全屏目录 ================= */
var mbtn = $('#menuBtn');
function showPic(id) { $$('#menuPic img').forEach(function (im) { im.classList.toggle('on', im.dataset.id === id); }); $('#menuCap').textContent = PAGE[id].name; }
function openMenu() {
  menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); mbtn.setAttribute('aria-expanded', 'true');
  root.style.overflow = 'hidden'; showPic(curPage);
  setTimeout(function () { if (menu.classList.contains('open')) ($('#menuList a.on') || $('#menuList a')).focus({ preventScroll: true }); }, 350);
}
function closeMenu(silent) {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); mbtn.setAttribute('aria-expanded', 'false');
  root.style.overflow = ''; if (!silent) mbtn.focus({ preventScroll: true });
}
mbtn.addEventListener('click', openMenu);
$('#menuClose').addEventListener('click', function () { closeMenu(); });
$('#menuList').addEventListener('pointerover', function (e) { var a = e.target.closest('a'); if (a) showPic(a.dataset.id); });
$('#menuList').addEventListener('focusin', function (e) { var a = e.target.closest('a'); if (a) showPic(a.dataset.id); });

/* ================= 快捷键面板、提示 ================= */
function openKeys() { keys.classList.add('open'); keys.setAttribute('aria-hidden', 'false'); setTimeout(function () { $('#keysClose').focus({ preventScroll: true }); }, 50); }
function closeKeys() { keys.classList.remove('open'); keys.setAttribute('aria-hidden', 'true'); }
$('#keysClose').addEventListener('click', closeKeys);
keys.addEventListener('click', function (e) { if (e.target === keys) closeKeys(); });
var toastEl = $('#toast'), toastT;
function toast(msg, ms) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2600); }

/* ================= 演示控制：开始、全屏、关闭 ================= */

// A top-level document navigation ends browser fullscreen. Keep that document
// alive only during a fullscreen presentation; normal visits use native links.
const inPresentation = window.parent !== window && window.name === 'portal-presentation';
const messageOrigin = location.protocol === 'file:' ? '*' : location.origin;
let slideFrame, slideUrl;
function presentMessage(action) {
  window.parent.postMessage({ portalSlide: action, page: curPage, hash: location.hash }, messageOrigin);
}
// Keep the navigation bar in place while the current content recedes.
let exitAnimation, destination;
function navigateTo(url) {
  destination = url;
  if (exitAnimation) return;
  if (reduced || !view.animate) { openDestination(url); return; }
  exitAnimation = view.animate([{opacity: 1}, {opacity: .72}], {
    duration: 135, easing: 'ease-in', fill: 'forwards'
  });
  exitAnimation.onfinish = () => openDestination(destination);
}
function clearExit() {
  if (exitAnimation) { exitAnimation.cancel(); exitAnimation = null; }
}
window.addEventListener('pageshow', clearExit);
function openDestination(url) {
  if (!document.fullscreenElement || inPresentation) { location.assign(url); return; }
  closeMenu(true);
  slideUrl = url;
  slideFrame = document.createElement('iframe');
  slideFrame.name = 'portal-presentation';
  slideFrame.title = '项目评估平台演示';
  slideFrame.className = 'presentation-frame';
  slideFrame.src = url;
  document.body.append(slideFrame);
  slideFrame.focus();
  clearExit();
}
window.addEventListener('message', function (event) {
  if (!slideFrame || event.source !== slideFrame.contentWindow) return;
  const localFile = location.protocol === 'file:' && event.origin === 'null';
  if (!localFile && event.origin !== location.origin) return;
  const data = event.data;
  if (!data || !PIDS.includes(data.page)) return;
  if (data.portalSlide === 'location' && typeof data.hash === 'string') {
    slideUrl = pageUrl(data.page) + (data.hash.startsWith('#') ? data.hash : '');
    document.title = PAGE[data.page].name + ' · 人工智能项目评估平台';
  } else if (data.portalSlide === 'exit') fsToggle();
  else if (data.portalSlide === 'close') window.close();
});
if (inPresentation) {
  addEventListener('pageshow', function () { presentMessage('location'); });
  addEventListener('hashchange', function () { presentMessage('location'); });
}
document.addEventListener('fullscreenchange', function () {
  if (!document.fullscreenElement && slideFrame) {
    slideFrame.remove();
    slideFrame = null;
    location.assign(slideUrl);
  }
});
document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href]');
  if (!link || link.target || e.button !== 0 || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const url = new URL(link.href);
  const page = PIDS.find(id => new URL(pageUrl(id), location.href).pathname === url.pathname);
  if (url.origin !== location.origin || url.protocol !== location.protocol) return;
  if (!page) return;
  closeMenu(true);
  if (page === curPage && url.search === location.search && url.hash === location.hash && !link.matches('.sr')) {
    e.preventDefault();
    if (url.hash) positionTarget(); else scrollToY(0);
  } else if (page !== curPage) {
    e.preventDefault(); navigateTo(pageUrl(page) + url.hash);
  }
});
function fsOn() { if (!inPresentation && !document.fullscreenElement && root.requestFullscreen) return root.requestFullscreen().catch(function () {}); }
function fsToggle() {
  if (inPresentation) presentMessage('exit');
  else if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
  else fsOn();
}
function startShow() {
  Promise.resolve(fsOn()).then(function () { go('home'); });
}
var qArm = 0;
function closeShow() {
  var now = Date.now();
  if (now - qArm > 2000) { qArm = now; toast('再按一次 Q 关闭演示窗口'); return; }
  qArm = 0;
  if (inPresentation) { presentMessage('close'); return; }
  if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
  window.close();
  setTimeout(function () { toast('浏览器不允许网页关闭这个窗口。请按 Ctrl+W，或双击项目文件夹里的「关闭项目」。', 5000); }, 300);
}

var ready = false;
addEventListener('keydown', function (e) {
  if (!ready || e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  var k = e.key, t = e.target;
  if (!(t instanceof Element)) return;
  if (t.isContentEditable || t.closest('input,textarea,select,[role="textbox"],[role="combobox"],[role="tablist"],dialog,[role="dialog"]:not(#keys):not(#menu)')) return;
  var interactive = !!t.closest('a,button,[tabindex="0"]');
  if (k === 'Escape') { if (keys.classList.contains('open')) closeKeys(); else if (menu.classList.contains('open')) closeMenu(); else if (document.fullscreenElement) document.exitFullscreen().catch(function () {}); return; }
  if (k === '?' || (k === '/' && e.shiftKey)) { e.preventDefault(); if (keys.classList.contains('open')) closeKeys(); else openKeys(); return; }
  if (keys.classList.contains('open')) return;
  if (k === 'm' || k === 'M') { e.preventDefault(); if (menu.classList.contains('open')) closeMenu(); else openMenu(); return; }
  if (menu.classList.contains('open')) return;
  if (k === 'q' || k === 'Q') { e.preventDefault(); closeShow(); return; }
  if (k === 'f' || k === 'F') { e.preventDefault(); fsToggle(); return; }
  if (interactive && (k === 'Enter' || k === ' ')) return;
  if (k === 'Enter') { e.preventDefault(); startShow(); return; }
  var i = PAGE[curPage].i;
  if (k === 'ArrowRight') { e.preventDefault(); if (i < PIDS.length - 1) go(PIDS[i + 1]); else toast('已经是最后一页'); return; }
  if (k === 'ArrowLeft') { e.preventDefault(); if (i > 0) go(PIDS[i - 1]); else toast('已经是首页'); return; }
  if (k === 'Home') { e.preventDefault(); go('home'); return; }
  if (/^[1-9]$/.test(k) && +k <= PIDS.length) { e.preventDefault(); go(PIDS[+k - 1]); }
});

function start() {
  if (followLegacyBookmark()) return;
  ready = true;
  root.classList.add('is-ready');
  view.classList.add('shown');
  if (curPage === 'home') $('#hero').classList.add('play');
  const page = PAGE[curPage];
  $$('#nav a,#menuList a').forEach(function (a) {
    if (a.dataset.id === curPage) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
  });
  $('#pgNum').textContent = pad(page.i + 1) + ' / ' + pad(PIDS.length);
  $('#pgName').textContent = page.name;
  calcHeader(); onScroll(); armIn(view); positionTarget();
}
window.PortalMedia.enter(start);
})();
