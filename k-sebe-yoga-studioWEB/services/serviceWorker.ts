export type ServiceWorkerCallbacks = {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
};

export const registerServiceWorker = ({ onUpdate, onOfflineReady }: ServiceWorkerCallbacks) => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
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
    } catch (error) {
      console.error('Service worker registration failed', error);
    }
  });
};
