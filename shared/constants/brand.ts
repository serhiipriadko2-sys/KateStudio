export const BRAND_COLORS = {
  primary: '#57a773',
  secondary: '#d6f0df',
  accent: '#2c3e50',
  text: '#2d3436',
  light: '#fcfcfc',
  dark: '#1a1a1a',
  mint: '#e8f5e9',
};

// Legacy compatibility wrapper for existing components
export const COLORS = {
  brandGreen: BRAND_COLORS.primary,
  brandMint: '#d4edda', // Slightly different in original, keeping original value for safety
  brandYellow: '#f0c14b',
  brandDark: BRAND_COLORS.dark,
  brandText: BRAND_COLORS.text,
  brandAccent: '#fef3c7',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  bgPrimary: '#fdfbf7',
  bgSecondary: '#f8f9fa',
  bgWhite: '#ffffff',
} as const;

export const BRAND = {
  name: 'К себе',
  fullName: 'К Себе | Йога Студия',
  tagline: 'Йога студия в Дубне',
  founder: 'Катя Габран',
  founderInstagram: '@kate_gabran',
  philosophy:
    'Йога — это не про то, чтобы дотянуться руками до пальцев ног, а про то, что мы узнаем на пути вниз',
  rating: 4.4,
  reviewsCount: 9,
} as const;

export const FONTS = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const API_ENDPOINTS = {
  PAYMENT: '/api/create-payment',
};

// Re-export original API object to prevent breaking changes
export const API = {
  supabase: {
    tables: {
      users: 'users',
      bookings: 'bookings',
      classes: 'classes',
      reviews: 'reviews',
      articles: 'articles',
    },
    buckets: {
      avatars: 'avatars',
      images: 'images',
      videos: 'videos',
    },
  },
  gemini: {
    models: {
      chat: 'gemini-2.5-flash',
      vision: 'gemini-2.5-flash',
      thinking: 'gemini-2.5-pro',
      image: 'imagen-3.0-generate-002',
      video: 'veo-2.0-generate-001',
    },
  },
} as const;

export const BREATHWORK_PRESETS = {
  square: {
    name: 'Квадратное дыхание',
    nameEn: 'Square Breathing',
    inhale: 4000,
    holdFull: 4000,
    exhale: 4000,
    holdEmpty: 4000,
  },
  relaxing: {
    name: 'Расслабляющее',
    nameEn: '4-7-8 Breathing',
    inhale: 4000,
    holdFull: 7000,
    exhale: 8000,
    holdEmpty: 0,
  },
  energizing: {
    name: 'Энергетическое',
    nameEn: 'Energizing Breath',
    inhale: 2000,
    holdFull: 0,
    exhale: 2000,
    holdEmpty: 0,
  },
  coherent: {
    name: 'Когерентное',
    nameEn: 'Coherent Breathing',
    inhale: 5000,
    holdFull: 0,
    exhale: 5000,
    holdEmpty: 0,
  },
} as const;

export const STORAGE_KEYS = {
  user: 'ksebe_user',
  theme: 'ksebe_theme',
  locale: 'ksebe_locale',
  onboarded: 'ksebe_onboarded',
  scheduleTab: 'ksebe_schedule_tab',
  chatHistory: 'ksebe_chat_history',
} as const;

export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneRu: /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
  cyrillic: /^[а-яА-ЯёЁ\s]+$/,
} as const;
