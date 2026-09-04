/* v37 — Foot & Ankle landmark procedures use the exact Hand & Wrist card pattern. */
(() => {
  const isInjection = () => location.hash.split('/')[2] === 'injection';
  const numberRe = /^\s*4\.\d+\b/;

  function sectionTitle(section) {
    return (section.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent ||
      section.querySelector(':scope > h2')?.textContent || '').trim();
  }

  function findFootLandmarkSection() {
    const sections = [...document.querySelectorAll('#view .section')];
    const byTitle = sections.find(s => /landmark-guided.*(?:image-guided)?.*approaches|landmark injections?/i.test(sectionTitle(s)) && /tibiotalar|subtalar/i.test(s.textContent || ''));
    if (byTitle) return byTitle;
    return sections.find(s => {
      const body = s.querySelector(':scope > .inj-collapse-body') || s;
      const hits = [...body.querySelectorAll('*')].filter(el => {
        const t = (el.textContent || '').trim();
        return numberRe.test(t) && t.length < 140;
      });
      return hits.length >= 5 && /tibiotalar/i.test(body.textContent || '') && /morton/i.test(body.textContent || '');
    }) || null;
  }

  function directChildUnder(ancestor, node) {
    let n = node;
    while (n && n.parentElement !== ancestor) n = n.parentElement;
    return n && n.parentElement === ancestor ? n : null;
  }

  function findProcedureLabels(body) {
    const all = [...body.querySelectorAll('*')].filter(el => {
      if (el.closest('.hand-inj-sub')) return false;
      const t = (el.textContent || '').trim();
      if (!numberRe.test(t) || t.length > 140) return false;
      return ![...el.children].some(c => (c.textContent || '').trim() === t);
    });

    const labels = [];
    const seenAnchors = new Set();
    all.forEach(el => {
      const anchor = directChildUnder(body, el);
      if (!anchor || seenAnchors.has(anchor)) return;
      seenAnchors.add(anchor);
      labels.push({label:el, anchor});
    });
    labels.sort((a,b) => [...body.children].indexOf(a.anchor) - [...body.children].indexOf(b.anchor));
    return labels;
  }

  function makeCard(title, nodes, originalId) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub collapsed';
    card.dataset.footAnkleHandstyle = 'v37';
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

    const text = document.createElement('span');
    text.className = 'hand-inj-sub-text';
    const label = document.createElement('span');
    label.className = 'hand-inj-sub-title';
    label.textContent = title;
    const hint = document.createElement('span');
    hint.className = 'hand-inj-sub-hint';
    hint.textContent = 'Tap to view landmarks, approach & safety';
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

  function convert() {
    if (!isInjection()) return;
    const section = findFootLandmarkSection();
    if (!section || section.dataset.footAnkleHandstyle === 'v37') return;
    const body = section.querySelector(':scope > .inj-collapse-body') || section;
    const labels = findProcedureLabels(body);
    if (labels.length < 5) return;

    const children = [...body.children];
    const segments = labels.map((entry, i) => {
      const start = children.indexOf(entry.anchor);
      const end = i + 1 < labels.length ? children.indexOf(labels[i + 1].anchor) : children.length;
      return {entry, nodes:children.slice(start, end)};
    });

    segments.forEach(({entry, nodes}) => {
      const title = (entry.label.textContent || '').trim();
      const originalId = entry.label.id || entry.anchor.id || '';
      const insertionPoint = nodes[0];
      if (!insertionPoint?.parentElement) return;

      const cardNodes = [];
      nodes.forEach(node => {
        if (node === entry.label) return;
        if (node.contains(entry.label)) {
          entry.label.remove();
          if ((node.textContent || '').trim() || node.querySelector('img,figure,.figs,.callout,ul,ol,p')) cardNodes.push(node);
        } else {
          cardNodes.push(node);
        }
      });

      const card = makeCard(title, cardNodes, originalId);
      insertionPoint.before(card);
      if (entry.label.isConnected) entry.label.remove();
      if (entry.anchor.isConnected && entry.anchor !== card && !card.contains(entry.anchor)) {
        if (!(entry.anchor.textContent || '').trim() && !entry.anchor.querySelector('img,figure,.figs,.callout,ul,ol,p')) entry.anchor.remove();
      }
    });

    section.dataset.footAnkleHandstyle = 'v37';
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
