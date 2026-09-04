from pathlib import Path

path = Path('index.html')
s = path.read_text(encoding='utf-8')

# 1) Mark the actual Foot & Ankle landmark section in the source data.
old_section = '{"title": "4. Landmark-guided and image-guided approaches", "video": false, "parts": ['
new_section = '{"title": "4. Landmark-guided and image-guided approaches", "video": false, "sourceCards": true, "parts": ['
if new_section not in s:
    if s.count(old_section) != 1:
        raise SystemExit(f'Expected exactly one Foot landmark source section, found {s.count(old_section)}')
    s = s.replace(old_section, new_section, 1)

# 2) Add a source renderer for Foot cards. This is part of index.html itself, not a post-load patch.
marker = 'function renderRegion(rid, tabId) {'
helper_tag = 'function renderSourceFootCard(s, p, pi) {'
helper = r'''function renderSourceFootCard(s, p, pi) {
  const figureBlocks = p.content.filter(x => x.t === 'figures');
  const otherBlocks = p.content.filter(x => x.t !== 'figures');
  const ordered = [...figureBlocks, ...otherBlocks];
  const first = figureBlocks[0]?.items?.[0];
  const thumb = first
    ? `<span class="hand-inj-thumb"><img src="${IMG[first.src] || ''}" alt="${esc(first.caption || p.sub || 'Injection approach')}" loading="lazy"></span>`
    : `<span class="hand-inj-thumb no-image" aria-hidden="true"></span>`;
  return `<section class="hand-inj-sub region-inj-sub foot-ankle-inj-sub foot-source-card collapsed" id="p-${s.id}-${pi}" data-source-foot-card="1">
    <button type="button" class="hand-inj-sub-toggle" aria-expanded="false">
      <span class="hand-inj-sub-text">
        <span class="hand-inj-sub-title">${esc(p.sub)}</span>
        <span class="hand-inj-sub-hint">Tap to view landmarks, approach &amp; safety</span>
      </span>
      ${thumb}
      <span class="hand-inj-sub-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="hand-inj-sub-body">${ordered.map(block).join('')}</div>
  </section>`;
}

function renderSectionParts(rid, tabId, s) {
  if (!(rid === 'foot' && tabId === 'injection' && s.sourceCards)) {
    return s.parts.map((p, pi) => `${p.sub ? `<h3 class="sub" id="p-${s.id}-${pi}">${esc(p.sub)}</h3>` : ''}
        ${p.content.map(block).join('')}`).join('');
  }
  return s.parts.map((p, pi) => {
    if (!p.sub) return p.content.map(block).join('');
    if (/^4\.[1-9]\b/.test(p.sub)) return renderSourceFootCard(s, p, pi);
    return `<h3 class="sub" id="p-${s.id}-${pi}">${esc(p.sub)}</h3>${p.content.map(block).join('')}`;
  }).join('');
}

'''
if helper_tag not in s:
    if marker not in s:
        raise SystemExit('Could not find renderRegion in index.html')
    s = s.replace(marker, helper + marker, 1)

# 3) Route section-part rendering through the source-card renderer.
old_render = '''      ${s.parts.map((p, pi) => `${p.sub ? `<h3 class="sub" id="p-${s.id}-${pi}">${esc(p.sub)}</h3>` : ''}
        ${p.content.map(block).join('')}`).join('')}'''
new_render = '''      ${renderSectionParts(rid, tab.id, s)}'''
if new_render not in s:
    if s.count(old_render) != 1:
        raise SystemExit(f'Expected exactly one section-parts renderer, found {s.count(old_render)}')
    s = s.replace(old_render, new_render, 1)

# 4) Wire the source cards immediately after index.html renders the region.
wire_anchor = "  view.querySelectorAll('.tab').forEach(b => b.onclick = () => go(`#/${rid}/${b.dataset.tab}`));"
wire_tag = "view.querySelectorAll('.foot-source-card > .hand-inj-sub-toggle')"
wire = r'''  view.querySelectorAll('.foot-source-card > .hand-inj-sub-toggle').forEach(btn => {
    btn.onclick = () => {
      const card = btn.closest('.foot-source-card');
      if (!card) return;
      const closed = card.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!closed));
    };
  });
'''
if wire_tag not in s:
    if wire_anchor not in s:
        raise SystemExit('Could not find region interaction wiring anchor')
    s = s.replace(wire_anchor, wire + wire_anchor, 1)

path.write_text(s, encoding='utf-8')
print('Rebuilt Foot & Ankle source section in index.html')
print('sourceCards marker:', s.count('"sourceCards": true'))
print('source Foot card renderer:', s.count('function renderSourceFootCard'))
