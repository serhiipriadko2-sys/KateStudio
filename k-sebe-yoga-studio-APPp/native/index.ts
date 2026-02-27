/**
 * Native initialization entry point.
 *
 * Call `initNative()` as early as possible in index.tsx (before React renders)
 * to configure platform-specific behavior.
 *
 * Call `nativeReady()` after React's first meaningful paint to hide the
 * splash screen and signal the app is interactive.
 */

import { applyPlatformClasses, isNative } from './platform';
import { hideSplashScreen, initAppLifecycle, initKeyboard, initStatusBar } from './plugins';

let keyboardCleanup: (() => void) | null = null;
let lifecycleCleanup: (() => void) | null = null;

/**
 * Initialize native wrapper synchronously-safe.
 * Runs platform detection, CSS classes, and async plugin setup.
 */
export const initNative = (): void => {
  // 1. Apply platform CSS classes to <html> for conditional styling
  applyPlatformClasses();

  if (!isNative()) return;

  // 2. Initialize native plugins (async, non-blocking)
  void initStatusBar();

  // 3. Configure keyboard behavior
  keyboardCleanup = initKeyboard();

  // 4. Handle app lifecycle (pause/resume/back button)
  lifecycleCleanup = initAppLifecycle({
    onResume: () => {
      // Refresh auth session, re-check network, etc.
      document.dispatchEvent(new CustomEvent('native:resume'));
    },
    onPause: () => {
      // Save state, stop audio, etc.
      document.dispatchEvent(new CustomEvent('native:pause'));
    },
  });
};

/**
 * Call after the app has rendered its first meaningful frame.
 * Hides the native splash screen with a smooth fade.
 */
export const nativeReady = async (): Promise<void> => {
  await hideSplashScreen();
};

/**
 * Cleanup all native listeners. Call on app unmount (rarely needed,
 * but useful for hot-reload in development).
 */
export const cleanupNative = (): void => {
  keyboardCleanup?.();
  lifecycleCleanup?.();
  keyboardCleanup = null;
  lifecycleCleanup = null;
};

// Re-export commonly used utilities for convenient imports
export { getPlatform, isAndroid, isIOS, isNative, isWeb } from './platform';
export {
  hapticError,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  getNetworkStatus,
  onNetworkChange,
} from './plugins';
