
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

const galleryImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=600&auto=format&fit=crop",
    alt: "Meditation Atmosphere",
    className: "md:col-span-1 row-span-1"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?q=80&w=800&auto=format&fit=crop",
    alt: "Stretching Flow",
    className: "md:col-span-2 row-span-1 object-[50%_40%]"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop",
    alt: "Yoga Studio Vibe",
    className: "md:col-span-2 row-span-1"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
    alt: "Peaceful Moment",
    className: "md:col-span-1 row-span-1"
  }
];

export const Gallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length));
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length));
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  // Swipe Logic
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="gallery" className="py-20 px-4 md:px-12 scroll-mt-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <FadeIn>
             <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">Галерея</h4>
             <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Атмосфера</h2>
          </FadeIn>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          {galleryImages.map((img, idx) => (
            <FadeIn key={img.id} delay={idx * 150} direction="up" className={`${img.className} h-full`}>
                <div 
                  className={`h-full w-full rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <Image 
                    src={img.url} 
                    alt={img.alt} 
                    storageKey={`gallery-image-${img.id}`}
                    containerClassName="w-full h-full"
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${img.id === 2 ? 'object-[50%_40%]' : ''}`} 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 z-20 pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                      <ZoomIn className="w-8 h-8" />
                    </div>
                  </div>
                </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button 
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors z-20"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors z-20 hidden md:flex"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors z-20 hidden md:flex"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="relative max-w-full max-h-[85vh]">
            <img 
                key={selectedIndex} // Force re-render for fade-in effect on change
                src={galleryImages[selectedIndex].url} 
                alt="Full view" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-500 select-none pointer-events-none md:pointer-events-auto"
                onClick={(e) => e.stopPropagation()} 
            />
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 text-center text-white/50 text-sm md:hidden pointer-events-none">
            Смахните для навигации
          </div>
        </div>
      )}
    </section>
  );
};
