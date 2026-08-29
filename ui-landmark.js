/* Landmark-focused injection UI enhancements */
(() => {
  const isInjectionTab = () => location.hash.split('/')[2] === 'injection';
  const isHandInjection = () => location.hash.split('/')[1] === 'hand' && isInjectionTab();

  function reorderBodyDiagramChoices() {
    const choice = document.querySelector('.figchoice');
    const illustration = choice?.querySelector('[data-figure="illustration"]');
    const silhouette = choice?.querySelector('[data-figure="silhouette"]');
    if (!choice || !illustration || !silhouette) return;
    if (choice.firstElementChild !== illustration) choice.insertBefore(illustration, silhouette);
  }

  function stripUltrasoundContent() {
    if (!isInjectionTab()) return;
    document.querySelectorAll('#view .section').forEach(section => {
      const title = section.querySelector(':scope > h2')?.textContent || '';
      if (/ultrasound/i.test(title)) {
        section.remove();
        return;
      }
      section.querySelectorAll('h3.sub').forEach(h => {
        if (!/ultrasound|image-guided/i.test(h.textContent)) return;
        let n = h.nextElementSibling;
        h.remove();
        while (n && !n.matches('h3.sub')) {
          const next = n.nextElementSibling;
          n.remove();
          n = next;
        }
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

  function makeHandSubsectionsCollapsible() {
    if (!isHandInjection()) return;

    const section = [...document.querySelectorAll('#view .section')].find(s => {
      const title = s.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent ||
                    s.querySelector(':scope > h2')?.textContent || '';
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

      const card = document.createElement('section');
      card.className = 'hand-inj-sub collapsed';
      if (originalId) card.id = originalId;

      const subBody = document.createElement('div');
      subBody.className = 'hand-inj-sub-body';
      nodes.forEach(node => subBody.appendChild(node));

      const firstImg = subBody.querySelector('.figs figure img');
      const firstCaption = subBody.querySelector('.figs figure figcaption')?.textContent?.trim() || `${title} injection approach`;

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

      /* Natural reading order: text first, then image, then expand control. */
      toggle.append(text, thumb, chev);
      card.append(toggle, subBody);
      h.replaceWith(card);

      toggle.addEventListener('click', () => {
        const closed = card.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', String(!closed));
      });
    });
  }

  function enhance() {
    reorderBodyDiagramChoices();
    if (!isInjectionTab()) return;
    stripUltrasoundContent();
    makeCollapsible();
    makeHandSubsectionsCollapsible();
  }

  document.addEventListener('click', e => {
    if (!isHandInjection()) return;
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

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', () => requestAnimationFrame(enhance));
  addEventListener('DOMContentLoaded', enhance);
})();
