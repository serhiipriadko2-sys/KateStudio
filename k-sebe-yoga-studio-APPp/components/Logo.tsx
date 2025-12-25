import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  progress?: number; // 0 to 100
  isSparking?: boolean;
  isIgnited?: boolean; // Activation effect
  variant?: 'full' | 'symbol';
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-full h-full',
  color,
  progress = 100,
  isSparking = false,
  isIgnited = false,
  variant = 'full',
}) => {
  // Gold color matching the logo
  const strokeColor = color || '#D4AF37';
  const p = Math.min(Math.max(progress, 0), 100) / 100;

  // Path Lengths for dasharray animation
  const lenTriangle = 510; // Triangle perimeter
  const lenSpiral = 400; // Spiral path length

  const viewBox = variant === 'symbol' ? '0 0 200 200' : '0 0 200 260';

  // Dynamic styles for the ignition effect
  const groupStyle = isIgnited
    ? {
        filter:
          'url(#neon-glow) drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px ' + strokeColor + ')',
        stroke: '#FFFFFF', // Flash white on ignition
        opacity: 1,
        transition: 'all 0.4s ease-out',
      }
    : {
        filter: p > 0.1 ? 'url(#neon-glow)' : 'none',
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
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur4" />
            <feMerge>
              <feMergeNode in="blur4" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          strokeWidth="2.5"
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
            letterSpacing="2"
            className="transition-opacity duration-300"
            style={{ opacity: p > 0.2 ? 1 : 0 }}
          >
            К себе
          </text>

          {/* Triangle - starts below text */}
          <path
            d="M100 42 L185 195 H15 L100 42 Z"
            strokeDasharray={lenTriangle}
            strokeDashoffset={lenTriangle * (1 - p)}
            className="transition-all duration-75 ease-linear"
            style={{ strokeOpacity: p > 0 ? 1 : 0 }}
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
