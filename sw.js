/* MSK Examination & Injection Guide — offline service worker
   The app shell (index.html) carries every photograph and diagram inline, so
   caching it makes the whole reference available offline. Videos are large, so
   they are cached only after they have been watched once. */

const VERSION = 'msk-v1';
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;

const SHELL_FILES = [
  '.', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Videos: network first, then cache what has been watched. Range requests
  // (seeking) are passed straight through — the Cache API cannot serve them.
  if (url.pathname.endsWith('.mp4')) {
    if (req.headers.has('range')) return;
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(MEDIA).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req)))
    );
    return;
  }

  // App shell: cache first, refresh in the background.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
