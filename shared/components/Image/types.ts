import React from 'react';

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

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
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
  /**
   * Controls when the browser loads the image.
   * Defaults to 'lazy' for below-the-fold images.
   * Pass 'eager' for above-the-fold (hero) images.
   */
  loading?: 'lazy' | 'eager';
}
