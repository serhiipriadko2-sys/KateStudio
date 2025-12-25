/**
 * K Sebe Logo Component
 * Logo with triangle, spiral, and "К себе" text ABOVE triangle
 * Shared across WEB and APP
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
  const getColor = () => {
    if (color) return color;
    switch (variant) {
      case 'light':
        return '#ffffff';
      case 'dark':
        return '#1a1a1a';
      default:
        return '#D4AF37'; // Gold color matching the logo
    }
  };

  const strokeColor = getColor();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 200 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* "К себе" text ABOVE triangle */}
        <text
          x="100"
          y="28"
          textAnchor="middle"
          fill={strokeColor}
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="26"
          fontWeight="400"
          letterSpacing="2"
        >
          К себе
        </text>

        {/* Triangle - starts below text */}
        <path
          d="M100 42 L185 195 H15 L100 42 Z"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Spiral - centered in triangle, clockwise from center outward */}
        <path
          d="M100 130
             C100 130, 105 130, 105 125
             C105 118, 95 115, 90 122
             C82 132, 88 148, 102 150
             C122 152, 135 135, 132 115
             C128 88, 95 75, 70 95
             C45 118, 55 165, 95 180"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* "ЙОГА СТУДИЯ" text below */}
        {showText && (
          <text
            x="100"
            y="235"
            textAnchor="middle"
            fill={strokeColor}
            fontFamily="'Inter', 'Segoe UI', sans-serif"
            fontSize="18"
            fontWeight="400"
            letterSpacing="8"
          >
            ЙОГА СТУДИЯ
          </text>
        )}
      </svg>
    </div>
  );
};

export default Logo;
