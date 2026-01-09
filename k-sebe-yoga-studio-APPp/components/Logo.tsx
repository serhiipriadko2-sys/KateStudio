/**
 * K Sebe Logo Component - APP Version
 * SVG logo with triangle, spiral, and text
 * Supports progress tracking and ignition effects
 */
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
  isSparking: _isSparking = false,
  isIgnited = false,
  variant = 'full',
}) => {
  // Calculate opacity based on progress
  const p = Math.min(Math.max(progress, 0), 100) / 100;
  const opacity = 0.4 + p * 0.6;

  // Determine color based on custom color prop and state
  const getColor = () => {
    if (color === '#ffffff' || color === 'white') {
      return '#ffffff';
    }
    if (color === '#000000' || color === 'black' || color === '#1a1a1a') {
      return '#1a1a1a';
    }
    if (color) {
      return color;
    }
    return '#d4bf6b'; // Default golden color
  };

  const fillColor = getColor();

  // Show text only for 'full' variant
  const showText = variant === 'full';

  // Default golden color RGB values (for #d4bf6b)
  const DEFAULT_GOLDEN_RGB = { r: 212, g: 191, b: 107 };

  // Create drop-shadow filter for ignition effect using fillColor
  const getDropShadow = () => {
    if (!isIgnited) return undefined;

    // Only process hex colors for drop-shadow
    if (!fillColor.startsWith('#')) {
      // For named colors, use default golden glow
      return `drop-shadow(0 0 8px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.8)) drop-shadow(0 0 16px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.4))`;
    }

    // Convert hex color to RGB for drop-shadow
    const hex = fillColor.replace('#', '');

    // Validate hex length (should be 6 characters for full hex)
    if (hex.length !== 6) {
      // Fallback to default golden glow for invalid formats
      return `drop-shadow(0 0 8px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.8)) drop-shadow(0 0 16px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.4))`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Validate RGB values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      // Fallback to default golden glow if parsing fails
      return `drop-shadow(0 0 8px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.8)) drop-shadow(0 0 16px rgba(${DEFAULT_GOLDEN_RGB.r}, ${DEFAULT_GOLDEN_RGB.g}, ${DEFAULT_GOLDEN_RGB.b}, 0.4))`;
    }

    return `drop-shadow(0 0 8px rgba(${r}, ${g}, ${b}, 0.8)) drop-shadow(0 0 16px rgba(${r}, ${g}, ${b}, 0.4))`;
  };

  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
      style={{
        opacity: isIgnited ? 1 : opacity,
        filter: getDropShadow(),
      }}
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
