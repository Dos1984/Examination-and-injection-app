from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
needles = [
    'Tibiotalar (ankle) joint',
    'Subtalar joint / sinus tarsi',
    'Landmark-guided and image-guided approaches',
    'Plantar fascia origin',
    'Morton neuroma / intermetatarsal bursa',
]
positions = [(n, s.find(n)) for n in needles]
found = [(n, i) for n, i in positions if i >= 0]
if not found:
    raise SystemExit('Could not find Foot & Ankle source markers in index.html')
lo = max(0, min(i for _, i in found) - 18000)
hi = min(len(s), max(i for _, i in found) + 30000)
out = ['INDEX LENGTH: %d' % len(s), 'MARKERS:']
out += [f'{n}: {i}' for n, i in positions]
out += ['', '--- SOURCE EXCERPT ---', s[lo:hi]]
Path('tools/foot-source-excerpt.txt').write_text('\n'.join(out), encoding='utf-8')
print('wrote tools/foot-source-excerpt.txt', lo, hi)
