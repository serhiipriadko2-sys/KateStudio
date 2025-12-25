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
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Triangle */}
        <path
          d="M100 15 L185 175 H15 L100 15 Z"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* "К себе" text inside triangle */}
        <text
          x="100"
          y="55"
          textAnchor="middle"
          fill={color}
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="24"
          fontWeight="400"
          letterSpacing="2"
        >
          К себе
        </text>

        {/* Spiral */}
        <path
          d="M100 115
             C108 115, 115 122, 115 130
             C115 145, 100 155, 85 148
             C65 138, 60 115, 78 95
             C100 72, 140 80, 150 110
             C160 145, 135 175, 100 175"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* "ЙОГА СТУДИЯ" text below */}
        {showText && (
          <text
            x="100"
            y="215"
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
