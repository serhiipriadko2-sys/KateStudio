import { Send, Phone, MapPin, Navigation, Loader2, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      showToast('Заявка отправлена! Мы свяжемся с вами.', 'success');

      // Reset form after 3 seconds
      setTimeout(() => setSent(false), 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-[#1a1a1a] text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Напишите нам</h2>
              <p className="text-white/50 mb-10 font-light text-lg">
                Оставьте заявку, и мы перезвоним в течение 15 минут
              </p>
            </FadeIn>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <FadeIn delay={100} fullWidth>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  required
                  className="w-full bg-transparent border-b border-white/20 text-white px-4 py-4 focus:outline-none focus:border-brand-green placeholder:text-white/30 transition-all text-lg"
                />
              </FadeIn>
              <FadeIn delay={200} fullWidth>
                <input
                  type="tel"
                  placeholder="Телефон"
                  required
                  className="w-full bg-transparent border-b border-white/20 text-white px-4 py-4 focus:outline-none focus:border-brand-green placeholder:text-white/30 transition-all text-lg"
                />
              </FadeIn>
              <FadeIn delay={300} fullWidth>
                <textarea
                  rows={2}
                  placeholder="Ваш вопрос"
                  className="w-full bg-transparent border-b border-white/20 text-white px-4 py-4 focus:outline-none focus:border-brand-green placeholder:text-white/30 transition-all resize-none text-lg"
                />
              </FadeIn>
              <FadeIn delay={400} fullWidth>
                <button
                  type="submit"
                  disabled={loading || sent}
                  className={`
                        w-full font-medium py-5 rounded-full mt-8 transition-all shadow-lg tracking-widest text-xs uppercase flex items-center justify-center gap-2
                        ${sent ? 'bg-brand-green text-white' : 'bg-white text-brand-dark hover:bg-brand-mint hover:shadow-white/10'}
                    `}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : sent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    'Отправить'
                  )}
                </button>
                <p className="text-[10px] text-white/20 text-center px-4 pt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями обработки данных
                </p>
              </FadeIn>
            </form>
          </div>
        </div>

        {/* Map & Info */}
        <div className="flex flex-col gap-6">
          {/* Map Card */}
          <div className="flex-1 bg-stone-100 rounded-[3rem] overflow-hidden relative group min-h-[400px]">
            <FadeIn className="h-full w-full">
              {/* Static Map Image / Placeholder */}
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
                alt="Map Location"
                storageKey="contact-map-bg"
                containerClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />

              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none"></div>

              {/* Overlay Pin */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-4 h-4 bg-brand-green rounded-full animate-ping absolute top-0 left-0"></div>
                  <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-brand-green relative z-10">
                    <MapPin className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-8 left-8 right-8">
                <a
                  href="https://yandex.ru/navi/org/k_sebe/7167334007"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all group/card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">
                        Студия К Себе
                      </p>
                      <p className="text-brand-text font-serif text-xl">Станционная ул., 5Б</p>
                      <p className="text-xs text-stone-400 mt-1">г. Дубна, этаж 2</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center group-hover/card:scale-110 transition-transform">
                      <Navigation className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};
