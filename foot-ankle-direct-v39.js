/* v39 — Direct Foot & Ankle landmark subsection card builder.
   Uses the same .hand-inj-sub component as Hand & Wrist, without relying on route slugs or numbering. */
(() => {
  const procRe = /(?:tibiotalar|ankle\s*joint|subtalar|sinus\s*tarsi|midtarsal|talonavicular|calcaneocuboid|metatarsophalangeal|\bmtp\b|plantar\s*fascia|posterior\s*tibial|posterior\s*tibialis|tibialis\s*posterior|peroneal|fibularis|retrocalcaneal|achilles|morton(?:'s)?\s*neuroma|intermetatarsal)/i;
  const norm = el => String(el?.textContent || '').replace(/\s+/g, ' ').trim();
  const cleanTitle = text => String(text || '').replace(/^\s*\d+(?:\.\d+)+\s+/, '').trim();

  function sectionTitle(section) {
    return norm(section.querySelector(':scope > .inj-collapse-toggle > span:first-child')) || norm(section.querySelector(':scope > h2'));
  }

  function findSection() {
    const sections = [...document.querySelectorAll('#view .section')];
    return sections.find(s => {
      const title = sectionTitle(s);
      const text = norm(s);
      return /landmark-guided/i.test(title) && /tibiotalar|ankle\s*joint/i.test(text) && /subtalar|sinus\s*tarsi/i.test(text);
    }) || sections.find(s => {
      const text = norm(s);
      return /tibiotalar|ankle\s*joint/i.test(text) && /subtalar|sinus\s*tarsi/i.test(text) && /morton|plantar\s*fascia/i.test(text);
    });
  }

  function buildCard(title, nodes, id) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-inj-sub collapsed';
    card.dataset.footAnkleDirect = 'v39';
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
    const firstImg = body.querySelector('.figs figure img, figure img, img');
    const firstCaption = body.querySelector('.figs figure figcaption, figure figcaption')?.textContent?.trim() || `${cleanTitle(title)} injection approach`;
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
    card.append(toggle, body);

    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    return card;
  }

  function candidateHeadings(body) {
    return [...body.querySelectorAll('h3,h4')]
      .filter(h => !h.closest('.hand-inj-sub') && procRe.test(norm(h)));
  }

  function wrapSharedParent(headings) {
    if (headings.length < 2) return false;
    const parent = headings[0].parentElement;
    if (!parent || !headings.every(h => h.parentElement === parent)) return false;
    const set = new Set(headings);

    headings.forEach(h => {
      if (!h.isConnected) return;
      const title = norm(h);
      const id = h.id;
      const nodes = [];
      let n = h.nextElementSibling;
      while (n && !set.has(n)) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      h.replaceWith(buildCard(title, nodes, id));
    });
    return true;
  }

  function lowestCommonAncestor(nodes, stop) {
    if (!nodes.length) return null;
    let cur = nodes[0].parentElement;
    while (cur && cur !== stop.parentElement) {
      if (nodes.every(n => cur.contains(n))) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function childUnder(container, node) {
    let cur = node;
    while (cur && cur.parentElement !== container) cur = cur.parentElement;
    return cur?.parentElement === container ? cur : null;
  }

  function wrapByContainer(body, headings) {
    const container = lowestCommonAncestor(headings, body);
    if (!container) return false;
    const starts = headings.map(h => ({h, block: childUnder(container, h)})).filter(x => x.block);
    if (starts.length < 2 || new Set(starts.map(x => x.block)).size < 2) return false;
    const startSet = new Set(starts.map(x => x.block));

    starts.forEach(({h, block}) => {
      if (!block.isConnected) return;
      const title = norm(h);
      const id = h.id || block.id || '';
      const nodes = [];
      let n = block;
      while (n) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
        if (n && startSet.has(n)) break;
      }
      block.before(buildCard(title, nodes, id));
      if (h.isConnected) h.remove();
    });
    return true;
  }

  function convert() {
    const section = findSection();
    if (!section) return;
    if (section.querySelectorAll(':scope .foot-ankle-inj-sub').length >= 2) {
      section.dataset.footAnkleDirect = 'v39';
      return;
    }
    if (section.dataset.footAnkleDirect === 'v39') return;

    const body = section.querySelector(':scope > .inj-collapse-body') || section;
    const headings = candidateHeadings(body);
    if (headings.length < 2) return;

    const converted = wrapSharedParent(headings) || wrapByContainer(body, headings);
    if (converted) section.dataset.footAnkleDirect = 'v39';
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      convert();
    });
  };

  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();
})();