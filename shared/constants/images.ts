/**
 * K Sebe Yoga Studio - Image Assets
 *
 * Centralized registry of all external images used in the application.
 * This makes it easy to replace placeholders with real studio photography.
 *
 * Usage:
 * import { IMAGES } from '@ksebe/shared';
 * <img src={IMAGES.REVIEWS.USER_1} />
 */

export const IMAGES = {
  // User Avatars for Reviews
  REVIEWS: {
    USER_1: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', // Woman, natural light
    USER_2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', // Woman, portrait
    USER_3: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', // Woman, smiling
    USER_4: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', // Woman, casual
    USER_5: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', // Woman, happy
  },

  // Retreats & Events
  RETREATS: {
    WINTER: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', // Mountains
    BALI: 'https://images.unsplash.com/photo-1518182170546-0766be6f5a56?q=80&w=800&auto=format&fit=crop', // Tropical/Yoga
  },

  // Blog & Articles
  BLOG: {
    MINDFULNESS: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=800&auto=format&fit=crop', // Meditation
    INSIDE_FLOW: 'https://images.unsplash.com/photo-1511690656952-34342d5c22b0?q=80&w=800&auto=format&fit=crop', // Flow/Dance
    BREATH: 'https://images.unsplash.com/photo-1508672019048-805c276e7e69?q=80&w=800&auto=format&fit=crop', // Nature/Breath
  },

  // Instructors
  INSTRUCTORS: {
    KATYA_MAIN: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=800&auto=format&fit=crop', // Placeholder for Katya
  },

  // UI Elements
  PLACEHOLDERS: {
    VIDEO_THUMB: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop', // Yoga Mat
  }
} as const;
