/* MSK Examination & Injection Guide — offline service worker */
const VERSION = 'msk-v19';
const SHELL = `${VERSION}-shell`;
const SHELL_FILES = [
  'manifest.webmanifest',
  'ui-landmark.css',
  'ui-landmark.js',
  'trigger-fix-v16.js',
  'images/direct-a1-pulley-schematic-final.png',
  'images/direct-a1-pulley-photo.webp',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

function enhanceHtml(html) {
  /* Illustration is the application default; Silhouette remains selectable. */
  html = html.replace(
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'silhouette' };",
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'illustration' };"
  );

  /* Replace only the right-hand Olecranon bursa image. */
  html = html.replace(
    'const IMG = {',
    'const IMG = {"Olecranon_Bursa_Replacement":"images/olecranon-bursa-aspiration-injection.png.png",'
  );
  html = html.replace(
    '"src": "Comprehensive_Elbow_Examination_and_Injection_Guide__image22", "caption": "Aspiration/injection illustration from the supplied material."',
    '"src": "Olecranon_Bursa_Replacement", "caption": "Olecranon bursa aspiration/injection approach."'
  );

  if (!html.includes('ui-landmark.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="ui-landmark.css"></head>');
  }
  if (!html.includes('ui-landmark.js')) {
    html = html.replace('</body>', '<script src="ui-landmark.js"></script></body>');
  }
  if (!html.includes('trigger-fix-v16.js')) {
    html = html.replace('</body>', '<script src="trigger-fix-v16.js"></script></body>');
  }
  return html;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* Leave video byte-range delivery to GitHub Pages/browser. */
  if (url.pathname.toLowerCase().endsWith('.mp4')) return;

  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/Examination-and-injection-app/')) {
    e.respondWith(fetch(req).then(async res => {
      if (!res.ok) return res;
      const html = enhanceHtml(await res.text());
      return new Response(html, {
        status: res.status,
        statusText: res.statusText,
        headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}
      });
    }).catch(() => fetch(req)));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
    return res;
  })));
});
