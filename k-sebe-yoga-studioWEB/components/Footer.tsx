import { Instagram, Send, MapPin, Terminal, ArrowRight, Check } from 'lucide-react';
import React, { useState } from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenLegal?: (type: 'privacy' | 'offer') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenLegal }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000); // Reset after 3s
    }
  };

  return (
    <footer
      id="footer"
      className="bg-brand-dark text-white pt-20 pb-10 px-6 rounded-t-[3rem] -mt-10 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-12">
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
                <Instagram className="w-5 h-5" />
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
                <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
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
                <Instagram className="w-5 h-5 text-brand-green shrink-0" />
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

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-serif mb-6 text-brand-green">Новости</h4>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Узнавайте первыми о новых ретритах, мастер-классах и изменениях в расписании.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-brand-green focus:bg-white/10 transition-all placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="absolute right-2 top-2 p-1.5 bg-brand-green rounded-lg text-white hover:bg-white hover:text-brand-green transition-colors disabled:bg-emerald-500 disabled:text-white"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 animate-in fade-in">
                Вы успешно подписались!
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
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="opacity-20 hover:opacity-100 transition-opacity flex items-center gap-1"
                title="Dev Settings"
                aria-label="Open Developer Settings"
              >
                <Terminal className="w-3 h-3" /> Dev
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
