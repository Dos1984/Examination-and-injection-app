from pathlib import Path

# Keep guide refinements matched after source-level renaming/renumbering.
g = Path('guide-integrated-v24.js')
s = g.read_text(encoding='utf-8')
s = s.replace("{re:/6\\.\\s*Intra-articular elbow injection/i,", "{re:/(?:6\\.\\s*Intra-articular elbow injection|Elbow joint.*Injection)/i,")
s = s.replace("{re:/9\\.\\s*Olecranon bursa/i,", "{re:/(?:9\\.\\s*Olecranon bursa|Olecranon bursa.*Aspiration and Injection)/i,")
s = s.replace("{re:/Injection Technique for GTPS/i,", "{re:/(?:Injection Technique for GTPS|Greater trochanteric pain syndrome.*Injection)/i,")
s = s.replace("{re:/^4\\.1\\s+Tibiotalar/i,", "{re:/(?:^\\d+(?:\\.\\d+)?\\s+)?Tibiotalar/i,")
s = s.replace("{re:/^4\\.2\\s+Subtalar/i,", "{re:/(?:^\\d+(?:\\.\\d+)?\\s+)?Subtalar/i,")
s = s.replace("{re:/^4\\.4\\s+Metatarsophalangeal/i,", "{re:/(?:^\\d+(?:\\.\\d+)?\\s+)?(?:Metatarsophalangeal|MTP)/i,")
s = s.replace(
    "if(route()!=='hip'||document.querySelector('[data-guide-hip-joint=\"v24\"]'))return;",
    "if(route()!=='hip'||document.querySelector('[data-guide-hip-joint=\"v24\"]')||allTargets().some(x=>/Hip joint injection/i.test(x.title)))return;"
)
g.write_text(s, encoding='utf-8')

# Move every injection image group to the start of its expanded body, including
# late-added guide images in Shoulder/Hip/Elbow procedure bodies.
p = Path('presentation-layout-v28.js')
s = p.read_text(encoding='utf-8')
old = '''  function moveInjectionImagesFirst() {
    if (!isInjection()) return;
    document.querySelectorAll('#view .hand-inj-sub-body').forEach(body => {
      if (body.dataset.imageFirstV28 === '1') return;
      const visualBlocks = [...body.children].filter(el => el.matches('.figs, figure'));
      if (!visualBlocks.length) {
        body.dataset.imageFirstV28 = '1';
        return;
      }
      const frag = document.createDocumentFragment();
      visualBlocks.forEach(el => frag.appendChild(el));
      body.prepend(frag);
      body.dataset.imageFirstV28 = '1';
    });
  }'''
new = '''  function moveInjectionImagesFirst() {
    if (!isInjection()) return;
    document.querySelectorAll('#view .hand-inj-sub-body, #view .inj-collapse-body').forEach(body => {
      const visualBlocks = [...body.children].filter(el => el.matches('.figs, figure'));
      if (!visualBlocks.length) return;
      const frag = document.createDocumentFragment();
      visualBlocks.forEach(el => frag.appendChild(el));
      body.prepend(frag);
    });
  }'''
if old not in s:
    raise SystemExit('presentation-layout image mover not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# Force a fresh service-worker rollout for the source rebuild and compatibility updates.
sw = Path('sw.js')
s = sw.read_text(encoding='utf-8')
s = s.replace("const VERSION = 'msk-v43';", "const VERSION = 'msk-v44';")
s = s.replace('?v=43', '?v=44')
sw.write_text(s, encoding='utf-8')

print('Patched guide matching, image-first layout, and service worker version')
