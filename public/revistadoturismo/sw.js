const CACHE_NAME = 'revistadoturismo-v1';
const urlsToCache = []; // nothing cached on install

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request)); // always go to network
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((cache) => caches.delete(cache)))
    )
  );
});
