/**
 * K Sebe Yoga Studio - Shared Components
 * Export all shared components from single entry point
 */

// UI Components
export { FadeIn } from './FadeIn';
export { Logo } from './Logo';
export { Image } from './Image';
export { Marquee } from './Marquee';
export { ScrollProgress } from './ScrollProgress';
export { BackToTop } from './BackToTop';
export { ErrorBoundary } from './ErrorBoundary';
export { CookieBanner } from './CookieBanner';
export { Paywall } from './Paywall';
export { UpdateBanner } from './UpdateBanner';
export { OfflineBanner } from './OfflineBanner';
export { Skeleton, SkeletonVideoCard, SkeletonAvatar, SkeletonText } from './Skeleton';

// Feature Components
export { Breathwork } from './Breathwork';
export { Blog } from './Blog';
export { Pricing } from './Pricing';

// Gamification & AI Components (2026)
export { DailyRecommendation } from './DailyRecommendation';
export { AchievementUnlockedModal } from './AchievementUnlockedModal';
export { AchievementsGrid } from './AchievementsGrid';
export { ProgressSummary } from './ProgressSummary';
export { WeeklyRecap } from './WeeklyRecap';
export { StreakCalendar } from './StreakCalendar';
export { OnboardingQuiz } from './OnboardingQuiz';
export { NotificationPreferences } from './NotificationPreferences';

// Types
export type { AsanaAnalysis, ImageServices } from './Image';
export type { MarqueeConfig } from './Marquee';
export type { PaywallPlanId, PaywallStatus } from './Paywall';
export type { DailyRecommendationProps } from './DailyRecommendation';
export type { AchievementUnlockedModalProps } from './AchievementUnlockedModal';
export type { AchievementsGridProps } from './AchievementsGrid';
export type { ProgressSummaryProps } from './ProgressSummary';
export type { WeeklyRecapProps } from './WeeklyRecap';
export type { StreakCalendarProps } from './StreakCalendar';
export type { OnboardingQuizProps } from './OnboardingQuiz';
export type { NotificationPreferencesProps } from './NotificationPreferences';
export type { UpdateBannerProps } from './UpdateBanner';
export type { OfflineBannerProps } from './OfflineBanner';
export type { SkeletonProps } from './Skeleton';

// Re-export types for convenience
export type {
  BlogArticle,
  PriceOption,
  BreathPhase,
  BreathworkConfig,
  StreakCalendarDay,
  // Gamification types (2026)
  Achievement,
  AchievementCategory,
  AchievementRarity,
  StreakData,
  StreakMilestone,
  WeeklyRecap as WeeklyRecapType,
  // AI Personalization types (2026)
  DailyRecommendation as DailyRecommendationType,
  PersonalProgram,
  ProgramDay,
  EnhancedAsanaAnalysis,
  PracticeType,
  PracticeGoal,
  PracticeLevel,
  // Subscription types (2026)
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanDetails,
  SubscriptionLimits,
  // Onboarding types (2026)
  OnboardingData,
  // Notification types (2026)
  NotificationType,
  NotificationPreferences as NotificationPreferencesType,
  PushNotification,
} from '../types';
