/**
 * usePWAUpdate - Hook for handling PWA service worker updates
 *
 * Provides a clean interface for:
 * - Detecting when updates are available
 * - Triggering update activation
 * - Handling the page refresh after update
 *
 * @example
 * const { updateAvailable, updating, triggerUpdate, dismissUpdate } = usePWAUpdate();
 */

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  activateWaitingWorker,
  type ServiceWorkerCallbacks,
} from '../services/serviceWorker';

export interface UsePWAUpdateReturn {
  /** Whether an update is available */
  updateAvailable: boolean;
  /** Whether the update is being applied */
  updating: boolean;
  /** Whether the app is ready for offline use */
  offlineReady: boolean;
  /** Trigger the update (calls skipWaiting on the waiting SW) */
  triggerUpdate: () => void;
  /** Dismiss the update notification */
  dismissUpdate: () => void;
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const callbacks: ServiceWorkerCallbacks = {
      onUpdate: (reg) => {
        setRegistration(reg);
        setUpdateAvailable(true);
      },
      onOfflineReady: () => {
        setOfflineReady(true);
      },
      onControllerChange: () => {
        // Service worker has taken control, reload to get new content
        window.location.reload();
      },
    };

    registerServiceWorker(callbacks);
  }, []);

  const triggerUpdate = useCallback(() => {
    if (!registration?.waiting) {
      console.warn('[usePWAUpdate] No waiting service worker');
      return;
    }

    setUpdating(true);
    activateWaitingWorker(registration);
    // The page will reload via onControllerChange callback
  }, [registration]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    setUpdating(false);
  }, []);

  return {
    updateAvailable,
    updating,
    offlineReady,
    triggerUpdate,
    dismissUpdate,
  };
}
