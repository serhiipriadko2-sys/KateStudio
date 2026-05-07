/**
 * K Sebe Yoga Studio WEB - Service Worker
 * Provides offline support and caching strategies
 *
 * BUILD_ID is injected at build time by the Vite plugin so that every
 * deployment produces a byte-different sw.js → browser detects the update.
 *
 * Navigation requests (HTML) are NEVER cached to prevent serving a stale
 * index.html with outdated JS chunk hashes after a deployment.
 *
 * skipWaiting() + clients.claim() ensure the new SW activates immediately.
 * @see https://web.dev/articles/service-worker-lifecycle
 */

// Replaced at build time. In dev this stays as-is (harmless).
const BUILD_ID = '__BUILD_ID__';
const CACHE_NAME = `ksebe-web-${BUILD_ID}`;
const RUNTIME_CACHE = `ksebe-web-runtime-${BUILD_ID}`;

// Assets to cache on install (only truly static assets, NOT the HTML shell)
const PRECACHE_ASSETS = [
  '/favicon.png',
  '/apple-touch-icon.png',
  '/manifest.json',
];

// ── Install ────────────────────────────────────────────────────────────────────
// Precache essential static assets and activate immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Installing, build:', BUILD_ID);
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────────
// Clean up ALL caches from previous builds.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Messages ───────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-HTTP protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  // ── Navigation requests (HTML) — ALWAYS network, NEVER cache ──────────────
  // This is THE critical fix: never serve a cached index.html that references
  // old JS chunks from a previous deployment.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' })).catch(() => {
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );
    return;
  }

  if (!isSameOrigin) {
    // CDN resources (fonts, external CSS) — Stale While Revalidate
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ── Hashed assets (Vite output like /assets/index-abc123.js) — Cache First ─
  // These filenames contain a content hash so they are immutable.
  if (url.pathname.startsWith('/assets/') && url.pathname.match(/\.[0-9a-f]{8,}\./)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // ── Non-hashed JS/CSS — Network First ─────────────────────────────────────
  if (url.pathname.match(/\.(js|css|mjs)$/)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ── Images and other static assets — Stale While Revalidate ───────────────
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      });
    })
  );
});
