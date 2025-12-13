import React from 'react';

export const Logo: React.FC<{ className?: string, color?: string }> = ({ className = "w-24 h-24", color = "#F4E06D" }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Container for SVG to ensure scaling */}
      <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Triangle */}
        <path d="M100 10 L190 150 H10 L100 10 Z" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Spiral */}
        <path d="M100 80 
                 C 120 80, 130 100, 100 110 
                 C 70 120, 60 90, 100 70 
                 C 150 50, 180 110, 140 120" 
              stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
              
        {/* Text inside */}
        <text x="100" y="65" textAnchor="middle" fill={color} fontFamily="Playfair Display, serif" fontSize="28" fontWeight="400">К себе</text>
      </svg>
      {/* Bottom text outside SVG for better control or part of design */}
      <div className="text-center mt-1 font-sans text-[10px] tracking-[0.3em] uppercase" style={{ color: color }}>
        Йога студия
      </div>
    </div>
  );
};