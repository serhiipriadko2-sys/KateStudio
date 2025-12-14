/**
 * K Sebe Yoga Studio - Unified Image Component
 * =============================================
 * Features from WEB: AI analysis, cloud upload
 * Features from APP: fallback, labels, key migration, toasts
 */

import {
  Upload,
  X,
  Link as LinkIcon,
  Check,
  Loader2,
  ImageOff,
  Brain,
  Activity,
  Zap,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Types for AI Analysis result
export interface AsanaAnalysis {
  sanskrit: string;
  name_ru: string;
  energy: 'Brahmana' | 'Langhana' | 'Samana';
  muscles: string[];
  description: string;
  tips: string;
}

// Service callbacks - optional, component works without them
export interface ImageServices {
  /** Upload file to cloud storage, returns public URL */
  uploadToCloud?: (file: File, key: string) => Promise<string | null>;
  /** Save image URL mapping to backend */
  saveMapping?: (key: string, url: string) => Promise<void>;
  /** Get saved URL from backend */
  getMapping?: (key: string) => Promise<string | null>;
  /** Delete mapping from backend */
  deleteMapping?: (key: string) => Promise<void>;
  /** Analyze image with AI, returns AsanaAnalysis or string */
  analyzeImage?: (base64: string) => Promise<AsanaAnalysis | string>;
  /** Show toast notification */
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  containerClassName?: string;
  /** Enable admin editing controls */
  storageKey?: string;
  /** Custom positioning for edit controls */
  controlsClassName?: string;
  /** Fallback URL if main src fails */
  fallbackSrc?: string;
  /** Show text labels on control buttons */
  showControlsLabel?: boolean;
  /** Enable AI analysis button (requires analyzeImage service) */
  enableAnalysis?: boolean;
  /** Optional services for cloud features */
  services?: ImageServices;
}

// Helper to find data from old localStorage key formats
const getCandidateKeys = (key: string): string[] => {
  const baseKey = key.replace(/-v\d+$/, '').replace(/-new$/, '');
  return [
    key,
    `ksebe-img-${key}`,
    baseKey,
    `ksebe-img-${baseKey}`,
    `${baseKey}-v4`,
    `ksebe-img-${baseKey}-v4`,
  ];
};

export const Image: React.FC<ImageProps> = ({
  className,
  containerClassName,
  src: defaultSrc,
  fallbackSrc,
  alt,
  storageKey,
  controlsClassName,
  showControlsLabel = false,
  enableAnalysis = false,
  services,
  ...props
}) => {
  // --- STATE ---
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(() => {
    if (storageKey) {
      try {
        const candidates = getCandidateKeys(storageKey);
        for (const k of candidates) {
          const val = localStorage.getItem(k);
          if (val) return val;
        }
      } catch (e) {
        console.error('localStorage error:', e);
      }
    }
    return defaultSrc;
  });

  const [usingStorage, setUsingStorage] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
      const candidates = getCandidateKeys(storageKey);
      return candidates.some((k) => !!localStorage.getItem(k));
    } catch {
      return false;
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AsanaAnalysis | string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  // Load from cloud if services available
  useEffect(() => {
    if (storageKey && services?.getMapping && !usingStorage) {
      services.getMapping(storageKey).then((url) => {
        if (url) {
          setCurrentSrc(url);
          setUsingStorage(true);
          localStorage.setItem(storageKey, url);
        }
      });
    }
  }, [storageKey, services, usingStorage]);

  // Update from defaultSrc when not using storage
  useEffect(() => {
    if (!storageKey && !usingStorage && defaultSrc && defaultSrc !== currentSrc) {
      setCurrentSrc(defaultSrc);
      setHasError(false);
      setIsLoaded(false);
    }
  }, [defaultSrc, storageKey, usingStorage, currentSrc]);

  // --- HANDLERS ---
  const toast = useCallback(
    (msg: string, type: 'success' | 'error' | 'info') => {
      services?.showToast?.(msg, type);
    },
    [services]
  );

  const handleError = () => {
    if (usingStorage) {
      setHasError(true);
      setIsLoaded(true);
      return;
    }
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    setIsLoaded(true);
  };

  const handleSave = async (newSrc: string, file?: File) => {
    setCurrentSrc(newSrc);
    setUsingStorage(true);
    setHasError(false);
    setIsLoaded(false);
    setAnalysisResult(null);

    if (storageKey) {
      // Save to localStorage immediately
      try {
        localStorage.setItem(storageKey, newSrc);
      } catch {
        toast('Память браузера переполнена', 'error');
      }

      // Upload to cloud if file provided and service available
      if (file && services?.uploadToCloud) {
        setIsUploading(true);
        try {
          const publicUrl = await services.uploadToCloud(file, storageKey);
          if (publicUrl) {
            setCurrentSrc(publicUrl);
            localStorage.setItem(storageKey, publicUrl);
            await services.saveMapping?.(storageKey, publicUrl);
          }
        } catch {
          // Keep base64 version
        } finally {
          setIsUploading(false);
        }
      } else if (!file && services?.saveMapping) {
        // URL link - save mapping
        await services.saveMapping(storageKey, newSrc);
      }
    }
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Вернуть стандартное изображение?')) return;

    setCurrentSrc(defaultSrc);
    setUsingStorage(false);
    setHasError(false);
    setAnalysisResult(null);

    if (storageKey) {
      const candidates = getCandidateKeys(storageKey);
      candidates.forEach((k) => localStorage.removeItem(k));
      await services?.deleteMapping?.(storageKey);
      toast('Изображение сброшено', 'info');
    }
  };

  const handleUrlSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (urlInputValue.trim()) {
      handleSave(urlInputValue.trim());
      setIsUrlInputOpen(false);
      setUrlInputValue('');
      toast('Ссылка сохранена', 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast('Файл слишком большой (макс 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSave(reader.result as string, file);
        toast('Изображение загружено', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSrc || hasError || !services?.analyzeImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let base64Data = currentSrc;
      if (currentSrc.startsWith('http')) {
        const response = await fetch(currentSrc);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      const result = await services.analyzeImage(base64Data);
      setAnalysisResult(result);
    } catch {
      setAnalysisResult('Не удалось проанализировать изображение.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- RENDER ---
  const renderAnalysis = () => {
    if (!analysisResult) return null;

    if (typeof analysisResult === 'string') {
      return <p className="text-sm text-brand-text leading-relaxed">{analysisResult}</p>;
    }

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

  const showAnalysisButton = enableAnalysis && services?.analyzeImage;

  return (
    <div className={`relative overflow-hidden bg-stone-100 group ${containerClassName}`}>
      {/* Loading shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-stone-200 z-10 pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 z-0 p-4 text-center">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
            {usingStorage ? 'Файл недоступен' : 'Нет изображения'}
          </span>
        </div>
      )}

      {/* Image */}
      {!hasError && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          {...props}
        />
      )}

      {/* Upload overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Analysis result */}
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

      {/* Admin controls */}
      {storageKey && (
        <div
          className={`absolute z-30 flex flex-col items-end gap-2 transition-opacity duration-300 ${showControlsLabel || hasError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${controlsClassName || 'top-4 right-4'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            {/* Analysis button */}
            {showAnalysisButton && (
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
            )}

            {/* Upload button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-green shadow-md transition-all border border-white/20 disabled:opacity-50"
              title="Загрузить файл"
            >
              <Upload className="w-4 h-4" />
              {showControlsLabel && <span className="text-xs font-medium pr-1">Фото</span>}
            </button>

            {/* Link button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUrlInputOpen(!isUrlInputOpen);
              }}
              className={`p-2 backdrop-blur-md rounded-full text-white shadow-md transition-all border border-white/20 ${isUrlInputOpen ? 'bg-brand-green' : 'bg-black/60 hover:bg-brand-green'}`}
              title="Вставить ссылку"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            {/* Reset button */}
            {(usingStorage || hasError) && currentSrc !== defaultSrc && (
              <button
                onClick={handleReset}
                className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-rose-500 shadow-md transition-all border border-white/20"
                title="Сбросить"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* URL input */}
          {isUrlInputOpen && (
            <div
              className="flex gap-2 p-1.5 bg-white rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 w-64 border border-stone-100"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 outline-none text-brand-text bg-transparent min-w-0"
                autoFocus
              />
              <button
                onClick={handleUrlSubmit}
                className="p-1.5 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 shrink-0"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
