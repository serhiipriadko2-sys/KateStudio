import { Mail, MapPin, Phone, Send, Navigation, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useStudioContacts } from '../hooks/useStudioContacts';
import { supabase } from '../services/supabase';
import { FadeIn } from './FadeIn';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { data: contacts } = useStudioContacts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setStatus('loading');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase.from('contacts').insert([
        {
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
          status: 'new',
        },
      ]);

      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const mapUrl = contacts?.map_url || "https://yandex.ru/map-widget/v1/?ll=37.121500%2C56.742200&mode=search&oid=7167334007&ol=biz&z=17";

  return (
    <section id="contacts" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-brand-green uppercase tracking-widest text-xs font-bold mb-3 block">
              Связь
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
              Напишите нам
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto leading-relaxed">
              Мы всегда рады ответить на ваши вопросы и помочь выбрать подходящее направление.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Form */}
          <div className="relative">
            <div className="absolute -inset-4 bg-stone-50 rounded-[2rem] -z-10 transform rotate-1"></div>
            <FadeIn delay={0.1} className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-stone-100 relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-brand-green/30 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-stone-300"
                    placeholder="Как к вам обращаться?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-brand-green/30 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-stone-300"
                    placeholder="+7 (999) 000-00-00"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-brand-green/30 rounded-xl px-4 py-3 outline-none transition-all resize-none placeholder:text-stone-300"
                    placeholder="Ваш вопрос или пожелание..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    status === 'success'
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-brand-dark text-white hover:bg-brand-green hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {status === 'loading' ? (
                    'Отправка...'
                  ) : status === 'success' ? (
                    'Отправлено!'
                  ) : (
                    <>
                      Отправить <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-center text-rose-500 text-sm">Ошибка отправки. Попробуйте позже.</p>
                )}
              </form>
            </FadeIn>

            {/* Contact Links */}
            <div className="mt-10 space-y-4">
              <FadeIn delay={0.2}>
                <p className="text-center text-stone-400 text-sm mb-6">Или свяжитесь напрямую:</p>
                <div className="flex flex-wrap justify-center gap-4">
                   {contacts?.phone && (
                    <a
                      href={`tel:${contacts.phone}`}
                      className="flex items-center gap-3 text-stone-600 hover:text-brand-green transition-colors group bg-white border border-stone-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-brand-green/20 transition-colors text-stone-400 group-hover:text-brand-green">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{contacts.phone}</span>
                    </a>
                   )}

                   {contacts?.social_telegram && (
                    <a
                      href={contacts.social_telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-stone-600 hover:text-brand-green transition-colors group bg-white border border-stone-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-brand-green/20 transition-colors text-stone-400 group-hover:text-brand-green">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">Telegram</span>
                    </a>
                   )}

                   {contacts?.email && (
                    <a
                      href={`mailto:${contacts.email}`}
                      className="flex items-center gap-3 text-stone-600 hover:text-brand-green transition-colors group bg-white border border-stone-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-brand-green/20 transition-colors text-stone-400 group-hover:text-brand-green">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{contacts.email}</span>
                    </a>
                   )}
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Map & Info */}
          <div className="flex flex-col gap-6 h-full">
            {/* Map Card */}
            <div className="flex-1 bg-stone-100 rounded-[2rem] overflow-hidden relative group min-h-[400px] lg:h-full">
              <FadeIn className="h-full w-full absolute inset-0">
                {/* iframe */}
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Карта студии"
                  loading="lazy"
                />

                {/* Info Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <div
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-brand-green" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-0.5">
                            Студия К Себе
                          </p>
                          <p className="text-brand-text font-medium text-sm md:text-base leading-tight">
                            {contacts?.address || "г. Дубна, ул. Станционная 5Б"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={mapUrl} // Or a direct link to Yandex Maps if possible, but mapUrl is embed
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all shadow-md shrink-0"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
