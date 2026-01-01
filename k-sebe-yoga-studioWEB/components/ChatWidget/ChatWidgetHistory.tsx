import React, { useLayoutEffect, useRef } from 'react';
import type { ChatMessage, ChatMode } from '../../types';
import { ChatMessagesPanel } from './ChatMessagesPanel';

interface ChatWidgetHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText: string;
  playingMessageId: number | null;
  onToggleAudio: (index: number) => void;
  isLiveMode: boolean;
  isOpen: boolean;
  mode: ChatMode;
}

export const ChatWidgetHistory: React.FC<ChatWidgetHistoryProps> = ({
  messages,
  isLoading,
  loadingText,
  playingMessageId,
  onToggleAudio,
  isLiveMode,
  isOpen,
  mode,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isLiveMode && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLiveMode, isLoading, mode]);

  return (
    <ChatMessagesPanel
      messages={messages}
      isLoading={isLoading}
      loadingText={loadingText}
      playingMessageId={playingMessageId}
      onToggleAudio={onToggleAudio}
      messagesEndRef={messagesEndRef}
    />
  );
};
