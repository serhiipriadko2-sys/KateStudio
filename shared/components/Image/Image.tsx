import { ImageOff, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Skeleton } from '../Skeleton';
import { AsanaAnalysisCard } from './AsanaAnalysisCard';
import { ImageAdminControls } from './ImageAdminControls';
import type { AsanaAnalysis, ImageProps } from './types';
import { getCandidateKeys } from './utils';

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
  loading = 'lazy',
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
      try {
        localStorage.setItem(storageKey, newSrc);
      } catch {
        toast('Память браузера переполнена', 'error');
      }

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
      getCandidateKeys(storageKey).forEach((k) => localStorage.removeItem(k));
      await services?.deleteMapping?.(storageKey);
      toast('Изображение сброшено', 'info');
    }
  };

  const handleUrlSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (urlInputValue.trim()) {
      void handleSave(urlInputValue.trim());
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
        void handleSave(reader.result as string, file);
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
  const showAnalysisButton = enableAnalysis && !!services?.analyzeImage;

  return (
    <div className={`relative overflow-hidden bg-stone-100 group ${containerClassName}`}>
      {!isLoaded && !hasError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          className="absolute inset-0 z-10 pointer-events-none"
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 z-0 p-4 text-center">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
            {usingStorage ? 'Файл недоступен' : 'Нет изображения'}
          </span>
        </div>
      )}

      {!hasError && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          loading={loading}
          {...props}
        />
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {analysisResult && (
        <AsanaAnalysisCard result={analysisResult} onClose={() => setAnalysisResult(null)} />
      )}

      {storageKey && (
        <ImageAdminControls
          isUploading={isUploading}
          isAnalyzing={isAnalyzing}
          hasError={hasError}
          usingStorage={usingStorage}
          isUrlInputOpen={isUrlInputOpen}
          urlInputValue={urlInputValue}
          showControlsLabel={showControlsLabel}
          showAnalysisButton={showAnalysisButton}
          controlsClassName={controlsClassName}
          isDefaultSrc={currentSrc === defaultSrc}
          fileInputRef={fileInputRef}
          onAnalyze={(e) => void handleAnalyze(e)}
          onReset={(e) => void handleReset(e)}
          onUrlSubmit={handleUrlSubmit}
          onUrlToggle={(e) => {
            e.stopPropagation();
            setIsUrlInputOpen(!isUrlInputOpen);
          }}
          onUrlChange={(value) => setUrlInputValue(value)}
          onUrlClose={() => setIsUrlInputOpen(false)}
          onFileClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          onFileChange={handleFileChange}
        />
      )}
    </div>
  );
};
