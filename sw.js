/* MSK Examination & Injection Guide — offline service worker */
const VERSION = 'msk-v34';
const SHELL = `${VERSION}-shell`;
const SHELL_FILES = [
  'manifest.webmanifest',
  'ui-landmark.css',
  'ui-landmark.js',
  'trigger-fix-v16.js',
  'guide-integrated-v24.js',
  'region-layout-v26.js',
  'presentation-layout-v28.js',
  'numbering-v29.js',
  'personal-images-v30.js',
  'images/direct-a1-pulley-schematic-final.png',
  'direct-a1-pulley-clinical-photo-final.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)));
  await self.clients.claim();
  const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
  await Promise.all(windows.map(async client => {
    try {
      const u = new URL(client.url);
      if (u.origin !== self.location.origin) return;
      const marker = `sw-${VERSION}`;
      if (u.searchParams.get('_appv') === marker) return;
      u.searchParams.set('_appv', marker);
      await client.navigate(u.href);
    } catch (_) {}
  }));
})()));

function enhanceHtml(html) {
  html = html.replace(
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'silhouette' };",
    "const DEFAULTS = { bg: '#EAEFEF', figure: 'illustration' };"
  );
  html = html.replace(
    'const IMG = {',
    'const IMG = {"Olecranon_Bursa_Replacement":"images/olecranon-bursa-aspiration-injection.png.png",'
  );
  html = html.replace(
    '"src": "Comprehensive_Elbow_Examination_and_Injection_Guide__image22", "caption": "Aspiration/injection illustration from the supplied material."',
    '"src": "Olecranon_Bursa_Replacement", "caption": "Olecranon bursa aspiration/injection approach."'
  );

  if (!html.includes('ui-landmark.css')) html = html.replace('</head>', '<link rel="stylesheet" href="ui-landmark.css?v=34"></head>');
  if (!html.includes('ui-landmark.js')) html = html.replace('</body>', '<script src="ui-landmark.js?v=34"></script></body>');
  if (!html.includes('trigger-fix-v16.js')) html = html.replace('</body>', '<script src="trigger-fix-v16.js?v=34"></script></body>');
  if (!html.includes('guide-integrated-v24.js')) html = html.replace('</body>', '<script src="guide-integrated-v24.js?v=34"></script></body>');
  if (!html.includes('region-layout-v26.js')) html = html.replace('</body>', '<script src="region-layout-v26.js?v=34"></script></body>');
  if (!html.includes('presentation-layout-v28.js')) html = html.replace('</body>', '<script src="presentation-layout-v28.js?v=34"></script></body>');
  if (!html.includes('numbering-v29.js')) html = html.replace('</body>', '<script src="numbering-v29.js?v=34"></script></body>');
  if (!html.includes('personal-images-v30.js')) html = html.replace('</body>', '<script src="personal-images-v30.js?v=34"></script></body>');

  if (!html.includes('data-msk-sw-updater')) html = html.replace('</body>', `<script data-msk-sw-updater>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update().catch(() => {});
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });
    }).catch(() => {});
  }
  </script></body>`);
  return html;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.toLowerCase().endsWith('.mp4')) return;

  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/Examination-and-injection-app/')) {
    e.respondWith(fetch(req, {cache:'no-store'}).then(async res => {
      if (!res.ok) return res;
      const html = enhanceHtml(await res.text());
      return new Response(html, {status:res.status,statusText:res.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
    }).catch(async () => {
      const cached = await caches.match('index.html');
      return cached || Response.error();
    }));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
    return res;
  })));
});
