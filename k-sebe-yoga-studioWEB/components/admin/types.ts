export type AdminTab =
  | 'dashboard'
  | 'schedule'
  | 'bookings'
  | 'contacts'
  | 'trainers'
  | 'reviews'
  | 'articles'
  | 'videos'
  | 'images'
  | 'faq'
  | 'retreats'
  | 'users'
  | 'analytics'
  | 'pricing'
  | 'settings';

export interface ClassRow {
  id: string;
  date: string;
  time: string;
  name: string;
  instructor: string | null;
  trainer_id: string | null;
  duration: string | null;
  spots_total: number | null;
  spots_booked: number | null;
  location: string | null;
  intensity: number | null;
  is_online: boolean | null;
  price: number | null;
}

export interface ClassFormData {
  date: string;
  time: string;
  name: string;
  instructor: string;
  trainer_id: string;
  duration: string;
  spots_total: number;
  location: string;
  intensity: 1 | 2 | 3;
  is_online: boolean;
  price: number;
  repeat_weeks: number;
}

export interface BookingRow {
  id: string;
  phone: string | null;
  name: string | null;
  class_name: string | null;
  class_type: string | null;
  class_date: string | null;
  class_time: string | null;
  date: string | null;
  time: string | null;
  created_at: string;
  location: string | null;
  is_purchase: boolean | null;
  price: string | null;
  status?: 'active' | 'cancelled' | 'completed' | 'no_show';
}

export interface ContactRow {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  status?: 'new' | 'read' | 'processed' | 'spam';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order_index: number;
  created_at: string;
}

export interface TrainerAdminRow {
  id: string;
  slug: string;
  full_name: string;
  short_name: string | null;
  role_title: string;
  bio_short: string;
  bio_long: string | null;
  quote: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  specialties: string[];
  teaching_formats: Array<'studio' | 'online' | 'retreat' | 'private'>;
  experience_years: number | null;
  instagram_url: string | null;
  telegram_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminTabProps {
  toast: (message: string, type?: 'success' | 'error') => void;
}
