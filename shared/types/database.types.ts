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
export type SubscriptionStatusDb =
  | 'active'
  | 'pending'
  | 'canceled'
  | 'past_due'
  | 'trialing';

// ============================================
// ROW TYPES (one per table)
// ============================================

export interface ContactRow {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
}

export interface ClassRow {
  id: string;
  date: string | null;       // ISO date YYYY-MM-DD
  time: string | null;       // HH:mm
  name: string | null;
  instructor: string | null;
  duration: string | null;
  spots_total: number | null;
  spots_booked: number | null;
  location: string | null;
  intensity: number | null;
  is_online: boolean | null;
  created_at: string;
}

export interface ProfileRow {
  user_id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BookingRow {
  id: string;
  user_id: string;
  // Common
  phone: string | null;
  name: string | null;
  location: string | null;
  created_at: string;
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
  answers: Record<string, unknown>;
  updated_at: string;
}

export interface AppEventRow {
  id: string;
  user_id: string;
  event: string;
  metadata: Record<string, unknown> | null;
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

// ============================================
// INSERT TYPES (omit auto-generated columns)
// ============================================

export type ContactInsert = Omit<ContactRow, 'id' | 'created_at'>;
export type ClassInsert = Omit<ClassRow, 'id' | 'created_at'>;
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<BookingRow, 'id' | 'created_at'>;
export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>;
export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at'>;
export type VideoInsert = Omit<VideoRow, 'id' | 'created_at'>;
export type PracticeEventInsert = Omit<PracticeEventRow, 'id' | 'created_at'>;
export type UserAchievementInsert = Omit<UserAchievementRow, 'id' | 'created_at'>;
export type AnalyticsEventInsert = Omit<AnalyticsEventRow, 'id' | 'created_at'>;

// ============================================
// UPDATE TYPES
// ============================================

export type ClassUpdate = Partial<ClassInsert>;
export type ProfileUpdate = Partial<Omit<ProfileInsert, 'user_id'>>;
export type SubscriptionUpdate = Partial<Omit<SubscriptionInsert, 'user_id'>>;
export type ReviewUpdate = Partial<ReviewInsert>;
export type VideoUpdate = Partial<VideoInsert>;
export type UserProgressUpdate = Partial<Omit<UserProgressRow, 'user_id'>>;
export type UserAchievementUpdate = Partial<Omit<UserAchievementInsert, 'user_id' | 'achievement_id'>>;

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
      };
      classes: {
        Row: ClassRow;
        Insert: ClassInsert;
        Update: ClassUpdate;
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: Partial<BookingInsert>;
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      videos: {
        Row: VideoRow;
        Insert: VideoInsert;
        Update: VideoUpdate;
      };
      practice_events: {
        Row: PracticeEventRow;
        Insert: PracticeEventInsert;
        Update: Partial<PracticeEventInsert>;
      };
      user_progress: {
        Row: UserProgressRow;
        Insert: Omit<UserProgressRow, 'updated_at'>;
        Update: UserProgressUpdate;
      };
      user_achievements: {
        Row: UserAchievementRow;
        Insert: UserAchievementInsert;
        Update: UserAchievementUpdate;
      };
      analytics_events: {
        Row: AnalyticsEventRow;
        Insert: AnalyticsEventInsert;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_plan: SubscriptionPlanDb;
      subscription_status: SubscriptionStatusDb;
    };
  };
}
