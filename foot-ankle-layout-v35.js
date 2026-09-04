/* v35 — Foot & Ankle landmark injections: force each procedure into a Hand/Wrist-style collapsible card. */
(() => {
  const isInjection = () => location.hash.split('/')[2] === 'injection';
  const clean = t => String(t || '').replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i, '').trim();
  const procRe = /tibiotalar|ankle\s+joint|subtalar|sinus\s+tarsi|posterior\s+tibialis|tibialis\s+posterior|plantar\s+fascia|morton|metatarsophalangeal|\bMTP\b/i;

  function bodyOf(section) {
    return section.querySelector(':scope > .inj-collapse-body') || section;
  }
  function titleOf(section) {
    return (section.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent ||
      section.querySelector(':scope > h2')?.textContent || '').trim();
  }
  function makeCard(title, nodes, id) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-procedure collapsed';
    card.dataset.footAnkleProcedure = 'v35';
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
    label.textContent = clean(title);
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    text.append(label, hint);

    const thumb = document.createElement('span');
    thumb.className = 'hand-inj-thumb';
    const firstImg = body.querySelector('.figs img, figure img, img');
    if (firstImg?.src) {
      const img = document.createElement('img');
      img.src = firstImg.src;
      img.alt = firstImg.alt || clean(title);
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

  function findLandmarkSection() {
    const sections = [...document.querySelectorAll('#view > .section')];
    return sections.find(section => {
      const t = clean(titleOf(section));
      const body = bodyOf(section);
      const text = body.textContent || '';
      return /landmark/i.test(t) && /tibiotalar|subtalar/i.test(text);
    }) || null;
  }

  function convert(section) {
    const body = bodyOf(section);
    if (body.querySelector(':scope > .foot-ankle-procedure')) return;

    const selector = ':scope > h3.sub, :scope > h3, :scope > h4.sub, :scope > h4';
    const heads = [...body.querySelectorAll(selector)].filter(h => procRe.test(clean(h.textContent)));
    if (heads.length < 2) return;

    const headSet = new Set(heads);
    heads.forEach(h => {
      const nodes = [];
      let n = h.nextElementSibling;
      while (n && !headSet.has(n)) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      h.replaceWith(makeCard(h.textContent, nodes, h.id));
    });

    section.dataset.footAnkleLayout = 'v35';
    document.querySelector('#view')?.removeAttribute('data-numbering-v29');
  }

  function ensure() {
    if (!isInjection()) return;
    const section = findLandmarkSection();
    if (!section) return;
    convert(section);
  }

  let q = false;
  const schedule = () => {
    if (q) return;
    q = true;
    requestAnimationFrame(() => { q = false; ensure(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
