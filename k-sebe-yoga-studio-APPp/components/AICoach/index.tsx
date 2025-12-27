/**
 * AICoach - AI-powered yoga assistant
 *
 * Refactored into modular components:
 * - ChatMode: AI chat with streaming
 * - VisionMode: Photo/video pose analysis
 * - MeditationMode: AI meditation generator with TTS
 * - CreateMode: Art generation (Image, Video, Edit)
 */
import { Sparkles, Image as ImageIcon, Headphones, Maximize2, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ChatMode } from './ChatMode';
import { CreateMode } from './CreateMode';
import { MeditationMode } from './MeditationMode';
import { Mode } from './types';
import { VisionMode } from './VisionMode';

const MODES = [
  { id: 'chat', label: 'Чат', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'vision', label: 'Анализ', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'meditation', label: 'Медитация', icon: <Headphones className="w-4 h-4" /> },
  { id: 'create', label: 'Арт', icon: <Maximize2 className="w-4 h-4" /> },
] as const;

export const AICoach: React.FC = () => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('chat');

  const handleError = (message: string) => {
    showToast(message, 'error');
  };

  // AI can work either via server-side proxy (recommended) or via client key (demo).
  const hasSupabase =
    !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasClientGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  if (!hasSupabase && !hasClientGeminiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-[2rem] border border-stone-100">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif text-brand-text mb-2">Требуется настройка</h3>
        <p className="text-stone-500 max-w-sm">
          Для работы AI функций нужна настройка Supabase (VITE_SUPABASE_URL /
          VITE_SUPABASE_ANON_KEY) или клиентский ключ Gemini (VITE_GEMINI_API_KEY) для локального
          демо.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl shadow-stone-100/50 border border-stone-100 overflow-hidden">
      {/* Mode Switcher */}
      <div className="flex p-1.5 gap-1 bg-stone-50 border-b border-stone-100 mx-4 mt-4 rounded-2xl overflow-x-auto scrollbar-hide">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              mode === m.id
                ? 'bg-white text-brand-green shadow-sm ring-1 ring-black/5'
                : 'text-stone-400 hover:text-stone-600 hover:bg-white/50'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {mode === 'chat' && <ChatMode onError={handleError} />}
        {mode === 'vision' && <VisionMode onError={handleError} />}
        {mode === 'meditation' && <MeditationMode onError={handleError} />}
        {mode === 'create' && <CreateMode onError={handleError} />}
      </div>
    </div>
  );
};

export default AICoach;
