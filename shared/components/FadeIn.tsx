/**
 * FadeIn Animation Component
 * Shared across WEB and APP
 */
import React, { useEffect, useRef, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
  threshold?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  fullWidth = false,
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translate-y-12';
        case 'down':
          return '-translate-y-12';
        case 'left':
          return 'translate-x-12';
        case 'right':
          return '-translate-x-12';
        case 'none':
          return '';
        default:
          return 'translate-y-12';
      }
    }
    return 'translate-0';
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${fullWidth ? 'w-full' : ''} ${className} ${getTransform()} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
