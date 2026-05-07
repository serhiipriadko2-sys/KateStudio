/**
 * K Sebe Yoga Studio - Brand Constants
 */
import type { BlogArticle, PriceOption } from '../types';
import { IMAGES } from './images';
export * from './pricing';

// ============================================
// BRAND IDENTITY
// ============================================

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
    nameRu: 'Inside Flow Yoga',
    description: 'Практика, вобравшая в себя лучшее из йоги, танца и музыки',
    tags: ['Ритм', 'Музыка', 'Поток'],
    intensity: 3,
    duration: '60 мин',
    price: 700,
  },
  {
    id: 'hatha',
    name: 'Hatha Yoga',
    nameRu: 'Йога (классическая хатха)',
    description: 'Классическая форма йоги для работы с телом и умом',
    tags: ['Сила', 'Баланс', 'Дыхание'],
    intensity: 2,
    duration: '60 мин',
    price: 700,
  },
  {
    id: 'sound-healing',
    name: 'Sound Healing',
    nameRu: 'Медитации с гонгом и поющими чашами',
    description: 'Звуковые медитации с тибетскими чашами и гонгами',
    tags: ['Расслабление', 'Вибрация', 'Исцеление'],
    intensity: 1,
    duration: '60 мин',
    price: 1500,
  },
] as const;

// ============================================
// PRICING
// ============================================

export const PRICING_PLANS = [
  {
    id: 'single',
    title: 'Разовое занятие',
    price: 700,
    currency: 'RUB',
    description: 'Для знакомства со студией',
    features: ['1 посещение любой практики', 'Коврик включен', 'Чай после практики'],
    validDays: 7,
    isPopular: false,
  },
  {
    id: 'pack-4',
    title: 'Абонемент 4 занятия',
    price: 2500,
    currency: 'RUB',
    description: 'Срок 1 месяц с первого посещения',
    features: ['625 ₽ за занятие', '4 посещения', 'Экономия 300 ₽'],
    validDays: 30,
    isPopular: false,
  },
  {
    id: 'pack-9',
    title: 'Абонемент 9 занятий',
    price: 5000,
    currency: 'RUB',
    description: 'Срок 1 месяц с первого посещения',
    features: ['556 ₽ за занятие', '9 посещений', 'Экономия 1300 ₽'],
    validDays: 30,
    isPopular: true,
  },
  {
    id: 'unlimited',
    title: 'Безлимит 1 месяц',
    price: 8000,
    currency: 'RUB',
    description: 'Неограниченное количество посещений',
    features: ['Безлимитные посещения', 'Все направления', 'Максимальная выгода'],
    validDays: 30,
    isPopular: false,
  },
  {
    id: 'personal-1',
    title: 'Персональная тренировка',
    price: 1800,
    currency: 'RUB',
    description: '1 человек',
    features: ['Индивидуальный подход', 'Удобное время', 'Разбор техники асан'],
    validDays: 30,
    isPopular: false,
  },
  {
    id: 'personal-2',
    title: 'Персональная тренировка',
    price: 2500,
    currency: 'RUB',
    description: '2 человека',
    features: ['Занятие вдвоём', 'Удобное время', 'Индивидуальный подход'],
    validDays: 30,
    isPopular: false,
  },
] as const;

// ============================================
// CONTACT INFO
// ============================================

