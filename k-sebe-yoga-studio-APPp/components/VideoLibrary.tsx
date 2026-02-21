/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { IMAGES } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import { Play, Lock, Clock, Sparkles, X, ChevronRight, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { videoService, Video } from '../services/videoService';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { Paywall } from './Paywall';

interface VideoLibraryProps {
  selectedMood?: string | null;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ selectedMood }) => {
  const { showToast } = useToast();
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  // Fetch videos from DB
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: videoService.getVideos,
  });

  const filteredVideos = useMemo(() => {
    if (!selectedMood) return videos;
    return videos.filter((v) => v.tags.includes(selectedMood));
  }, [selectedMood, videos]);

  const handleVideoClick = (video: Video) => {
    if (video.is_locked) {
      setShowPaywall(true);
      return;
    }
    if (!video.video_url) {
        showToast('Видео временно недоступно', 'error');
        return;
    }
    setIsVideoLoading(true);
    setActiveVideo(video);
  };

  const handleClose = () => {
    setActiveVideo(null);
    setIsVideoLoading(true);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Header if filtered */}
      {selectedMood && (
        <FadeIn>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="p-1.5 bg-brand-green/10 rounded-full text-brand-green">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-brand-green">
              Подобрано для состояния: <span className="font-bold">{selectedMood}</span>
            </span>
          </div>
        </FadeIn>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-h-[300px]">
        {filteredVideos.map((vid) => (
          <FadeIn key={vid.id} className="h-full">
            <div
              onClick={() => handleVideoClick(vid)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleVideoClick(vid);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Открыть видео ${vid.title}`}
              className="group relative bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] duration-300 h-full flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={vid.image_url || IMAGES.studio[1]}
                  alt={vid.title}
                  storageKey={`video-thumb-${vid.id}`}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${vid.is_locked ? 'grayscale-[0.5]' : ''}`}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-colors flex items-center justify-center ${vid.is_locked ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-black/10 group-hover:bg-black/20'}`}
                >
                  <div
                    className={`
                        w-14 h-14 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg border border-white/20
                        ${vid.is_locked ? 'bg-stone-900/60' : 'bg-white/30 group-hover:scale-110'}
                    `}
                  >
                    {vid.is_locked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 pl-0.5" />
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
                  <Clock className="w-3 h-3" /> {vid.duration}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-lg text-brand-text group-hover:text-brand-green transition-colors leading-tight">
                    {vid.title}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${vid.is_locked ? 'bg-stone-100 text-stone-400' : 'bg-brand-mint/40 text-brand-green'}`}
                  >
                    {vid.level}
                  </span>
                  {vid.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-stone-50 px-2 py-1 rounded-md text-stone-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-stone-50 flex justify-between items-center">
                  <p className="text-xs text-stone-400 font-medium">
                    {vid.is_locked ? 'По подписке' : 'Бесплатно'}
                  </p>
                  {!vid.is_locked && (
                    <ChevronRight className="w-4 h-4 text-brand-green opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}

        {/* Promo Card */}
        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 flex flex-col justify-center items-center text-center text-white relative overflow-hidden h-full min-h-[280px] group shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/20 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center h-full justify-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-6 h-6 text-brand-yellow" />
            </div>
            <h4 className="font-serif text-xl mb-2">Все уроки</h4>
            <p className="text-white/60 text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">
              Оформите подписку, чтобы получить неограниченный доступ к библиотеке.
            </p>
            <button
                onClick={() => setShowPaywall(true)}
                className="w-full py-4 bg-brand-green text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-95">
              Подписаться
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={handleClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Видео плеер"
        >
          <div
            className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden relative shadow-2xl aspect-video animate-in zoom-in-95 duration-300 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Loader */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-10">
                <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
              </div>
            )}

            {activeVideo.video_url ? (
              <iframe
                src={activeVideo.video_url}
                title={activeVideo.title}
                className="w-full h-full relative z-20"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsVideoLoading(false)}
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col text-white/50">
                <p>Видео недоступно</p>
              </div>
            )}
          </div>
          <div className="mt-6 text-white text-center">
            <h3 className="text-2xl font-serif mb-2">{activeVideo.title}</h3>
            <button
              onClick={handleClose}
              className="text-stone-400 hover:text-white text-sm transition-colors"
            >
              Закрыть просмотр
            </button>
          </div>
        </div>
      )}

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
    </div>
  );
};
