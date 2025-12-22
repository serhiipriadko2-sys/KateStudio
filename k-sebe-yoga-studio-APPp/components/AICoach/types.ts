/**
 * AICoach Types
 */
export type Mode = 'chat' | 'vision' | 'meditation' | 'create';
export type CreateSubMode = 'gen' | 'veo' | 'edit';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ArtStyle {
  id: string;
  label: string;
  promptMod: string;
}

export const SUGGESTED_PROMPTS = [
  'Как правильно делать Собаку мордой вниз?',
  'Посоветуй практику для больной спины',
  'Что такое Inside Flow?',
  'Составь план тренировок на месяц',
  'Расскажи про дыхание Уджайи',
] as const;

export const ART_STYLES: ArtStyle[] = [
  { id: 'realistic', label: 'Реализм', promptMod: 'photorealistic, 8k, cinematic lighting' },
  { id: 'watercolor', label: 'Акварель', promptMod: 'soft watercolor painting, artistic, pastel colors' },
  { id: 'cyber', label: 'Кибер-Йога', promptMod: 'cyberpunk neon, futuristic city, glowing tattoos' },
  { id: 'oil', label: 'Масло', promptMod: 'oil painting on canvas, classical art style' },
];

export const MEDITATION_DURATIONS = ['5 минут', '10 минут', '20 минут'] as const;
