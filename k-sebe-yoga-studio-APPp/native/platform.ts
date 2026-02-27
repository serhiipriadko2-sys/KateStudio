/**
 * Platform detection utilities for Capacitor native wrapper.
 * Uses Capacitor's runtime APIs when available, falls back to UA detection.
 */

import { Capacitor } from '@capacitor/core';

/** True when running inside a native Capacitor container (iOS or Android) */
export const isNative = (): boolean => Capacitor.isNativePlatform();

/** True when running on iOS (native or web) */
export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

/** True when running on Android (native or web) */
export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

/** True when running in a browser (not native) */
export const isWeb = (): boolean => Capacitor.getPlatform() === 'web';

/** Current platform string: 'ios' | 'android' | 'web' */
export const getPlatform = (): string => Capacitor.getPlatform();

/**
 * Whether the device has a notch / Dynamic Island / cutout.
 * On web: uses CSS env variable availability as a proxy.
 * On native: iOS 11+ has safe-area-inset-top > 20px for notched devices.
 */
export const hasNotch = (): boolean => {
  if (isWeb()) {
    const style = getComputedStyle(document.documentElement);
    const top = style.getPropertyValue('--safe-area-inset-top') || '0px';
    return parseInt(top) > 20;
  }
  // On native, we treat all modern iOS/Android as potentially having cutouts
  return isIOS() || isAndroid();
};

/** Apply platform class names to <html> for CSS targeting */
export const applyPlatformClasses = (): void => {
  const html = document.documentElement;
  const platform = getPlatform();

  html.classList.add(`platform-${platform}`);

  if (isNative()) {
    html.classList.add('is-native');
  }

  if (isIOS()) {
    html.classList.add('is-ios');
  }

  if (isAndroid()) {
    html.classList.add('is-android');
  }
};
