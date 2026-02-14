/**
 * K Sebe Yoga Studio - Unified Types
 * Shared across WEB and APP platforms
 */

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface UserProfile {
  phone: string;
  name?: string;
  city?: string;
  avatar?: string;
  isAdmin?: boolean;
  createdAt?: number;
}

// ============================================
// BOOKING & SCHEDULE
// ============================================

export interface BookingDetails {
  type: string;
  time: string;
  date: string;
  location: string;
}

export interface Booking extends BookingDetails {
  id: string;
  phone: string;
  className: string;
  timestamp: number;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface ClassSession {
  id: string;
  name: string;
  time: string;
  duration: string;
  instructor: string;
  location: string;
  spotsTotal: number;
  spotsBooked: number;
  intensity: 1 | 2 | 3;
  type?: 'offline' | 'online';
  description?: string;
}

export type LoadLevel = 'low' | 'medium' | 'high' | 'full' | 'none';

// ============================================
// AI & CHAT
// ============================================

export type ChatMode =
  | 'chat'
  | 'meditation'
  | 'art'
  | 'video_gen'
  | 'coach'
  | 'program'
  | 'diary'
  | 'vision'
  | 'create';

export interface AppSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'model';
  content?: string;
  text?: string;
  timestamp?: number;
  mode?: ChatMode;
  attachments?: ChatAttachment[];

  // Extended fields
  diarySummary?: string;
  generatedVideoUrl?: string;
  generatedImageUrl?: string;
  isThinking?: boolean;
  audioBase64?: string;
  isAudioLoading?: boolean;
  sources?: AppSource[];
}

export interface ChatAttachment {
  type: 'image' | 'video' | 'audio';
  url: string;
  mimeType?: string;
}

// ============================================
// ASANA ANALYSIS (AI Vision)
// ============================================

export interface AsanaAnalysis {
  sanskrit: string;
  name_ru: string;
  energy: 'Brahmana' | 'Langhana' | 'Samana';
  muscles: string[];
  description: string;
  tips: string;
  contraindications?: string[];
}

// ============================================
// CONTENT & BLOG
// ============================================

export interface BlogArticle {
  id: number | string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content: string;
  author?: string;
  readTime?: string;
}

// ============================================
// PRICING
// ============================================

export interface PriceOption {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isDark?: boolean;
}

// ============================================
// VIDEO LIBRARY
// ============================================

export interface VideoItem {
  id: number | string;
  title: string;
  duration: string;
  level: string;
  image: string;
  isLocked: boolean;
  tags: string[];
  videoUrl?: string;
  description?: string;
}

// ============================================
// RETREATS
// ============================================

export interface Retreat {
  id: number | string;
  title: string;
  location: string;
  dates: string;
  image: string;
  description: string;
  price?: string;
  spotsLeft?: number;
}

// ============================================
// REVIEWS
// ============================================

export interface Review {
  id: number | string;
  name: string;
  avatar?: string;
  rating: number;
  text: string;
  date?: string;
}

// ============================================
// COMPONENT PROPS (Shared)
// ============================================

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classDetails?: ClassSession | null;
  bookingDetails?: BookingDetails;
  onSuccess?: () => void;
}

export interface ScheduleProps {
  onBook?: (details: BookingDetails) => void;
}

export interface PricingProps {
  onBook?: (plan: string, price: string) => void;
}

// ============================================
// THEME
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  brandGreen: string;
  brandMint: string;
  brandYellow: string;
  brandDark: string;
  brandText: string;
  background: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============================================
// BREATHWORK
// ============================================

export type BreathPhase = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty' | 'idle';

export interface BreathworkConfig {
  inhaleDuration: number;
  holdFullDuration: number;
  exhaleDuration: number;
  holdEmptyDuration: number;
}

// ============================================
// GAMIFICATION & RETENTION (2026)
// ============================================

export type AchievementCategory = 'streak' | 'practice' | 'ai' | 'community' | 'milestone';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: AchievementRarity;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalPractices: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakFreezes: number;
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achieved: boolean;
  achievedAt?: string;
  reward?: string;
}

