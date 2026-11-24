/* Browse the locally bundled public inquiry standards from the directory. */
(function () {
  'use strict';

  function mount() {
    const host = document.getElementById('standards-app');
    if (!host) return;
    const dataset = window.InquiryStandards;
    if (!dataset || !Array.isArray(dataset.entries)) {
      host.textContent = '询价标准数据未能载入。请检查项目文件后重新打开。';
      return;
    }
    const entries = dataset.entries;
    const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
      .replace(/[\s\p{P}\p{S}]/gu, '');
    const indexed = entries.map(entry => {
      const topics = entry.blocks.filter(block => block.type === 'image').map(block => block.title);
      return { entry, key: normalize([entry.region, entry.province, entry.city, entry.level, entry.title, ...topics].join(' ')) };
    });
    const escape = value => String(value ?? '').replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
    const searchIcon = '<span class="std-search-icon" aria-hidden="true"></span>';
    host.innerHTML = `<div class="std-wrap">
      <div class="std-tools">
        <div class="std-caption"><h2>地区目录</h2><span class="std-count" role="status" aria-live="polite" aria-atomic="true"></span></div>
        <div class="std-inputs">
          <label class="std-search">${searchIcon}<input type="search" autocomplete="off" placeholder="搜索地区、标准名称、文号或图题" aria-label="搜索地区、标准名称、文号或图题"></label>
          <select class="std-level" aria-label="筛选标准层级"><option value="">全部层级</option></select>
        </div>
      </div>
      <ul class="std-grid" aria-label="地区标准目录"></ul>
      <div class="std-empty" hidden>
        <h3>没有找到匹配的标准</h3><p>试试地区简称或文号中的数字。</p><button type="button" data-reset>清除筛选</button>
      </div>
    </div>
    <dialog class="std-dialog std-dossier" aria-labelledby="std-dossier-title">
      <div class="std-dialog-layout">
        <header class="std-dialog-bar"><span class="std-dialog-region"></span><button type="button" class="std-close" data-close-doc aria-label="关闭标准详情">关闭 <span aria-hidden="true">×</span></button></header>
        <div class="std-doc-scroll" data-native-scroll tabindex="-1">
          <div class="std-doc-head"><h2 id="std-dossier-title"></h2><div class="std-citation"><a class="std-source" target="_blank" rel="noopener noreferrer">AI询价喵 · 询价依据摘录 ↗</a><small>适用范围和计费要求以发布机构文件原文为准。</small></div></div>
          <div class="std-outline" hidden><label>定位到 <select aria-label="定位到详情条目"></select></label></div>
          <div class="std-doc-body"></div>
        </div>
      </div>
    </dialog>
    <dialog class="std-dialog std-reader" aria-labelledby="std-reader-title">
      <div class="std-dialog-layout">
        <header class="std-dialog-bar"><strong id="std-reader-title"></strong><button type="button" class="std-close" data-close-image aria-label="关闭原图">关闭 <span aria-hidden="true">×</span></button></header>
        <div class="std-image-tools">
          <div class="std-image-pages"><button type="button" data-prev aria-label="上一张参考图">←</button><span data-page-label></span><button type="button" data-next aria-label="下一张参考图">→</button></div>
          <div class="std-scale"><button type="button" data-smaller aria-label="缩小原图">－</button><button type="button" data-fit title="适应宽度">适应宽度</button><button type="button" data-larger aria-label="放大原图">＋</button></div>
        </div>
        <div class="std-image-stage" tabindex="0" data-native-scroll aria-label="标准原图，可上下左右滚动"><img alt=""></div>
      </div>
    </dialog>`;
    const get = selector => host.querySelector(selector);
    const search = get('input[type=search]');
    const levelSelect = get('.std-level');
    const grid = get('.std-grid');
    const dossier = get('.std-dossier');
    const reader = get('.std-reader');
    const stage = get('.std-image-stage');
    const largeImage = stage.querySelector('img');
    const source = get('.std-source');
    if (/^https?:\/\//i.test(dataset.sourceUrl)) source.href = dataset.sourceUrl;
    else source.hidden = true;
    for (const level of new Set(entries.map(entry => entry.level).filter(Boolean))) {
      levelSelect.add(new Option(level, level));
    }
    levelSelect.hidden = levelSelect.options.length < 3;
    let openEntry, images = [], imageIndex = 0, zoom = 1;

    function summarize(entry) {
      const counts = { image: 0, table: 0, paragraph: 0 };
      for (const block of entry.blocks) counts[block.type]++;
      const parts = [];
      if (counts.image) parts.push(counts.image + ' 张参考图');
      if (counts.table) parts.push(counts.table + ' 张表格');
      if (!parts.length && counts.paragraph) parts.push('文字依据');
      return parts.join(' · ');
    }
    function renderList() {
      const terms = search.value.trim().split(/\s+/u).map(normalize).filter(Boolean);
      const filtered = indexed.filter(({ entry, key }) =>
        (!levelSelect.value || entry.level === levelSelect.value) && terms.every(word => key.includes(word)));
      get('.std-count').textContent = (levelSelect.value || terms.length ? '找到 ' : '共 ') + filtered.length + ' 条';
      get('.std-empty').hidden = !!filtered.length;
      grid.innerHTML = filtered.map(({ entry }) => `<li><button type="button" class="std-card" data-entry="${escape(entry.id)}" aria-haspopup="dialog">
        <span class="std-card-top"><strong>${escape(entry.region)}</strong><span class="std-tag">${escape(entry.level)}</span></span>
        <span class="std-card-title">${escape(entry.title)}</span>
        <span class="std-card-foot"><small>${escape(summarize(entry))}</small><span class="std-card-action">查看详情 <span aria-hidden="true">↗</span></span></span>
        </button></li>`).join('');
    }
    function tableMarkup(block, index) {
      const renderRow = row => '<tr>' + row.map(cell => {
        const tag = cell.header ? 'th' : 'td';
        const spans = (Number(cell.rowspan) > 1 ? ' rowspan="' + Number(cell.rowspan) + '"' : '') +
          (Number(cell.colspan) > 1 ? ' colspan="' + Number(cell.colspan) + '"' : '');
        return '<' + tag + spans + '>' + escape(cell.text) + '</' + tag + '>';
      }).join('') + '</tr>';
      const label = openEntry.region + '标准表格 ' + index;
      return `<div class="std-tab-wrap" data-native-scroll role="region" aria-label="${escape(label)}" tabindex="0"><table aria-label="${escape(label)}"><tbody>${block.rows.map(renderRow).join('')}</tbody></table></div>`;
    }
    function showEntry(entry) {
      openEntry = entry;
      images = entry.blocks.filter(block => block.type === 'image');
      get('.std-dialog-region').textContent = entry.region + ' · ' + entry.level + '标准';
      get('#std-dossier-title').textContent = entry.title;
      let tableNumber = 0, imageNumber = 0;
      get('.std-doc-body').innerHTML = entry.blocks.map(block => {
        if (block.type === 'paragraph') {
          const heading = block.text.length <= 38 &&
            /^(?:[（(]\s*[一二三四五六七八九十]+|[一二三四五六七八九十]+[.、．]|\d+(?:\.\d+)+\s|\d+、)/.test(block.text);
          const tag = heading ? 'h3' : 'p';
          return '<' + tag + '>' + escape(block.text) + '</' + tag + '>';
        }
        if (block.type === 'table') return tableMarkup(block, ++tableNumber);
        if (block.type !== 'image') return '';
        const n = ++imageNumber;
        const title = block.title || entry.region + '参考图 ' + n;
        return `<figure class="std-sheet"><figcaption><span><small>参考图 ${n}</small><b>${escape(title)}</b></span><button type="button" data-image="${n - 1}" aria-label="查看原图，${escape(title)}">查看原图 <span aria-hidden="true">↗</span></button></figcaption>
          <button type="button" class="std-sheet-preview" data-image="${n - 1}" aria-label="放大${escape(title)}"><img src="${escape(block.src)}" width="${Number(block.width)}" height="${Number(block.height)}" alt="${escape(title)}" loading="lazy" decoding="async"></button>
          </figure>`;
      }).join('');
      const outline = get('.std-outline');
      const select = outline.querySelector('select');
      select.replaceChildren(new Option('选择条目', ''));
      get('.std-doc-body').querySelectorAll('h3, figure').forEach((node, index) => {
        const id = 'std-section-' + index;
        node.id = id;
        select.add(new Option(node.querySelector('figcaption b')?.textContent || node.textContent, id));
      });
      outline.hidden = select.options.length < 3;
      dossier.showModal();
      get('.std-doc-scroll').scrollTop = 0;
      get('[data-close-doc]').focus({ preventScroll: true });
    }
    function sizeImage() {
      if (!reader.open || !stage.clientWidth) return;
      const fitWidth = Math.min(largeImage.naturalWidth || stage.clientWidth, stage.clientWidth);
      largeImage.style.width = Math.round(fitWidth * zoom) + 'px';
      get('[data-smaller]').disabled = zoom <= 1;
      get('[data-larger]').disabled = zoom >= 4;
    }
    function showImage(index) {
      imageIndex = index;
      zoom = 1;
      get('#std-reader-title').textContent = openEntry.region + ' · ' + (images[index].title || '标准参考图');
      get('[data-page-label]').textContent = (index + 1) + ' / ' + images.length;
      get('[data-prev]').disabled = index === 0;
      get('[data-next]').disabled = index === images.length - 1;
      largeImage.alt = get('#std-reader-title').textContent;
      largeImage.src = images[index].src;
      if (!reader.open) reader.showModal();
      sizeImage();
      stage.scrollTop = stage.scrollLeft = 0;
    }
    window.addEventListener('pagehide', function () {
      if (reader.open) reader.close();
      if (dossier.open) dossier.close();
    });
    function closeOnBackdrop(event) {
      if (event.target !== this) return;
      const bounds = this.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) this.close();
    }
    dossier.addEventListener('click', closeOnBackdrop);
    reader.addEventListener('click', closeOnBackdrop);
    largeImage.addEventListener('load', sizeImage);
    window.addEventListener('resize', sizeImage);
    search.addEventListener('input', renderList);
    levelSelect.addEventListener('change', renderList);
    get('.std-outline select').addEventListener('change', event => {
      const section = document.getElementById(event.target.value);
      if (section) section.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    host.addEventListener('keydown', event => {
      if (event.target.closest('input,select,button,dialog,a')) event.stopPropagation();
    });
    host.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-entry')) {
        const entry = entries.find(row => String(row.id) === button.dataset.entry);
        if (entry) showEntry(entry);
      } else if (button.hasAttribute('data-reset')) {
        search.value = levelSelect.value = '';
        renderList();
        search.focus();
      } else if (button.hasAttribute('data-close-doc')) dossier.close();
      else if (button.hasAttribute('data-close-image')) reader.close();
      else if (button.hasAttribute('data-image')) showImage(Number(button.dataset.image));
      else if (button.hasAttribute('data-prev')) showImage(imageIndex - 1);
      else if (button.hasAttribute('data-next')) showImage(imageIndex + 1);
      else if (button.closest('.std-scale')) {
        zoom = button.hasAttribute('data-fit') ? 1 : Math.max(1, Math.min(4, zoom + (button.hasAttribute('data-larger') ? 0.5 : -0.5)));
        sizeImage();
      }
    });
    renderList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
