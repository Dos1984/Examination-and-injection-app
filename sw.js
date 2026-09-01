/* MSK Examination & Injection Guide — offline service worker */
const VERSION = 'msk-v11';
const SHELL = `${VERSION}-shell`;
const SHELL_FILES = ['manifest.webmanifest','ui-landmark.css','ui-landmark.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

function enhanceHtml(html) {
  /* Illustration is the application default. */
  html = html.replace(
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'silhouette' };",
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'illustration' };"
  );

  /* Replace only the right-hand image in the Olecranon bursa section. */
  html = html.replace(
    'const IMG = {',
    'const IMG = {"Olecranon_Bursa_Replacement":"images/olecranon-bursa-aspiration-injection.png.png",'
  );
  html = html.replace(
    '"src": "Comprehensive_Elbow_Examination_and_Injection_Guide__image22", "caption": "Aspiration/injection illustration from the supplied material."',
    '"src": "Olecranon_Bursa_Replacement", "caption": "Olecranon bursa aspiration/injection approach."'
  );

  /* Expand the trigger-finger alternative direct technique and add a compact schematic. */
  html = html.replace(
    'Alternative direct techniques are described in the source manuals.',
    'Alternative direct A1 pulley approach: palpate the A1 pulley at the MCP crease/maximal tenderness and insert the needle directly over the flexor tendon, approximately perpendicular to the skin or with only a slight distal angle. Advance carefully until firm pulley/tendon resistance is encountered, then withdraw the tip slightly before injecting so the needle is not intratendinous. If the syringe/needle moves with active finger flexion-extension, withdraw slightly and re-check before injection. The aim is to deposit corticosteroid around the A1 pulley/flexor sheath rather than within the tendon.<div style="margin:16px 0 4px;padding:14px;border:1px solid #d7e0e2;border-radius:12px;background:#fbfcfc;max-width:760px"><div style="font-weight:700;margin-bottom:8px;color:#8f4a19">Direct A1 pulley approach — schematic</div><svg viewBox="0 0 760 250" role="img" aria-label="Schematic showing a direct volar needle approach to the A1 pulley" style="width:100%;height:auto;display:block"><rect x="0" y="0" width="760" height="250" rx="10" fill="#ffffff"/><path d="M90 185 C150 170 205 162 270 158 C350 153 435 150 520 148 C575 147 625 150 675 158" fill="none" stroke="#e5b08f" stroke-width="54" stroke-linecap="round"/><path d="M118 178 C205 167 303 160 401 156 C495 152 581 151 656 157" fill="none" stroke="#f4cdb4" stroke-width="40" stroke-linecap="round"/><path d="M245 164 C320 158 395 155 475 154" fill="none" stroke="#d8c08f" stroke-width="8" stroke-linecap="round"/><rect x="315" y="132" width="66" height="48" rx="20" fill="none" stroke="#9b5b37" stroke-width="7"/><text x="348" y="116" text-anchor="middle" font-size="19" font-family="Arial, sans-serif" fill="#6a3b22">A1 pulley</text><line x1="348" y1="22" x2="348" y2="126" stroke="#5d6870" stroke-width="8" stroke-linecap="round"/><polygon points="348,136 337,116 359,116" fill="#5d6870"/><rect x="332" y="6" width="32" height="70" rx="5" fill="#d8e1e5" stroke="#5d6870" stroke-width="3"/><line x1="348" y1="76" x2="348" y2="126" stroke="#b9c3c8" stroke-width="4"/><text x="382" y="55" font-size="18" font-family="Arial, sans-serif" fill="#33444b">direct volar needle</text><text x="382" y="80" font-size="17" font-family="Arial, sans-serif" fill="#53666e">withdraw slightly before injection</text><text x="348" y="216" text-anchor="middle" font-size="17" font-family="Arial, sans-serif" fill="#53666e">Flexor tendon / sheath</text></svg><div style="font-size:.88rem;color:#5a6a70;margin-top:7px">Schematic only: keep the needle tip out of the flexor tendon; reposition if the needle moves with tendon excursion.</div></div>'
  );

  if (!html.includes('ui-landmark.css')) html = html.replace('</head>', '<link rel="stylesheet" href="ui-landmark.css"></head>');
  if (!html.includes('ui-landmark.js')) html = html.replace('</body>', '<script src="ui-landmark.js"></script></body>');
  return html;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.toLowerCase().endsWith('.mp4')) return;

  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/Examination-and-injection-app/')) {
    e.respondWith(fetch(req).then(async res => {
      if (!res.ok) return res;
      const html = enhanceHtml(await res.text());
      return new Response(html, {status: res.status, statusText: res.statusText, headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
    }).catch(() => fetch(req)));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
    return res;
  })));
});