export interface StreakCalendarDay {
  practiced: boolean;
  duration: number;
  type: string;
}

export interface WeeklyRecapData {
  weekNumber: number;
  year: number;
  dateRange: { start: string; end: string };
  practiceStats: WeeklyPracticeStats;
  streakStatus: WeeklyStreakStatus;
  aiUsage: WeeklyAIUsage;
  newAchievements: Achievement[];
  insights: WeeklyInsights;
  shareCard?: WeeklyShareCard;
}

export interface WeeklyPracticeStats {
  total: number;
  totalDuration: number;
  types: Record<string, number>;
  avgDuration: number;
}

export interface WeeklyStreakStatus {
  maintained: boolean;
  currentStreak: number;
  daysThisWeek: number;
}

export interface WeeklyAIUsage {
  chatMessages: number;
  visionAnalyses: number;
  meditations: number;
}

export interface WeeklyInsights {
  summary: string;
  improvement: string;
  recommendation: string;
}

export interface WeeklyShareCard {
  imageUrl: string;
  text: string;
}

// ============================================
// AI PERSONALIZATION (2026)
// ============================================

export type PracticeType = 'inside-flow' | 'hatha' | 'meditation' | 'breathwork';
export type PracticeGoal = 'flexibility' | 'strength' | 'relaxation' | 'energy' | 'balance';
export type PracticeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DailyRecommendationData {
  practiceId: string;
  title: string;
  duration: number;
  type: PracticeType;
  reason: string;
  matchScore: number;
  musicMood?: string;
  generatedAt: string;
}

export interface PersonalProgram {
  id: string;
  userId: string;
  goal: PracticeGoal;
  level: PracticeLevel;
  durationDays: number;
  days: ProgramDay[];
  createdAt: string;
  completedDays: number;
  completedAt?: string;
}

export interface ProgramDay {
  day: number;
  practiceType: PracticeType;
  duration: number;
  focus: string;
  aiNotes: string;
  completed: boolean;
  completedAt?: string;
}

export interface EnhancedAsanaAnalysis extends AsanaAnalysis {
  overallScore: number;
  feedback: string[];
  bodyParts: BodyPartAnalysis[];
  comparisonWithIdeal: IdealComparison;
  progressTracking?: ProgressTracking;
}

export interface BodyPartAnalysis {
  part: 'spine' | 'shoulders' | 'hips' | 'knees' | 'ankles';
  alignment: 'correct' | 'needs_adjustment';
  suggestion: string;
  confidence: number;
}

export interface IdealComparison {
  overallSimilarity: number;
  keyDifferences: string[];
}

export interface ProgressTracking {
  previousAnalyses: AsanaAnalysis[];
  improvementAreas: string[];
  trend: 'improving' | 'stable' | 'needs_attention';
  weeksOfProgress: number;
}

// ============================================
// SUBSCRIPTION & MONETIZATION (2026)
// ============================================

export type SubscriptionPlan = 'free' | 'premium' | 'vip';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  nameRu: string;
  price: number;
  currency: 'RUB';
  interval: 'month';
  features: string[];
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  aiMessagesPerDay: number;
  videosPerWeek: number;
  offlineDownloads: boolean;
  personalPrograms: boolean;
  visionAnalysesPerMonth: number;
  prioritySupport: boolean;
}

// ============================================
// ONBOARDING (2026)
// ============================================

export interface OnboardingData {
  goals: PracticeGoal[];
  level: PracticeLevel;
  preferredDuration: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  limitations?: string[];
  completedAt: string;
}

// ============================================
// NOTIFICATIONS (2026)
// ============================================

export type NotificationType =
  | 'streak_reminder'
  | 'streak_at_risk'
  | 'achievement_unlocked'
  | 'new_content'
  | 'class_reminder'
  | 'weekly_summary'
  | 'ai_recommendation';

export interface NotificationPreferencesData {
  streakReminder: boolean;
  newContent: boolean;
  weeklySummary: boolean;
  aiRecommendations: boolean;
  reminderTime: string;
}

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sentAt: string;
  readAt?: string;
}
