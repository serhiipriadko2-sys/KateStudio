
import React, { useEffect, useRef } from 'react';

export const ScrollProgress: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      // Use requestAnimationFrame to decouple scroll events from paint
      rafId = requestAnimationFrame(() => {
        if (!barRef.current) return;
        
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = window.scrollY / totalHeight;
        
        // Use transform instead of width for GPU acceleration (Composite layer only)
        barRef.current.style.transform = `scaleX(${progress})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div 
        ref={barRef}
        className="h-full bg-brand-green origin-left will-change-transform"
        style={{ transform: 'scaleX(0)' }} // Initial state
      />
    </div>
  );
};
