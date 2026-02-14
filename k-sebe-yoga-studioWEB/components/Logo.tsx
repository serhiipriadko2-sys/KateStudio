import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  showText?: boolean;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-24 h-28',
  color,
  showText: _showText = true,
  loading = 'lazy',
  fetchpriority = 'auto',
}) => {
  // Determine filter based on color
  const getFilter = () => {
    if (!color) return undefined;
    // Convert color to grayscale filters
    if (color === '#ffffff' || color === 'white') {
      return 'brightness(0) invert(1)'; // White variant
    }
    if (color === '#000000' || color === 'black' || color === '#1a1a1a') {
      return 'brightness(0)'; // Black variant
    }
    return undefined; // Original color for other cases
  };

  const filter = getFilter();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={`${import.meta.env.BASE_URL}images/logo.png`}
        srcSet={`${import.meta.env.BASE_URL}images/logo.png 1x, ${import.meta.env.BASE_URL}images/logo@2x.png 2x`}
        alt="К себе - Йога Студия"
        className="w-full h-full object-contain"
        style={filter ? { filter } : undefined}
        loading={loading}
        fetchPriority={fetchpriority}
        width="600"
        height="668"
      />
    </div>
  );
};
