import { STUDIO_KB } from '../constants/kb';
import { AppSource } from '../types';

export interface AssistantResponse {
  text: string;
  sources?: AppSource[];
}

export const getKnowledgeBaseResponse = (message: string): AssistantResponse => {
  const lowerMsg = message.toLowerCase();

  // 1. Schedule
  if (lowerMsg.includes('расписание') || lowerMsg.includes('когда') || lowerMsg.includes('занятия')) {
    return {
      text: `${STUDIO_KB.schedule.summary}\n\nНаправления:\n` +
            STUDIO_KB.schedule.types.map(t => `• ${t.name}: ${t.description} (${t.level})`).join('\n'),
      sources: [{ title: 'Расписание', url: '#schedule' }]
    };
  }

  // 2. Pricing
  if (lowerMsg.includes('цен') || lowerMsg.includes('стоит') || lowerMsg.includes('абонемент')) {
    return {
      text: `Стоимость занятий:\n` +
            `• Пробное: ${STUDIO_KB.pricing.trial}\n` +
            `• Разовое: ${STUDIO_KB.pricing.single}\n` +
            `• Абонемент (4): ${STUDIO_KB.pricing.subscription_4}\n` +
            `• Абонемент (8): ${STUDIO_KB.pricing.subscription_8}\n` +
            `• Индивидуально: ${STUDIO_KB.pricing.personal}`,
      sources: [{ title: 'Цены', url: '#pricing' }]
    };
  }

  // 3. Contacts / Location
  if (lowerMsg.includes('адрес') || lowerMsg.includes('где') || lowerMsg.includes('контакт') || lowerMsg.includes('найти')) {
    return {
      text: `Мы находимся по адресу: ${STUDIO_KB.location.address}.\n${STUDIO_KB.location.landmark}\n` +
            `Телефон: ${STUDIO_KB.contacts.phone}\n` +
            `Telegram: ${STUDIO_KB.contacts.telegram}`,
      sources: [{ title: 'Контакты', url: '#contact' }]
    };
  }

  // 4. FAQ
  for (const faq of STUDIO_KB.faq) {
    if (lowerMsg.includes(faq.q.toLowerCase()) || (faq.q.includes('новичок') && lowerMsg.includes('начин'))) {
      return {
        text: faq.a,
        sources: [{ title: 'FAQ', url: '#faq' }]
      };
    }
  }

  // Default
  return {
    text: `Я пока не могу ответить на этот вопрос. Пожалуйста, посмотрите информацию на сайте или напишите нам в Telegram: ${STUDIO_KB.contacts.telegram}.`,
    sources: []
  };
};
