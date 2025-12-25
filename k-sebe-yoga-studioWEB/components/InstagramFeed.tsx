import { Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

const INSTAGRAM_USERNAME = 'kate_gabran';
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_USERNAME}`;

// Preview posts - these would be replaced with actual Instagram embed or API data
const previewPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    likes: 124,
    comments: 18,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=400&fit=crop',
    likes: 156,
    comments: 24,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop',
    likes: 203,
    comments: 31,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop',
    likes: 178,
    comments: 22,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
    likes: 145,
    comments: 19,
  },
];

export const InstagramFeed: React.FC = () => {
  return (
    <section id="instagram" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Instagram
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">
            Следите за нами
          </h2>
        </FadeIn>

        <FadeIn delay={200} direction="left">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <Instagram className="w-5 h-5" />
            <span className="font-medium">@{INSTAGRAM_USERNAME}</span>
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </FadeIn>
      </div>

      {/* Instagram Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {previewPosts.map((post, idx) => (
          <FadeIn key={post.id} delay={idx * 100} direction="up">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-white">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </div>
              </div>
            </a>
          </FadeIn>
        ))}
      </div>

      {/* CTA */}
      <FadeIn delay={600}>
        <div className="mt-12 text-center">
          <p className="text-stone-500 mb-6">
            Больше фото, видео и историй из жизни студии
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green/80 transition-colors group"
          >
            <span className="text-sm font-bold uppercase tracking-wider border-b-2 border-brand-green/30 group-hover:border-brand-green pb-1">
              Подписаться в Instagram
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </FadeIn>
    </section>
  );
};
