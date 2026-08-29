/* MSK Examination & Injection Guide — offline service worker */
const VERSION = 'msk-v4';
const SHELL = `${VERSION}-shell`;
const SHELL_FILES = ['manifest.webmanifest','ui-landmark.css','ui-landmark.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

function enhanceHtml(html) {
  if (!html.includes('ui-landmark.css')) html = html.replace('</head>', '<link rel="stylesheet" href="ui-landmark.css"></head>');
  if (!html.includes('ui-landmark.js')) html = html.replace('</body>', '<script src="ui-landmark.js"></script></body>');
  return html;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Leave video delivery entirely to GitHub Pages/browser byte-range handling.
  if (url.pathname.toLowerCase().endsWith('.mp4')) return;

  // Inject the lightweight landmark/collapsible UI assets into the large
  // single-file app at delivery time, avoiding a risky 4 MB index rewrite.
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
