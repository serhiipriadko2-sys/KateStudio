/**
 * K Sebe Yoga Studio - Shared Hooks
 */
export { useScrollLock } from './useScrollLock';
export { useLocalStorage } from './useLocalStorage';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './useMediaQuery';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useOnlineStatus } from './useOnlineStatus';
export { usePWAMode, useIsPWA } from './usePWAMode';
export type { DisplayMode } from './usePWAMode';

// Gamification hooks (2026)
export { useAchievements } from './useAchievements';
export type { UseAchievementsOptions, UseAchievementsReturn } from './useAchievements';

// Admin & Authorization hooks (2026)
export { useIsAdmin } from './useIsAdmin';
export type { UseIsAdminReturn } from './useIsAdmin';
export * from './useGamification';

// Push Notifications (2026)
export { usePushNotifications } from './usePushNotifications';
export type { UsePushNotificationsReturn, FirebaseConfig } from './usePushNotifications';
