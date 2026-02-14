/**
 * K Sebe Logo Component
 * Uses the new image logo with support for different variants
 */
/// <reference types="vite/client" />
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
  showText: _showText = true,
}) => {
  // Determine filter based on variant or color
  const getFilter = () => {
    // If custom color is provided, map common colors to filters
    if (color) {
      if (color === '#ffffff' || color === 'white') {
        return 'brightness(0) invert(1)'; // White variant
      }
      if (color === '#000000' || color === 'black' || color === '#1a1a1a') {
        return 'brightness(0)'; // Black variant
      }
      // For other custom colors, use the default golden logo
      // (Custom color tinting with filters would distort the logo)
      return undefined;
    }

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
