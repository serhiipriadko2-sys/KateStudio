/**
 * Breathwork Component - Square Breathing
 * Shared across WEB and APP
 */
import { Play, Pause, RefreshCw, Wind } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { BreathPhase, BreathworkConfig } from '../types';

interface BreathworkProps {
  config?: BreathworkConfig;
  className?: string;
  compact?: boolean;
}

const DEFAULT_CONFIG: BreathworkConfig = {
  inhaleDuration: 4000,
  holdFullDuration: 4000,
  exhaleDuration: 4000,
  holdEmptyDuration: 4000,
};

export const Breathwork: React.FC<BreathworkProps> = ({
  config = DEFAULT_CONFIG,
  className = '',
  compact = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [text, setText] = useState('Начать');
  const [subText, setSubText] = useState('Квадратное дыхание');

  const totalCycle =
    config.inhaleDuration +
    config.holdFullDuration +
    config.exhaleDuration +
    config.holdEmptyDuration;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let timer: ReturnType<typeof setTimeout>;

    if (isActive) {
      const runCycle = () => {
        // Inhale
        setPhase('inhale');
        setText('Вдох');
        setSubText('Наполняйтесь энергией');

        timer = setTimeout(() => {
          if (!isActive) return;
          setPhase('hold-full');
          setText('Пауза');
          setSubText('Сохраните баланс');

          timer = setTimeout(() => {
            if (!isActive) return;
            setPhase('exhale');
            setText('Выдох');
            setSubText('Отпустите напряжение');

            timer = setTimeout(() => {
              if (!isActive) return;
              setPhase('hold-empty');
              setText('Тишина');
              setSubText('Покой внутри');
            }, config.exhaleDuration);
          }, config.holdFullDuration);
        }, config.inhaleDuration);
      };

      runCycle();
      interval = setInterval(runCycle, totalCycle);
    } else {
      setPhase('idle');
      setText('Дыхание');
      setSubText('Нажмите Play для старта');
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [isActive, config, totalCycle]);

  const toggle = () => setIsActive(!isActive);

  const getScale = () => {
    switch (phase) {
      case 'inhale':
      case 'hold-full':
        return 'scale-110';
      case 'exhale':
      case 'hold-empty':
        return 'scale-75';
      default:
        return 'scale-90';
    }
  };

  const getOpacity = () => {
    switch (phase) {
      case 'inhale':
        return 'opacity-100';
      case 'hold-full':
        return 'opacity-80';
      case 'exhale':
        return 'opacity-60';
      case 'hold-empty':
        return 'opacity-40';
      default:
        return 'opacity-50';
    }
  };

  const containerSize = compact ? 'w-64 h-64' : 'w-80 h-80';
  const minHeight = compact ? 'min-h-[350px]' : 'min-h-[450px]';

  return (
    <div
      className={`flex flex-col items-center justify-center h-full ${minHeight} relative overflow-hidden ${className}`}
    >
      {/* Visualizer Container */}
      <div className={`relative ${containerSize} flex items-center justify-center mb-12`}>
        {/* Layer 1: Outer Glow (Aura) */}
        <div
          className={`
            absolute inset-0 rounded-full bg-brand-green/5 blur-3xl transition-all duration-[4000ms] ease-in-out
            ${phase === 'inhale' || phase === 'hold-full' ? 'scale-125 opacity-100' : 'scale-75 opacity-30'}
          `}
        />

        {/* Layer 2: Outer Ring (Guide) */}
        <div
          className={`
            absolute inset-4 border border-brand-green/20 rounded-full transition-all duration-[4000ms] ease-in-out
            ${getScale()}
          `}
        />

        {/* Layer 3: Organic Shape (Main) */}
        <div
          className={`
            absolute w-48 h-48 bg-gradient-to-tr from-brand-mint to-brand-green/30 rounded-full mix-blend-multiply filter blur-md
            transition-all duration-[4000ms] ease-in-out animate-blob
            ${getScale()} ${getOpacity()}
          `}
        />

        {/* Layer 4: Organic Shape (Secondary) */}
        <div
          className={`
            absolute w-48 h-48 bg-brand-yellow/30 rounded-full mix-blend-multiply filter blur-lg
            transition-all duration-[4000ms] ease-in-out animation-delay-2000
            ${phase === 'idle' ? 'animate-pulse' : 'animate-blob'}
            ${getScale()}
          `}
        />

        {/* Layer 5: Core Text */}
        <div className="relative z-10 text-center flex flex-col items-center">
          {phase === 'idle' && !isActive && (
            <Wind className="w-8 h-8 text-brand-green mb-2 opacity-50" />
          )}
          <h3
            className={`text-3xl font-serif text-brand-text mb-1 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}
          >
            {text}
          </h3>
          <p className="text-stone-400 text-xs font-medium uppercase tracking-widest transition-opacity duration-500">
            {subText}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 items-center z-20">
        <button
          onClick={toggle}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
            ${
              isActive
                ? 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
                : 'bg-brand-green text-white shadow-brand-green/30 hover:scale-105'
            }
          `}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-7 h-7 pl-1" />}
        </button>

        {isActive && (
          <button
            onClick={() => {
              setIsActive(false);
              setPhase('idle');
            }}
            className="w-12 h-12 rounded-full bg-white border border-stone-100 text-stone-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-sm animate-in fade-in zoom-in"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-10 px-8 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-500 ${
                (phase === 'inhale' && step === 1) ||
                (phase === 'hold-full' && step === 2) ||
                (phase === 'exhale' && step === 3) ||
                (phase === 'hold-empty' && step === 4)
                  ? 'w-8 bg-brand-green'
                  : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-stone-300">Цикл: {config.inhaleDuration / 1000} сек</p>
      </div>
    </div>
  );
};

export default Breathwork;
