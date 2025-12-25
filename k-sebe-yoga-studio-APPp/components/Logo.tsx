import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  progress?: number; // 0 to 100
  isSparking?: boolean;
  isIgnited?: boolean; // Activation effect
  variant?: 'full' | 'symbol';
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
  className = 'w-full h-full',
  color,
  progress = 100,
  isSparking = false,
  isIgnited = false,
  variant = 'full',
}) => {
  // Warm gold from pixel analysis
  const strokeColor = color || '#c9b36e';
  const p = Math.min(Math.max(progress, 0), 100) / 100;

  // Path lengths for animation
  const lenTriangle = 520;
  const lenSpiral = 850;

  const viewBox = variant === 'symbol' ? '0 0 200 210' : '0 0 200 260';

  // Dynamic styles for ignition effect (minimal glow)
  const groupStyle = isIgnited
    ? {
        filter: 'url(#soft-glow) drop-shadow(0 0 6px rgba(201, 179, 110, 0.5))',
        stroke: '#ffffff',
        opacity: 1,
        transition: 'all 0.4s ease-out',
      }
    : {
        filter: p > 0.1 ? 'url(#soft-glow)' : 'none',
        opacity: 0.4 + p * 0.6,
        stroke: strokeColor,
        transition: 'opacity 0.1s linear',
      };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Soft minimal glow filter */}
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={groupStyle}
        >
          {/* "К себе" text ABOVE triangle */}
          <text
            x="100"
            y="28"
            textAnchor="middle"
            fill={isIgnited ? '#fff' : p > 0.2 ? strokeColor : 'none'}
            stroke="none"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="26"
            fontWeight="400"
            fontStyle="italic"
            letterSpacing="1"
            className="transition-opacity duration-300"
            style={{ opacity: p > 0.2 ? 1 : 0 }}
          >
            К себе
          </text>

          {/* Triangle */}
          <path
            d="M100 48 L185 198 H15 L100 48 Z"
            strokeDasharray={lenTriangle}
            strokeDashoffset={lenTriangle * (1 - p)}
            className="transition-all duration-75 ease-linear"
            style={{ strokeOpacity: p > 0 ? 1 : 0 }}
          />

          {/* Spiral - 3.5 turns clockwise from center */}
          <path
            d={SPIRAL_PATH}
            strokeDasharray={lenSpiral}
            strokeDashoffset={lenSpiral * (1 - p)}
            className="transition-all duration-75 ease-linear"
          />

          {/* "ЙОГА СТУДИЯ" text below - only in full variant */}
          {variant === 'full' && (
            <text
              x="100"
              y="235"
              textAnchor="middle"
              fill={isIgnited ? '#fff' : p > 0.85 ? strokeColor : 'none'}
              stroke="none"
              fontFamily="'Inter', 'Segoe UI', sans-serif"
              fontSize="16"
              fontWeight="400"
              letterSpacing="6"
              className="transition-opacity duration-300"
              style={{ opacity: p > 0.85 ? 1 : 0 }}
            >
              ЙОГА СТУДИЯ
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};
