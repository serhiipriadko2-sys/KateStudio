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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: ChatMode;
  attachments?: ChatAttachment[];
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
