/**
 * K Sebe Logo Component
 * Uses the new image logo with support for different variants
 */
import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-20 h-24',
  color,
  variant = 'default',
  showText = true,
}) => {
  // Determine filter based on variant
  const getFilter = () => {
    if (color) return undefined; // Custom color not supported with image
    switch (variant) {
      case 'light':
        return 'brightness(0) invert(1)'; // White variant
      case 'dark':
        return 'brightness(0)'; // Black variant
      default:
        return undefined; // Original golden color
    }
  };

  const filter = getFilter();

  return (
    <div className="flex flex-col items-center">
      <img
        src={`${import.meta.env.BASE_URL}images/logo.png`}
        srcSet={`${import.meta.env.BASE_URL}images/logo.png 1x, ${import.meta.env.BASE_URL}images/logo@2x.png 2x`}
        alt="К себе - Йога Студия"
        className={className}
        style={filter ? { filter } : undefined}
        loading="lazy"
        width="600"
        height="668"
      />
    </div>
  );
};

export default Logo;
