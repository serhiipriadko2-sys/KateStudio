import React from 'react';
import type { ChatMode } from '../../types';
import type { ChatTool } from './tools';

export const ToolMenu: React.FC<{
  tools: ChatTool[];
  activeMode: ChatMode;
  onSelect: (mode: ChatMode) => void;
}> = ({ tools, activeMode, onSelect }) => {
  return (
    <div className="flex-1 bg-stone-50 p-4 grid grid-cols-2 gap-3 overflow-y-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelect(tool.id)}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${activeMode === tool.id ? 'bg-brand-green text-white border-brand-green shadow-lg' : 'bg-white text-stone-600 border-stone-200 hover:border-brand-green hover:shadow-md'}`}
        >
          <div
            className={`mb-2 p-3 rounded-full ${activeMode === tool.id ? 'bg-white/20' : 'bg-stone-100 text-brand-green'}`}
          >
            {tool.icon}
          </div>
          <span className="font-medium text-sm">{tool.label}</span>
          <span
            className={`text-[10px] mt-1 ${activeMode === tool.id ? 'text-white/80' : 'text-stone-400'}`}
          >
            {tool.desc}
          </span>
        </button>
      ))}
    </div>
  );
};
