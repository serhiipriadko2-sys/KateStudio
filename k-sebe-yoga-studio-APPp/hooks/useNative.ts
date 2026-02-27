/**
 * useNative — React hook for native Capacitor features.
 *
 * Provides reactive access to platform info, network status,
 * and haptic feedback utilities.
 *
 * Usage:
 *   const { isNative, isIOS, isOnline, haptic } = useNative();
 */

import { useCallback, useEffect, useState } from 'react';

import {
  getPlatform,
  getNetworkStatus,
  hapticError,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  isAndroid,
  isIOS,
  isNative,
  isWeb,
  onNetworkChange,
} from '../native';

interface NativeState {
  /** True when running inside a native Capacitor container */
  isNative: boolean;
  /** True when running on iOS */
  isIOS: boolean;
  /** True when running on Android */
  isAndroid: boolean;
  /** True when running in a browser */
  isWeb: boolean;
  /** Current platform: 'ios' | 'android' | 'web' */
  platform: string;
  /** True when device has network connectivity */
  isOnline: boolean;
  /** Current network connection type */
  connectionType: string;
  /** Haptic feedback utilities */
  haptic: {
    light: () => Promise<void>;
    medium: () => Promise<void>;
    success: () => Promise<void>;
    error: () => Promise<void>;
  };
}

export const useNative = (): NativeState => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  // Initialize network status
  useEffect(() => {
    void getNetworkStatus().then((status) => {
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    const cleanup = onNetworkChange((connected, type) => {
      setIsOnline(connected);
      setConnectionType(type);
    });

    return cleanup;
  }, []);

  const haptic = {
    light: useCallback(() => hapticLight(), []),
    medium: useCallback(() => hapticMedium(), []),
    success: useCallback(() => hapticSuccess(), []),
    error: useCallback(() => hapticError(), []),
  };

  return {
    isNative: isNative(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isWeb: isWeb(),
    platform: getPlatform(),
    isOnline,
    connectionType,
    haptic,
  };
};
