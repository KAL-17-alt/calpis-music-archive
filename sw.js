// Cache safety patch v2: don't intercept HTML, JavaScript, or JSON.
// The site relies on frequently updated data.js produced by GitHub Actions.
const CACHE_PREFIX = 'calpis-archive-pwa-';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Clear older app-created caches without touching unrelated browser storage.
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Navigation, scripts, and JSON always use the browser's normal HTTP path.
  // Do not serve stale or missing archive data from Service Worker caches.
  if (event.request.mode === 'navigate' || url.pathname.startsWith('/api/') || /\.(?:html|js|json)$/i.test(url.pathname) || url.pathname === '/') return;

  // Preserve the previous network-first behavior for non-critical assets.
  event.respondWith(fetch(event.request).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    throw new Error('Network unavailable and no offline asset cached');
  }));
});
