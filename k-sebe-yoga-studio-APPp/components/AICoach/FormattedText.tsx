/**
 * FormattedText - Renders markdown-like bold text
 */
import React from 'react';

interface FormattedTextProps {
  text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="space-y-3 text-sm leading-relaxed whitespace-pre-wrap">
      {text.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold text-brand-dark">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </div>
  );
};
