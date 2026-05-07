/**
 * Service Worker Registration Service
 * Handles PWA registration with automatic update activation.
 *
 * Key principles:
 * - sw.js calls skipWaiting() on install → new SW activates immediately
 * - controllerchange triggers window.location.reload() for fresh content
 * - UpdateBanner is a fallback for edge cases where waiting SW exists
 *
 * @see https://web.dev/articles/service-worker-lifecycle
 */

export type ServiceWorkerCallbacks = {
  /** Called when a new service worker is waiting to activate */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** Called when the app is ready to work offline */
  onOfflineReady?: () => void;
  /** Called when the controller changes (after skipWaiting) */
  onControllerChange?: () => void;
  /** Called on registration error */
  onError?: (error: Error) => void;
};

/**
 * Register the service worker with update callbacks
 */
export function registerServiceWorker({
  onUpdate,
  onOfflineReady,
  onControllerChange,
  onError,
}: ServiceWorkerCallbacks = {}): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      // Track whether there was an active controller when we loaded.
      // If not, this is a fresh install and we should NOT reload on
      // controllerchange — the page already loaded fresh content.
      const hadController = !!navigator.serviceWorker.controller;

      const registration = await navigator.serviceWorker.register('/sw.js');

      // Check if there's already a waiting service worker
      if (registration.waiting) {
        onUpdate?.(registration);
      }

      // Listen for new service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, notify user
              onUpdate?.(registration);
            } else {
              // Content is cached for offline use
              onOfflineReady?.();
            }
          }
        });
      });

      // Listen for controller change (happens after skipWaiting).
      // Only reload if we're REPLACING an existing SW, not on first install.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) {
          onControllerChange?.();
        }
      });
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Request the waiting service worker to activate
 * This should be called when the user clicks "Update" button
 */
export function activateWaitingWorker(registration: ServiceWorkerRegistration): void {
  if (!registration.waiting) {
    console.warn('[SW] No waiting worker to activate');
    return;
  }

  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Check if a service worker update is available
 */
export async function checkForUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    await registration.update();
    return !!registration.waiting;
  } catch {
    return false;
  }
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterServiceWorkers(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
    return true;
  } catch {
    return false;
  }
}