export const CONTACT = {
  phone: '+7 909 946-89-72',
  email: 'k.sebe.dubna@gmail.com',
  address: 'Станционная ул., 5Б, Дубна, 141981',
  addressFull: 'Станционная ул., 5Б, Дубна, Московская область, 141981 (этаж 2)',
  city: 'Дубна',
  coordinates: {
    lat: 56.7327,
    lng: 37.1534,
  },
  workingHours: {
    weekdays: '09:00 - 21:00',
    weekends: '10:00 - 18:00',
  },
  social: {
    instagram: 'https://instagram.com/kate_gabran',
    telegram: 'https://t.me/k_sebe_dubna',
    yandex: 'https://yandex.ru/navi/org/k_sebe/7167334007',
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

// ============================================
// ACHIEVEMENTS (2026)
// ============================================

export const ACHIEVEMENTS = [
  // Streak achievements
  {
    id: 'first_practice',
    name: 'First Step',
    nameRu: 'Первый шаг',
    description: 'Завершите первую практику',
    icon: '🌱',
    category: 'practice' as const,
    target: 1,
    rarity: 'common' as const,
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    nameRu: 'Неделя силы',
    description: '7 дней практики подряд',
    icon: '🔥',
    category: 'streak' as const,
    target: 7,
    rarity: 'common' as const,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    nameRu: 'Месяц трансформации',
    description: '30 дней практики подряд',
    icon: '⭐',
    category: 'streak' as const,
    target: 30,
    rarity: 'rare' as const,
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    nameRu: 'Мастер дисциплины',
    description: '100 дней практики подряд',
    icon: '👑',
    category: 'streak' as const,
    target: 100,
    rarity: 'legendary' as const,
  },
  // Practice achievements
  {
    id: 'practices_10',
    name: 'Getting Started',
    nameRu: 'Начинающий йог',
    description: '10 завершённых практик',
    icon: '🧘',
    category: 'practice' as const,
    target: 10,
    rarity: 'common' as const,
  },
  {
    id: 'practices_50',
    name: 'Dedicated Practitioner',
    nameRu: 'Опытный практик',
    description: '50 завершённых практик',
    icon: '💪',
    category: 'practice' as const,
    target: 50,
    rarity: 'rare' as const,
  },
  {
    id: 'practices_100',
    name: 'Yoga Enthusiast',
    nameRu: 'Йога-энтузиаст',
    description: '100 завершённых практик',
    icon: '🎯',
    category: 'practice' as const,
    target: 100,
    rarity: 'epic' as const,
  },
  // AI achievements
  {
    id: 'vision_first',
    name: 'AI Analysis',
    nameRu: 'AI-анализ',
    description: 'Первый анализ асаны с AI',
    icon: '📸',
    category: 'ai' as const,
    target: 1,
    rarity: 'common' as const,
  },
  {
    id: 'meditation_first',
    name: 'Inner Peace',
    nameRu: 'Внутренний покой',
    description: 'Первая AI-медитация',
    icon: '🕊️',
    category: 'ai' as const,
    target: 1,
    rarity: 'common' as const,
  },
  {
    id: 'all_modes',
    name: 'AI Explorer',
    nameRu: 'Исследователь AI',
    description: 'Попробовать все режимы Aria',
    icon: '🔮',
    category: 'ai' as const,
    target: 6,
    rarity: 'rare' as const,
  },
  // Inside Flow achievements
  {
    id: 'inside_flow_first',
    name: 'Flow Beginner',
    nameRu: 'Поток начинается',
    description: 'Первый Inside Flow класс',
    icon: '🎵',
    category: 'practice' as const,
    target: 1,
    rarity: 'common' as const,
  },
  {
    id: 'inside_flow_10',
    name: 'Flow Master',
    nameRu: 'Мастер потока',
    description: '10 Inside Flow классов',
    icon: '🎶',
    category: 'practice' as const,
    target: 10,
    rarity: 'rare' as const,
  },
  // New achievements 2026
  {
    id: 'music_sync',
    name: 'Music Flow',
    nameRu: 'В ритме музыки',
    description: '5 практик Inside Flow с музыкой',
    icon: '🎧',
    category: 'practice' as const,
    target: 5,
    rarity: 'common' as const,
  },
  {
    id: 'ai_daily_7',
    name: 'AI Assistant',
    nameRu: 'AI-ассистент',
    description: 'Общение с Aria 7 дней подряд',
    icon: '🤖',
    category: 'ai' as const,
    target: 7,
    rarity: 'common' as const,
  },
  {
    id: 'vision_progress',
    name: 'Visible Progress',
    nameRu: 'Видимый прогресс',
    description: '10 анализов асан с улучшением',
    icon: '📈',
    category: 'ai' as const,
    target: 10,
    rarity: 'rare' as const,
  },
  {
    id: 'breathwork_master',
    name: 'Breathwork Master',
    nameRu: 'Мастер дыхания',
    description: '20 дыхательных практик',
    icon: '💨',
    category: 'practice' as const,
    target: 20,
    rarity: 'rare' as const,
  },
  {
    id: 'morning_bird',
    name: 'Early Bird',
    nameRu: 'Ранняя пташка',
    description: '10 утренних практик (до 9:00)',
    icon: '🌅',
    category: 'milestone' as const,
    target: 10,
    rarity: 'common' as const,
  },
  {
    id: 'evening_calm',
    name: 'Evening Calm',
    nameRu: 'Вечерний покой',
    description: '10 вечерних практик (после 19:00)',
    icon: '🌙',
    category: 'milestone' as const,
    target: 10,
    rarity: 'common' as const,
  },
  {
    id: 'weekly_goal',
    name: 'Goal Achiever',
    nameRu: 'Цель достигнута',
    description: 'Выполнить недельную цель 4 раза',
    icon: '🎯',
    category: 'milestone' as const,
    target: 4,
    rarity: 'rare' as const,
  },
  {
    id: 'personal_program',
    name: 'Program Complete',
    nameRu: 'Программа завершена',
    description: 'Завершить 7-дневную AI-программу',
    icon: '📋',
    category: 'ai' as const,
    target: 1,
    rarity: 'rare' as const,
  },
] as const;

// ============================================
// STREAK MILESTONES (2026)
// ============================================

export const STREAK_MILESTONES = [
  { days: 3, reward: 'Bronze Badge', rewardRu: 'Бронзовый значок', icon: '🥉' },
  { days: 7, reward: 'Silver Badge', rewardRu: 'Серебряный значок', icon: '🥈' },
  { days: 14, reward: 'Gold Badge', rewardRu: 'Золотой значок', icon: '🥇' },
  { days: 30, reward: 'Diamond Badge', rewardRu: 'Бриллиантовый значок', icon: '💎' },
  { days: 60, reward: 'Platinum Badge', rewardRu: 'Платиновый значок', icon: '🏆' },
  { days: 100, reward: 'Legend Badge', rewardRu: 'Легендарный значок', icon: '👑' },
] as const;

// ============================================
// SUBSCRIPTION PLANS (2026)
// ============================================

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    nameRu: 'Бесплатный',
    price: 0,
    currency: 'RUB' as const,
    interval: 'month' as const,
    features: [
      'AI-чат с Арией (100 сообщений/день)',
      '3 видео в неделю',
      'Дыхательные практики',
      'Базовый трекинг прогресса',
    ],
    limits: {
      aiMessagesPerDay: 100,
      videosPerWeek: 3,
      offlineDownloads: false,
      personalPrograms: false,
      visionAnalysesPerMonth: 5,
      prioritySupport: false,
    },
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    nameRu: 'Премиум',
    price: 990,
    currency: 'RUB' as const,
    interval: 'month' as const,
    features: [
      'Все функции Free',
      'Безлимитные AI-сообщения',
      'Полная видеотека',
      'Скачивание для offline',
      'Персональные AI-программы',
      'Безлимитный анализ асан',
    ],
    limits: {
      aiMessagesPerDay: -1, // unlimited
      videosPerWeek: -1, // unlimited
      offlineDownloads: true,
      personalPrograms: true,
      visionAnalysesPerMonth: -1, // unlimited
      prioritySupport: false,
    },
  },
  {
    id: 'vip' as const,
    name: 'VIP',
    nameRu: 'VIP',
    price: 2990,
    currency: 'RUB' as const,
    interval: 'month' as const,
    features: [
      'Все функции Premium',
      'Личные консультации с Катей (2/мес)',
      'Приоритетная поддержка',
      'Эксклюзивный контент',
      'Ранний доступ к новым функциям',
    ],
    limits: {
      aiMessagesPerDay: -1,
      videosPerWeek: -1,
      offlineDownloads: true,
      personalPrograms: true,
      visionAnalysesPerMonth: -1,
      prioritySupport: true,
    },
  },
] as const;

