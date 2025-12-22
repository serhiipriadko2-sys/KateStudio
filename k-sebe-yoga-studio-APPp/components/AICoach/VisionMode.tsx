/**
 * VisionMode - Photo/Video analysis for yoga poses
 */
import React, { useState } from 'react';
import { Upload, X, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { analyzeMedia, VisionAnalysisResult } from '../../services/geminiService';
import { AnalysisReport } from './AnalysisReport';

interface VisionModeProps {
  onError: (message: string) => void;
}

export const VisionMode: React.FC<VisionModeProps> = ({ onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Проверь мою технику выполнения');
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        onError('Файл слишком большой (макс 20MB)');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVisionResult(null);

      // Auto prompt suggestion
      if (file.type.startsWith('video/')) {
        setVisionPrompt('Оцени ритм и плавность переходов');
      } else {
        setVisionPrompt('Проверь технику выполнения асаны');
      }
    }
  };

  const handleVisionAnalyze = async () => {
    if (!selectedFile || isVisionLoading) return;

    setIsVisionLoading(true);
    setVisionResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeMedia(base64String, selectedFile.type, visionPrompt);
      setVisionResult(result);
      setIsVisionLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVisionResult(null);
    setIsVisionLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-hide">
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif text-brand-text mb-2">Анализ Техники</h3>
        <p className="text-sm text-stone-400">
          Загрузите фото или видео асаны, и я проверю технику.
        </p>
      </div>

      <div className="mb-6">
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-stone-200 rounded-[2rem] cursor-pointer hover:bg-stone-50 hover:border-brand-green/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-stone-400 group-hover:scale-110 group-hover:text-brand-green transition-all mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm text-stone-500 font-medium">Фото или Видео</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="relative rounded-[2rem] overflow-hidden border border-stone-100 bg-stone-900 group shadow-lg">
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-20 backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            {isVisionLoading && (
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-green shadow-[0_0_20px_rgba(87,167,115,1)] animate-[scan_2s_linear_infinite]" />
                <div className="absolute inset-0 bg-brand-green/5" />
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <span className="inline-block px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase rounded-full animate-pulse">
                    Изучаю биомеханику...
                  </span>
                </div>
              </div>
            )}

            {selectedFile?.type.startsWith('video/') ? (
              <video src={previewUrl} className="w-full max-h-[400px] object-contain" controls />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain" />
            )}
          </div>
        )}
      </div>

      {previewUrl && !visionResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative">
            <div className="absolute top-3 left-3 text-stone-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <textarea
              value={visionPrompt}
              onChange={(e) => setVisionPrompt(e.target.value)}
              className="w-full p-3 pl-10 bg-stone-50 rounded-2xl border border-stone-100 text-sm focus:outline-none focus:border-brand-green/50 resize-none transition-colors"
              rows={2}
              disabled={isVisionLoading}
            />
          </div>

          <button
            onClick={handleVisionAnalyze}
            disabled={isVisionLoading}
            className="w-full py-4 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-95"
          >
            {isVisionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isVisionLoading ? 'Идет анализ...' : 'Разобрать технику'}
          </button>
        </div>
      )}

      {visionResult && (
        <div className="mt-8">
          {typeof visionResult === 'string' ? (
            <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 text-rose-800">
              {visionResult}
            </div>
          ) : (
            <AnalysisReport result={visionResult} />
          )}
          <button
            onClick={() => setVisionResult(null)}
            className="w-full mt-4 py-3 text-stone-400 text-xs font-bold uppercase tracking-wider hover:text-stone-600 transition-colors"
          >
            Новый анализ
          </button>
        </div>
      )}
    </div>
  );
};
