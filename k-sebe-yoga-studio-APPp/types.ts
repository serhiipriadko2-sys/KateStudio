export interface PriceItem {
  id: string;
  title: string;
  price: string;
  subtitle?: string;
  isPersonal?: boolean;
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  sources?: Source[];
  audioBase64?: string;
  isAudioLoading?: boolean;
}

export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  span?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  avatar?: string;
  isRegistered: boolean;
  createdAt?: string;
}

export interface Booking {
  id: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  location: string;
  timestamp: number;
}

export interface ClassSession {
  id: string;
  dateStr: string; // YYYY-MM-DD
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spotsTotal: number;
  spotsBooked: number;
  location: string;
  intensity: 1 | 2 | 3;
  price: number;
  isOnline: boolean;
}

export type SubscriptionPlan = 'free' | 'premium' | 'vip';

export type SubscriptionStatus = 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end?: string | null;
  created_at?: string;
  updated_at?: string;
}
