import { AppSource } from '../types';

export type AssistantResponse = {
  text: string;
  sources?: AppSource[];
};

export type KnowledgeEntry = {
  patterns: RegExp[];
  response: AssistantResponse;
};

export const CONTACT_SOURCES: AppSource[] = [
  { title: 'Telegram', url: 'https://t.me/k_sebe_dubna' },
  { title: 'Instagram', url: 'https://instagram.com/kate_gabran' },
  { title: 'Адрес', url: 'https://yandex.ru/navi/org/k_sebe/7167334007' },
];

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    patterns: [/адрес/i, /как добраться/i, /где вы/i, /локац/i],
    response: {
      text: 'Студия находится в Дубне: Станционная ул., 5Б (2 этаж). Могу прислать точку на карте или помочь с маршрутом.',
      sources: CONTACT_SOURCES,
    },
  },
  {
    patterns: [/контакт/i, /связаться/i, /телеграм/i, /инстаграм/i],
    response: {
      text: 'Лучше всего писать в Telegram или Instagram. Я отвечу и помогу подобрать занятие или время.',
      sources: CONTACT_SOURCES,
    },
  },
  {
    patterns: [/расписан/i, /когда занятия/i, /время/i],
    response: {
      text: 'Актуальное расписание смотрите в разделе «Расписание» на сайте. Если нужно — уточню места вручную.',
    },
  },
  {
    patterns: [/стоим/i, /цены/i, /абонемент/i, /сколько/i],
    response: {
      text: 'Цены и варианты абонементов собраны в блоке «Стоимость». Если подскажете цель и частоту, помогу выбрать.',
    },
  },
  {
    patterns: [/запис/i, /как попасть/i, /брон/i],
    response: {
      text: 'Запись можно оформить через раздел «Расписание» или написать мне в Telegram — подберём удобное время.',
      sources: CONTACT_SOURCES,
    },
  },
];

export const DEFAULT_RESPONSE: AssistantResponse = {
  text: 'Я помогу с адресом, расписанием, ценами и записью. Напишите, что интересует — отвечу коротко и по делу.',
  sources: CONTACT_SOURCES,
};

export const getKnowledgeBaseResponse = (message: string): AssistantResponse => {
  const trimmed = message.trim();
  if (!trimmed) return DEFAULT_RESPONSE;

  const entry = KNOWLEDGE_BASE.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(trimmed))
  );

  return entry?.response ?? DEFAULT_RESPONSE;
};
