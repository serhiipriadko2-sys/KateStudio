/**
 * Capacitor plugin initialization.
 * All native plugin setup happens here — keeps index.tsx clean.
 */

import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isAndroid, isIOS, isNative } from './platform';

// ─── Status Bar ────────────────────────────────────────────────────────────

/** Configure native status bar appearance */
export const initStatusBar = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });

    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: '#57a773' });
    }

    // Overlay on iOS for edge-to-edge look; underlap on Android
    await StatusBar.setOverlaysWebView({ overlay: isIOS() });
  } catch (error) {
    console.warn('[Native] StatusBar init failed:', error);
  }
};

// ─── Splash Screen ─────────────────────────────────────────────────────────

/**
 * Hide the native splash screen.
 * Call this after the React app has rendered its first meaningful frame.
 */
export const hideSplashScreen = async (): Promise<void> => {
  if (!isNative()) return;

  try {
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (error) {
    console.warn('[Native] SplashScreen hide failed:', error);
  }
};

// ─── Keyboard ──────────────────────────────────────────────────────────────

/** Configure keyboard behavior for app-like feel */
export const initKeyboard = (): (() => void) => {
  if (!isNative()) return () => {};

  void Keyboard.setResizeMode({ mode: KeyboardResize.Body });

  if (isIOS()) {
    void Keyboard.setAccessoryBarVisible({ isVisible: false });
    void Keyboard.setScroll({ isDisabled: false });
  }

  // Push body up when keyboard opens so inputs aren't hidden
  const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
    document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    document.body.classList.add('keyboard-open');
  });

  const hideListener = Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--keyboard-height', '0px');
    document.body.classList.remove('keyboard-open');
  });

  // Return cleanup function
  return () => {
    void showListener.then((l) => l.remove());
    void hideListener.then((l) => l.remove());
  };
};

// ─── App Lifecycle ─────────────────────────────────────────────────────────

/**
 * Handle native app lifecycle events.
 * Returns a cleanup function to remove listeners.
 */
export const initAppLifecycle = (callbacks?: {
  onResume?: () => void;
  onPause?: () => void;
  onBackButton?: () => void;
}): (() => void) => {
  if (!isNative()) return () => {};

  const resumeListener = App.addListener('appStateChange', (state) => {
    if (state.isActive) {
      callbacks?.onResume?.();
    } else {
      callbacks?.onPause?.();
    }
  });

  // Android back button — prevent accidental exit
  const backListener = App.addListener('backButton', ({ canGoBack }) => {
    if (callbacks?.onBackButton) {
      callbacks.onBackButton();
    } else if (!canGoBack) {
      // If no browser history, minimize app instead of closing
      void App.minimizeApp();
    }
  });

  return () => {
    void resumeListener.then((l) => l.remove());
    void backListener.then((l) => l.remove());
  };
};

// ─── Network ───────────────────────────────────────────────────────────────

/** Get current network status */
export const getNetworkStatus = async (): Promise<{
  connected: boolean;
  connectionType: string;
}> => {
  if (!isNative()) {
    return {
      connected: navigator.onLine,
      connectionType: 'unknown',
    };
  }

  const status = await Network.getStatus();
  return {
    connected: status.connected,
    connectionType: status.connectionType,
  };
};

/**
 * Listen for network changes.
 * Returns a cleanup function.
 */
export const onNetworkChange = (
  callback: (connected: boolean, type: string) => void
): (() => void) => {
  if (!isNative()) {
    const handler = () => callback(navigator.onLine, 'unknown');
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }

  const listener = Network.addListener('networkStatusChange', (status) => {
    callback(status.connected, status.connectionType);
  });

  return () => {
    void listener.then((l) => l.remove());
  };
};

// ─── Haptics ───────────────────────────────────────────────────────────────

/** Light haptic tap — for button presses */
export const hapticLight = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silently fail — haptics are non-critical
  }
};

/** Medium haptic — for selections */
export const hapticMedium = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Silently fail
  }
};

/** Success haptic — for completed actions */
export const hapticSuccess = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silently fail
  }
};

/** Error haptic — for failed actions */
export const hapticError = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {
    // Silently fail
  }
};
