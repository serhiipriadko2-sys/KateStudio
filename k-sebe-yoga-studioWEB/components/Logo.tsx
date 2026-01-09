/**
 * K Sebe Logo Component - WEB Version
 * SVG logo with triangle, spiral, and text
 */
import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-24 h-28',
  color,
  variant = 'default',
  showText = true,
}) => {
  // Determine color based on variant or custom color prop
  const getColor = () => {
    if (color) {
      if (color === '#ffffff' || color === 'white') {
        return '#ffffff';
      }
      if (color === '#000000' || color === 'black' || color === '#1a1a1a') {
        return '#1a1a1a';
      }
      return color;
    }

    // Apply variant if no custom color is provided
    switch (variant) {
      case 'light':
        return '#ffffff';
      case 'dark':
        return '#1a1a1a';
      default:
        return '#d4bf6b'; // Default golden color
    }
  };

  const fillColor = getColor();

  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="К себе - Йога Студия"
    >
      {/* Text "К себе" above triangle */}
      {showText && (
        <text
          x="100"
          y="25"
          textAnchor="middle"
          fill={fillColor}
          fontFamily="serif"
          fontSize="18"
          fontWeight="400"
          letterSpacing="2"
        >
          К себе
        </text>
      )}

      {/* Triangle with spiral */}
      <g transform="translate(100, 50)">
        {/* Triangle outline */}
        <path d="M 0,-70 L 60,50 L -60,50 Z" stroke={fillColor} strokeWidth="2" fill="none" />

        {/* Spiral inside triangle */}
        <path
          d="M 0,0 C 0,-10 10,-10 10,0 C 10,15 -10,15 -15,0 C -15,-20 20,-20 25,0 C 25,30 -30,30 -35,0"
          stroke={fillColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Text "ЙОГА СТУДИЯ" below triangle */}
      {showText && (
        <text
          x="100"
          y="230"
          textAnchor="middle"
          fill={fillColor}
          fontFamily="sans-serif"
          fontSize="12"
          fontWeight="400"
          letterSpacing="3"
        >
          ЙОГА СТУДИЯ
        </text>
      )}
    </svg>
  );
};