// ============================================
// INSIDE FLOW INFO (2026)
// ============================================

export const INSIDE_FLOW = {
  founder: 'Young Ho Kim',
  origin: 'Inside Yoga Academy, Germany',
  description:
    'Inside Flow — это современный стиль йоги, созданный Young Ho Kim, который сочетает vinyasa flow с музыкой и эмоциональным сторителлингом. Каждая практика построена вокруг песни, создавая уникальный опыт движения в потоке.',
  philosophy: 'Движение как выражение эмоций, синхронизация с музыкой, storytelling through yoga',
  keyElements: [
    'Музыкальная интеграция',
    'Эмоциональный сторителлинг',
    'Breath-to-beat координация',
    'Creative sequencing',
    'Community connection',
  ],
  globalCommunity: {
    certifiedTeachers: '10,000+',
    countries: '50+',
    annualSummits: [
      'Global Summit Thailand',
      'European Summit Budapest',
      'Elite Training Frankfurt',
    ],
  },
  // Training & Certification 2026
  certification: {
    levels: [
      'Flow Lover',
      'Silver Instructor',
      'Gold Instructor',
      'Junior Teacher',
      'Senior Teacher',
      'Pro Teacher',
      'Master Teacher',
    ],
    fundamentalsTraining: {
      name: 'Inside Flow Fundamentals',
      credits: 50, // TRC - Training Credits
      format: 'Online + Hybrid',
      duration: '4-5 weeks',
    },
    annualLicenseFee: 108, // EUR
  },
  // Events 2026
  events2026: [
    {
      name: 'Inside Flow Fundamentals Training',
      date: '2026-03-21',
      location: 'Online',
      description: 'Онлайн-тренинг от Young Ho Kim',
    },
    {
      name: 'European Summit',
      date: '2026-05',
      location: 'Budapest, Hungary',
      description: 'Региональный саммит для европейских учителей',
    },
    {
      name: 'Elite Training',
      date: '2026-05-31 to 2026-06-06',
      location: 'Frankfurt, Germany',
      description: 'Продвинутый тренинг в штаб-квартире Inside Flow',
    },
  ],
  links: {
    official: 'https://insideflow.com',
    academy: 'https://insideyoga.org',
    online: 'https://online.insideyoga.org',
    flowShow: 'https://insideyoga.org/flow-show/',
    fundamentals: 'https://online.insideyoga.org/programs/inside-flow-fundamentals',
  },
} as const;

