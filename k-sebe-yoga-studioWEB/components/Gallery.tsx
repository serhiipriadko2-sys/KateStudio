import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

const galleryImages = [
  {
    id: 1,
    url: '/images/gallery/gallery-image-1.jpg',
    alt: 'Meditation Atmosphere',
    className: 'md:col-span-1 row-span-1',
  },
  {
    id: 2,
    url: '/images/gallery/gallery-image-2.jpg',
    alt: 'Stretching Flow',
    className: 'md:col-span-2 row-span-1 object-[50%_40%]',
  },
  {
    id: 3,
    url: '/images/gallery/gallery-image-3.jpg',
    alt: 'Yoga Studio Vibe',
    className: 'md:col-span-2 row-span-1',
  },
  {
    id: 4,
    url: '/images/gallery/gallery-image-4.jpg',
    alt: 'Peaceful Moment',
    className: 'md:col-span-1 row-span-1',
  },
];

export const Gallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Use custom hook for scroll locking
  useScrollLock(selectedIndex !== null);
  useFocusTrap(dialogRef, selectedIndex !== null, closeButtonRef);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length));
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length
    );
  }, []);

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  return (
    <section id="gallery" className="py-20 px-4 md:px-12 scroll-mt-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <FadeIn>
            <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
              Галерея
            </h4>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Атмосфера</h2>
          </FadeIn>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          {galleryImages.map((img, idx) => (
            <FadeIn
              key={img.id}
              delay={idx * 150}
              direction="up"
              className={`${img.className} h-full`}
            >
              <div
                className={`
                    h-full w-full rounded-[2.5rem] overflow-hidden relative group cursor-pointer 
                    shadow-sm hover:shadow-2xl hover:shadow-stone-200 
                    transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                    transform hover:-translate-y-1
                  `}
                onClick={() => setSelectedIndex(idx)}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  storageKey={`gallery-image-${img.id}`}
                  containerClassName="w-full h-full"
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 ${img.id === 2 ? 'object-[50%_40%]' : ''}`}
                  loading="lazy"
                />

                {/* Overlay and Icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Просмотр изображения: ${galleryImages[selectedIndex].alt}`}
          tabIndex={-1}
          className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 touch-none"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedIndex(null)}
            ref={closeButtonRef}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Закрыть"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="hidden md:block absolute left-4 md:left-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-white group"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:block absolute right-4 md:right-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-white group"
            aria-label="Следующее изображение"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Main Image Container */}
          <div
            className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={selectedIndex} // Force re-render on index change for animation
              src={galleryImages[selectedIndex].url}
              alt={galleryImages[selectedIndex].alt}
              storageKey={`gallery-image-${galleryImages[selectedIndex].id}`} // Enable sync with admin changes
              containerClassName="w-full h-full flex items-center justify-center"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 fade-in duration-300"
              controlsClassName="hidden" // Hide edit controls in lightbox
            />

            {/* Caption */}
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="inline-block bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                {selectedIndex + 1} / {galleryImages.length} — {galleryImages[selectedIndex].alt}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
