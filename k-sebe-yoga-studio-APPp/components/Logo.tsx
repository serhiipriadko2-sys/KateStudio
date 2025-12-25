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
  // New gold color matching the updated logo
  const strokeColor = color || '#D4AF37';
  const p = Math.min(Math.max(progress, 0), 100) / 100;

  // Path Lengths for dasharray animation
  const lenTriangle = 510; // Triangle perimeter
  const lenSpiral = 350; // Spiral path length

  const viewBox = variant === 'symbol' ? '0 0 200 180' : '0 0 200 240';

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
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={groupStyle}
        >
          {/* Triangle */}
          <path
            d="M100 15 L185 175 H15 L100 15 Z"
            strokeDasharray={lenTriangle}
            strokeDashoffset={lenTriangle * (1 - p)}
            className="transition-all duration-75 ease-linear"
            style={{ strokeOpacity: p > 0 ? 1 : 0 }}
          />

          {/* "К себе" text inside triangle */}
          <text
            x="100"
            y="55"
            textAnchor="middle"
            fill={isIgnited ? '#fff' : p > 0.3 ? strokeColor : 'none'}
            stroke="none"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="24"
            fontWeight="400"
            letterSpacing="2"
            className="transition-opacity duration-300"
            style={{ opacity: p > 0.3 ? 1 : 0 }}
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
            strokeDasharray={lenSpiral}
            strokeDashoffset={lenSpiral * (1 - p)}
            className="transition-all duration-75 ease-linear"
          />

          {/* "ЙОГА СТУДИЯ" text below - only in full variant */}
          {variant === 'full' && (
            <text
              x="100"
              y="215"
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
