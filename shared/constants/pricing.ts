export type PricingCategoryId = 'yoga' | 'personal' | 'sound' | 'massage';

export interface SharedPricingOption {
  id?: string;
  category: PricingCategoryId;
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isDark?: boolean;
  amountCents?: number | null;
  currency?: 'RUB';
  visitsTotal?: number | null;
  validDays?: number | null;
  isPayable?: boolean;
}

export interface PricingCategoryConfig {
  id: PricingCategoryId;
  label: string;
  title: string;
  subtitle: string;
  columns: 2 | 3;
}

export type SharedPricingData = Record<PricingCategoryId, SharedPricingOption[]>;

export const PRICING_CATEGORIES: PricingCategoryConfig[] = [
  {
    id: 'yoga',
    label: 'Йога-абонементы',
    title: 'Йога-абонементы',
    subtitle: 'Групповые занятия',
    columns: 3,
  },
  {
    id: 'personal',
    label: 'Персональные',
    title: 'Персональные тренировки',
    subtitle: 'Индивидуальный подход',
    columns: 2,
  },
  {
    id: 'sound',
    label: 'Саундхилинг',
    title: 'Саундхилинг',
    subtitle: 'Звукотерапия тибетскими чашами и гонгом',
    columns: 3,
  },
  {
    id: 'massage',
    label: 'Массаж',
    title: 'Массаж тибетскими чашами',
    subtitle: 'Глубокое расслабление через вибрации и звук',
    columns: 2,
  },
];

export const DEFAULT_PRICING_DATA: SharedPricingData = {
  yoga: [
    {
      category: 'yoga',
      title: 'Разовое',
      price: '850 ₽',
      description: 'Для знакомства со студией',
      features: ['1 посещение любой практики', 'Срок действия: 7 дней'],
      amountCents: 85000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 7,
      isPayable: true,
    },
    {
      category: 'yoga',
      title: '4 занятия',
      price: '3 100 ₽',
      description: 'Срок 1 месяц с первого посещения',
      features: ['775 ₽ за занятие', '4 посещения', 'Экономия 300 ₽', 'Срок действия: 30 дней'],
      amountCents: 310000,
      currency: 'RUB',
      visitsTotal: 4,
      validDays: 30,
      isPayable: true,
    },
    {
      category: 'yoga',
      title: '9 занятий',
      price: '6 300 ₽',
      description: 'Срок 1 месяц с первого посещения',
      features: ['700 ₽ за занятие', '9 посещений', 'Экономия 1 350 ₽', 'Срок действия: 30 дней'],
      isPopular: true,
      amountCents: 630000,
      currency: 'RUB',
      visitsTotal: 9,
      validDays: 30,
      isPayable: true,
    },
  ],
  personal: [
    {
      category: 'personal',
      title: 'Персональная (1 чел)',
      price: '1 800 ₽',
      description: 'Индивидуальный подход',
      features: ['Удобное время', 'Индивидуальный подход', '1 человек'],
      isDark: true,
      amountCents: 180000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
    {
      category: 'personal',
      title: 'Персональная (2 чел)',
      price: '2 500 ₽',
      description: 'Занятие для двоих',
      features: ['Удобное время', 'Индивидуальный подход', '2 человека'],
      isDark: true,
      amountCents: 250000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
  ],
  sound: [
    {
      category: 'sound',
      title: 'Групповая сессия',
      price: '1 500 ₽',
      description: 'Саундхилинг в группе',
      features: ['Глубокая релаксация', 'Снятие стресса и тревожности', 'Гармонизация энергии'],
      amountCents: 150000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
    {
      category: 'sound',
      title: 'Индивидуальная',
      price: '3 000 ₽',
      description: 'Персональная сессия',
      features: [
        'Чаши - 3 000 ₽',
        'Гонг + чаши - 3 500 ₽',
        'Индивидуальный подход',
        'Глубокое исцеление',
      ],
      isPopular: true,
      amountCents: 300000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
    {
      category: 'sound',
      title: 'Парная',
      price: '3 500 ₽',
      description: 'Сессия для двоих',
      features: ['Чаши - 3 500 ₽', 'Гонг + чаши - 4 000 ₽', '2 человека', 'Совместное погружение'],
      amountCents: 350000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
  ],
  massage: [
    {
      category: 'massage',
      title: 'Индивидуальный',
      price: '3 500 ₽',
      description: 'Массаж тибетскими чашами',
      features: [
        'Глубокое расслабление',
        'Снятие мышечных зажимов',
        'Улучшение сна',
        'Энергетический баланс',
      ],
      amountCents: 350000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
    {
      category: 'massage',
      title: 'Для двоих',
      price: '6 000 ₽',
      description: 'Массаж для пары',
      features: [
        'Совместное расслабление',
        'Гармонизация энергии',
        'Улучшение кровообращения',
        'Медитативное погружение',
      ],
      isDark: true,
      amountCents: 600000,
      currency: 'RUB',
      visitsTotal: 1,
      validDays: 30,
      isPayable: true,
    },
  ],
};

export function emptyPricingData(): SharedPricingData {
  return {
    yoga: [],
    personal: [],
    sound: [],
    massage: [],
  };
}
