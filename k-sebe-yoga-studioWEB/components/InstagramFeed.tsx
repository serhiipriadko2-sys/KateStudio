import React, { useEffect, useRef } from 'react';
import { FadeIn } from './FadeIn';

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
      <div className="mb-16">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Следите за нами</h2>
        </FadeIn>
      </div>

      {/* Elfsight Instagram Feed */}
      <FadeIn delay={300}>
        <div ref={widgetRef} className="flex justify-center">
          <div className={`elfsight-app-${ELFSIGHT_WIDGET_ID} w-full`} data-elfsight-app-lazy />
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
