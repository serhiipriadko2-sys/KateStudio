import { ImageOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Skeleton } from '../Skeleton';
import { AsanaAnalysisCard } from './AsanaAnalysisCard';
// ImageAdminControls hidden from public UI — managed via AdminPanel → Images tab
// import { ImageAdminControls } from './ImageAdminControls';
import type { AsanaAnalysis, ImageProps } from './types';
import { getCandidateKeys } from './utils';

export const Image: React.FC<ImageProps> = ({
  className,
  containerClassName,
  src: defaultSrc,
  fallbackSrc,
  alt,
  storageKey,
  controlsClassName: _controlsClassName,
  showControlsLabel: _showControlsLabel = false,
  enableAnalysis: _enableAnalysis = false,
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
  const [analysisResult, setAnalysisResult] = useState<AsanaAnalysis | string | null>(null);

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

  // --- RENDER ---
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

      {analysisResult && (
        <AsanaAnalysisCard result={analysisResult} onClose={() => setAnalysisResult(null)} />
      )}

      {/* ImageAdminControls hidden from public UI — managed via AdminPanel → Images tab */}
    </div>
  );
};
