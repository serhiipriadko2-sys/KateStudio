/**
 * K Sebe Yoga Studio - Brand Constants
 */

// ============================================
// BRAND IDENTITY
// ============================================

export const BRAND = {
  name: 'К себе',
  fullName: 'K Sebe Yoga Studio | Atmosphere',
  tagline: 'Slow life в мегаполисе',
  founder: 'Катя Габран',
  philosophy:
    'Йога — это не про то, чтобы дотянуться руками до пальцев ног, а про то, что мы узнаем на пути вниз',
} as const;

// ============================================
// COLORS
// ============================================

export const COLORS = {
  // Primary
  brandGreen: '#57a773',
  brandMint: '#d4edda',
  brandYellow: '#f0c14b',

  // Neutrals
  brandDark: '#1a1a1a',
  brandText: '#2d3436',
  brandAccent: '#fef3c7',

  // Semantic
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Backgrounds
  bgPrimary: '#fdfbf7',
  bgSecondary: '#f8f9fa',
  bgWhite: '#ffffff',
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const FONTS = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
} as const;

// ============================================
// SPACING
// ============================================

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ============================================
// YOGA CLASSES
// ============================================

export const YOGA_DIRECTIONS = [
  {
    id: 'inside-flow',
    name: 'Inside Flow',
    nameRu: 'Инсайд Флоу',
    description: 'Практика, вобравшая в себя лучшее из йоги, танца и музыки',
    tags: ['Ритм', 'Музыка', 'Поток'],
    intensity: 3,
    duration: '90 мин',
  },
  {
    id: 'hatha',
    name: 'Hatha Yoga',
    nameRu: 'Хатха Йога',
    description: 'Классическая форма йоги для работы с телом и умом',
    tags: ['Сила', 'Баланс', 'Дыхание'],
    intensity: 2,
    duration: '60 мин',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    nameRu: 'Медитация',
    description: 'Практика осознанности и работа с умом',
    tags: ['Покой', 'Осознанность', 'Тишина'],
    intensity: 1,
    duration: '30 мин',
  },
  {
    id: 'sound-healing',
    name: 'Sound Healing',
    nameRu: 'Sound Healing',
    description: 'Звуковые ванны с тибетскими чашами и гонгами',
    tags: ['Расслабление', 'Вибрация', 'Исцеление'],
    intensity: 1,
    duration: '60 мин',
  },
] as const;

// ============================================
// PRICING
// ============================================

export const PRICING_PLANS = [
  {
    id: 'single',
    title: 'Разовое',
    price: 800,
    currency: 'RUB',
    description: 'Для знакомства со студией',
    features: ['1 посещение любой практики', 'Коврик включен', 'Чай после практики'],
    validDays: 7,
    isPopular: false,
  },
  {
    id: 'pack-4',
    title: '4 занятия',
    price: 2800,
    currency: 'RUB',
    description: 'Для регулярной практики',
    features: ['700 ₽ за занятие', 'Заморозка на 7 дней', 'Скидка 10% на мастер-классы'],
    validDays: 30,
    isPopular: false,
  },
  {
    id: 'pack-8',
    title: '8 занятий',
    price: 5200,
    currency: 'RUB',
    description: 'Выгодный выбор',
    features: ['650 ₽ за занятие', 'Заморозка на 14 дней', 'Гостевой визит для друга'],
    validDays: 45,
    isPopular: true,
  },
  {
    id: 'individual',
    title: 'Индивидуально',
    price: 3500,
    currency: 'RUB',
    description: 'Персональный подход',
    features: ['Удобное время', 'Разбор техники асан', 'План питания', 'Поддержка в мессенджере'],
    validDays: 30,
    isPopular: false,
  },
] as const;

// ============================================
// CONTACT INFO
// ============================================

export const CONTACT = {
  phone: '+7 (999) 123-45-67',
  email: 'hello@ksebe.yoga',
  address: 'Москва, ул. Мира, 15',
  workingHours: {
    weekdays: '07:00 - 22:00',
    weekends: '09:00 - 20:00',
  },
  social: {
    instagram: 'https://instagram.com/ksebe.yoga',
    telegram: 'https://t.me/ksebe_yoga',
    youtube: 'https://youtube.com/@ksebeyoga',
  },
} as const;

// ============================================
// API CONFIGURATION
// ============================================

export const API = {
  supabase: {
    // URL and keys are loaded from environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
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
    // API key is loaded from environment variable (VITE_GEMINI_API_KEY)
    models: {
      chat: 'gemini-2.5-flash',
      vision: 'gemini-2.5-flash',
      thinking: 'gemini-2.5-pro',
      image: 'imagen-3.0-generate-002',
      video: 'veo-2.0-generate-001',
    },
  },
} as const;

// ============================================
// BREATHWORK PRESETS
// ============================================

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

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  user: 'ksebe_user',
  theme: 'ksebe_theme',
  locale: 'ksebe_locale',
  onboarded: 'ksebe_onboarded',
  scheduleTab: 'ksebe_schedule_tab',
  chatHistory: 'ksebe_chat_history',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================

export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneRu: /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
  cyrillic: /^[а-яА-ЯёЁ\s]+$/,
} as const;
