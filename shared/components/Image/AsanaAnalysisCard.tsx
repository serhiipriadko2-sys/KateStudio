import { Activity, Brain, X, Zap } from 'lucide-react';
import React from 'react';

import type { AsanaAnalysis } from './types';

interface AsanaAnalysisCardProps {
  result: AsanaAnalysis | string;
  onClose: () => void;
}

const EnergyBadge: React.FC<{ energy: AsanaAnalysis['energy'] }> = ({ energy }) => {
  const styles = {
    Brahmana: 'bg-amber-100 text-amber-600',
    Langhana: 'bg-indigo-100 text-indigo-600',
    Samana: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${styles[energy]}`}
    >
      <Zap className="w-3 h-3" />
      {energy}
    </div>
  );
};

export const AsanaAnalysisCard: React.FC<AsanaAnalysisCardProps> = ({ result, onClose }) => {
  return (
    <div className="absolute inset-x-4 bottom-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/20 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600"
        >
          <X className="w-4 h-4" />
        </button>

        {typeof result === 'string' ? (
          <p className="text-sm text-brand-text leading-relaxed">{result}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-brand-green/10 pb-2">
              <div>
                <h3 className="text-xl font-serif text-brand-text">{result.sanskrit}</h3>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                  {result.name_ru}
                </p>
              </div>
              <EnergyBadge energy={result.energy} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {result.muscles.map((m, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded-full"
                >
                  <Activity className="w-3 h-3" /> {m}
                </span>
              ))}
            </div>

            <p className="text-sm text-stone-600 italic">&ldquo;{result.description}&rdquo;</p>

            <div className="bg-brand-mint/30 p-3 rounded-xl flex gap-2">
              <Brain className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <p className="text-xs text-brand-text/80 leading-relaxed">
                <span className="font-bold">Совет:</span> {result.tips}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
