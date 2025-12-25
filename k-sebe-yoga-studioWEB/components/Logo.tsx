import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  showText?: boolean;
}

// Spiral path - 3.5 turns, starting from center, tail exits at BOTTOM
const SPIRAL_PATH = `M100 112
  C99 111.4, 97.7 111.2, 96.3 111.2
  C94.8 111.7, 93.4 112.6, 92.2 114
  C91.2 115.7, 90.7 117.8, 90.7 120
  C91.3 122.3, 92.4 124.6, 94.1 126.7
  C96.4 128.3, 99.2 129.5, 102.2 130
  C105.5 129.8, 108.7 128.9, 111.8 127.1
  C114.6 124.6, 116.7 121.4, 118.2 117.7
  C118.8 113.6, 118.5 109.3, 117.2 105.1
  C114.8 101.2, 111.6 97.7, 107.6 95
  C102.9 93.1, 97.8 92.4, 92.5 92.8
  C87.2 94.4, 82.4 97.2, 78.1 101.1
  C74.8 106, 72.5 111.7, 71.6 117.8
  C72 124.1, 73.9 130.4, 77.1 136.2
  C81.7 141.2, 87.3 145.3, 93.9 148
  C101 149.2, 108.4 148.9, 115.7 146.8
  C122.5 143.2, 128.4 138, 133.2 131.6
  C136.4 124.1, 138 116, 137.7 107.6
  C135.6 99.2, 131.6 91.5, 126 84.6
  C118.8 79.1, 110.5 75.2, 101.3 73.3
  C91.9 73.3, 82.5 75.5, 73.7 79.8
  C65.9 85.9, 59.5 93.8, 55 102.9
  C52.6 113, 52.4 123.5, 54.6 134
  C59 143.9, 65.6 152.6, 74.1 159.8
  C84.1 165.1, 95.1 168, 106.6 168.5`;

export const Logo: React.FC<LogoProps> = ({
  className = 'w-24 h-28',
  color = '#d4bf6b', // Warm gold - adjusted to match original
  showText = true,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
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
          fill={color}
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="26"
          fontWeight="400"
          fontStyle="italic"
          letterSpacing="1"
        >
          К себе
        </text>

        {/* Triangle */}
        <path
          d="M100 48 L185 198 H15 L100 48 Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Spiral - 3.5 turns clockwise from center */}
        <path
          d={SPIRAL_PATH}
          stroke={color}
          strokeWidth="2"
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
