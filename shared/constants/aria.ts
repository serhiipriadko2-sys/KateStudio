// AI Coach Aria Configuration

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
