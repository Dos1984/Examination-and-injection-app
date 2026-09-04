/* v32 — Standardise Injection > Landmark-guided techniques > procedure dropdowns.
   Layout only. Numbering is handled centrally by numbering-v29.js. */
(() => {
  const route = () => location.hash.split('/')[1] || '';
  const isInjection = () => location.hash.split('/')[2] === 'injection';

  const patterns = {
    elbow: [/elbow joint/i,/olecranon/i,/lateral epicondyl|tennis elbow/i,/medial epicondyl/i,/distal biceps|bicipitoradial/i],
    shoulder: [/glenohumeral/i,/subacromial/i,/acromioclavicular|\bAC joint/i,/bicipital|biceps.*groove/i],
    hip: [/hip joint|intra.?articular hip/i,/trochanter|GTPS|greater trochanteric/i],
    knee: [/knee joint|intra.?articular knee|patellofemoral|suprapatellar/i,/pes anser/i,/baker/i],
    ankle: [/ankle joint|tibiotalar/i,/subtalar|sinus tarsi/i,/posterior tibialis/i,/plantar fascia/i,/morton/i,/metatarsophalangeal|\bMTP\b/i],
    foot: [/ankle joint|tibiotalar/i,/subtalar|sinus tarsi/i,/posterior tibialis/i,/plantar fascia/i,/morton/i,/metatarsophalangeal|\bMTP\b/i]
  };

  function cleanTitle(text) {
    return String(text || '')
      .replace(/^\s*(?:Q\s*)?\d+(?:\.\d+)*\s*[.)]?\s*[-–—:]?\s*/i, '')
      .replace(/^\s*(?:procedure|approach)\s+\d+(?:\.\d+)*\s*[:.)-]?\s*/i, '')
      .trim();
  }
  function titleOf(section) {
    return (section.querySelector(':scope > .inj-collapse-toggle > span:first-child')?.textContent ||
      section.querySelector(':scope > h2')?.textContent || '').trim();
  }
  function bodyOf(section) {
    return section.querySelector(':scope > .inj-collapse-body') || section;
  }
  function matchesProcedure(text, regs) {
    return regs.some(re => re.test(text || ''));
  }

  function makeCard(title, nodes, id, marker) {
    const card = document.createElement('section');
    card.className = 'hand-inj-sub region-inj-sub collapsed';
    card.dataset.regionProcedure = 'v32';
    if (marker) card.dataset[marker] = 'v32';
    if (id) card.id = id;

    const subBody = document.createElement('div');
    subBody.className = 'hand-inj-sub-body';
    nodes.forEach(n => subBody.appendChild(n));

    const firstImg = subBody.querySelector('.figs figure img, figure img');
    const firstCaption = subBody.querySelector('.figs figure figcaption, figure figcaption')?.textContent?.trim() || `${cleanTitle(title)} injection approach`;

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

  function convertHeadings(outer, regs) {
    const body = bodyOf(outer);
    const headings = [...body.querySelectorAll(':scope > h3.sub')].filter(h => matchesProcedure(cleanTitle(h.textContent), regs));
    headings.forEach(h => {
      const title = cleanTitle(h.textContent);
      const nodes = [];
      let n = h.nextElementSibling;
      while (n && !n.matches('h3.sub')) {
        const next = n.nextElementSibling;
        nodes.push(n);
        n = next;
      }
      h.replaceWith(makeCard(title, nodes, h.id));
    });
  }

  function groupTopLevelSections(regs) {
    const view = document.querySelector('#view');
    if (!view) return null;
    const all = [...view.querySelectorAll(':scope > .section')];
    const existing = all.find(s => /landmark[ -]guided injection techniques|landmark injections?/i.test(cleanTitle(titleOf(s))));
    if (existing) return existing;

    const procedureSections = all.filter(s => matchesProcedure(cleanTitle(titleOf(s)), regs));
    if (procedureSections.length < 2) return null;

    const outer = document.createElement('section');
    outer.className = 'section region-landmark-section';
    outer.dataset.regionLandmark = 'v32';
    const h2 = document.createElement('h2');
    h2.textContent = 'Landmark-guided injection techniques';
    outer.appendChild(h2);
    procedureSections[0].before(outer);

    procedureSections.forEach(sec => {
      const title = cleanTitle(titleOf(sec));
      const srcBody = bodyOf(sec);
      const nodes = [...srcBody.children];
      const marker = sec.dataset.guideHipJoint ? 'guideHipJointCard' : null;
      outer.appendChild(makeCard(title, nodes, sec.id, marker));
      sec.remove();
    });
    return outer;
  }

  function ensure() {
    if (!isInjection()) return;
    const regs = patterns[route()];
    if (!regs) return;
    const view = document.querySelector('#view');
    if (!view) return;

    let outer = groupTopLevelSections(regs);
    if (!outer) {
      const sections = [...view.querySelectorAll(':scope > .section')];
      const candidate = sections
        .map(s => ({s, score:[...bodyOf(s).querySelectorAll(':scope > h3.sub')].filter(h => matchesProcedure(cleanTitle(h.textContent), regs)).length}))
        .sort((a,b) => b.score-a.score)[0];
      outer = candidate?.score >= 2 ? candidate.s : null;
    }
    if (!outer) return;

    const h2 = outer.querySelector(':scope > h2');
    const btnLabel = outer.querySelector(':scope > .inj-collapse-toggle > span:first-child');
    if (h2) h2.textContent = cleanTitle(h2.textContent) || 'Landmark-guided injection techniques';
    if (btnLabel) btnLabel.textContent = cleanTitle(btnLabel.textContent) || 'Landmark-guided injection techniques';

    convertHeadings(outer, regs);
    outer.dataset.regionLandmark = 'v32';
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ensure(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('hashchange', schedule);
  addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
