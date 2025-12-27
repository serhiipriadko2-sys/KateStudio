import {
  Activity,
  Brain,
  Headphones,
  Image as ImageIcon,
  MessageCircle,
  Video,
} from 'lucide-react';
import React from 'react';
import type { ChatMode } from '../../types';

export type ChatTool = {
  id: ChatMode;
  label: string;
  icon: React.ReactNode;
  desc: string;
};

export const TOOLS: ChatTool[] = [
  {
    id: 'chat',
    label: 'Чат',
    icon: <MessageCircle className="w-5 h-5" />,
    desc: 'Общение с Катей',
  },
  {
    id: 'meditation',
    label: 'Медитация',
    icon: <Headphones className="w-5 h-5" />,
    desc: 'Голос + Видео (Veo)',
  },
  {
    id: 'art',
    label: 'Арт-терапия',
    icon: <ImageIcon className="w-5 h-5" />,
    desc: 'Создание образов (Imagen)',
  },
  {
    id: 'coach',
    label: 'AI Тренер',
    icon: <Video className="w-5 h-5" />,
    desc: 'Анализ вашей техники',
  },
  {
    id: 'program',
    label: 'Программа',
    icon: <Brain className="w-5 h-5" />,
    desc: 'Глубокий анализ (Thinking)',
  },
  {
    id: 'diary',
    label: 'Дневник',
    icon: <Activity className="w-5 h-5" />,
    desc: 'Голосовые заметки',
  },
];
