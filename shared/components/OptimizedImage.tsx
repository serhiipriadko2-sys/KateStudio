/**
 * OptimizedImage — renders a <picture> element with WebP source + original fallback.
 *
 * Automatically derives the WebP path by replacing the extension with ".webp".
 * If the WebP file doesn't exist (e.g. during local dev before optimization),
 * the browser silently falls back to the original src.
 *
 * Usage:
 *   <OptimizedImage src="/images/gallery/image-1.jpg" alt="Studio" className="w-full" />
 *
 * The component accepts all <img> props plus:
 *   - eager?: boolean — use loading="eager" (default: "lazy")
 *   - pictureClassName?: string — className applied to the <picture> wrapper
 */
import React from 'react';

export interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Override WebP path if it doesn't follow the default naming convention */
  webpSrc?: string;
  /** Disable lazy loading (e.g. for above-the-fold hero images) */
  eager?: boolean;
  /** className for the wrapping <picture> element */
  pictureClassName?: string;
}

const WEBP_PATTERN = /\.(jpe?g|png)(\?.*)?$/i;

function toWebP(src: string, override?: string): string | undefined {
  if (override) return override;
  // Only auto-derive for local paths (not external CDN URLs)
  if (src.startsWith('http://') || src.startsWith('https://')) return undefined;
  if (!WEBP_PATTERN.test(src)) return undefined;
  return src.replace(WEBP_PATTERN, '.webp');
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  eager = false,
  pictureClassName,
  className,
  ...imgProps
}) => {
  const derivedWebP = toWebP(src, webpSrc);

  return (
    <picture className={pictureClassName}>
      {derivedWebP && <source srcSet={derivedWebP} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        {...imgProps}
      />
    </picture>
  );
};
