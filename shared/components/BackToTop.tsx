/**
 * K Sebe Yoga Studio - BackToTop Component
 * =========================================
 * Scroll-to-top button with smooth animation
 */

import { ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface BackToTopProps {
  /** Scroll threshold to show button (default: 500) */
  threshold?: number;
  /** Position: left or right (default: left) */
  position?: 'left' | 'right';
  /** Custom class name */
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({
  threshold = 500,
  position = 'left',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const positionClass = position === 'left' ? 'left-6' : 'right-6';

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 ${positionClass} z-40 p-4 rounded-full
        bg-white text-brand-text shadow-lg border border-stone-100
        hover:bg-brand-green hover:text-white transition-all duration-300 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        ${className || ''}
      `}
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
