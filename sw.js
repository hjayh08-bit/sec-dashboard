const CACHE = 'eddies-grit-hub-v2';
const ASSETS = [
  '/eddies-grit-hub/',
  '/eddies-grit-hub/index.html',
  '/eddies-grit-hub/style.css',
  '/eddies-grit-hub/script.js',
  '/eddies-grit-hub/manifest.json',
  '/eddies-grit-hub/eddiesLogoWhite.png',
  '/eddies-grit-hub/house_h.png',
  '/eddies-grit-hub/house_m.png',
  '/eddies-grit-hub/house_t.png',
  '/eddies-grit-hub/house_o.png',
  '/eddies-grit-hub/house_r.png',
  '/eddies-grit-hub/house_c.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
