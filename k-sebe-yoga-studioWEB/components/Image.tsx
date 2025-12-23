import {
  Upload,
  X,
  Link,
  Check,
  Loader2,
  Sparkles,
  ImageOff,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import {
  getSavedImageUrl,
  saveImageMapping,
  deleteImageMapping,
  uploadImage,
} from '../services/content';
import { analyzeImageContent } from '../services/geminiService';
import { AsanaAnalysis } from '../types';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  storageKey?: string;
  controlsClassName?: string;
}

export const Image: React.FC<ImageProps> = ({
  className,
  containerClassName,
  src: defaultSrc,
  alt,
  storageKey,
  controlsClassName,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [src, setSrc] = useState<string | undefined>(
    typeof defaultSrc === 'string' ? defaultSrc : undefined
  );
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AsanaAnalysis | string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storageKey) {
      const savedLocal = localStorage.getItem(`ksebe-img-${storageKey}`);
      if (savedLocal) {
        setSrc(savedLocal);
      }
      getSavedImageUrl(storageKey).then((url) => {
        if (url && url !== savedLocal) {
          setSrc(url);
          localStorage.setItem(`ksebe-img-${storageKey}`, url);
        }
      });
    }
  }, [storageKey]);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && storageKey) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Изображение слишком большое. Максимум 5MB.');
        return;
      }
      setIsUploading(true);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSrc(base64);
        try {
          const publicUrl = await uploadImage(file, storageKey);
          if (publicUrl) {
            await saveImageMapping(storageKey, publicUrl);
            setSrc(publicUrl);
            localStorage.setItem(`ksebe-img-${storageKey}`, publicUrl);
          } else {
            throw new Error('No URL returned');
          }
        } catch (err) {
          localStorage.setItem(`ksebe-img-${storageKey}`, base64);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkValue.trim() && storageKey) {
      const newUrl = linkValue.trim();
      setSrc(newUrl);
      setIsLinkMode(false);
      setLinkValue('');
      setAnalysisResult(null);
      localStorage.setItem(`ksebe-img-${storageKey}`, newUrl);
      await saveImageMapping(storageKey, newUrl);
    }
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSrc(typeof defaultSrc === 'string' ? defaultSrc : undefined);
    setAnalysisResult(null);
    if (storageKey) {
      localStorage.removeItem(`ksebe-img-${storageKey}`);
      await deleteImageMapping(storageKey);
    }
  };

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src || typeof src !== 'string' || hasError) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let base64Data = src;
      if (src.startsWith('http')) {
        const response = await fetch(src);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      const result = await analyzeImageContent(base64Data);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed', error);
      setAnalysisResult('Не удалось проанализировать изображение.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to render the structured result
  const renderAnalysis = () => {
    if (!analysisResult) return null;

    // Legacy or error string
    if (typeof analysisResult === 'string') {
      return <p className="text-sm text-brand-text leading-relaxed font-light">{analysisResult}</p>;
    }

    // Structured AsanaAnalysis
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-start border-b border-brand-green/10 pb-2">
          <div>
            <h3 className="text-xl font-serif text-brand-text">{analysisResult.sanskrit}</h3>
            <p className="text-xs uppercase tracking-wider text-stone-400 font-bold">
              {analysisResult.name_ru}
            </p>
          </div>
          <div
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1
                    ${
                      analysisResult.energy === 'Brahmana'
                        ? 'bg-amber-100 text-amber-600'
                        : analysisResult.energy === 'Langhana'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-emerald-100 text-emerald-600'
                    }`}
          >
            <Zap className="w-3 h-3" />
            {analysisResult.energy}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {analysisResult.muscles.map((m, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded-full"
            >
              <Activity className="w-3 h-3" /> {m}
            </span>
          ))}
        </div>

        <p className="text-sm text-stone-600 italic">"{analysisResult.description}"</p>

        <div className="bg-brand-mint/30 p-3 rounded-xl flex gap-2">
          <Brain className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <p className="text-xs text-brand-text/80 leading-relaxed">
            <span className="font-bold">Совет:</span> {analysisResult.tips}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden bg-stone-100 group ${containerClassName}`}>
      {!hasError && (
        <div
          className={`absolute inset-0 bg-stone-200 transition-opacity duration-700 z-10 pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ transform: 'skewX(-20deg)' }}
          ></div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-300 z-0">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
            No Image
          </span>
        </div>
      )}

      {!hasError && src && (
        <img
          src={src}
          alt={alt}
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          {...props}
        />
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {analysisResult && (
        <div className="absolute inset-x-4 bottom-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/20 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAnalysisResult(null);
              }}
              className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
            {renderAnalysis()}
          </div>
        </div>
      )}

      {storageKey && (
        <>
          <div
            className={`absolute flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 ${controlsClassName || 'top-4 right-4'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isLinkMode ? (
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                <input
                  type="text"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="https://..."
                  className="bg-transparent border-none focus:outline-none text-xs px-2 w-32 text-stone-700 placeholder:text-stone-400"
                  autoFocus
                />
                <button
                  onClick={handleLinkSave}
                  className="p-1.5 bg-brand-green text-white rounded-full hover:bg-brand-green/90 transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsLinkMode(false)}
                  className="p-1.5 bg-stone-200 text-stone-500 rounded-full hover:bg-stone-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isUploading || hasError}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-brand-accent hover:text-brand-dark text-stone-600 shadow-md transition-colors transform hover:scale-110 disabled:opacity-50"
                  title="Анатомический разбор"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={triggerUpload}
                  disabled={isUploading}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-brand-green hover:text-white text-stone-600 shadow-md transition-colors transform hover:scale-110 disabled:opacity-50"
                  title="Загрузить файл"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsLinkMode(true)}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-brand-green hover:text-white text-stone-600 shadow-md transition-colors transform hover:scale-110"
                  title="Вставить ссылку"
                >
                  <Link className="w-4 h-4" />
                </button>
                {src !== defaultSrc && (
                  <button
                    onClick={handleReset}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-rose-500 hover:text-white text-rose-500 shadow-md transition-colors transform hover:scale-110"
                    title="Сбросить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </>
      )}
    </div>
  );
};
