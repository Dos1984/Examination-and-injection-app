from pathlib import Path

path = Path('index.html')
src = path.read_text(encoding='utf-8')

src = src.replace('"title": "Photographic examination sequence"', '"title": "Approach to Examination"')

src = src.replace(
    '<img src="${IMG[f.src] || \'\'}" alt="${esc(f.caption || \'\')}" loading="lazy">',
    '<img src="${IMG[f.src] || (/[/\\\\.]/.test(f.src || \'\') ? f.src : \'\')}" alt="${esc(f.caption || \'\')}" loading="lazy">'
)
src = src.replace(
    "$('#lbImg').src = IMG[f.src] || '';",
    "$('#lbImg').src = IMG[f.src] || (/[/\\\\.]/.test(f.src || '') ? f.src : '');"
)

start = src.find('function renderSourceFootCard')
end = src.find('function renderRegion', start)
if start < 0 or end < 0:
    raise SystemExit('Could not locate source-card renderer block')

helpers = r'''function stripDisplayNumber(value) {
  return String(value || '').replace(/^\s*\d+(?:\.\d+)*[.)]?\s*/, '').trim();
}

function prepareSourceRegionStructure() {
  const foot = REG.foot?.tabs?.find(t => t.id === 'injection');
  if (foot) {
    const landmark = foot.sections.find(s => /landmark-guided|landmark injections/i.test(s.title));
    if (landmark) {
      landmark.title = 'Landmark Injections';
      landmark.sourceCards = true;
    }
  }

  const elbow = REG.elbow?.tabs?.find(t => t.id === 'injection');
  if (elbow && !elbow.__sourceGrouped) {
    const landmarkMembers = elbow.sections.filter(s =>
      /intra-articular elbow injection|lateral epicondylalgia|medial epicondylalgia|olecranon bursa|distal biceps tendon/i.test(s.title)
    );
    if (landmarkMembers.length) {
      const titleFor = s => {
        const t = stripDisplayNumber(s.title);
        if (/intra-articular elbow injection/i.test(t)) return 'Elbow joint — Injection';
        if (/lateral epicondylalgia/i.test(t)) return 'Lateral epicondyle — Injection';
        if (/medial epicondylalgia/i.test(t)) return 'Medial epicondyle — Injection';
        if (/olecranon bursa/i.test(t)) return 'Olecranon bursa — Aspiration and Injection';
        if (/distal biceps tendon/i.test(t)) return 'Distal biceps tendon / bicipitoradial bursa — Injection';
        return t;
      };
      const firstIndex = Math.min(...landmarkMembers.map(s => elbow.sections.indexOf(s)));
      const grouped = {
        title: 'Landmark Injections',
        video: false,
        sourceCards: true,
        id: 'landmark-injections',
        parts: landmarkMembers.map((s, i) => ({
          sub: titleFor(s),
          content: [],
          nestedParts: s.parts,
          sourceId: s.id || `elbow-landmark-${i+1}`
        }))
      };
      elbow.sections = elbow.sections.filter(s => !landmarkMembers.includes(s));
      elbow.sections.splice(firstIndex, 0, grouped);
    }
    elbow.__sourceGrouped = true;
  }

  const hip = REG.hip?.tabs?.find(t => t.id === 'injection');
  if (hip && !hip.__sourceGrouped) {
    const gtpsIndex = hip.sections.findIndex(s => /Injection Technique for GTPS/i.test(s.title));
    if (gtpsIndex >= 0) {
      const gtps = hip.sections[gtpsIndex];
      const grouped = {
        title: 'Landmark Injections',
        video: false,
        sourceCards: true,
        id: 'landmark-injections',
        parts: [
          {
            sub: 'Greater trochanteric pain syndrome (GTPS) — Injection',
            content: [],
            nestedParts: gtps.parts,
            sourceId: gtps.id || 'gtps-injection'
          },
          {
            sub: 'Hip joint injection',
            sourceId: 'hip-joint-injection',
            content: [
              {t:'figures', items:[
                {src:'images/hip-joint-injection-diagram.jpg', caption:'Hip joint landmark injection diagram'},
                {src:'images/hip-joint-injection-clinical.jpg', caption:'Clinical hip joint injection positioning'}
              ]},
              {t:'p', text:'The supplied guide includes a landmark hip-joint injection technique. Intra-articular hip injection is a deep procedure close to the femoral neurovascular bundle, so careful landmark identification and appropriate needle length are essential.'},
              {t:'landmarks', rows:[
                {label:'Position', item:{text:'Position the patient supine and identify the femoral pulse and anterior superior iliac spine before marking the intended anterior approach.'}},
                {label:'Landmark approach', item:{text:'The supplied guide places the entry lateral to the femoral artery and distal to the inguinal ligament, with the needle directed toward the femoral neck until bone is contacted.'}},
                {label:'Safety', item:{text:'Because the joint is deep and the femoral neurovascular bundle is nearby, image guidance is commonly preferred where available and where required by local policy or competency.'}}
              ]}
            ]
          }
        ]
      };
      hip.sections.splice(gtpsIndex, 1, grouped);
    }
    hip.__sourceGrouped = true;
  }
}
prepareSourceRegionStructure();

function cardOrderedBlocks(p) {
  const own = Array.isArray(p.content) ? p.content : [];
  const nested = Array.isArray(p.nestedParts) ? p.nestedParts : [];
  const figures = own.filter(x => x.t === 'figures');
  nested.forEach(np => (np.content || []).forEach(x => { if (x.t === 'figures') figures.push(x); }));
  const ownOther = own.filter(x => x.t !== 'figures');
  return { figures, ownOther, nested };
}

function renderSourceProcedureCard(s, p, cardNumber, sectionNumber) {
  const { figures: figureBlocks, ownOther, nested } = cardOrderedBlocks(p);
  const first = figureBlocks[0]?.items?.[0];
  const displayTitle = `${sectionNumber}.${cardNumber} ${stripDisplayNumber(p.sub)}`;
  const thumbSrc = first ? (IMG[first.src] || (/[/\.]/.test(first.src || '') ? first.src : '')) : '';
  const thumb = first && thumbSrc
    ? `<span class="hand-inj-thumb"><img src="${thumbSrc}" alt="${esc(first.caption || p.sub || 'Injection approach')}" loading="lazy"></span>`
    : `<span class="hand-inj-thumb no-image" aria-hidden="true"></span>`;
  const nestedHtml = nested.map(np => {
    const heading = np.sub ? `<h3 class="sub">${esc(stripDisplayNumber(np.sub))}</h3>` : '';
    const nonFigures = (np.content || []).filter(x => x.t !== 'figures');
    return `${heading}${nonFigures.map(block).join('')}`;
  }).join('');
  return `<section class="hand-inj-sub region-inj-sub source-procedure-card collapsed" id="p-${s.id}-${cardNumber}" data-source-procedure-card="1">
    <button type="button" class="hand-inj-sub-toggle" aria-expanded="false">
      <span class="hand-inj-sub-text">
        <span class="hand-inj-sub-title">${esc(displayTitle)}</span>
        <span class="hand-inj-sub-hint">Tap to view landmarks, approach &amp; safety</span>
      </span>
      ${thumb}
      <span class="hand-inj-sub-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="hand-inj-sub-body">${figureBlocks.map(block).join('')}${ownOther.map(block).join('')}${nestedHtml}</div>
  </section>`;
}

function renderSectionParts(rid, tabId, s, sectionNumber) {
  if (!s.sourceCards) {
    let subNo = 0;
    return s.parts.map((p, pi) => {
      const heading = p.sub ? `<h3 class="sub" id="p-${s.id}-${pi}">${esc(`${sectionNumber}.${++subNo} ${stripDisplayNumber(p.sub)}`)}</h3>` : '';
      return `${heading}${p.content.map(block).join('')}`;
    }).join('');
  }
  let cardNo = 0;
  return s.parts.map(p => {
    if (!p.sub) return p.content.map(block).join('');
    cardNo += 1;
    return renderSourceProcedureCard(s, p, cardNo, sectionNumber);
  }).join('');
}

'''

