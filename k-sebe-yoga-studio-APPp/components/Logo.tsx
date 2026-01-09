import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  progress?: number; // 0 to 100
  isSparking?: boolean;
  isIgnited?: boolean; // Activation effect
  variant?: 'full' | 'symbol';
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-full h-full',
  color,
  progress = 100,
  isSparking: _isSparking = false,
  isIgnited = false,
  variant = 'full',
}) => {
  // Calculate opacity based on progress
  const p = Math.min(Math.max(progress, 0), 100) / 100;
  const opacity = 0.4 + p * 0.6;

  // Determine filter based on color and state
  const getFilter = () => {
    const filters: string[] = [];

    // Color filters
    if (color === '#ffffff' || color === 'white') {
      filters.push('brightness(0) invert(1)');
    } else if (color === '#000000' || color === 'black' || color === '#1a1a1a') {
      filters.push('brightness(0)');
    }

    // Ignition glow effect
    if (isIgnited) {
      filters.push(
        'drop-shadow(0 0 8px rgba(201, 179, 110, 0.8)) drop-shadow(0 0 16px rgba(201, 179, 110, 0.4))'
      );
    }

    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  const filter = getFilter();

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <img
        src={`${import.meta.env.BASE_URL}images/logo.png`}
        srcSet={`${import.meta.env.BASE_URL}images/logo.png 1x, ${import.meta.env.BASE_URL}images/logo@2x.png 2x`}
        alt="К себе - Йога Студия"
        className="w-full h-full object-contain transition-all duration-300"
        style={{
          filter,
          opacity: isIgnited ? 1 : opacity,
        }}
        loading="lazy"
        width="600"
        height="668"
      />
    </div>
  );
};
