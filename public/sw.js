/* Champions Rivals: always-online PWA worker.
 * Do not cache the application shell: GitHub Pages updates must appear on normal visits.
 * Build metadata remains injected by Vite for versioned worker updates.
 */
const cachePrefix = 'champions-rivals-pwa-';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) =>
      name.startsWith(cachePrefix)
    ).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

// No fetch handler: all navigations, JSON, CSS, JavaScript, icons and images
// follow the browser's ordinary HTTP/network rules. No stale PWA cache.