// ============================================
// AI COACH ARIA (2026)
// ============================================

export const ARIA_CONFIG = {
  name: 'Aria',
  nameRu: 'Ария',
  role: 'AI Yoga Coach',
  roleRu: 'AI-коуч по йоге',
  personality:
    'Добрый, поддерживающий, знающий. Говорит на русском языке. Эксперт в Inside Flow, хатха-йоге и медитации.',
  modes: [
    {
      id: 'chat',
      name: 'Chat',
      nameRu: 'Чат',
      description: 'Общение о йоге, здоровье, осознанности',
      icon: '💬',
    },
    {
      id: 'vision',
      name: 'Vision',
      nameRu: 'Анализ асан',
      description: 'AI-анализ вашей позы по фото',
      icon: '📸',
    },
    {
      id: 'meditation',
      name: 'Meditation',
      nameRu: 'Медитация',
      description: 'Персонализированные медитации',
      icon: '🧘',
    },
    {
      id: 'program',
      name: 'Program',
      nameRu: 'Программа',
      description: 'Персональная 7-дневная программа',
      icon: '📋',
    },
    {
      id: 'create',
      name: 'Create',
      nameRu: 'Творчество',
      description: 'Арт-терапия и визуализация',
      icon: '🎨',
    },
    {
      id: 'coach',
      name: 'Coach',
      nameRu: 'Коуч',
      description: 'Голосовой коучинг во время практики',
      icon: '🎤',
    },
  ],
  geminiModels: {
    chat: 'gemini-2.5-flash',
    vision: 'gemini-2.5-flash',
    thinking: 'gemini-2.5-pro',
    image: 'imagen-3.0-generate-002',
    video: 'veo-2.0-generate-001',
  },
} as const;

