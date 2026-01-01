import React from 'react';
import { ChatInputPanel } from './ChatInputPanel';

interface ChatWidgetInputsProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export const ChatWidgetInputs: React.FC<ChatWidgetInputsProps> = ({
  inputRef,
  value,
  onChange,
  onSend,
  onKeyDown,
  isLoading,
}) => {
  return (
    <ChatInputPanel
      inputRef={inputRef}
      value={value}
      onChange={onChange}
      onSend={onSend}
      onKeyDown={onKeyDown}
      isLoading={isLoading}
    />
  );
};
