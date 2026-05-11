export const getTrainerImageObjectPosition = (slug: string) =>
  slug === 'lidia-kuzina' ? 'center 18%' : 'center';

export const getTrainerGalleryImageObjectPosition = (slug: string, index: number) => {
  if (slug === 'elizaveta-belonogova' && index === 1) return 'center 18%';
  if (slug === 'lidia-kuzina' && index === 0) return 'center 18%';
  return 'center';
};
