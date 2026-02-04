import { Instagram, ExternalLink } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { FadeIn } from './FadeIn';

const INSTAGRAM_USERNAME = 'kate_gabran';
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_USERNAME}`;

// Elfsight Widget ID - Active widget for @kate_gabran
// Widget URL: https://c9682b51c4384ad0a8cfb41a1354ddf0.elf.site
// Dashboard: https://elfsight.com/instagram-feed-instashow/
const ELFSIGHT_WIDGET_ID = 'c9682b51-c438-4ad0-a8cf-b41a1354ddf0';

export const InstagramFeed: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Elfsight platform script if widget ID is configured
    if (ELFSIGHT_WIDGET_ID && !document.querySelector('script[src*="elfsightcdn.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup script on unmount
        const existingScript = document.querySelector('script[src*="elfsightcdn.com"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, []);

  return (
    <section id="instagram" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Следите за нами</h2>
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

      {/* Elfsight Instagram Feed */}
      <FadeIn delay={300}>
        <div ref={widgetRef} className="flex justify-center">
          {ELFSIGHT_WIDGET_ID ? (
            // Elfsight widget embed
            <div className={`elfsight-app-${ELFSIGHT_WIDGET_ID} w-full`} data-elfsight-app-lazy />
          ) : (
            // Fallback: Beautiful CTA card when widget not configured
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full max-w-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-1 rounded-3xl hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-500"
            >
              <div className="bg-white rounded-[1.4rem] p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-serif text-brand-text mb-3">@{INSTAGRAM_USERNAME}</h3>
                <p className="text-stone-500 mb-6 max-w-md mx-auto">
                  Фото и видео из студии, анонсы занятий, полезные советы по йоге и здоровому образу
                  жизни
                </p>
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full font-medium group-hover:gap-4 transition-all duration-300">
                  Подписаться
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </a>
          )}
        </div>
      </FadeIn>

      {/* CTA */}
      <FadeIn delay={500}>
        <div className="mt-12 text-center">
          <p className="text-stone-500">Больше фото, видео и историй из жизни студии</p>
        </div>
      </FadeIn>
    </section>
  );
};
