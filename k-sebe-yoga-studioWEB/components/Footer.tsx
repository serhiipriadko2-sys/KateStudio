import { supabase } from '@ksebe/shared';
import { Send, MapPin, Terminal, Phone, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useStudioContacts } from '../hooks/useStudioContacts';
import { Logo } from './Logo';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenLegal?: (type: 'privacy' | 'offer') => void;
}

type SubscribeState = 'idle' | 'loading' | 'success' | 'error' | 'exists';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubscribeState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading' || state === 'success') return;
    setState('loading');
    setErrorMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: email.trim().toLowerCase() },
      });

      if (error) throw error;

      if (data?.success) {
        setState('success');
      } else if (data?.error === 'already_subscribed') {
        setState('exists');
      } else if (data?.error === 'invalid_email') {
        setErrorMsg('Проверьте адрес электронной почты');
        setState('error');
      } else {
        throw new Error('Unexpected response');
      }
    } catch {
      setErrorMsg('Не удалось подписаться. Попробуйте позже.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 text-brand-green">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm">Вы подписались! Ждите вдохновляющих писем ✨</span>
      </div>
    );
  }

  if (state === 'exists') {
    return (
      <div className="flex items-center gap-3 text-white/60">
        <CheckCircle className="w-5 h-5 shrink-0 text-brand-green/60" />
        <span className="text-sm">Этот email уже подписан — спасибо!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ваш@email.ru"
        required
        disabled={state === 'loading'}
        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-green transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={state === 'loading' || !email}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50"
      >
        {state === 'loading' ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Подписаться</span>
      </button>
      {state === 'error' && <p className="absolute mt-11 text-xs text-red-400">{errorMsg}</p>}
    </form>
  );
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenLegal }) => {
  const { data: contacts } = useStudioContacts();

  return (
    <footer
      id="footer"
      className="bg-brand-dark text-white pt-20 pb-10 px-6 rounded-t-[3rem] -mt-10 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Banner */}
        <div className="border border-white/10 rounded-2xl p-6 mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-base font-serif text-white mb-1">Вдохновение на почту</h4>
            <p className="text-sm text-white/50">
              Советы по йоге, расписание и анонсы событий — раз в месяц.
            </p>
          </div>
          <div className="relative flex-shrink-0 sm:min-w-[320px]">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 border-b border-white/10 pb-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Logo className="w-20 h-20 mb-6" color="#fff" />
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Студия йоги Кати Габран.
              <br />
              Гармония тела и души в каждом движении.
            </p>
            <div className="flex gap-4">
              {contacts?.social_vk && (
                <a
                  href={contacts.social_vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VK"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                >
                  <span className="font-bold text-xs">VK</span>
                </a>
              )}
              {contacts?.social_telegram && (
                <a
                  href={contacts.social_telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {contacts?.email && (
                <a
                  href={`mailto:${contacts.email}`}
                  aria-label="Email"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-serif mb-6 text-brand-green">Меню</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  О студии
                </a>
              </li>
              <li>
                <a href="#directions" className="hover:text-white transition-colors">
                  Направления
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-white transition-colors">
                  Расписание
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Цены
                </a>
              </li>
              {/* Ретриты — временно скрыто */}
              {/* Блог — временно скрыто */}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-lg font-serif mb-6 text-brand-green">Контакты</h4>
            <ul className="space-y-4 text-sm text-white/70">
              {contacts?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <a
                    href={contacts.map_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {contacts.address}
                  </a>
                </li>
              )}
              {contacts?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-green shrink-0" />
                  <a href={`tel:${contacts.phone}`} className="hover:text-white">
                    {contacts.phone}
                  </a>
                </li>
              )}
              {contacts?.social_telegram && (
                <li className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-brand-green shrink-0" />
                  <a
                    href={contacts.social_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Telegram
                  </a>
                </li>
              )}
              {contacts?.social_vk && (
                <li className="flex items-center gap-3">
                  {/* Since Lucide doesn't have VK, we use text or a generic icon */}
                  <span className="w-5 h-5 flex items-center justify-center text-brand-green font-bold text-[10px] border border-brand-green rounded-full shrink-0">
                    VK
                  </span>
                  <a
                    href={contacts.social_vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    ВКонтакте
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>© {new Date().getFullYear()} Катя Габран. Все права защищены.</p>
          <div className="flex gap-6 items-center">
            <button
              onClick={() => onOpenLegal?.('privacy')}
              className="hover:text-white/50 transition-colors"
            >
              Политика конфиденциальности
            </button>
            <button
              onClick={() => onOpenLegal?.('offer')}
              className="hover:text-white/50 transition-colors"
            >
              Оферта
            </button>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="opacity-40 hover:opacity-100 active:opacity-100 touch-manipulation transition-opacity flex items-center gap-1 hover:text-white/60 active:text-white/60"
                title="Управление студией"
                aria-label="Открыть панель управления"
              >
                <Terminal className="w-3 h-3" /> Управление
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
