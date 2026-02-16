// Knowledge Base for Non-AI Assistants (and fallback for AI)
// This file serves as a deterministic source of truth for studio information.

export const STUDIO_KB = {
  name: 'К себе',
  description: 'Уютная студия йоги и медитации в Дубне. Место, где можно замедлиться, услышать свое тело и найти внутренний баланс.',

  location: {
    address: 'Московская область, г. Дубна, ул. Станционная, 5Б',
    landmark: 'Рядом с вокзалом "Дубна" (Большая Волга), вход со двора, 2 этаж.',
    mapLink: 'https://yandex.ru/maps/-/CCUFM2X8OC', // Placeholder link
  },

  contacts: {
    phone: '+7 (999) 123-45-67', // Placeholder
    instagram: '@kate_gabran',
    telegram: '@k_sebe_dubna',
    email: 'hello@ksebe-studio.ru',
  },

  schedule: {
    summary: 'Групповые занятия проходят ежедневно утром и вечером. Индивидуальные — по записи.',
    types: [
      {
        name: 'Inside Flow',
        description: 'Динамичная практика в ритме современной музыки. Танец дыхания и движения.',
        level: 'Для продолжающих (или смелых начинающих)',
      },
      {
        name: 'Хатха Йога',
        description: 'Классическая йога: асаны, дыхание, расслабление. Баланс силы и гибкости.',
        level: 'Для всех уровней',
      },
      {
        name: 'Медитация + Sound Healing',
        description: 'Практика глубокого расслабления под звуки тибетских чаш.',
        level: 'Для всех уровней',
      },
    ],
  },

  pricing: {
    trial: '700 ₽ (разовое посещение)',
    single: '700 ₽',
    subscription_4: '2 500 ₽ (625 ₽/занятие, 30 дней)',
    subscription_8: '4 500 ₽ (562 ₽/занятие, 30 дней)', // Adjusted from 9 for consistency if needed, but keeping consistent with UI
    subscription_9: '5 000 ₽ (556 ₽/занятие, 30 дней)',
    personal: 'от 1 800 ₽',
  },

  faq: [
    {
      q: 'Я новичок, мне можно?',
      a: 'Конечно! Большинство наших практик адаптированы для начинающих. Преподаватель всегда предложит упрощенный вариант асаны.',
    },
    {
      q: 'Что взять с собой?',
      a: 'Удобную одежду, не стесняющую движений. Коврики и оборудование есть в студии, но можно прийти со своим.',
    },
    {
      q: 'Нужно ли записываться?',
      a: 'Да, количество мест ограничено (камерные группы до 12 человек). Запись обязательна.',
    },
  ],
} as const;