src = src[:start] + helpers + src[end:]

old_body = '''  const body = tab.videos ? tab.videos.map(videoCard).join('') : tab.sections.map(s => `
    <section class="section" id="s-${s.id}">
      <h2>${esc(s.title)}${s.video ? (r.tabs.some(t => t.id === 'video')
        ? `<button class="videotag link" data-tabgo="${rid}/video">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>watch video</button>`
        : '') : ''}</h2>
      <div class="sec-rule"></div>
      ${renderSectionParts(rid, tab.id, s)}
    </section>`).join('');'''
new_body = '''  const body = tab.videos ? tab.videos.map(videoCard).join('') : tab.sections.map((s, si) => `
    <section class="section" id="s-${s.id}">
      <h2>${esc(`${si + 1}. ${stripDisplayNumber(s.title)}`)}${s.video ? (r.tabs.some(t => t.id === 'video')
        ? `<button class="videotag link" data-tabgo="${rid}/video">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>watch video</button>`
        : '') : ''}</h2>
      <div class="sec-rule"></div>
      ${renderSectionParts(rid, tab.id, s, si + 1)}
    </section>`).join('');'''
if old_body not in src:
    raise SystemExit('Could not locate renderRegion section-body template')
src = src.replace(old_body, new_body, 1)

old_nav = '''          ${(tab.videos || tab.sections).map((s, i) => tab.videos
            ? `<a href="#s-${s.id}" class="${i === 0 ? 'on' : ''}">${esc(s.title)}</a>`
            : `<a href="#s-${s.id}" class="${i === 0 ? 'on' : ''}">${esc(s.title)}</a>` +
            s.parts.map((p, pi) => p.sub ? `<a href="#p-${s.id}-${pi}" class="subl">${esc(p.sub)}</a>` : '').join('')).join('')}'''
new_nav = '''          ${(tab.videos || tab.sections).map((s, i) => tab.videos
            ? `<a href="#s-${s.id}" class="${i === 0 ? 'on' : ''}">${esc(s.title)}</a>`
            : `<a href="#s-${s.id}" class="${i === 0 ? 'on' : ''}">${esc(`${i + 1}. ${stripDisplayNumber(s.title)}`)}</a>` +
            s.parts.map((p, pi) => p.sub ? `<a href="#p-${s.id}-${s.parts.slice(0, pi + 1).filter(x => x.sub).length}" class="subl">${esc(`${i + 1}.${s.parts.slice(0, pi + 1).filter(x => x.sub).length} ${stripDisplayNumber(p.sub)}`)}</a>` : '').join('')).join('')}'''
if old_nav not in src:
    raise SystemExit('Could not locate side-navigation template')
src = src.replace(old_nav, new_nav, 1)

src = src.replace(
    "view.querySelectorAll('.foot-source-card > .hand-inj-sub-toggle').forEach(btn => {\n    btn.onclick = () => {\n      const card = btn.closest('.foot-source-card');",
    "view.querySelectorAll('.source-procedure-card > .hand-inj-sub-toggle').forEach(btn => {\n    btn.onclick = () => {\n      const card = btn.closest('.source-procedure-card');"
)

path.write_text(src, encoding='utf-8')
print('Updated index.html source structure')
