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

export type ChatMode = 'chat' | 'meditation' | 'art' | 'video_gen' | 'coach' | 'program' | 'diary';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  sources?: Source[];
  audioBase64?: string;
  isAudioLoading?: boolean;

  // New fields for AI features
  type?: ChatMode;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  videoAnalysis?: string;
  isThinking?: boolean; // For Thinking Mode UI
  diarySummary?: string; // For transcribed text
}

export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  span?: boolean;
}

export interface AsanaAnalysis {
  sanskrit: string;
  name_ru: string;
  muscles: string[];
  energy: 'Brahmana' | 'Langhana' | 'Samana';
  description: string;
  tips: string;
}

export interface BookingDetails {
  type: string; // Название услуги или класса
  date?: string; // Опционально (если конкретная дата)
  time?: string; // Опционально
  location?: string; // Опционально
  price?: string; // Опционально (для покупки абонементов)
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
