
import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  containerClassName?: string;
  storageKey?: string; // If provided, enables editing
  controlsClassName?: string; // Custom positioning for edit controls
  fallbackSrc?: string; // URL to use if src fails
  showControlsLabel?: boolean; // Show text label next to icon
  src?: string;
}

// Helper to generate all possible key variations to find lost user data
const getCandidateKeys = (key: string): string[] => {
    const baseKey = key.replace(/-v\d+$/, '').replace(/-new$/, ''); // e.g. "hero-main-bg-v4" -> "hero-main-bg"
    
    return [
        key,                                   // 1. Exact match (Current): "hero-main-bg-v4"
        `ksebe-img-${key}`,                    // 2. Prefixed exact: "ksebe-img-hero-main-bg-v4"
        baseKey,                               // 3. Base legacy: "hero-main-bg"
        `ksebe-img-${baseKey}`,                // 4. Prefixed base: "ksebe-img-hero-main-bg" (CRITICAL MISSING ONE)
        `${baseKey}-v4`,                       // 5. Base + v4: "hero-main-bg-v4"
        `ksebe-img-${baseKey}-v4`,             // 6. Prefixed base + v4
        `${key}-v4`                            // 7. Double version artifact
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
  ...props 
}) => {
  const { showToast } = useToast();
  
  // --- STATE INIT ---
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(() => {
    if (storageKey) {
      try {
        const candidates = getCandidateKeys(storageKey);
        // Iterate and find the first non-null value in LocalStorage
        for (const k of candidates) {
            const val = localStorage.getItem(k);
            if (val) {
                return val;
            }
        }
      } catch (e) {
        console.error("LS Error", e);
      }
    }
    return defaultSrc;
  });

  const [usingStorage, setUsingStorage] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
        const candidates = getCandidateKeys(storageKey);
        return candidates.some(k => !!localStorage.getItem(k));
    } catch { return false; }
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECT ---
  // Only update from defaultSrc if we are definitely NOT using storage.
  // We added a check `defaultSrc !== currentSrc` to avoid unnecessary re-renders/resets.
  useEffect(() => {
    if (!storageKey && !usingStorage && defaultSrc && defaultSrc !== currentSrc) {
        setCurrentSrc(defaultSrc);
        setHasError(false);
        setIsLoaded(false);
    }
  }, [defaultSrc, storageKey, usingStorage, currentSrc]);

  // --- HANDLERS ---

  const handleError = () => {
    // If it's user data, show error state, don't fallback silently
    if (usingStorage) {
        setHasError(true);
        setIsLoaded(true);
        return; 
    }

    // If default failed, try fallback
    if (currentSrc !== fallbackSrc && fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
    }

    setHasError(true);
    setIsLoaded(true);
  };

  const handleSave = (newSrc: string) => {
    setCurrentSrc(newSrc);
    setUsingStorage(true);
    setHasError(false);
    setIsLoaded(false); 

    if (storageKey) {
        try {
            // Always save to the CLEAN current key to fix future lookups
            localStorage.setItem(storageKey, newSrc);
            // Optional: We could clean up old keys here, but better to keep them for safety for now
        } catch (e) {
            showToast("Ошибка сохранения: память браузера переполнена", "error");
        }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Вернуть стандартное изображение?")) {
        setCurrentSrc(defaultSrc);
        setUsingStorage(false);
        setHasError(false);
        if (storageKey) {
            // Clean up ALL candidates to ensure it doesn't resurrect
            const candidates = getCandidateKeys(storageKey);
            candidates.forEach(k => localStorage.removeItem(k));
            showToast("Изображение сброшено", "info");
        }
    }
  };

  const handleUrlSubmit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (urlInputValue.trim()) {
          handleSave(urlInputValue.trim());
          setIsUrlInputOpen(false);
          setUrlInputValue('');
          showToast("Ссылка сохранена", "success");
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
          showToast("Файл слишком большой (макс 5MB)", "error");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSave(reader.result as string);
        showToast("Изображение загружено", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-stone-200 group ${containerClassName}`}>
      
      {!isLoaded && !hasError && (
         <div className="absolute inset-0 bg-stone-200 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }}></div>
         </div>
      )}

      {!hasError && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          {...props}
        />
      )}

      {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-500 z-0 p-4 text-center">
              <AlertCircle className="w-8 h-8 mb-2 text-rose-400 opacity-80" />
              <span className="text-[10px] uppercase tracking-wider font-bold mb-1">
                {usingStorage ? "Файл недоступен" : "Нет изображения"}
              </span>
              {usingStorage && (
                  <div className="text-[9px] break-all max-w-full opacity-60 px-2 line-clamp-2">
                     Ссылка сломана
                  </div>
              )}
          </div>
      )}

      {storageKey && (
        <div 
          className={`absolute z-30 flex flex-col items-end gap-2 transition-opacity duration-300 pointer-events-auto ${showControlsLabel || hasError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${controlsClassName || 'top-4 right-4'}`}
          onClick={(e) => e.stopPropagation()} 
        >
            <div className="flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-green shadow-md transition-all border border-white/20"
                    title="Загрузить файл"
                >
                    <Upload className="w-4 h-4" />
                    {showControlsLabel && <span className="text-xs font-medium pr-1">Фото</span>}
                </button>
                
                <button
                    onClick={(e) => { e.stopPropagation(); setIsUrlInputOpen(!isUrlInputOpen); }}
                    className={`p-2 backdrop-blur-md rounded-full text-white shadow-md transition-all border border-white/20 ${isUrlInputOpen ? 'bg-brand-green' : 'bg-black/60 hover:bg-brand-green'}`}
                    title="Вставить ссылку"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>

                {(usingStorage || hasError) && (
                    <button
                        onClick={handleReset}
                        className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-rose-500 shadow-md transition-all border border-white/20"
                        title="Сбросить"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

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
                        onClick={(e) => e.stopPropagation()}
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
