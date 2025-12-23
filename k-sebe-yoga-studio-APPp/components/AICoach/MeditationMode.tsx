/**
 * MeditationMode - AI-powered meditation generator with TTS
 */
import { Loader2, Sparkles, Play, Pause } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createMeditation, generateSpeech, MeditationResult } from '../../services/geminiService';
import { MEDITATION_DURATIONS } from './types';

interface MeditationModeProps {
  onError: (message: string) => void;
}

export const MeditationMode: React.FC<MeditationModeProps> = ({ onError }) => {
  const [meditTopic, setMeditTopic] = useState('Снятие стресса после работы');
  const [meditDuration, setMeditDuration] = useState('5 минут');
  const [meditResult, setMeditResult] = useState<MeditationResult | null>(null);
  const [isMeditLoading, setIsMeditLoading] = useState(false);
  const [meditAudio, setMeditAudio] = useState<HTMLAudioElement | null>(null);
  const [isMeditPlaying, setIsMeditPlaying] = useState(false);
  const [isAudioGenLoading, setIsAudioGenLoading] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (meditAudio) {
        meditAudio.pause();
        meditAudio.src = '';
      }
    };
  }, [meditAudio]);

  const handleGenerateMeditation = async () => {
    setIsMeditLoading(true);
    setMeditResult(null);
    if (meditAudio) {
      meditAudio.pause();
      setMeditAudio(null);
      setIsMeditPlaying(false);
    }

    const result = await createMeditation(meditTopic, meditDuration);
    setMeditResult(result);
    setIsMeditLoading(false);
  };

  const handlePlayMeditation = async () => {
    if (!meditResult) return;

    if (meditAudio) {
      if (isMeditPlaying) {
        meditAudio.pause();
        setIsMeditPlaying(false);
      } else {
        meditAudio.play();
        setIsMeditPlaying(true);
      }
      return;
    }

    setIsAudioGenLoading(true);
    const audioBase64 = await generateSpeech(meditResult.script);
    setIsAudioGenLoading(false);

    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.addEventListener('ended', () => setIsMeditPlaying(false));
      setMeditAudio(audio);
      audio.play();
      setIsMeditPlaying(true);
    } else {
      onError('Не удалось создать аудио');
    }
  };

  const handleReset = () => {
    setMeditResult(null);
    if (meditAudio) {
      meditAudio.pause();
      setIsMeditPlaying(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-hide flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-brand-text mb-2">Генератор Дзена</h3>
        <p className="text-sm text-stone-400">
          Создайте персональную медитацию под ваше состояние.
        </p>
      </div>

      {!meditResult ? (
        <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">
              Тема / Намерение
            </label>
            <textarea
              value={meditTopic}
              onChange={(e) => setMeditTopic(e.target.value)}
              className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors h-24"
              placeholder="Например: Снятие тревоги перед важной встречей..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">
              Длительность
            </label>
            <div className="flex gap-2">
              {MEDITATION_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setMeditDuration(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    meditDuration === d
                      ? 'bg-brand-green text-white shadow-md'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerateMeditation}
            disabled={isMeditLoading}
            className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95"
          >
            {isMeditLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-brand-yellow" />
            )}
            {isMeditLoading ? 'Создаю поток...' : 'Сгенерировать'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-[#1a1a1a] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] mb-6">
            {/* Visualizer BG */}
            <div
              className={`absolute inset-0 bg-brand-green/20 blur-3xl transition-all duration-[2000ms] ${
                isMeditPlaying ? 'scale-150 opacity-100 animate-pulse' : 'scale-100 opacity-30'
              }`}
            />

            <div className="relative z-10 text-center mb-8">
              <h3 className="font-serif text-2xl mb-2">{meditResult.title}</h3>
              <p className="text-white/50 text-sm">
                Персональная практика &bull; {meditResult.durationMin} мин
              </p>
            </div>

            <button
              onClick={handlePlayMeditation}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 relative z-10 ${
                isMeditPlaying ? 'bg-white text-brand-dark' : 'bg-brand-green text-white'
              }`}
            >
              {isAudioGenLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isMeditPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 pl-1" />
              )}
            </button>

            {isMeditPlaying && (
              <p className="text-white/30 text-xs mt-6 animate-pulse">Голос генерируется AI...</p>
            )}
          </div>

          <div className="bg-stone-50 rounded-[2rem] p-6 border border-stone-100 flex-1 overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              Текст практики
            </h4>
            <div className="prose prose-sm text-stone-600 leading-relaxed whitespace-pre-wrap font-serif">
              {meditResult.script}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 py-3 text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-stone-600 transition-colors"
          >
            Создать новую
          </button>
        </div>
      )}
    </div>
  );
};
