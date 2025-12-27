import React from 'react';

export const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 bg-brand-green rounded-full transition-all duration-150 ease-in-out ${isActive ? 'animate-waveform' : 'h-2 opacity-50'}`}
          style={{ animationDelay: `${i * 0.1}s`, height: isActive ? '100%' : '8px' }}
        />
      ))}
    </div>
  );
};
