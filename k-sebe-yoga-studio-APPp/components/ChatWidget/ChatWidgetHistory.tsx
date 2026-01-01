import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import { ChatMessagesPanel } from './ChatMessagesPanel';

interface ChatWidgetHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onPlayTts: (index: number, text: string) => void;
  isLiveMode: boolean;
  isOpen: boolean;
}

export const ChatWidgetHistory: React.FC<ChatWidgetHistoryProps> = ({
  messages,
  isLoading,
  onPlayTts,
  isLiveMode,
  isOpen,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLiveMode && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLiveMode]);

  return (
    <ChatMessagesPanel
      messages={messages}
      isLoading={isLoading}
      onPlayTts={onPlayTts}
      messagesEndRef={messagesEndRef}
    />
  );
};
