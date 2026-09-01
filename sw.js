/* MSK Examination & Injection Guide — offline service worker */
const VERSION = 'msk-v14';
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

  /* Add external replacement/teaching illustrations to the image registry.
     Trigger-finger figures use raw GitHub URLs to bypass stale/blank Pages cache entries. */
  html = html.replace(
    'const IMG = {',
    'const IMG = {"Olecranon_Bursa_Replacement":"images/olecranon-bursa-aspiration-injection.png.png","Trigger_Finger_Direct_A1_Schematic":"https://raw.githubusercontent.com/Dos1984/Examination-and-injection-app/main/images/direct-a1-pulley-schematic.webp?v=2","Trigger_Finger_Direct_A1_Photo":"https://raw.githubusercontent.com/Dos1984/Examination-and-injection-app/main/images/direct-a1-pulley-photo.webp?v=2",'
  );

  /* Replace only the right-hand image in the Olecranon bursa section. */
  html = html.replace(
    '"src": "Comprehensive_Elbow_Examination_and_Injection_Guide__image22", "caption": "Aspiration/injection illustration from the supplied material."',
    '"src": "Olecranon_Bursa_Replacement", "caption": "Olecranon bursa aspiration/injection approach."'
  );

  /* Trigger finger: retain the two existing figures and add the two supplied direct-approach images. */
  html = html.replace(
    '{"src": "Comprehensive_Hand_Wrist_Examination_and_Injection_Guide__image19", "caption": "A1 pulley / trigger finger anatomy"}, {"src": "Comprehensive_Hand_Wrist_Examination_and_Injection_Guide__image20", "caption": "Trigger finger injection trajectory"}',
    '{"src": "Comprehensive_Hand_Wrist_Examination_and_Injection_Guide__image19", "caption": "A1 pulley / trigger finger anatomy"}, {"src": "Comprehensive_Hand_Wrist_Examination_and_Injection_Guide__image20", "caption": "Trigger finger injection trajectory (proximal-to-distal approach)"}, {"src": "Trigger_Finger_Direct_A1_Schematic", "caption": "Needle path and target (direct A1 pulley approach)"}, {"src": "Trigger_Finger_Direct_A1_Photo", "caption": "Needle entry directly over A1 pulley (short-axis approach)"}'
  );

  /* Replace the source-manual referral with practical landmark guidance. */
  html = html.replace(
    '"sub": ["Alternative direct techniques are described in the source manuals."]',
    '"sub": ["Alternative direct A1 pulley approach: palpate the A1 pulley at the volar MCP crease, usually at the point of maximal tenderness or palpable nodule.", "Insert the needle in the midline directly over the flexor tendon, approximately perpendicular to the skin (or with only a slight distal angle). Advance cautiously until resistance from the pulley/tendon is felt, then withdraw the needle slightly before injecting to avoid intratendinous placement.", "Ask the patient to gently flex and extend the finger before injection. If the needle or syringe moves with the tendon, withdraw slightly and reassess.", "Aim to deposit injectate around the A1 pulley/flexor sheath rather than within the tendon. The digital neurovascular bundles lie to either side, so keep the approach strictly midline."]'
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
