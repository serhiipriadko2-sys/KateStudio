import { MessageCircle } from 'lucide-react';
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
];