// ============================================
// MARQUEE WORD LISTS
// ============================================

export const MARQUEE_WORDS = {
  inhale: [
    'смелость',
    'энергия',
    'сила',
    'уверенность',
    'радость',
    'движение',
    'огонь',
    'мощь',
    'воля',
    'страсть',
    'мужество',
    'решимость',
    'энтузиазм',
    'жизнь',
    'творчество',
    'свобода',
    'рост',
    'победа',
    'сила духа',
    'мотивация',
    'активность',
    'борьба',
    'прогресс',
    'успех',
    'триумф',
    'энергия жизни',
    'огненная страсть',
    'непоколебимость',
    'дерзость',
    'динамика',
  ] as string[],
  exhale: [
    'гармония',
    'покой',
    'тишина',
    'любовь',
    'свет',
    'нежность',
    'мягкость',
    'тепло',
    'спокойствие',
    'мир',
    'баланс',
    'умиротворение',
    'спокойная сила',
    'мудрость',
    'сострадание',
    'принятие',
    'благодать',
    'спокойный ум',
    'радость тишины',
    'душевный покой',
    'гармоничная энергия',
    'мягкая сила',
    'внутренний свет',
    'спокойная решимость',
    'умиротворенная воля',
    'тихая мощь',
    'гармоничный баланс',
    'спокойное тепло',
    'нежная любовь',
    'тихий свет',
  ] as string[],
} as const;

// ============================================
// PRICING DATA (studio services)
// ============================================

export const PRICING_DATA: {
  yoga: PriceOption[];
  personal: PriceOption[];
  soundHealing: PriceOption[];
  tibetanMassage: PriceOption[];
} = {
  yoga: [
    {
      title: 'Разовое',
      price: '700 ₽',
      description: 'Для знакомства со студией',
      features: ['1 посещение любой практики', 'Срок действия: 7 дней'],
      isPopular: false,
    },
    {
      title: '4 занятия',
      price: '2 500 ₽',
      description: 'Срок 1 месяц с первого посещения',
      features: ['625 ₽ за занятие', '4 посещения', 'Экономия 300 ₽', 'Срок действия: 30 дней'],
      isPopular: false,
    },
    {
      title: '9 занятий',
      price: '5 000 ₽',
      description: 'Срок 1 месяц с первого посещения',
      features: ['556 ₽ за занятие', '9 посещений', 'Экономия 1 300 ₽', 'Срок действия: 30 дней'],
      isPopular: true,
    },
  ],
  personal: [
    {
      title: 'Персональная (1 чел)',
      price: '1 800 ₽',
      description: 'Индивидуальный подход',
      features: ['Удобное время', 'Индивидуальный подход', '1 человек'],
      isPopular: false,
      isDark: true,
    },
    {
      title: 'Персональная (2 чел)',
      price: '2 500 ₽',
      description: 'Занятие для двоих',
      features: ['Удобное время', 'Индивидуальный подход', '2 человека'],
      isPopular: false,
      isDark: true,
    },
  ],
  soundHealing: [
    {
      title: 'Групповая сессия',
      price: '1 500 ₽',
      description: 'Саундхилинг в группе',
      features: ['Глубокая релаксация', 'Снятие стресса и тревожности', 'Гармонизация энергии'],
      isPopular: false,
    },
    {
      title: 'Индивидуальная',
      price: 'от 3 000 ₽',
      description: 'Персональная сессия',
      features: [
        'Чаши — 3 000 ₽',
        'Гонг + чаши — 3 500 ₽',
        'Индивидуальный подход',
        'Глубокое исцеление',
      ],
      isPopular: true,
    },
    {
      title: 'Парная',
      price: 'от 3 500 ₽',
      description: 'Сессия для двоих',
      features: ['Чаши — 3 500 ₽', 'Гонг + чаши — 4 000 ₽', '2 человека', 'Совместное погружение'],
      isPopular: false,
    },
  ],
  tibetanMassage: [
    {
      title: 'Индивидуальный',
      price: '3 500 ₽',
      description: 'Массаж тибетскими чашами',
      features: [
        'Глубокое расслабление',
        'Снятие мышечных зажимов',
        'Улучшение сна',
        'Энергетический баланс',
      ],
      isPopular: false,
    },
    {
      title: 'Для двоих',
      price: '6 000 ₽',
      description: 'Массаж для пары',
      features: [
        'Совместное расслабление',
        'Гармонизация энергии',
        'Улучшение кровообращения',
        'Медитативное погружение',
      ],
      isPopular: false,
      isDark: true,
    },
  ],
};

