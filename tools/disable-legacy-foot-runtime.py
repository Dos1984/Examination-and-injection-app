from pathlib import Path

p = Path('ui-landmark.js')
s = p.read_text(encoding='utf-8')
old = """  function makeFootAnkleSubsectionsCollapsible() {
    if (!isInjectionTab()) return;
    const view = document.querySelector('#view');
    if (!view) return;
"""
new = """  function makeFootAnkleSubsectionsCollapsible() {
    if (!isInjectionTab()) return;
    const view = document.querySelector('#view');
    if (!view) return;
    /* Foot & Ankle 4.1–4.9 are now rendered as real source cards in index.html. */
    if (view.querySelector('.foot-source-card[data-source-foot-card=\"1\"]')) return;
"""
if new not in s:
    if old not in s:
        raise SystemExit('Could not find legacy Foot runtime function anchor')
    s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('Legacy Foot runtime conversion disabled when source cards are present')
