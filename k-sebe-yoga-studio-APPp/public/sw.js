/**
 * K Sebe Yoga Studio - Service Worker
 * Provides offline support and caching strategies
 *
 * IMPORTANT: skipWaiting() is only called on explicit user request
 * to avoid breaking resource consistency during runtime.
 * @see https://web.dev/articles/service-worker-lifecycle
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `ksebe-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ksebe-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/manifest.json',
];

// Install event - precache essential assets
// NOTE: We do NOT call skipWaiting() here - only on user request
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.warn('[SW] Precaching essential assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.warn('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - implements different strategies per resource type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (CDN, API calls)
  if (url.origin !== location.origin) {
    // For API calls, try network only
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
    // For CDN resources (Tailwind, fonts) - Stale While Revalidate
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

  // For navigation requests (HTML pages) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached page or offline page
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For JS/CSS assets - Network First to ensure fresh code
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

  // For images and other assets - Cache First (Stale While Revalidate)
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

// Handle messages from the app
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
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
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
