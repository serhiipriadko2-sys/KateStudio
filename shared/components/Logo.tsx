/**
 * K Sebe Logo Component
 * Shared across WEB and APP
 */
import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  variant?: 'default' | 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-12 h-12',
  color,
  variant = 'default',
}) => {
  const getColor = () => {
    if (color) return color;
    switch (variant) {
      case 'light':
        return '#ffffff';
      case 'dark':
        return '#1a1a1a';
      default:
        return '#57a773';
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lotus/Mandala-inspired yoga logo */}
      <circle cx="50" cy="50" r="45" stroke={getColor()} strokeWidth="2" opacity="0.2" />
      <circle cx="50" cy="50" r="35" stroke={getColor()} strokeWidth="1.5" opacity="0.3" />

      {/* Central lotus */}
      <path
        d="M50 20 C55 35 65 40 50 55 C35 40 45 35 50 20"
        fill={getColor()}
        opacity="0.8"
      />
      <path
        d="M50 20 C45 35 35 40 50 55 C65 40 55 35 50 20"
        fill={getColor()}
        opacity="0.6"
      />

      {/* Side petals */}
      <path
        d="M25 50 C35 45 40 35 50 50 C40 65 35 55 25 50"
        fill={getColor()}
        opacity="0.6"
      />
      <path
        d="M75 50 C65 45 60 35 50 50 C60 65 65 55 75 50"
        fill={getColor()}
        opacity="0.6"
      />

      {/* Bottom petal */}
      <path
        d="M50 80 C55 65 65 60 50 45 C35 60 45 65 50 80"
        fill={getColor()}
        opacity="0.7"
      />

      {/* Center dot */}
      <circle cx="50" cy="50" r="5" fill={getColor()} />
    </svg>
  );
};

export default Logo;
