/**
 * K Sebe Yoga Studio WEB - Service Worker
 * Provides offline support and caching strategies
 *
 * IMPORTANT: skipWaiting() is only called on explicit user request
 * to avoid breaking resource consistency during runtime.
 * @see https://web.dev/articles/service-worker-lifecycle
 */

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `ksebe-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ksebe-runtime-${CACHE_VERSION}`;

const CORE_ASSETS = ['/', '/index.html'];

// Install event - precache core assets
// NOTE: We do NOT call skipWaiting() here - only on user request
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// Handle SKIP_WAITING message from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  // Navigation requests - Network First with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request).then((response) => response || caches.match('/')))
    );
    return;
  }

  if (isSameOrigin) {
    // JS/CSS assets - Network First to ensure fresh code
    const isAsset = requestUrl.pathname.match(/\.(js|css|mjs)$/);

    if (isAsset) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    } else {
      // Images and other assets - Stale While Revalidate
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
              }
              return response;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        })
      );
    }
  }
});
