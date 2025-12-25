import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-24 h-28',
  color = '#D4AF37',
  showText = true,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* "К себе" text ABOVE triangle */}
        <text
          x="100"
          y="28"
          textAnchor="middle"
          fill={color}
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
          stroke={color}
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
          stroke={color}
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
            fill={color}
            fontFamily="'Inter', 'Segoe UI', sans-serif"
            fontSize="16"
            fontWeight="400"
            letterSpacing="6"
          >
            ЙОГА СТУДИЯ
          </text>
        )}
      </svg>
    </div>
  );
};
