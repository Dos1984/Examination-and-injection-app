from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
needles = [
    'Tibiotalar (ankle) joint',
    'Subtalar joint / sinus tarsi',
    'Landmark-guided and image-guided approaches',
    'Plantar fascia origin',
    'Morton neuroma / intermetatarsal bursa',
    'function figures',
    'function renderSection',
    'function renderRegion',
]
positions = [(n, s.find(n)) for n in needles]
found = [(n, i) for n, i in positions if i >= 0]
if not found:
    raise SystemExit('Could not find Foot & Ankle source markers in index.html')
lo = max(0, min(i for n, i in found if 'Tibiotalar' in n or 'Landmark-guided' in n) - 18000)
hi = len(s)
out = ['INDEX LENGTH: %d' % len(s), 'MARKERS:']
out += [f'{n}: {i}' for n, i in positions]
out += ['', '--- SOURCE EXCERPT ---', s[lo:hi]]
Path('tools/foot-source-excerpt.txt').write_text('\n'.join(out), encoding='utf-8')
print('wrote tools/foot-source-excerpt.txt', lo, hi)