// ============================================
// DEFAULT BLOG ARTICLES
// ============================================

export const DEFAULT_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    category: 'Практика',
    title: 'Как начать медитировать: 5 простых шагов',
    excerpt:
      'Медитация — это не отсутствие мыслей, а умение их наблюдать. Рассказываем, как сделать первые шаги к осознанности без стресса.',
    image: IMAGES.blog.articles[0],
    date: '12 Авг',
    author: 'Катя Габран',
    readTime: '3 мин',
    content: `
      <p>Многие думают, что медитация — это сидеть в позе лотоса и ни о чем не думать. На самом деле, это тренировка ума возвращаться в настоящий момент.</p>
      <h3>1. Найдите удобное место</h3>
      <p>Вам не нужна специальная комната. Достаточно тихого уголка и подушки. Главное — прямая спина.</p>
      <h3>2. Начните с дыхания</h3>
      <p>Просто наблюдайте за тем, как воздух входит и выходит. Не пытайтесь его контролировать.</p>
      <h3>3. Не ругайте себя за мысли</h3>
      <p>Мысли будут приходить. Это нормально. Как только заметите, что отвлеклись — мягко верните внимание к дыханию.</p>
      <p>Начните с 5 минут в день. Это эффективнее, чем час раз в месяц.</p>
    `,
  },
  {
    id: 2,
    category: 'Здоровье',
    title: 'Питание и Йога: что есть до и после?',
    excerpt:
      'Легкость в теле — залог успешной практики. Разбираем идеальный рацион для утренних и вечерних занятий.',
    image: IMAGES.blog.articles[1],
    date: '08 Авг',
    author: 'Катя Габран',
    readTime: '4 мин',
    content: `
      <p>Йога на полный желудок — это испытание. Но и на голодный желудок заниматься сложно из-за слабости.</p>
      <h3>До практики (за 1.5-2 часа)</h3>
      <p>Идеально подойдут легкие углеводы: банан, овсянка на воде, смузи. Избегайте тяжелой, жирной пищи.</p>
      <h3>После практики</h3>
      <p>В течение 30 минут после шавасаны лучше выпить травяной чай или воду. Через час можно полноценно поесть: белок + овощи.</p>
      <p>Слушайте свое тело — оно лучший нутрициолог.</p>
    `,
  },
  {
    id: 3,
    category: 'Философия',
    title: 'Inside Flow: Танец твоего сердца',
    excerpt:
      'Почему эта практика покоряет мир? Сочетание современной музыки, ритма и традиционных асан в одном потоке.',
    image: IMAGES.blog.articles[2],
    date: '01 Авг',
    author: 'Катя Габран',
    readTime: '5 мин',
    content: `
      <p>Inside Flow — это эволюция виньяса-йоги. Здесь мы движемся в такт современной музыке.</p>
      <h3>Музыка как проводник</h3>
      <p>Каждое движение синхронизировано с битом. Это помогает отключить «мыслемешалку» и полностью отдаться потоку.</p>
      <h3>История в движении</h3>
      <p>Каждая последовательность (флоу) рассказывает историю. Мы проживаем эмоции через тело.</p>
      <p>Это практика для тех, кто любит динамику, музыку и хочет почувствовать йогу по-новому.</p>
    `,
  },
];

export * from './images';
export * from './kb';
