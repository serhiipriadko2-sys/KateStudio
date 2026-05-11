import { subscribeNewsletter } from '@ksebe/shared';
import { AtSign, Send, MapPin } from 'lucide-react';
import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onOpenLegal?: (type: 'privacy' | 'offer') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterStatus, setNewsletterStatus] = React.useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [newsletterMessage, setNewsletterMessage] = React.useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterStatus('error');
      setNewsletterMessage('Укажите email.');
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    const result = await subscribeNewsletter({ email });
    if (result.ok) {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setNewsletterMessage(
        result.alreadySubscribed
          ? 'Этот email уже подписан на рассылку.'
          : 'Подписка оформлена. Спасибо!'
      );
      return;
    }

    setNewsletterStatus('error');
    if (result.error === 'invalid_email') {
      setNewsletterMessage('Некорректный email.');
      return;
    }
    if (result.error === 'not_configured') {
      setNewsletterMessage('Сервис рассылки временно недоступен.');
      return;
    }
    if (result.error === 'network_error') {
      setNewsletterMessage('Ошибка сети. Попробуйте позже.');
      return;
    }
    setNewsletterMessage('Не удалось оформить подписку.');
  };

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 px-6 rounded-t-[3rem] -mt-10 relative z-10">
      <div className="max-w-7xl mx-auto">
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
              <a
                href="https://instagram.com/kate_gabran"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
              >
                <AtSign className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/k_sebe_dubna"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
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
              <li>
                <a href="#retreats" className="hover:text-white transition-colors">
                  Ретриты
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  Блог
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-lg font-serif mb-6 text-brand-green">Контакты</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-green shrink-0" />
                <a
                  href="https://yandex.ru/navi/org/k_sebe/7167334007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  г. Дубна, Станционная ул., 5Б
                  <br />
                  <span className="text-white/50">этаж 2</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Send className="w-5 h-5 text-brand-green shrink-0" />
                <a
                  href="https://t.me/k_sebe_dubna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  @k_sebe_dubna
                </a>
              </li>
              <li className="flex items-center gap-3">
                <AtSign className="w-5 h-5 text-brand-green shrink-0" />
                <a
                  href="https://instagram.com/kate_gabran"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  @kate_gabran
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-10 border-b border-white/10 pb-10">
          <div className="max-w-xl">
            <h4 className="text-lg font-serif mb-2 text-brand-green">Подписка на новости</h4>
            <p className="text-sm text-white/60 mb-4">
              Редкие письма о новых классах, ретритах и спецпредложениях.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-green"
                disabled={newsletterStatus === 'loading'}
                required
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-green px-5 py-3 text-sm font-medium text-brand-dark hover:brightness-110 transition-all disabled:opacity-60"
                disabled={newsletterStatus === 'loading'}
              >
                {newsletterStatus === 'loading' ? 'Отправка...' : 'Подписаться'}
              </button>
            </form>
            {newsletterStatus !== 'idle' && newsletterMessage && (
              <p
                className={`mt-3 text-sm ${
                  newsletterStatus === 'success' ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {newsletterMessage}
              </p>
            )}
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
          </div>
        </div>
      </div>
    </footer>
  );
};
