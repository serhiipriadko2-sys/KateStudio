import React, { useRef } from 'react';
import type { ChatMode } from '../../types';
import { ChatControlsPanel } from './ChatControlsPanel';

interface ChatWidgetInputsProps {
  mode: ChatMode;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const ChatWidgetInputs: React.FC<ChatWidgetInputsProps> = ({
  mode,
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  onFileUpload,
  isRecording,
  onToggleRecording,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <ChatControlsPanel
      mode={mode}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onSend={onSend}
      isLoading={isLoading}
      fileInputRef={fileInputRef}
      onFileUpload={onFileUpload}
      isRecording={isRecording}
      onToggleRecording={onToggleRecording}
    />
  );
};
