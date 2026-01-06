/**
 * K Sebe Yoga Studio - Skeleton Loader
 * Placeholder component for loading states to prevent CLS
 *
 * Use to reserve space for content that is loading,
 * preventing layout shifts when content appears.
 */

import React from 'react';
import { cn } from '../utils';

export interface SkeletonProps {
  /** Width of the skeleton (CSS value or Tailwind class) */
  width?: string;
  /** Height of the skeleton (CSS value or Tailwind class) */
  height?: string;
  /** Border radius style */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Additional CSS classes */
  className?: string;
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-stone-200/60';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'shimmer-animation',
    none: '',
  };

  // Default dimensions based on variant
  const defaultDimensions = {
    text: { width: '100%', height: '1em' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '4rem' },
    rounded: { width: '100%', height: '8rem' },
  };

  const finalWidth = width || defaultDimensions[variant].width;
  const finalHeight = height || defaultDimensions[variant].height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], animationClasses[animation], className)}
      style={{ width: finalWidth, height: finalHeight }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton for video/image cards - matches VideoLibrary card dimensions
 */
export const SkeletonVideoCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-[2rem] overflow-hidden border border-stone-100', className)}>
    <Skeleton variant="rectangular" height="12rem" className="rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton variant="text" width="70%" height="1.5rem" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="4rem" height="1.25rem" className="rounded-md" />
        <Skeleton variant="text" width="3rem" height="1.25rem" className="rounded-md" />
      </div>
      <Skeleton variant="text" width="40%" height="1rem" />
    </div>
  </div>
);

/**
 * Skeleton for avatar/profile images
 */
export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({
  size = '3rem',
  className,
}) => <Skeleton variant="circular" width={size} height={size} className={className} />;

/**
 * Skeleton for text content
 */
export const SkeletonText: React.FC<{
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}> = ({ lines = 3, lastLineWidth = '60%', className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? lastLineWidth : '100%'}
        height="1rem"
      />
    ))}
  </div>
);
