
import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random increment for realistic feel
        return prev + Math.random() * 10;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800); // Wait for exit animation
      }, 500);
    }
  }, [progress, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className={`transition-all duration-700 transform ${isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
        <Logo className="w-24 h-24 mb-8" color="#fff" />
      </div>

      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className="absolute left-0 top-0 bottom-0 bg-brand-green transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-4 text-white/40 text-xs font-serif italic tracking-widest animate-pulse">
        {progress < 100 ? 'Вдох...' : 'Выдох'}
      </div>
    </div>
  );
};
