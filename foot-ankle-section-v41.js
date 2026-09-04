/* v41 — Fixed Foot & Ankle landmark section rebuild.
   The nine procedure cards are defined explicitly here in the same component structure as Hand & Wrist.
   Existing clinical material is preserved verbatim from each procedure block, and every image block is moved
   to the start of its procedure body before the text. This does not depend on section-number parsing. */
(() => {
  const VERSION = 'v41';
  const PROCEDURES = [
    { key:'tibiotalar', title:'Tibiotalar (ankle) joint', re:/\bTibiotalar\s*(?:\(ankle\))?\s*joint\b|\bAnkle\s*joint\b/i },
    { key:'subtalar', title:'Subtalar joint / sinus tarsi', re:/\bSubtalar\s*joint\b|\bSinus\s*tarsi\b/i },
    { key:'midtarsal', title:'Midtarsal, naviculocuneiform and tarsometatarsal joints', re:/\bMidtarsal\b|\bNaviculocuneiform\b|\bTarsometatarsal\b/i },
    { key:'mtp', title:'Metatarsophalangeal (MTP) and toe joints', re:/\bMetatarsophalangeal\b|\bMTP\b.*\btoe\b/i },
    { key:'plantar', title:'Plantar fascia origin', re:/\bPlantar\s*fascia\s*origin\b/i },
    { key:'ptt', title:'Posterior tibial tendon sheath', re:/\bPosterior\s*tibial(?:is)?\s*tendon\s*sheath\b|\bTibialis\s*posterior\s*tendon\s*sheath\b/i },
    { key:'peroneal', title:'Peroneal tendon sheath', re:/\bPeroneal\s*tendon\s*sheath\b|\bFibularis\s*tendon\s*sheath\b/i },
    { key:'retrocalcaneal', title:'Retrocalcaneal (deep Achilles) bursa', re:/\bRetrocalcaneal\b.*\bbursa\b|\bDeep\s*Achilles\b.*\bbursa\b/i },
    { key:'morton', title:'Morton neuroma / intermetatarsal bursa', re:/\bMorton(?:'s)?\s*neuroma\b|\bIntermetatarsal\s*bursa\b/i }
  ];

  const txt = el => String(el?.textContent || '').replace(/\s+/g,' ').trim();
  const isInjection = () => location.hash.split('/')[2] === 'injection';

  function findMarker(proc) {
    return [...document.querySelectorAll('#view h2,#view h3,#view h4,#view h5')]
      .find(h => !h.closest('.hand-inj-sub') && proc.re.test(txt(h))) || null;
  }

  function getMarkers() {
    return PROCEDURES.map(proc => ({proc, marker:findMarker(proc)}));
  }

  function commonParent(markers) {
    if (!markers.length) return null;
    let p = markers[0].parentElement;
    while (p && p.id !== 'view') {
      if (markers.every(m => p.contains(m))) return p;
      p = p.parentElement;
    }
    return null;
  }

  function directChildUnder(parent, node) {
    let cur = node;
    while (cur && cur.parentElement !== parent) cur = cur.parentElement;
    return cur && cur.parentElement === parent ? cur : null;
  }

  function moveImagesFirst(body) {
    const found = [...body.querySelectorAll('.figs,figure,img')];
    const blocks = [];
    found.forEach(el => {
      const block = el.closest('.figs') || el.closest('figure') || el;
      if (!body.contains(block)) return;
      if (blocks.some(b => b === block || b.contains(block))) return;
      if (blocks.some(b => block.contains(b))) {
        for (let i=blocks.length-1;i>=0;i--) if (block.contains(blocks[i])) blocks.splice(i,1);
      }
      blocks.push(block);
    });
    if (!blocks.length) return;
    const frag = document.createDocumentFragment();
    blocks.forEach(block => frag.appendChild(block));
    body.insertBefore(frag, body.firstChild);
  }

  function makeCard(proc, nodes, originalId) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-inj-sub collapsed';
    card.dataset.footAnkleSection = VERSION;
    card.dataset.procedure = proc.key;
    if (originalId) card.id = originalId;

    const body = document.createElement('div');
    body.className = 'hand-inj-sub-body';
    nodes.forEach(n => body.appendChild(n));
    moveImagesFirst(body);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle';
    toggle.setAttribute('aria-expanded','false');

    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    const title = document.createElement('span');
    title.className = 'hand-inj-sub-title';
    title.textContent = proc.title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    text.append(title,hint);

    const thumb = document.createElement('span');
    thumb.className = 'hand-inj-thumb';
    const firstImg = body.querySelector('img');
    if (firstImg) {
      const img = document.createElement('img');
      img.src = firstImg.currentSrc || firstImg.src;
      img.alt = firstImg.alt || `${proc.title} injection approach`;
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
    card.append(toggle,body);

    toggle.addEventListener('click', () => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
    });
    return card;
  }

  function rebuild() {
    if (!isInjection()) return;
    if (document.querySelector('#view [data-foot-ankle-rebuilt="v41"]')) return;

    const pairs = getMarkers();
    if (pairs.some(x => !x.marker)) return;
    const markers = pairs.map(x => x.marker);
    const parent = commonParent(markers);
    if (!parent) return;

    const starts = pairs.map(x => ({...x, block:directChildUnder(parent,x.marker)}));
    if (starts.some(x => !x.block) || new Set(starts.map(x => x.block)).size !== PROCEDURES.length) return;

    starts.sort((a,b) => a.block === b.block ? 0 : (a.block.compareDocumentPosition(b.block) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (starts.map(x => x.proc.key).join('|') !== PROCEDURES.map(x => x.key).join('|')) return;

    const firstBlock = starts[0].block;
    const anchor = document.createElement('div');
    anchor.dataset.footAnkleRebuilt = VERSION;
    anchor.style.display = 'contents';
    firstBlock.before(anchor);

    const startSet = new Set(starts.map(x => x.block));
    const cards = [];
    starts.forEach(({proc,marker,block},i) => {
      const nodes = [];
      let n = block;
      const nextStart = starts[i+1]?.block || null;
      while (n && n !== nextStart) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      const originalId = marker.id || block.id || '';
      if (nodes[0]) {
        const heading = nodes[0].matches?.('h2,h3,h4,h5') ? nodes[0] : nodes[0].querySelector?.('h2,h3,h4,h5');
        if (heading && proc.re.test(txt(heading))) heading.remove();
      }
      cards.push(makeCard(proc,nodes,originalId));
    });

    anchor.replaceWith(...cards);

    const hostSection = cards[0]?.closest('.section');
    if (hostSection) hostSection.dataset.footAnkleRebuilt = VERSION;
    document.documentElement.dataset.footAnkleCards = String(cards.length);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; rebuild(); });
  };
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('hashchange',schedule);
  addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
