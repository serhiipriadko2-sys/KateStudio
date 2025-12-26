import { useState, useEffect } from 'react';

export type DisplayMode = 'browser' | 'standalone' | 'twa';

/**
 * Hook to detect if the app is running as PWA (installed) or in browser
 *
 * Returns:
 * - 'browser': Running in regular browser tab
 * - 'standalone': Installed as PWA (desktop or mobile)
 * - 'twa': Running as Trusted Web Activity (Android)
 */
export function usePWAMode(): DisplayMode {
  const [mode, setMode] = useState<DisplayMode>('browser');

  useEffect(() => {
    const detectMode = (): DisplayMode => {
      // Check for Trusted Web Activity (Android)
      if (document.referrer.includes('android-app://')) {
        return 'twa';
      }

      // Check for iOS standalone mode
      if ((navigator as any).standalone === true) {
        return 'standalone';
      }

      // Check for display-mode: standalone (PWA on desktop/Android)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
      }

      // Check for display-mode: fullscreen (some PWAs)
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'standalone';
      }

      return 'browser';
    };

    setMode(detectMode());

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => setMode(detectMode());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return mode;
}

/**
 * Simple boolean check if running as PWA
 */
export function useIsPWA(): boolean {
  const mode = usePWAMode();
  return mode === 'standalone' || mode === 'twa';
}
