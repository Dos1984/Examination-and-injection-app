/* v42 — complete Foot & Ankle landmark-section rebuild.
   Rebuilds the section into nine explicit Hand & Wrist-style collapsible cards.
   Existing procedure material is moved intact into the matching card, with all images
   placed at the start of that card before the text. */
(() => {
  const VERSION = 'v42';
  const PROCEDURES = [
    { key:'tibiotalar', title:'Tibiotalar (ankle) joint', re:/\bTibiotalar\s*(?:\(ankle\))?\s*joint\b|\bAnkle\s*joint\b/i },
    { key:'subtalar', title:'Subtalar joint / sinus tarsi', re:/\bSubtalar\s*joint\b|\bSinus\s*tarsi\b/i },
    { key:'midtarsal', title:'Midtarsal, naviculocuneiform and tarsometatarsal joints', re:/\bMidtarsal\b|\bNaviculocuneiform\b|\bTarsometatarsal\b/i },
    { key:'mtp', title:'Metatarsophalangeal (MTP) and toe joints', re:/\bMetatarsophalangeal\b|\bMTP\b/i },
    { key:'plantar', title:'Plantar fascia origin', re:/\bPlantar\s*fascia(?:\s*origin)?\b/i },
    { key:'ptt', title:'Posterior tibial tendon sheath', re:/\bPosterior\s*tibial(?:is)?\b|\bTibialis\s*posterior\b/i },
    { key:'peroneal', title:'Peroneal tendon sheath', re:/\bPeroneal\b|\bFibularis\b/i },
    { key:'retrocalcaneal', title:'Retrocalcaneal (deep Achilles) bursa', re:/\bRetrocalcaneal\b|\bDeep\s*Achilles\b/i },
    { key:'morton', title:'Morton neuroma / intermetatarsal bursa', re:/\bMorton(?:'s)?\s*neuroma\b|\bIntermetatarsal\s*bursa\b/i }
  ];

  const text = el => String(el?.textContent || '').replace(/\s+/g,' ').trim();
  const isFootInjection = () => {
    const p = location.hash.split('/');
    return p[2] === 'injection' && /foot|ankle/i.test(p[1] || '');
  };

  function findHostSection() {
    const sections = [...document.querySelectorAll('#view .section')];
    return sections.find(s => {
      const t = text(s);
      return /Tibiotalar|Ankle joint/i.test(t) && /Subtalar|Sinus tarsi/i.test(t) && /Morton|Intermetatarsal/i.test(t);
    }) || null;
  }

  function findHeading(root, proc) {
    return [...root.querySelectorAll('h2,h3,h4,h5')].find(h => proc.re.test(text(h))) || null;
  }

  function commonParent(nodes, stop) {
    let p = nodes[0]?.parentElement || null;
    while (p && p !== stop.parentElement) {
      if (nodes.every(n => p.contains(n))) return p;
      p = p.parentElement;
    }
    return null;
  }

  function childUnder(parent,node) {
    let cur = node;
    while (cur && cur.parentElement !== parent) cur = cur.parentElement;
    return cur?.parentElement === parent ? cur : null;
  }

  function moveImagesFirst(body) {
    const blocks = [];
    [...body.querySelectorAll('.figs,figure,img')].forEach(el => {
      const block = el.closest('.figs') || el.closest('figure') || el;
      if (!body.contains(block) || blocks.some(b => b === block || b.contains(block))) return;
      for (let i=blocks.length-1;i>=0;i--) if (block.contains(blocks[i])) blocks.splice(i,1);
      blocks.push(block);
    });
    if (!blocks.length) return;
    const frag = document.createDocumentFragment();
    blocks.forEach(b => frag.appendChild(b));
    body.insertBefore(frag,body.firstChild);
  }

  function makeCard(proc,nodes,id) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub foot-ankle-inj-sub collapsed';
    card.dataset.footAnkleSection = VERSION;
    card.dataset.procedure = proc.key;
    if (id) card.id = id;

    const body = document.createElement('div');
    body.className = 'hand-inj-sub-body';
    nodes.forEach(n => body.appendChild(n));
    const repeatedHeading = [...body.querySelectorAll('h2,h3,h4,h5')].find(h => proc.re.test(text(h)));
    if (repeatedHeading) repeatedHeading.remove();
    moveImagesFirst(body);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hand-inj-sub-toggle';
    toggle.setAttribute('aria-expanded','false');

    const labelWrap = document.createElement('span');
    labelWrap.className = 'hand-inj-sub-text';
    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = proc.title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
    labelWrap.append(label,hint);

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
    toggle.append(labelWrap,thumb,chev);
    card.append(toggle,body);
    toggle.addEventListener('click',() => {
      const closed = card.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded',String(!closed));
    });
    return card;
  }

  function rebuild() {
    if (!isFootInjection()) return;
    const section = findHostSection();
    if (!section || section.dataset.footAnkleSource === VERSION) return;

    [...section.querySelectorAll('.hand-inj-sub')].forEach(card => {
      if (!/Tibiotalar|Subtalar|Midtarsal|Metatarsophalangeal|MTP|Plantar fascia|Posterior tibial|Peroneal|Retrocalcaneal|Morton/i.test(text(card))) return;
      const body = card.querySelector(':scope > .hand-inj-sub-body');
      if (!body) return;
      const title = text(card.querySelector('.hand-inj-sub-title'));
      const h = document.createElement('h3');
      h.className = 'sub';
      h.textContent = title;
      const frag = document.createDocumentFragment();
      frag.appendChild(h);
      while (body.firstChild) frag.appendChild(body.firstChild);
      card.replaceWith(frag);
    });

    const root = section.querySelector(':scope > .inj-collapse-body') || section;
    const pairs = PROCEDURES.map(proc => ({proc,heading:findHeading(root,proc)}));
    if (pairs.some(x => !x.heading)) return;

    const headings = pairs.map(x => x.heading);
    const parent = commonParent(headings,root);
    if (!parent) return;
    const starts = pairs.map(x => ({...x,block:childUnder(parent,x.heading)}));
    if (starts.some(x => !x.block) || new Set(starts.map(x => x.block)).size !== PROCEDURES.length) return;
    starts.sort((a,b) => a.block === b.block ? 0 : (a.block.compareDocumentPosition(b.block) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    const first = starts[0].block;
    const anchor = document.createElement('span');
    anchor.hidden = true;
    first.before(anchor);
    const cards = [];
    starts.forEach((item,i) => {
      const nextStart = starts[i+1]?.block || null;
      const nodes = [];
      let n = item.block;
      while (n && n !== nextStart) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      cards.push(makeCard(item.proc,nodes,item.heading.id || item.block.id || ''));
    });
    anchor.replaceWith(...cards);
    section.dataset.footAnkleSource = VERSION;
    document.documentElement.dataset.footAnkleCards = String(cards.length);
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; rebuild(); });
  }
  addEventListener('DOMContentLoaded',schedule);
  addEventListener('hashchange',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  rebuild();
  schedule();
})();
