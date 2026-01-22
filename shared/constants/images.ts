export const IMAGES = {
  brand: {
    logo: '/images/brand/logo.jpg',
  },
  hero: {
    mainBg: '/images/hero/main-bg.jpg',
  },
  about: {
    katyaPortrait: '/images/about/katya-portrait.jpg',
  },
  directions: {
    hatha: '/images/directions/hatha.jpg',
    insideFlow: '/images/directions/inside-flow.jpg',
  },
  gallery: [
    '/images/gallery/image-1.jpg',
    '/images/gallery/image-2.jpg',
    '/images/gallery/image-3.jpg',
    '/images/gallery/image-4.jpg',
  ],
  studio: {
    1: '/images/studio/studio-1.jpg',
    2: '/images/studio/studio-2.jpg',
    3: '/images/studio/studio-3.jpg',
    4: '/images/studio/studio-4.jpg',
    5: '/images/studio/studio-5.jpg',
    6: '/images/studio/studio-6.jpg',
    7: '/images/studio/studio-7.jpg',
    8: '/images/studio/studio-8.jpg',
    9: '/images/studio/studio-9.jpg',
  },
  // Mapped for specific components
  reviews: {
    avatars: [
      '/images/studio/studio-1.jpg',
      '/images/studio/studio-2.jpg',
      '/images/studio/studio-3.jpg',
      '/images/studio/studio-4.jpg',
      '/images/studio/studio-5.jpg',
    ],
  },
  retreats: {
    main: '/images/studio/studio-6.jpg', // Placeholder, ideally specific retreat image
    sidebar: '/images/studio/studio-7.jpg',
  },
  blog: {
    articles: [
      '/images/studio/studio-8.jpg',
      '/images/studio/studio-9.jpg',
      '/images/studio/studio-1.jpg', // Reusing
    ],
  },
} as const;
