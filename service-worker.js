/**
 * Zenith Service Worker — Cache-first strategy for offline support.
 */
const CACHE_NAME    = 'zenith-v2';
const RUNTIME_CACHE = 'zenith-runtime-v2';
const SHELL_URLS    = ['/zeeee/', '/zeeee/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Google Fonts — cache-first
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(e.request).then(
          (hit) => hit || fetch(e.request).then((res) => { cache.put(e.request, res.clone()); return res; })
        )
      )
    );
    return;
  }

  // Same-origin — cache-first with network fallback
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            if (res && res.status === 200 && res.type === 'basic') {
              const clone = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(e.request, clone));
            }
            return res;
          }).catch(() => caches.match('/'))
      )
    );
  }
});
