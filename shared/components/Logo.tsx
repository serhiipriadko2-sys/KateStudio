/**
 * K Sebe Logo Component
 * Precise recreation based on pixel analysis of original logo
 * Color: #c9b36e (warm gold), 3.5-turn spiral
 */
import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
}

// Mathematically generated spiral path (3.5 turns, clockwise from center)
const SPIRAL_PATH = `M100 134
  C99 134.6, 97.7 134.8, 96.3 134.8
  C94.8 134.3, 93.4 133.4, 92.2 132
  C91.2 130.3, 90.7 128.2, 90.7 126
  C91.3 123.7, 92.4 121.4, 94.1 119.3
  C96.4 117.7, 99.2 116.5, 102.2 116
  C105.5 116.2, 108.7 117.1, 111.8 118.9
  C114.6 121.4, 116.7 124.6, 118.2 128.3
  C118.8 132.4, 118.5 136.7, 117.2 140.9
  C114.8 144.8, 111.6 148.3, 107.6 151
  C102.9 152.9, 97.8 153.6, 92.5 153.2
  C87.2 151.6, 82.4 148.8, 78.1 144.9
  C74.8 140, 72.5 134.3, 71.6 128.2
  C72 121.9, 73.9 115.6, 77.1 109.8
  C81.7 104.8, 87.3 100.7, 93.9 98
  C101 96.8, 108.4 97.1, 115.7 99.2
  C122.5 102.8, 128.4 108, 133.2 114.4
  C136.4 121.9, 138 130, 137.7 138.4
  C135.6 146.8, 131.6 154.5, 126 161.4
  C118.8 166.9, 110.5 170.8, 101.3 172.7
  C91.9 172.7, 82.5 170.5, 73.7 166.2
  C65.9 160.1, 59.5 152.2, 55 143.1
  C52.6 133, 52.4 122.5, 54.6 112
  C59 102.1, 65.6 93.4, 74.1 86.2
  C84.1 80.9, 95.1 78, 106.6 77.5`;

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
        return '#c9b36e'; // Warm gold from pixel analysis
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
          fontStyle="italic"
          letterSpacing="1"
        >
          К себе
        </text>

        {/* Triangle - precise coordinates from analysis */}
        <path
          d="M100 48 L185 198 H15 L100 48 Z"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Spiral - 3.5 turns clockwise from center */}
        <path
          d={SPIRAL_PATH}
          stroke={strokeColor}
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
