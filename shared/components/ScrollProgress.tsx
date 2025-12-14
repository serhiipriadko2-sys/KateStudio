/**
 * K Sebe Yoga Studio - Unified ScrollProgress Component
 * ======================================================
 * GPU-accelerated scroll progress indicator
 */

import React, { useEffect, useRef } from 'react';

interface ScrollProgressProps {
  /** Bar color (default: brand-green) */
  color?: string;
  /** Bar height in pixels (default: 4) */
  height?: number;
  /** Z-index (default: 100) */
  zIndex?: number;
  /** Custom class for the bar */
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  color,
  height = 4,
  zIndex = 100,
  className,
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!barRef.current) return;

        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;

        // Use transform for GPU acceleration (composite layer only)
        barRef.current.style.transform = `scaleX(${Math.min(progress, 1)})`;
      });
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full pointer-events-none"
      style={{ height: `${height}px`, zIndex }}
    >
      <div
        ref={barRef}
        className={`h-full origin-left will-change-transform ${className || 'bg-brand-green'}`}
        style={{
          transform: 'scaleX(0)',
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
};
