/**
 * K Sebe Yoga Studio - Service Worker
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
const CACHE_NAME = `ksebe-app-${BUILD_ID}`;
const RUNTIME_CACHE = `ksebe-runtime-${BUILD_ID}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache on install (only truly static assets, NOT the HTML shell)
const PRECACHE_ASSETS = [
  '/offline.html',
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

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-HTTP protocols (e.g. chrome-extension://)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // ── API / Supabase / external data — network only, never cache ────────────
  if (url.origin !== location.origin) {
    if (url.hostname.includes('supabase') || url.hostname.includes('googleapis')) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );
      return;
    }

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

  // ── Navigation requests (HTML) — ALWAYS network, NEVER cache ──────────────
  // This is THE critical fix: never serve a cached index.html that references
  // old JS chunks from a previous deployment.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' })).catch(() => {
        // Offline: show the dedicated offline page (not a cached app shell)
        return caches.match(OFFLINE_URL).then(
          (offlinePage) =>
            offlinePage ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
        );
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

// ── Messages ───────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Push Notifications (FCM) ─────────────────────────────────────────────────

// Show notification when a push arrives (background)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: 'К себе', body: event.data.text() } };
  }

  const { title, body, image, icon, data } = payload.notification ?? payload;

  event.waitUntil(
    self.registration.showNotification(title || 'К себе', {
      body: body || '',
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      image: image || undefined,
      data: data || {},
      vibrate: [200, 100, 200],
      tag: 'ksebe-notification',
      renotify: true,
    })
  );
});

// Handle notification click — open / focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing window if available
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
