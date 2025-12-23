import React from 'react';
import { PriceItem } from '../types';

interface PricingCardProps {
  item: PriceItem;
}

export const PricingCard: React.FC<PricingCardProps> = ({ item }) => {
  return (
    <div
      className={`
      relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1
      ${
        item.isPersonal
          ? 'bg-brand-green text-brand-light shadow-xl'
          : 'bg-white text-stone-700 shadow-sm border border-stone-100 hover:shadow-md'
      }
    `}
    >
      {item.isPersonal && (
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <h3
            className={`text-xl font-serif mb-2 ${item.isPersonal ? 'text-brand-accent' : 'text-brand-green'}`}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p
              className={`text-sm mb-4 ${item.isPersonal ? 'text-brand-light/70' : 'text-stone-500'}`}
            >
              {item.subtitle}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-current/10">
          <p className="text-2xl font-light tracking-wide">{item.price}</p>
        </div>
      </div>
    </div>
  );
};
