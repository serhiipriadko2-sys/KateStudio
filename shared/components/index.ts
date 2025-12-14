/**
 * K Sebe Yoga Studio - Shared Components
 * Export all shared components from single entry point
 */

// UI Components
export { FadeIn } from './FadeIn';
export { Logo } from './Logo';
export { Image } from './Image';
export { Marquee } from './Marquee';
export { ScrollProgress } from './ScrollProgress';
export { BackToTop } from './BackToTop';
export { ErrorBoundary } from './ErrorBoundary';
export { CookieBanner } from './CookieBanner';

// Feature Components
export { Breathwork } from './Breathwork';
export { Blog } from './Blog';
export { Pricing } from './Pricing';

// Types
export type { AsanaAnalysis, ImageServices } from './Image';
export type { MarqueeConfig } from './Marquee';

// Re-export types for convenience
export type { BlogArticle, PriceOption, BreathPhase, BreathworkConfig } from '../types';
