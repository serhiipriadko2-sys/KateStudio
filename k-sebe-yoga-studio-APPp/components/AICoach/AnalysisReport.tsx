/**
 * AnalysisReport - Displays vision analysis results
 */
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Info } from 'lucide-react';
import { VisionAnalysisResult } from '../../services/geminiService';

interface AnalysisReportProps {
  result: VisionAnalysisResult;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  if (score >= 5) return 'text-amber-500 bg-amber-50 border-amber-100';
  return 'text-rose-500 bg-rose-50 border-rose-100';
};

const getStatusIcon = (status: string): React.ReactNode => {
  if (status === 'Safe') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === 'Caution') return <AlertCircle className="w-5 h-5 text-amber-500" />;
  return <AlertTriangle className="w-5 h-5 text-rose-500" />;
};

const getStatusText = (status: string): string => {
  if (status === 'Safe') return 'Безопасно';
  if (status === 'Caution') return 'Есть риски';
  return 'Травмоопасно';
};

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-stone-100 space-y-6 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-serif text-brand-text">{result.poseName}</h3>
          <p className="text-sm text-stone-400 font-serif italic">{result.sanskritName}</p>
          <div className="flex items-center gap-2 mt-2">
            {getStatusIcon(result.safetyStatus)}
            <span className="text-sm font-medium text-stone-500">
              {getStatusText(result.safetyStatus)}
            </span>
          </div>
        </div>
        <div
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${getScoreColor(result.alignmentScore)}`}
        >
          <span className="text-2xl font-bold">{result.alignmentScore}</span>
          <span className="text-[10px] uppercase font-bold opacity-60">/10</span>
        </div>
      </div>

      {/* Anatomy & Energy Tags */}
      <div className="flex flex-wrap gap-2">
        {result.muscleGroups?.map((m, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] uppercase font-bold rounded-md"
          >
            {m}
          </span>
        ))}
        {result.energyEffect && (
          <span className="px-2 py-1 bg-brand-mint/30 text-brand-green text-[10px] uppercase font-bold rounded-md border border-brand-green/20">
            {result.energyEffect}
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="space-y-4 pt-2">
        {/* Positives */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Сильные стороны
          </h4>
          <ul className="space-y-1">
            {result.positivePoints.map((p, i) => (
              <li
                key={i}
                className="text-sm text-stone-600 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-400 before:rounded-full"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Corrections */}
        {result.corrections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <Info className="w-3 h-3" /> Зоны роста
            </h4>
            <ul className="space-y-1">
              {result.corrections.map((p, i) => (
                <li
                  key={i}
                  className="text-sm text-stone-600 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-400 before:rounded-full"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Advice */}
      <div className="bg-brand-mint/20 rounded-xl p-4 border border-brand-green/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-12 h-12" />
        </div>
        <h4 className="text-brand-green font-serif text-lg mb-2 flex items-center gap-2 relative z-10">
          Совет Кати
        </h4>
        <p className="text-sm text-brand-text/80 leading-relaxed italic relative z-10">
          &quot;{result.expertAdvice}&quot;
        </p>
      </div>
    </div>
  );
};
