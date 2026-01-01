import React from 'react';
import type { ChatMode } from '../../types';
import { ToolMenu } from './ToolMenu';
import { TOOLS } from './tools';

export const ChatModeSelector: React.FC<{
  activeMode: ChatMode;
  onSelect: (mode: ChatMode) => void;
}> = ({ activeMode, onSelect }) => {
  return <ToolMenu tools={TOOLS} activeMode={activeMode} onSelect={onSelect} />;
};
