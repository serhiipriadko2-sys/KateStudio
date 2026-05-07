/**
 * Service Worker Registration Service (WEB)
 * Handles PWA registration with automatic update activation.
 *
 * Key principles:
 * - sw.js calls skipWaiting() on install → new SW activates immediately
 * - controllerchange triggers window.location.reload() for fresh content
 * - Update banner is a fallback for edge cases where waiting SW exists
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
};

export const registerServiceWorker = ({
  onUpdate,
  onOfflineReady,
  onControllerChange,
}: ServiceWorkerCallbacks) => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // Track whether there was an active controller when we loaded.
      // If not, this is a fresh install and we should NOT reload on
      // controllerchange — the page already loaded fresh content.
      const hadController = !!navigator.serviceWorker.controller;

      const registration = await navigator.serviceWorker.register('/sw.js');

      if (registration.waiting) {
        onUpdate?.(registration);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              onUpdate?.(registration);
            } else {
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
    }
  });
};
