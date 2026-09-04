/* v36 — Definitive Foot & Ankle injection subsection cards.
   Targets the visible numbered procedure headings themselves rather than route metadata. */
(() => {
  const isInjection = () => location.hash.split('/')[2] === 'injection';
  const procedureRe = /(?:tibiotalar|ankle\s*joint|subtalar|sinus\s*tarsi|posterior\s+tibialis|tibialis\s+posterior|plantar\s+fascia|morton|metatarsophalangeal|\bMTP\b)/i;
  const numberedProcedureRe = /^\s*\d+(?:\.\d+)+\s+.*(?:tibiotalar|ankle\s*joint|subtalar|sinus\s*tarsi|posterior\s+tibialis|tibialis\s+posterior|plantar\s+fascia|morton|metatarsophalangeal|\bMTP\b)/i;

  function cleanTitle(text) {
    return String(text || '').replace(/^\s*\d+(?:\.\d+)+\s+/, '').trim();
  }

  function makeCard(title, nodes, id) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-inj-sub collapsed';
    card.dataset.footAnkleCard = 'v36';
    if (id) card.id = id;

    const body = document.createElement('div');
    body.className = 'hand-inj-sub-body';
    nodes.forEach(n => body.appendChild(n));

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle';
    toggle.setAttribute('aria-expanded', 'false');

    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = cleanTitle(title);
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    text.append(label, hint);

    const thumb = document.createElement('span');
    thumb.className = 'hand-inj-thumb';
    const img = body.querySelector('.figs img, figure img, img');
    if (img?.src) {
      const im = document.createElement('img');
      im.src = img.src;
      im.alt = img.alt || cleanTitle(title);
      im.loading = 'lazy';
      thumb.appendChild(im);
    } else {
      thumb.classList.add('no-image');
      thumb.setAttribute('aria-hidden', 'true');
    }

    const chev = document.createElement('span');
    chev.className = 'hand-inj-sub-chevron';
    chev.setAttribute('aria-hidden', 'true');
    chev.textContent = '⌄';
    toggle.append(text, thumb, chev);
    card.append(toggle, body);

    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    return card;
  }

  function findOuter() {
    const headings = [...document.querySelectorAll('#view h2,#view h3,#view h4')]
      .filter(h => numberedProcedureRe.test((h.textContent || '').trim()));
    if (headings.length < 2) return null;
    const first = headings[0];
    return first.closest('.inj-collapse') || first.closest('.section') || first.parentElement;
  }

  function directProcedureHeadings(container) {
    const candidates = [...container.querySelectorAll('h2,h3,h4')]
      .filter(h => numberedProcedureRe.test((h.textContent || '').trim()) && !h.closest('.hand-inj-sub'));
    if (candidates.length < 2) return [];
    const parentCounts = new Map();
    candidates.forEach(h => parentCounts.set(h.parentElement, (parentCounts.get(h.parentElement) || 0) + 1));
    const bestParent = [...parentCounts.entries()].sort((a,b) => b[1]-a[1])[0]?.[0];
    return bestParent ? candidates.filter(h => h.parentElement === bestParent) : candidates;
  }

  function convert() {
    if (!isInjection()) return;
    const outer = findOuter();
    if (!outer) return;
    const content = outer.querySelector(':scope > .inj-collapse-body') || outer;
    if (content.dataset.footAnkleCardsV36 === '1') return;

    const headings = directProcedureHeadings(content);
    if (headings.length < 2) return;
    const parent = headings[0].parentElement;
    const headingSet = new Set(headings);

    headings.forEach(h => {
      const nodes = [];
      let n = h.nextElementSibling;
      while (n && !headingSet.has(n)) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      const card = makeCard(h.textContent, nodes, h.id);
      h.replaceWith(card);
    });

    parent.dataset.footAnkleCardsV36 = '1';
    content.dataset.footAnkleCardsV36 = '1';
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; convert(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
