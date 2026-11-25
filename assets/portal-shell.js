/* Shared chrome for the eight standalone pages (including file:// launches). */
(function () {
  'use strict';
  const main = document.getElementById('main');
  main.insertAdjacentHTML('beforebegin', `<a class="sr" href="#main">跳到正文</a>
<!-- ========== 顶部 ========== -->
<div class="top" id="top">
  <header class="hd">
    <a class="brand" href="index.html" aria-label="京西智评 首页">
      <img class="brand-mark" src="assets/brand-mark.svg" width="132" height="67" alt="">
      <span><b>京西智评</b><small>信息化项目评估平台</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="主导航"></nav>
    <div class="hd-act">
      <a class="btn btn-lime" href="matching.html#desk">项目申报</a>
      <button class="btn btn-line" id="menuBtn" aria-expanded="false" aria-controls="menu">目录</button>
    </div>
  </header>
</div>`);
  main.insertAdjacentHTML('afterend', `
<!-- ========== 全屏目录 ========== -->
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="目录" aria-hidden="true">
  <button class="btn btn-line menu-close" id="menuClose">关闭</button>
  <div class="menu-list">
    <nav id="menuList" aria-label="目录"></nav>
  </div>
  <div class="menu-pic" id="menuPic"><span class="cap" id="menuCap"></span></div>
</div>

<!-- ========== 快捷键面板 ========== -->
<div class="keys" id="keys" role="dialog" aria-modal="true" aria-label="快捷键" aria-hidden="true">
  <div class="keys-box">
    <div class="keys-head"><h3>快捷键</h3><button class="btn btn-line" id="keysClose">关闭</button></div>
    <div class="keys-cols">
      <h4>演示控制</h4>
      <div><span>开始演示（全屏并回到首页）</span><span><kbd>Enter</kbd></span></div>
      <div><span>切换全屏</span><span><kbd>F</kbd></span></div>
      <div><span>退出全屏 / 关闭面板</span><span><kbd>Esc</kbd></span></div>
      <div><span>关闭演示窗口（连按两次）</span><span><kbd>Q</kbd></span></div>
      <h4>页面切换</h4>
      <div><span>下一页</span><span><kbd>→</kbd></span></div>
      <div><span>上一页</span><span><kbd>←</kbd></span></div>
      <div><span>跳到第 N 页</span><span><kbd>1</kbd>—<kbd>8</kbd></span></div>
      <div><span>回到首页</span><span><kbd>Home</kbd></span></div>
      <div><span>页面内滚动</span><span><kbd>↑</kbd><kbd>↓</kbd><kbd>空格</kbd></span></div>
      <div><span>打开目录</span><span><kbd>M</kbd></span></div>
    </div>
    <p class="keys-foot">在电脑上双击项目文件夹里的「启动项目」可直接全屏打开本页，双击「关闭项目」关闭演示窗口。</p>
  </div>
</div>

<div class="pg" aria-hidden="true"><span class="num" id="pgNum">01 / 08</span><span id="pgName">首页</span></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`);
})();
