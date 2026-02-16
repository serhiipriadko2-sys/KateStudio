/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { IMAGES } from '@ksebe/shared';
import { Clock, Lock, Play, Star } from 'lucide-react';
import React, { useState } from 'react';
import { Image } from './Image';

interface Video {
  id: string;
  title: string;
  duration: string;
  level: string;
  category: string;
  image: string;
  isLocked: boolean;
  rating: number;
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Утренняя энергия: Пробуждение',
    duration: '20 мин',
    level: 'Начинающий',
    category: 'Энергия',
    image: IMAGES.studio[1], // Reusing studio image for now
    isLocked: false,
    rating: 4.9,
  },
  {
    id: '2',
    title: 'Inside Flow: Crazy in Love',
    duration: '45 мин',
    level: 'Средний',
    category: 'Сила',
    image: IMAGES.studio[2],
    isLocked: true,
    rating: 5.0,
  },
  {
    id: '3',
    title: 'Вечерняя растяжка: Deep Stretch',
    duration: '30 мин',
    level: 'Все уровни',
    category: 'Покой',
    image: IMAGES.studio[3],
    isLocked: false,
    rating: 4.8,
  },
  {
    id: '4',
    title: 'Здоровая спина и шея',
    duration: '25 мин',
    level: 'Начинающий',
    category: 'Здоровье',
    image: IMAGES.studio[4],
    isLocked: true,
    rating: 4.9,
  },
];

export const VideoLibrary = ({ selectedMood }: { selectedMood?: string | null }) => {
  const filteredVideos = selectedMood
    ? videos.filter((v) => v.category === selectedMood)
    : videos;

  const displayVideos = filteredVideos.length > 0 ? filteredVideos : videos;
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleVideoClick = (video: Video) => {
    if (!video.isLocked) {
      setActiveVideo(video.id);
    }
  };

  return (
    <div className="space-y-4">
      {displayVideos.map((video) => (
        <div
          key={video.id}
          className="group relative bg-white rounded-[2rem] p-3 shadow-sm border border-stone-100 flex gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          onClick={() => handleVideoClick(video)}
        >
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-200">
            <Image
              src={video.image}
              alt={video.title}
              storageKey={`video-thumb-${video.id}`}
              className="w-full h-full object-cover"
            />
            {video.isLocked && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <Lock className="w-6 h-6 text-white/80" />
              </div>
            )}
            {!video.isLocked && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green bg-brand-mint/30 px-2 py-0.5 rounded-full">
                {video.category}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-brand-yellow font-bold">
                <Star className="w-3 h-3 fill-brand-yellow" />
                {video.rating}
              </div>
            </div>
            <h3 className="font-serif text-brand-text leading-tight mb-2 truncate">
              {video.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {video.duration}
              </span>
              <span>•</span>
              <span>{video.level}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
