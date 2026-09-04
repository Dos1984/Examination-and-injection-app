/* v40 — Rebuild the complete Foot & Ankle landmark procedure section into Hand & Wrist-style cards.
   Preserves the existing procedure material, but restructures each procedure as a separate collapsible card
   and moves its images to the top of the expanded body before the text. */
(() => {
  const procedures = [
    { key:'tibiotalar', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Tibiotalar\s*\(ankle\)\s*joint|Tibiotalar\s*joint|Ankle\s*joint)\b/i },
    { key:'subtalar', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Subtalar\s*joint(?:\s*\/\s*sinus\s*tarsi)?|Sinus\s*tarsi)\b/i },
    { key:'midtarsal', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Midtarsal|Talonavicular|Calcaneocuboid|Naviculocuneiform|Tarsometatarsal)\b/i },
    { key:'mtp', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Metatarsophalangeal\s*\(MTP\)|Metatarsophalangeal|MTP|Toe\s*joint)\b/i },
    { key:'plantar', re:/^(?:\d+(?:\.\d+)*\s*)?Plantar\s*fascia(?:\s*origin)?\b/i },
    { key:'ptt', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Posterior\s*tibial|Posterior\s*tibialis|Tibialis\s*posterior).*?(?:tendon\s*sheath|sheath)?\b/i },
    { key:'peroneal', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Peroneal|Fibularis).*?(?:tendon\s*sheath|sheath)?\b/i },
    { key:'retrocalcaneal', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Retrocalcaneal|Deep\s*Achilles).*?(?:bursa)?\b/i },
    { key:'morton', re:/^(?:\d+(?:\.\d+)*\s*)?(?:Morton(?:'s)?\s*neuroma|Morton\s*neuroma|Intermetatarsal\s*bursa)\b/i }
  ];

  const norm = value => String(value?.textContent ?? value ?? '').replace(/\s+/g,' ').trim();
  const cleanTitle = text => norm(text).replace(/^\d+(?:\.\d+)*\s*/, '').trim();

  function hitCount(text) {
    return procedures.reduce((n,p) => n + (p.re.test(norm(text)) ? 1 : 0), 0);
  }

  function findSection() {
    const sections = [...document.querySelectorAll('#view .section')];
    let best = null;
    let bestScore = 0;
    for (const s of sections) {
      const text = norm(s);
      let score = 0;
      for (const p of procedures) if (p.re.test(text)) score++;
      const title = norm(s.querySelector(':scope > .inj-collapse-toggle > span:first-child')) || norm(s.querySelector(':scope > h2'));
      if (/landmark/i.test(title)) score += 2;
      if (score > bestScore) { best = s; bestScore = score; }
    }
    return bestScore >= 7 ? best : null;
  }

  function flattenOldCards(section) {
    [...section.querySelectorAll('.hand-inj-sub')].forEach(card => {
      const title = norm(card.querySelector(':scope > .hand-inj-sub-toggle .hand-inj-sub-title'));
      const body = card.querySelector(':scope > .hand-inj-sub-body');
      if (!body || !procedures.some(p => p.re.test(title))) return;
      const frag = document.createDocumentFragment();
      const h = document.createElement('h3');
      h.className = 'sub';
      h.textContent = title;
      frag.appendChild(h);
      while (body.firstChild) frag.appendChild(body.firstChild);
      card.replaceWith(frag);
    });
  }

  function markerFor(root, proc) {
    const all = [...root.querySelectorAll('h2,h3,h4,h5,p,div,span,strong,b,li')]
      .filter(el => proc.re.test(norm(el)));
    if (!all.length) return null;
    const leaf = all.find(el => ![...el.children].some(c => proc.re.test(norm(c))));
    const base = leaf || all[0];
    const preferred = base.closest('h2,h3,h4,h5') || base;
    if (root.contains(preferred)) return preferred;
    return base;
  }

  function orderedMarkers(body) {
    const out = [];
    for (const proc of procedures) {
      const marker = markerFor(body, proc);
      if (marker) out.push({proc, marker});
    }
    out.sort((a,b) => a.marker === b.marker ? 0 : (a.marker.compareDocumentPosition(b.marker) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    return out;
  }

  function boundaryFor(body, marker, allMarkers) {
    let el = marker;
    while (el && el.parentElement && el.parentElement !== body) {
      const parent = el.parentElement;
      const containsOther = allMarkers.some(m => m !== marker && parent.contains(m));
      const txt = norm(parent);
      if (containsOther || txt.length > 320) break;
      if (/^(H2|H3|H4|H5|P|DIV|LI|SECTION)$/.test(parent.tagName)) el = parent;
      else break;
    }
    return el;
  }

  function cloneBetween(body, startEl, endEl) {
    const range = document.createRange();
    range.setStartBefore(startEl);
    if (endEl) range.setEndBefore(endEl);
    else range.setEnd(body, body.childNodes.length);
    return range.cloneContents();
  }

  function removeRepeatedHeading(container, proc) {
    const candidates = [...container.querySelectorAll('h2,h3,h4,h5,p,div,span,strong,b')];
    const heading = candidates.find(el => proc.re.test(norm(el)) && norm(el).length < 180 && ![...el.children].some(c => proc.re.test(norm(c))));
    if (!heading) return;
    const block = heading.closest('h2,h3,h4,h5') || heading;
    block.remove();
  }

  function moveImagesFirst(body) {
    const candidates = [...body.querySelectorAll('.figs, figure, img')];
    const blocks = [];
    for (const el of candidates) {
      let block = el.closest('.figs') || el.closest('figure') || el;
      if (!body.contains(block)) continue;
      if (blocks.some(b => b.contains(block))) continue;
      blocks.push(block);
    }
    if (!blocks.length) return;
    const anchor = body.firstChild;
    blocks.forEach(block => body.insertBefore(block, anchor));
  }

  function buildCard(title, fragment, id) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-inj-sub collapsed';
    card.dataset.footAnkleRebuild = 'v40';
    if (id) card.id = id;

    const subBody = document.createElement('div');
    subBody.className = 'hand-inj-sub-body';
    subBody.appendChild(fragment);
    moveImagesFirst(subBody);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle';
    toggle.setAttribute('aria-expanded','false');

    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    text.append(label,hint);

    const thumb = document.createElement('span');
    thumb.className = 'hand-inj-thumb';
    const firstImg = subBody.querySelector('img');
    const caption = subBody.querySelector('figcaption')?.textContent?.trim() || `${title} injection approach`;
    if (firstImg?.src) {
      const img = document.createElement('img');
      img.src = firstImg.src;
      img.alt = caption;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.classList.add('no-image');
      thumb.setAttribute('aria-hidden','true');
    }

    const chev = document.createElement('span');
    chev.className = 'hand-inj-sub-chevron';
    chev.setAttribute('aria-hidden','true');
    chev.textContent = '⌄';
    toggle.append(text,thumb,chev);
    card.append(toggle,subBody);

    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    return card;
  }

  function rebuild() {
    const section = findSection();
    if (!section || section.dataset.footAnkleRebuild === 'v40') return;
    flattenOldCards(section);

    const body = section.querySelector(':scope > .inj-collapse-body') || section;
    const markers = orderedMarkers(body);
    if (markers.length < 7) return;

    const markerEls = markers.map(x => x.marker);
    const bounds = markers.map(x => ({...x, boundary: boundaryFor(body, x.marker, markerEls)}));
    const preRange = document.createRange();
    preRange.setStart(body,0);
    preRange.setEndBefore(bounds[0].boundary);
    const prelude = preRange.cloneContents();

    const cards = [];
    bounds.forEach((item,i) => {
      const next = bounds[i+1]?.boundary || null;
      const frag = cloneBetween(body,item.boundary,next);
      const holder = document.createElement('div');
      holder.appendChild(frag);
      const rawTitle = norm(item.marker);
      removeRepeatedHeading(holder,item.proc);
      const title = cleanTitle(rawTitle);
      const finalFrag = document.createDocumentFragment();
      while (holder.firstChild) finalFrag.appendChild(holder.firstChild);
      cards.push(buildCard(title, finalFrag, item.marker.id || item.boundary.id || ''));
    });

    body.replaceChildren(prelude, ...cards);
    section.dataset.footAnkleRebuild = 'v40';
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      rebuild();
    });
  };

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('hashchange',schedule);
  addEventListener('DOMContentLoaded',schedule);
  schedule();
})();