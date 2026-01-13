// Yoga Directions and Styles

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

// Inside Flow Specifics (2026)
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
