import { Instagram, Send, MapPin, Terminal, Phone, Mail } from 'lucide-react';
import React from 'react';
import { useStudioContacts } from '../hooks/useStudioContacts';
import { Logo } from './Logo';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenLegal?: (type: 'privacy' | 'offer') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenLegal }) => {
  const { data: contacts } = useStudioContacts();

  return (
    <footer
      id="footer"
      className="bg-brand-dark text-white pt-20 pb-10 px-6 rounded-t-[3rem] -mt-10 relative z-10"
    >
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
              {contacts?.social_instagram && (
                <a
                  href={contacts.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                >
                  <Instagram className="w-4 h-4" />
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
              {contacts?.social_instagram && (
                <li className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-brand-green shrink-0" />
                  <a
                    href={contacts.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Instagram
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
