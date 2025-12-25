import { Send, Phone, MapPin, Navigation, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({});

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7 (${numbers}`;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9)
      return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const raw = value.replace(/\D/g, '');
      if (raw.length === 0) {
        setFormData((prev) => ({ ...prev, phone: '' }));
      } else {
        setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const isPhoneValid = formData.phone.length >= 16; // +7 (999) 000-00-00 is 18 chars, but allow relaxed
  const isNameValid = formData.name.trim().length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !isNameValid) {
      setTouched({ name: true, phone: true });
      return;
    }

    setStatus('loading');

    try {
      if (supabase) {
        const { error } = await supabase.from('contacts').insert([
          {
            name: formData.name,
            phone: formData.phone,
            message: formData.message,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      } else {
        console.warn('Supabase credentials not found. Simulating submission.');
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setStatus('success');
      setFormData({ name: '', phone: '', message: '' });
      setTouched({});

      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-[#1a1a1a] text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col justify-center shadow-2xl">
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
                <div className="relative group">
                  <label htmlFor="name" className="sr-only">
                    Ваше имя
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ваше имя"
                    className={`w-full bg-transparent border-b px-4 py-4 focus:outline-none placeholder:text-white/30 transition-all text-lg focus:bg-white/5 rounded-t-lg
                        ${touched.name && !isNameValid ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/20 focus:border-brand-green'}
                    `}
                  />
                  {touched.name && !isNameValid && (
                    <span className="absolute right-4 top-4 text-rose-500">
                      <AlertCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={200} fullWidth>
                <div className="relative group">
                  <label htmlFor="phone" className="sr-only">
                    Телефон
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+7 (999) 000-00-00"
                    maxLength={18}
                    className={`w-full bg-transparent border-b px-4 py-4 focus:outline-none placeholder:text-white/30 transition-all text-lg focus:bg-white/5 rounded-t-lg
                        ${touched.phone && !isPhoneValid ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/20 focus:border-brand-green'}
                    `}
                  />
                  {touched.phone && !isPhoneValid && (
                    <span className="absolute right-4 top-4 text-rose-500">
                      <AlertCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={300} fullWidth>
                <div className="relative">
                  <label htmlFor="message" className="sr-only">
                    Ваш вопрос
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ваш вопрос"
                    className="w-full bg-transparent border-b border-white/20 text-white px-4 py-4 focus:outline-none focus:border-brand-green placeholder:text-white/30 transition-all resize-none text-lg focus:bg-white/5 rounded-t-lg"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={400} fullWidth>
                <button
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full font-medium py-5 rounded-full mt-8 transition-all shadow-lg tracking-widest text-xs uppercase flex items-center justify-center gap-2
                    ${
                      status === 'success'
                        ? 'bg-green-500 text-white cursor-default'
                        : status === 'error'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-brand-dark hover:bg-brand-mint hover:shadow-white/10 active:scale-95'
                    }
                  `}
                >
                  {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                  {status === 'success' && (
                    <>
                      <CheckCircle className="w-5 h-5" /> Отправлено
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <AlertCircle className="w-5 h-5" /> Ошибка. Повторить?
                    </>
                  )}
                  {status === 'idle' && 'Отправить'}
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
