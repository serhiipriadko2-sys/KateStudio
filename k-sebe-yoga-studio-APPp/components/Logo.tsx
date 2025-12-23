import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  progress?: number; // 0 to 100
  isSparking?: boolean;
  isIgnited?: boolean; // New prop for activation effect
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
  // Reference: Neon is Warm Yellow/Gold.
  const strokeColor = color || '#FCEEAC';
  const p = Math.min(Math.max(progress, 0), 100) / 100;

  // Path Lengths for dasharray animation
  const lenTriangle = 950;
  const lenSpiral = 550;

  const viewBox = variant === 'symbol' ? '0 0 400 320' : '0 0 400 520';

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
          strokeWidth={variant === 'symbol' ? '8' : '5'}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={groupStyle}
        >
          {/* 1. TRIANGLE (Outer) */}
          <path
            d="M 200 40 L 360 290 H 40 L 200 40 Z"
            strokeDasharray={lenTriangle}
            strokeDashoffset={lenTriangle * (1 - p)}
            className="transition-all duration-75 ease-linear"
            style={{ strokeOpacity: p > 0 ? 1 : 0 }}
          />

          {/* 2. SPIRAL (Refined Geometry) */}
          <path
            d="M 200 195 
               C 205 195, 210 200, 210 205
               C 210 215, 200 220, 190 215
               C 175 205, 175 180, 190 165
               C 215 145, 250 155, 255 190
               C 260 235, 215 260, 175 255
               C 125 245, 110 190, 130 150"
            strokeDasharray={lenSpiral}
            strokeDashoffset={lenSpiral * (1 - p)}
            className="transition-all duration-75 ease-linear"
          />

          {/* Render Text only if variant is 'full' */}
          {variant === 'full' && (
            <>
              {/* 3. TEXT: "К себе" */}
              <g transform="translate(0, 40)" strokeWidth="5">
                {/* К */}
                <path
                  d="M 85 300 V 360 M 85 330 L 115 300 M 85 330 L 115 360"
                  strokeDasharray={140}
                  strokeDashoffset={140 * (1 - p)}
                />
                {/* с */}
                <path
                  d="M 160 330 A 15 15 0 1 0 160 360"
                  strokeDasharray={80}
                  strokeDashoffset={80 * (1 - p)}
                />
                {/* е */}
                <path
                  d="M 180 345 H 200 A 10 10 0 0 0 190 330 A 10 10 0 0 0 180 345 A 10 10 0 0 0 190 360 H 200"
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - p)}
                />
                {/* б */}
                <path
                  d="M 230 310 H 245 M 230 310 V 345 A 15 15 0 1 0 245 345 V 345"
                  strokeDasharray={120}
                  strokeDashoffset={120 * (1 - p)}
                />
                {/* е */}
                <path
                  d="M 270 345 H 290 A 10 10 0 0 0 280 330 A 10 10 0 0 0 270 345 A 10 10 0 0 0 280 360 H 290"
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - p)}
                />
              </g>

              {/* 4. BADGE */}
              <path
                d="M 70 425 H 330 C 335 425, 340 430, 340 435 V 465 C 340 475, 320 475, 310 465 C 300 455, 280 480, 200 480 C 120 480, 100 455, 90 465 C 80 475, 60 475, 60 465 V 435 C 60 430, 65 425, 70 425 Z"
                strokeWidth="3"
                style={{ opacity: p > 0.5 ? 1 : 0 }}
              />

              {/* 5. TEXT "ЙОГА СТУДИЯ" */}
              <text
                x="200"
                y="462"
                textAnchor="middle"
                fill={isIgnited ? '#fff' : p > 0.85 ? strokeColor : 'none'}
                stroke="none"
                fontFamily="'Manrope', sans-serif"
                fontSize="22"
                fontWeight="600"
                letterSpacing="4"
                className="transition-opacity duration-300"
                style={{ opacity: p > 0.85 ? 1 : 0 }}
              >
                ЙОГА СТУДИЯ
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
