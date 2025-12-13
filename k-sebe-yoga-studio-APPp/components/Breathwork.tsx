
import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Wind } from 'lucide-react';

export const Breathwork: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold-full' | 'exhale' | 'hold-empty' | 'idle'>('idle');
  const [text, setText] = useState('Начать');
  const [subText, setSubText] = useState('Квадратное дыхание');

  useEffect(() => {
    let interval: any;
    let timer: any;
    
    if (isActive) {
      const runCycle = () => {
         // Inhale (4s)
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
                }, 4000);
            }, 4000);
         }, 4000);
      };

      runCycle();
      interval = setInterval(runCycle, 16000); // 4+4+4+4 = 16s cycle
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
  }, [isActive]);

  const toggle = () => setIsActive(!isActive);

  // Dynamic Styles based on phase
  const getScale = () => {
      switch(phase) {
          case 'inhale': return 'scale-110';
          case 'hold-full': return 'scale-110'; // Stay expanded
          case 'exhale': return 'scale-75';
          case 'hold-empty': return 'scale-75'; // Stay contracted
          default: return 'scale-90';
      }
  };

  const getOpacity = () => {
      switch(phase) {
          case 'inhale': return 'opacity-100';
          case 'hold-full': return 'opacity-80';
          case 'exhale': return 'opacity-60';
          case 'hold-empty': return 'opacity-40';
          default: return 'opacity-50';
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[450px] relative overflow-hidden">
      
      {/* Visualizer Container */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        
        {/* Layer 1: Outer Glow (Aura) */}
        <div className={`
            absolute inset-0 rounded-full bg-brand-green/5 blur-3xl transition-all duration-[4000ms] ease-in-out
            ${phase === 'inhale' || phase === 'hold-full' ? 'scale-125 opacity-100' : 'scale-75 opacity-30'}
        `}></div>

        {/* Layer 2: Outer Ring (Guide) */}
        <div className={`
            absolute inset-4 border border-brand-green/20 rounded-full transition-all duration-[4000ms] ease-in-out
            ${getScale()}
        `}></div>

        {/* Layer 3: Organic Shape (Main) */}
        <div className={`
            absolute w-48 h-48 bg-gradient-to-tr from-brand-mint to-brand-green/30 rounded-full mix-blend-multiply filter blur-md
            transition-all duration-[4000ms] ease-in-out animate-blob
            ${getScale()} ${getOpacity()}
        `}></div>

        {/* Layer 4: Organic Shape (Secondary - Rotating) */}
        <div className={`
            absolute w-48 h-48 bg-brand-yellow/30 rounded-full mix-blend-multiply filter blur-lg
            transition-all duration-[4000ms] ease-in-out animation-delay-2000
            ${phase === 'idle' ? 'animate-pulse' : 'animate-blob'} 
            ${getScale()}
        `}></div>

        {/* Layer 5: Core Text */}
        <div className="relative z-10 text-center flex flex-col items-center">
            {phase === 'idle' && !isActive && <Wind className="w-8 h-8 text-brand-green mb-2 opacity-50" />}
            <h3 className={`text-3xl font-serif text-brand-text mb-1 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
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
                ${isActive 
                    ? 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50' 
                    : 'bg-brand-green text-white shadow-brand-green/30 hover:scale-105'}
            `}
        >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-7 h-7 pl-1" />}
        </button>
        
        {isActive && (
            <button 
                onClick={() => { setIsActive(false); setPhase('idle'); }}
                className="w-12 h-12 rounded-full bg-white border border-stone-100 text-stone-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-sm animate-in fade-in zoom-in"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="mt-10 px-8 text-center">
          <div className="flex justify-center gap-1 mb-2">
             {[1,2,3,4].map(step => (
                 <div key={step} className={`h-1 rounded-full transition-all duration-500 ${
                     (phase === 'inhale' && step === 1) ||
                     (phase === 'hold-full' && step === 2) ||
                     (phase === 'exhale' && step === 3) ||
                     (phase === 'hold-empty' && step === 4) 
                     ? 'w-8 bg-brand-green' : 'w-2 bg-stone-200'
                 }`}></div>
             ))}
          </div>
          <p className="text-xs text-stone-300">Цикл: 4 сек</p>
      </div>
    </div>
  );
};
