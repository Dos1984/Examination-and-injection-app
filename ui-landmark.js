/* Landmark-focused injection UI enhancements */
(() => {
  const isInjectionTab = () => location.hash.split('/')[2] === 'injection';
  const isHandInjection = () => location.hash.split('/')[1] === 'hand' && isInjectionTab();
  const DEFAULT_MIGRATION_KEY = 'msk.illustration-default-v17';
  let settingsDraft = null;

  function enforceIllustrationDefault() {
    /* Migrate the old Silhouette default once. After this one-time migration,
       an explicitly applied Silhouette preference is respected. */
    try {
      if (!localStorage.getItem(DEFAULT_MIGRATION_KEY)) {
        const saved = JSON.parse(localStorage.getItem('msk.settings') || 'null');
        if (saved && typeof saved === 'object' && saved.figure === 'silhouette') {
          saved.figure = 'illustration';
          localStorage.setItem('msk.settings', JSON.stringify(saved));
          if (typeof CFG !== 'undefined') CFG.figure = 'illustration';
        }
        localStorage.setItem(DEFAULT_MIGRATION_KEY, '1');
      }
    } catch (_) {}

    const choice = document.querySelector('.figchoice');
    const illustration = choice?.querySelector('[data-figure="illustration"]');
    const silhouette = choice?.querySelector('[data-figure="silhouette"]');
    if (choice && illustration && silhouette && choice.firstElementChild !== illustration) {
      choice.insertBefore(illustration, silhouette);
    }
  }

  function reorderBodyDiagramChoices() {
    const choice = document.querySelector('.figchoice');
    const illustration = choice?.querySelector('[data-figure="illustration"]');
    const silhouette = choice?.querySelector('[data-figure="silhouette"]');
    if (!choice || !illustration || !silhouette) return;
    if (choice.firstElementChild !== illustration) choice.insertBefore(illustration, silhouette);
  }

  function paintDraftSelection(body) {
    if (!body || !settingsDraft) return;
    body.querySelectorAll('[data-figure]').forEach(btn => {
      const on = btn.dataset.figure === settingsDraft.figure;
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
    if (!body || body.dataset.confirmSettings === '1') return;

    enforceIllustrationDefault();
    reorderBodyDiagramChoices();

    try {
      settingsDraft = {
        figure: (typeof CFG !== 'undefined' && CFG.figure) ? CFG.figure : 'illustration',
        bg: (typeof CFG !== 'undefined' && CFG.bg) ? CFG.bg : '#EAEFEF'
      };
    } catch (_) {
      settingsDraft = { figure: 'illustration', bg: '#EAEFEF' };
    }

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
      section.dataset.collapsible = '1'; section.classList.add('inj-collapse');
      const content = document.createElement('div'); content.className = 'inj-collapse-body';
      [...section.children].filter(el => el !== h2).forEach(el => content.appendChild(el)); section.appendChild(content);
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'inj-collapse-toggle';
      btn.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      btn.innerHTML = `<span>${h2.innerHTML}</span><span class="inj-chevron" aria-hidden="true">⌄</span>`;
      h2.replaceWith(btn); if (i !== 0) section.classList.add('collapsed');
      btn.onclick = () => { const closed = section.classList.toggle('collapsed'); btn.setAttribute('aria-expanded', String(!closed)); };
    });
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
    if (!headings.length) return; section.dataset.handSubsections = '1';
    headings.forEach(h => {
      const originalId = h.id, title = h.textContent.trim(), nodes = []; let n = h.nextElementSibling;
      while (n && !(n.matches('h3.sub') && /^5\.\d+\b/.test((n.textContent || '').trim()))) { nodes.push(n); n = n.nextElementSibling; }
      const card = document.createElement('section'); card.className = 'hand-inj-sub collapsed'; if (originalId) card.id = originalId;
      const subBody = document.createElement('div'); subBody.className = 'hand-inj-sub-body'; nodes.forEach(node => subBody.appendChild(node));
      const firstImg = subBody.querySelector('.figs figure img');
      const firstCaption = subBody.querySelector('.figs figure figcaption')?.textContent?.trim() || `${title} injection approach`;
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'hand-inj-sub-toggle'; toggle.setAttribute('aria-expanded', 'false');
      const label = document.createElement('span'); label.className = 'hand-inj-sub-title'; label.textContent = title;
      const hint = document.createElement('span'); hint.className = 'hand-inj-sub-hint'; hint.textContent = 'Tap to view landmarks, approach & safety';
      const text = document.createElement('span'); text.className = 'hand-inj-sub-text'; text.append(label, hint);
      const thumb = document.createElement('span'); thumb.className = 'hand-inj-thumb';
      if (firstImg?.src) { const img = document.createElement('img'); img.src = firstImg.src; img.alt = firstCaption; img.loading = 'lazy'; thumb.appendChild(img); }
      else { thumb.classList.add('no-image'); thumb.setAttribute('aria-hidden', 'true'); }
      const chev = document.createElement('span'); chev.className = 'hand-inj-sub-chevron'; chev.setAttribute('aria-hidden', 'true'); chev.textContent = '⌄';
      toggle.append(text, thumb, chev); card.append(toggle, subBody); h.replaceWith(card);
      toggle.addEventListener('click', () => { const closed = card.classList.toggle('collapsed'); toggle.setAttribute('aria-expanded', String(!closed)); });
    });
  }

  function enhance() {
    enforceIllustrationDefault();
    reorderBodyDiagramChoices();
    enhanceSettings();
    if (!isInjectionTab()) return;
    stripUltrasoundContent(); makeCollapsible(); makeHandSubsectionsCollapsible();
  }

  /* Settings are edited as a draft. Capture these events before the app's
     original immediate-apply handlers, then commit them only on Apply. */
  document.addEventListener('click', e => {
    const body = e.target.closest?.('#setBody');
    if (body && settingsDraft) {
      const figure = e.target.closest?.('[data-figure]');
      const swatch = e.target.closest?.('[data-bg]');
      const reset = e.target.closest?.('#resetCfg');
      const apply = e.target.closest?.('#applyNewSettings');

      if (figure) {
        e.preventDefault(); e.stopImmediatePropagation();
        settingsDraft.figure = figure.dataset.figure;
        paintDraftSelection(body);
        return;
      }
      if (swatch) {
        e.preventDefault(); e.stopImmediatePropagation();
        settingsDraft.bg = swatch.dataset.bg;
        paintDraftSelection(body);
        return;
      }
      if (reset) {
        e.preventDefault(); e.stopImmediatePropagation();
        settingsDraft = { figure: 'illustration', bg: '#EAEFEF' };
        paintDraftSelection(body);
        return;
      }
      if (apply) {
        e.preventDefault(); e.stopImmediatePropagation();
        try {
          CFG.figure = settingsDraft.figure;
          CFG.bg = settingsDraft.bg;
          applyCfg();
          refreshHome();
          localStorage.setItem(DEFAULT_MIGRATION_KEY, '1');
        } catch (_) {}
        settingsDraft = null;
        try { closeSettings(); } catch (_) {}
        return;
      }
    }

    if (!isHandInjection()) return;
    const link = e.target.closest?.('.sidenav a[href^="#p-"]'); if (!link) return;
    const card = document.querySelector(link.getAttribute('href')); if (!card?.classList.contains('hand-inj-sub')) return;
    const outer = card.closest('.inj-collapse');
    if (outer?.classList.contains('collapsed')) { outer.classList.remove('collapsed'); outer.querySelector(':scope > .inj-collapse-toggle')?.setAttribute('aria-expanded', 'true'); }
    if (card.classList.contains('collapsed')) { card.classList.remove('collapsed'); card.querySelector(':scope > .hand-inj-sub-toggle')?.setAttribute('aria-expanded', 'true'); }
  }, true);

  document.addEventListener('input', e => {
    if (e.target?.id !== 'bgCustom' || !settingsDraft) return;
    const body = e.target.closest('#setBody');
    if (!body) return;
    e.stopImmediatePropagation();
    settingsDraft.bg = e.target.value;
    paintDraftSelection(body);
  }, true);

  /* Closing settings without Apply discards the draft. */
  document.addEventListener('click', e => {
    if (e.target.closest?.('#setClose')) settingsDraft = null;
  }, false);

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', () => requestAnimationFrame(enhance));
  addEventListener('DOMContentLoaded', enhance);
})();
