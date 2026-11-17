/* offlineBuild is injected by Vite at build time. */
const scope = self.registration.scope;
const prefix = `champions-rivals-pwa-${scope}-`;
const cacheName = prefix + offlineBuild.version;
const indexUrl = new URL('index.html', scope).href;
const dataPath = new URL('data/', scope).pathname;

self.addEventListener('install', (event) => {
  // Do not block a new release on third-party resources or precaching.
  // Versioned JavaScript and CSS are cached as the browser requests them.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) =>
      name === 'champions-rivals-pwa-v1' ||
      (name.startsWith(prefix) && name !== cacheName)
    ).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return;
  const navigation = request.mode === 'navigate';
  const isData = new URL(request.url).pathname.startsWith(dataPath);
  const isWorker = new URL(request.url).pathname.endsWith('/sw.js');

  // Let the browser update the worker through its standard mechanism.
  if (isWorker) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const key = navigation ? indexUrl : request;

    // HTML and JSON must be network-first to avoid serving stale releases.
    if (navigation || isData) {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          try { await cache.put(key, response.clone()); }
          catch { /* Unavailable storage must never block loading. */ }
          return response;
        }
        return (await cache.match(key)) ?? response;
      } catch {
        return (await cache.match(key)) ?? Response.error();
      }
    }

    // Versioned assets are immutable; use cache when already downloaded.
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && request.url.startsWith(scope)) {
        try { await cache.put(request, response.clone()); }
        catch { /* Optional cache. */ }
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
