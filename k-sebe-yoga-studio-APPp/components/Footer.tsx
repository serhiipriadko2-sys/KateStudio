import { Instagram, Send, MapPin } from 'lucide-react';
import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 px-6 rounded-t-[3rem] -mt-10 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-12">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-start">
            <Logo className="w-20 h-20 mb-6" color="#fff" />
            <p className="text-white/50 text-sm leading-relaxed">
              Студия йоги Кати Габран.
              <br />
              Гармония тела и души в каждом движении.
            </p>
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

          {/* Social */}
          <div>
            <h4 className="text-lg font-serif mb-6 text-brand-green">Мы в соцсетях</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/kate_gabran"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/k_sebe_dubna"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-8 text-xs text-white/30">
              Подпишитесь, чтобы следить за анонсами мероприятий и ретритов.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>© {new Date().getFullYear()} Катя Габран. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/50 transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="hover:text-white/50 transition-colors">
              Оферта
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
