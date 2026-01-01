import React from 'react';
import { ChatWidgetShell } from './ChatWidget/ChatWidgetShell';

interface ChatWidgetProps {
  hidden?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ hidden = false }) => {
  return <ChatWidgetShell hidden={hidden} />;
};
