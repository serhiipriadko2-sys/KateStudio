import { Brain, Check, Link as LinkIcon, Loader2, Upload, X } from 'lucide-react';
import React from 'react';

interface ImageAdminControlsProps {
  isUploading: boolean;
  isAnalyzing: boolean;
  hasError: boolean;
  usingStorage: boolean;
  isUrlInputOpen: boolean;
  urlInputValue: string;
  showControlsLabel: boolean;
  showAnalysisButton: boolean;
  controlsClassName?: string;
  isDefaultSrc: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAnalyze: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent) => void;
  onUrlSubmit: (e: React.MouseEvent) => void;
  onUrlToggle: (e: React.MouseEvent) => void;
  onUrlChange: (value: string) => void;
  onUrlClose: () => void;
  onFileClick: (e: React.MouseEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageAdminControls: React.FC<ImageAdminControlsProps> = ({
  isUploading,
  isAnalyzing,
  hasError,
  usingStorage,
  isUrlInputOpen,
  urlInputValue,
  showControlsLabel,
  showAnalysisButton,
  controlsClassName,
  isDefaultSrc,
  fileInputRef,
  onAnalyze,
  onReset,
  onUrlSubmit,
  onUrlToggle,
  onUrlChange,
  onUrlClose,
  onFileClick,
  onFileChange,
}) => {
  return (
    <div
      className={`absolute z-30 flex flex-col items-end gap-2 transition-opacity duration-300 ${showControlsLabel || hasError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${controlsClassName ?? 'top-4 right-4'}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.key === 'Escape' && e.stopPropagation()}
      role="group"
      aria-label="Управление изображением"
    >
      <div className="flex gap-2">
        {showAnalysisButton && (
          <button
            onClick={onAnalyze}
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

        <button
          onClick={onFileClick}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-green shadow-md transition-all border border-white/20 disabled:opacity-50"
          title="Загрузить файл"
        >
          <Upload className="w-4 h-4" />
          {showControlsLabel && <span className="text-xs font-medium pr-1">Фото</span>}
        </button>

        <button
          onClick={onUrlToggle}
          className={`p-2 backdrop-blur-md rounded-full text-white shadow-md transition-all border border-white/20 ${isUrlInputOpen ? 'bg-brand-green' : 'bg-black/60 hover:bg-brand-green'}`}
          title="Вставить ссылку"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {(usingStorage || hasError) && !isDefaultSrc && (
          <button
            onClick={onReset}
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
          onKeyDown={(e) => e.key === 'Escape' && onUrlClose()}
          role="group"
          aria-label="Ввод URL изображения"
        >
          <input
            type="text"
            value={urlInputValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-xs px-2 py-1 outline-none text-brand-text bg-transparent min-w-0"
            autoFocus
          />
          <button
            onClick={onUrlSubmit}
            className="p-1.5 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 shrink-0"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
