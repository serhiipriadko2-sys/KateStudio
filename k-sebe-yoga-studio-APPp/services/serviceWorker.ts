/**
 * Service Worker Registration Service
 * Handles PWA registration with proper update UX patterns
 *
 * Key principles:
 * - Only call skipWaiting() on explicit user request
 * - Show update banner only when registration.waiting exists
 * - Handle controller change for clean refresh
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

      // Listen for controller change (happens after skipWaiting)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        onControllerChange?.();
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
