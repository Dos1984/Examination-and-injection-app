/* Landmark-focused injection UI enhancements */
(() => {
  const isInjectionTab = () => location.hash.split('/')[2] === 'injection';
  const isHandInjection = () => location.hash.split('/')[1] === 'hand' && isInjectionTab();
  let settingsDraft = null;

  function loadGuideV24() {
    if (document.querySelector('script[data-guide-v24-loader]')) return;
    const s = document.createElement('script');
    s.dataset.guideV24Loader = '1';
    s.src = new URL('guide-integrated-v24.js?v=24', document.baseURI).href;
    s.async = false;
    document.head.appendChild(s);
  }
  loadGuideV24();

  function forceIllustrationOnly() {
    let changed = false;
    try {
      const saved = JSON.parse(localStorage.getItem('msk.settings') || 'null');
      if (saved && typeof saved === 'object' && saved.figure !== 'illustration') {
        saved.figure = 'illustration';
        localStorage.setItem('msk.settings', JSON.stringify(saved));
        changed = true;
      }
      if (typeof CFG !== 'undefined' && CFG.figure !== 'illustration') {
        CFG.figure = 'illustration';
        changed = true;
      }
    } catch (_) {}

    document.querySelectorAll('[data-figure="silhouette"]').forEach(el => el.remove());
    const illustration = document.querySelector('.figchoice [data-figure="illustration"]');
    if (illustration) {
      illustration.classList.add('on');
      illustration.setAttribute('aria-pressed', 'true');
    }

    if (changed) {
      try { applyCfg(); refreshHome(); } catch (_) {}
    }
  }

  function paintDraftSelection(body) {
    if (!body || !settingsDraft) return;
    settingsDraft.figure = 'illustration';
    body.querySelectorAll('[data-figure]').forEach(btn => {
      const on = btn.dataset.figure === 'illustration';
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    body.querySelectorAll('[data-bg]').forEach(btn => {
      btn.classList.toggle('on', (btn.dataset.bg || '').toLowerCase() === settingsDraft.bg.toLowerCase());
    });
    const custom = body.querySelector('#bgCustom');
    if (custom) custom.value = settingsDraft.bg;
    const code = body.querySelector('.custom code');
    if (code) code.textContent = settingsDraft.bg.toUpperCase();
  }

  function enhanceSettings() {
    const body = document.querySelector('#setBody');
    if (!body) return;

    forceIllustrationOnly();
    body.querySelectorAll('[data-figure="silhouette"]').forEach(el => el.remove());

    const hint = body.querySelector('.sethint');
    if (hint && /Both diagrams/i.test(hint.textContent || '')) hint.textContent = 'The illustration is fully clickable — select a body part or its label.';

    if (body.dataset.confirmSettings === '1' && body.querySelector('#applyNewSettings')) {
      if (settingsDraft) paintDraftSelection(body);
      return;
    }

    try {
      settingsDraft = {
        figure: 'illustration',
        bg: (typeof CFG !== 'undefined' && CFG.bg) ? CFG.bg : '#EAEFEF'
      };
    } catch (_) {
      settingsDraft = { figure: 'illustration', bg: '#EAEFEF' };
    }

    body.querySelector('.settings-apply-group')?.remove();
    body.dataset.confirmSettings = '1';
    const group = document.createElement('div');
    group.className = 'setgroup settings-apply-group';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'applyNewSettings';
    btn.className = 'apply-settings-btn';
    btn.textContent = 'Apply New Settings';
    group.appendChild(btn);
    body.appendChild(group);
    paintDraftSelection(body);
  }

  function stripUltrasoundContent() {
    if (!isInjectionTab()) return;
    document.querySelectorAll('#view .section').forEach(section => {
      const title = section.querySelector(':scope > h2')?.textContent || '';
      if (/ultrasound/i.test(title)) { section.remove(); return; }
      section.querySelectorAll('h3.sub').forEach(h => {
        if (!/ultrasound|image-guided/i.test(h.textContent)) return;
        let n = h.nextElementSibling;
        h.remove();
        while (n && !n.matches('h3.sub')) { const next = n.nextElementSibling; n.remove(); n = next; }
      });
      section.querySelectorAll('p,li,.callout,.landmark-row').forEach(el => {
        if (/ultrasound|sonograph|image-guided/i.test(el.textContent || '')) el.remove();
      });
    });
  }

  function makeCollapsible() {
    if (!isInjectionTab()) return;
    document.querySelectorAll('#view .section').forEach((section, i) => {
      if (section.dataset.collapsible === '1') return;
      const h2 = section.querySelector(':scope > h2');
      if (!h2) return;
      section.dataset.collapsible = '1';
      section.classList.add('inj-collapse');
      const content = document.createElement('div');
      content.className = 'inj-collapse-body';
      [...section.children].filter(el => el !== h2).forEach(el => content.appendChild(el));
      section.appendChild(content);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inj-collapse-toggle';
      btn.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      btn.innerHTML = `<span>${h2.innerHTML}</span><span class="inj-chevron" aria-hidden="true">⌄</span>`;
      h2.replaceWith(btn);
      if (i !== 0) section.classList.add('collapsed');
      btn.onclick = () => {
        const closed = section.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', String(!closed));
      };
    });
  }

  function buildInjectionSubcard(title, nodes, originalId) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub collapsed';
    if (originalId) card.id = originalId;

    const subBody = document.createElement('div');
    subBody.className = 'hand-inj-sub-body';
    nodes.forEach(node => subBody.appendChild(node));

    const firstImg = subBody.querySelector('.figs figure img, figure img, img');
    const firstCaption = subBody.querySelector('.figs figure figcaption, figure figcaption')?.textContent?.trim() || `${title} injection approach`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle';
    toggle.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    text.append(label, hint);

    const thumb = document.createElement('span');
    thumb.className = 'hand-inj-thumb';
    if (firstImg?.src) {
      const img = document.createElement('img');
      img.src = firstImg.src;
      img.alt = firstCaption;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.classList.add('no-image');
      thumb.setAttribute('aria-hidden', 'true');
    }

    const chev = document.createElement('span');
    chev.className = 'hand-inj-sub-chevron';
    chev.setAttribute('aria-hidden', 'true');
    chev.textContent = '⌄';
    toggle.append(text, thumb, chev);
    card.append(toggle, subBody);
    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    return card;
  }

  function makeHandSubsectionsCollapsible() {
    if (!isHandInjection()) return;
    const section = [...document.querySelectorAll('#view .section')].find(s => {
      const title = s.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent || s.querySelector(':scope > h2')?.textContent || '';
      return /^5\.\s*Landmark-guided injection techniques/i.test(title.trim());
    });
    if (!section || section.dataset.handSubsections === '1') return;
    const body = section.querySelector(':scope > .inj-collapse-body') || section;
    const headings = [...body.querySelectorAll(':scope > h3.sub')].filter(h => /^5\.\d+\b/.test((h.textContent || '').trim()));
    if (!headings.length) return;
    section.dataset.handSubsections = '1';

    headings.forEach(h => {
      const originalId = h.id;
      const title = h.textContent.trim();
      const nodes = [];
      let n = h.nextElementSibling;
      while (n && !(n.matches('h3.sub') && /^5\.\d+\b/.test((n.textContent || '').trim()))) {
        nodes.push(n);
        n = n.nextElementSibling;
      }
      h.replaceWith(buildInjectionSubcard(title, nodes, originalId));
    });
  }

  const footProcedureRe = /^\s*4\.(\d+)\s+(?:Tibiotalar|Subtalar|Midtarsal|Metatarsophalangeal|MTP|Plantar fascia|Posterior tibial|Peroneal tendon|Retrocalcaneal|Morton neuroma)/i;
  const normaliseText = el => String(el?.textContent || '').replace(/\s+/g, ' ').trim();

  function smallestFootMarkers(root) {
    return [...root.querySelectorAll('*')].filter(el => {
      const text = normaliseText(el);
      if (!footProcedureRe.test(text)) return false;
      return ![...el.children].some(child => footProcedureRe.test(normaliseText(child)));
    }).sort((a,b) => {
      const na = +(normaliseText(a).match(footProcedureRe)?.[1] || 99);
      const nb = +(normaliseText(b).match(footProcedureRe)?.[1] || 99);
      return na - nb;
    });
  }

  function lowestCommonContainer(markers, limit) {
    if (!markers.length) return null;
    let node = markers[0].parentElement;
    while (node && node !== limit.parentElement) {
      if (markers.every(m => node.contains(m))) return node;
      node = node.parentElement;
    }
    return null;
  }

  function directChildUnder(container, node) {
    let cur = node;
    while (cur && cur.parentElement !== container) cur = cur.parentElement;
    return cur && cur.parentElement === container ? cur : null;
  }

  function makeFootAnkleSubsectionsCollapsible() {
    if (!isInjectionTab()) return;
    const view = document.querySelector('#view');
    if (!view) return;

    const candidateSections = [...view.querySelectorAll('.section')];
    let section = null;
    let markers = [];
    for (const s of candidateSections) {
      if (s.dataset.footAnkleSubsections === '1') return;
      const found = smallestFootMarkers(s);
      if (found.length >= 6) { section = s; markers = found; break; }
    }
    if (!section || markers.length < 6) return;

    const body = section.querySelector(':scope > .inj-collapse-body') || section;
    markers = smallestFootMarkers(body);
    if (markers.length < 6) return;

    const container = lowestCommonContainer(markers, body);
    if (!container) return;

    const boundaries = markers.map(marker => ({ marker, block: directChildUnder(container, marker) }))
      .filter(x => x.block);
    const uniqueBlocks = new Set(boundaries.map(x => x.block));
    if (boundaries.length < 6 || uniqueBlocks.size < 6) return;

    section.dataset.footAnkleSubsections = '1';
    const boundarySet = new Set(boundaries.map(x => x.block));

    boundaries.forEach(({marker, block}, index) => {
      if (!block.isConnected) return;
      const title = normaliseText(marker);
      const originalId = marker.id || block.id || '';
      const nodes = [];
      let n = block;
      const nextBoundary = boundaries[index + 1]?.block || null;
      while (n && n !== nextBoundary) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
        if (n && boundarySet.has(n) && n !== nextBoundary) break;
      }

      const card = buildInjectionSubcard(title, nodes, originalId);
      block.before(card);
      if (marker.isConnected) marker.remove();
    });

    /* A final pass removes any empty source wrappers left after moving the procedure blocks. */
    [...container.children].forEach(el => {
      if (el.classList?.contains('hand-inj-sub')) return;
      const text = normaliseText(el);
      const hasMedia = !!el.querySelector?.('img,video,figure');
      if (!text && !hasMedia) el.remove();
    });
  }

  function enhance() {
    loadGuideV24();
    forceIllustrationOnly();
    enhanceSettings();
    if (!isInjectionTab()) return;
    stripUltrasoundContent();
    makeCollapsible();
    makeHandSubsectionsCollapsible();
    makeFootAnkleSubsectionsCollapsible();
  }

  document.addEventListener('click', e => {
    const body = e.target.closest?.('#setBody');
    if (body && settingsDraft) {
      const figure = e.target.closest?.('[data-figure]');
      const swatch = e.target.closest?.('[data-bg]');
      const reset = e.target.closest?.('#resetCfg');
      const apply = e.target.closest?.('#applyNewSettings');

      if (figure) {
        e.preventDefault();
        e.stopImmediatePropagation();
        settingsDraft.figure = 'illustration';
        paintDraftSelection(body);
        return;
      }
      if (swatch) {
        e.preventDefault();
        e.stopImmediatePropagation();
        settingsDraft.bg = swatch.dataset.bg;
        paintDraftSelection(body);
        return;
      }
      if (reset) {
        e.preventDefault();
        e.stopImmediatePropagation();
        settingsDraft = { figure: 'illustration', bg: '#EAEFEF' };
        paintDraftSelection(body);
        return;
      }
      if (apply) {
        e.preventDefault();
        e.stopImmediatePropagation();
        try {
          CFG.figure = 'illustration';
          CFG.bg = settingsDraft.bg;
          applyCfg();
          refreshHome();
        } catch (_) {}
        settingsDraft = null;
        try { closeSettings(); } catch (_) {}
        return;
      }
    }

    const link = e.target.closest?.('.sidenav a[href^="#p-"]');
    if (!link) return;
    const card = document.querySelector(link.getAttribute('href'));
    if (!card?.classList.contains('hand-inj-sub')) return;
    const outer = card.closest('.inj-collapse');
    if (outer?.classList.contains('collapsed')) {
      outer.classList.remove('collapsed');
      outer.querySelector(':scope > .inj-collapse-toggle')?.setAttribute('aria-expanded', 'true');
    }
    if (card.classList.contains('collapsed')) {
      card.classList.remove('collapsed');
      card.querySelector(':scope > .hand-inj-sub-toggle')?.setAttribute('aria-expanded', 'true');
    }
  }, true);

  document.addEventListener('input', e => {
    if (e.target?.id !== 'bgCustom' || !settingsDraft) return;
    const body = e.target.closest('#setBody');
    if (!body) return;
    e.stopImmediatePropagation();
    settingsDraft.bg = e.target.value;
    paintDraftSelection(body);
  }, true);

  document.addEventListener('click', e => {
    if (e.target.closest?.('#setClose')) settingsDraft = null;
  }, false);

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', () => requestAnimationFrame(enhance));
  addEventListener('DOMContentLoaded', enhance);
})();
