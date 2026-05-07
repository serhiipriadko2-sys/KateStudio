/**
 * Database Types — K Sebe Yoga Studio
 *
 * Hand-crafted from Supabase migrations.
 * Run `supabase gen types typescript` after connecting to a live project
 * to replace this file with auto-generated types.
 */

// ============================================
// ENUMS (Postgres check constraints → TS union)
// ============================================

export type SubscriptionPlanDb = 'free' | 'premium' | 'vip';
export type SubscriptionStatusDb = 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';
export type PaymentOrderStatus =
  | 'pending'
  | 'waiting_for_capture'
  | 'succeeded'
  | 'canceled'
  | 'failed';
export type UserPassStatus = 'active' | 'expired' | 'canceled' | 'used';

export type ContactStatus = 'new' | 'read' | 'processed' | 'spam';
export type PricingCategory = 'yoga' | 'personal' | 'sound' | 'massage';
export type PushTokenPlatform = 'web' | 'android' | 'ios';

// ============================================
// ROW TYPES (one per table)
// ============================================

export interface ContactRow {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  status: ContactStatus | null;
  ip_address: string | null;
}

export interface ClassRow {
  id: string;
  date: string | null; // ISO date YYYY-MM-DD
  time: string | null; // HH:mm
  name: string | null;
  instructor: string | null;
  duration: string | null;
  spots_total: number | null;
  spots_booked: number | null;
  location: string | null;
  intensity: number | null;
  is_online: boolean | null;
  price: number | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProfileRow {
  user_id: string | null;
  name: string | null;
  phone: string | null;
  city: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BookingRow {
  id: string;
  user_id: string | null;
  // Common
  phone: string | null;
  name: string | null;
  location: string | null;
  created_at: string;
  status: 'active' | 'cancelled' | 'completed' | 'no_show' | null;
  // APP-specific
  class_id: string | null;
  class_name: string | null;
  date: string | null;
  time: string | null;
  timestamp: number | null;
  // WEB-specific
  class_type: string | null;
  class_date: string | null;
  class_time: string | null;
  class_uuid: string | null;
  is_purchase: boolean | null;
  price: string | null;
}

export interface SubscriptionRow {
  id: string;
  user_id: string | null;
  plan: SubscriptionPlanDb;
  status: SubscriptionStatusDb;
  current_period_end: string | null;
  provider: string | null;
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  name: string;
  text: string;
  image_url: string | null;
  rating: number | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface VideoRow {
  id: string;
  title: string;
  duration: string;
  level: string;
  image_url: string | null;
  video_url: string | null;
  is_locked: boolean | null;
  tags: string[] | null;
  created_at: string;
}

export interface PracticeEventRow {
  id: string;
  user_id: string;
  day: string; // ISO date
  kind: string;
  source: string;
  created_at: string;
}

export interface UserPreferencesRow {
  user_id: string;
  onboarding: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AppEventRow {
  id: string;
  user_id: string;
  name: string;
  props: Record<string, unknown> | null;
  created_at: string;
}

export interface UserProgressRow {
  user_id: string;
  current_streak: number | null;
  max_streak: number | null;
  last_activity_date: string | null; // ISO date
  total_xp: number | null;
  level: number | null;
  updated_at: string;
}

export interface UserAchievementRow {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number | null;
  unlocked_at: string | null;
  created_at: string;
}

export interface AnalyticsEventRow {
  id: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  session_id: string | null;
  url: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminRow {
  user_id: string;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  image_url: string | null;
  content: string | null;
  published_at: string | null;
  created_at: string;
}

export interface AppSettingRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string | null;
}

export interface PricingPlanRow {
  id: string;
  category: PricingCategory;
  title: string;
  price: string;
  subtitle: string | null;
  description: string | null;
  features: unknown[] | null;
  is_popular: boolean | null;
  is_dark: boolean | null;
  display_order: number | null;
  is_active: boolean | null;
  amount_cents: number | null;
  currency: 'RUB';
  visits_total: number | null;
  valid_days: number | null;
  is_payable: boolean | null;
  created_at: string;
}

export interface PaymentOrderRow {
  id: string;
  user_id: string;
  pricing_plan_id: string | null;
  provider: string;
  provider_payment_id: string | null;
  status: PaymentOrderStatus;
  amount_cents: number;
  currency: 'RUB';
  plan_snapshot: Record<string, unknown>;
  checkout_url: string | null;
  provider_payload: Record<string, unknown> | null;
  error_message: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPassRow {
  id: string;
  user_id: string;
  payment_order_id: string;
  pricing_plan_id: string | null;
  title: string;
  visits_total: number;
  visits_remaining: number;
  valid_from: string;
  valid_until: string;
  status: UserPassStatus;
  created_at: string;
  updated_at: string;
}

export interface UserPushTokenRow {
  id: string;
  user_id: string;
  token: string;
  platform: PushTokenPlatform;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteImageRow {
  key: string;
  url: string;
}

// Legacy aliases — kept for backwards-compat with existing code
export type DBUserProgress = UserProgressRow;
export type DBUserAchievement = UserAchievementRow;

export type ContactInsert = Omit<ContactRow, 'id' | 'created_at'>;
export type ClassInsert = Omit<ClassRow, 'id' | 'created_at' | 'updated_at'>;
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<BookingRow, 'id' | 'created_at'>;
export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>;
export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at'>;
export type VideoInsert = Omit<VideoRow, 'id' | 'created_at'>;
export type PracticeEventInsert = Omit<PracticeEventRow, 'id' | 'created_at'>;
export type UserAchievementInsert = Omit<UserAchievementRow, 'id' | 'created_at'>;
export type AnalyticsEventInsert = Omit<AnalyticsEventRow, 'id' | 'created_at'>;
export type ArticleInsert = Omit<ArticleRow, 'id' | 'created_at'>;
export type PricingPlanInsert = Omit<PricingPlanRow, 'id' | 'created_at'>;
export type PaymentOrderInsert = Omit<PaymentOrderRow, 'id' | 'created_at' | 'updated_at'>;
export type UserPassInsert = Omit<UserPassRow, 'id' | 'created_at' | 'updated_at'>;
export type UserPushTokenInsert = Omit<UserPushTokenRow, 'id' | 'created_at' | 'updated_at'>;
export type UserPreferencesInsert = Omit<UserPreferencesRow, 'created_at' | 'updated_at'>;
export type AppEventInsert = Omit<AppEventRow, 'id' | 'created_at'>;

// ============================================
// UPDATE TYPES
// ============================================

export type ClassUpdate = Partial<ClassInsert>;
export type ProfileUpdate = Partial<Omit<ProfileInsert, 'user_id'>>;
export type SubscriptionUpdate = Partial<Omit<SubscriptionInsert, 'user_id'>>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type VideoUpdate = Partial<VideoInsert>;
export type UserProgressUpdate = Partial<Omit<UserProgressRow, 'user_id'>>;
export type UserAchievementUpdate = Partial<
  Omit<UserAchievementInsert, 'user_id' | 'achievement_id'>
>;

// ============================================
// DATABASE SCHEMA MAP (for use with supabase-js generics)
// ============================================

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: ContactRow;
        Insert: ContactInsert;
        Update: Partial<ContactInsert>;
        Relationships: [];
      };
      classes: {
        Row: ClassRow;
        Insert: ClassInsert;
        Update: ClassUpdate;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: Partial<BookingInsert>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
        Relationships: [];
      };
      videos: {
        Row: VideoRow;
        Insert: VideoInsert;
        Update: VideoUpdate;
        Relationships: [];
      };
      practice_events: {
        Row: PracticeEventRow;
        Insert: PracticeEventInsert;
        Update: Partial<PracticeEventInsert>;
        Relationships: [];
      };
      user_progress: {
        Row: UserProgressRow;
        Insert: Omit<UserProgressRow, 'updated_at'>;
        Update: UserProgressUpdate;
        Relationships: [];
      };
      user_achievements: {
        Row: UserAchievementRow;
        Insert: UserAchievementInsert;
        Update: UserAchievementUpdate;
        Relationships: [];
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: UserPreferencesInsert;
        Update: Partial<Omit<UserPreferencesInsert, 'user_id'>>;
        Relationships: [];
      };
      app_events: {
        Row: AppEventRow;
        Insert: AppEventInsert;
        Update: never;
        Relationships: [];
      };
      analytics_events: {
        Row: AnalyticsEventRow;
        Insert: AnalyticsEventInsert;
        Update: Partial<AnalyticsEventInsert>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: Omit<AdminRow, 'created_at'>;
        Update: never;
        Relationships: [];
      };
      articles: {
        Row: ArticleRow;
        Insert: ArticleInsert;
        Update: Partial<ArticleInsert>;
        Relationships: [];
      };
      app_settings: {
        Row: AppSettingRow;
        Insert: AppSettingRow;
        Update: Partial<Pick<AppSettingRow, 'value'>>;
        Relationships: [];
      };
      pricing_plans: {
        Row: PricingPlanRow;
        Insert: PricingPlanInsert;
        Update: Partial<PricingPlanInsert>;
        Relationships: [];
      };
      payment_orders: {
        Row: PaymentOrderRow;
        Insert: PaymentOrderInsert;
        Update: Partial<Omit<PaymentOrderInsert, 'user_id'>>;
        Relationships: [];
      };
      user_passes: {
        Row: UserPassRow;
        Insert: UserPassInsert;
        Update: Partial<Omit<UserPassInsert, 'user_id' | 'payment_order_id'>>;
        Relationships: [];
      };
      user_push_tokens: {
        Row: UserPushTokenRow;
        Insert: UserPushTokenInsert;
        Update: Partial<Pick<UserPushTokenRow, 'token' | 'user_agent'>>;
        Relationships: [];
      };
      site_images: {
        Row: SiteImageRow;
        Insert: SiteImageRow;
        Update: Partial<SiteImageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
      process_practice_completion: { Args: Record<never, never>; Returns: void };
    };
    Enums: {
      subscription_plan: SubscriptionPlanDb;
      subscription_status: SubscriptionStatusDb;
      contact_status: ContactStatus;
      pricing_category: PricingCategory;
      payment_order_status: PaymentOrderStatus;
      user_pass_status: UserPassStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
