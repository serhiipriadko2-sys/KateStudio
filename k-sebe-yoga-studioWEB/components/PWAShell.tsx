/**
 * PWA Shell - App-like wrapper for PWA mode
 * Shows bottom navigation and app-like UX when installed as PWA
 */
import { Home, Calendar, MessageCircle, MapPin, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

type Tab = 'home' | 'schedule' | 'chat' | 'studio' | 'profile';

interface PWAShellProps {
  children: React.ReactNode;
}

const tabs: { id: Tab; icon: React.ElementType; label: string; href: string }[] = [
  { id: 'home', icon: Home, label: 'Главная', href: '#hero' },
  { id: 'schedule', icon: Calendar, label: 'Расписание', href: '#schedule' },
  { id: 'chat', icon: MessageCircle, label: 'Чат', href: '#contact' },
  { id: 'studio', icon: MapPin, label: 'Студия', href: '#about' },
  { id: 'profile', icon: User, label: 'Профиль', href: '#pricing' },
];

export const PWAShell: React.FC<PWAShellProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tab: Tab, href: string) => {
    setActiveTab(tab);

    // Special handling for chat tab - open chat widget
    if (tab === 'chat') {
      window.dispatchEvent(new CustomEvent('ksebe-open-chat'));
      return;
    }

    // Scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* App Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="flex items-center justify-between px-4">
          <div className="w-10 h-10">
            <Logo className="w-full h-full" color={isScrolled ? '#57a773' : '#fff'} />
          </div>
          <h1
            className={`text-lg font-serif transition-colors ${
              isScrolled ? 'text-brand-text' : 'text-white'
            }`}
          >
            К себе
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-0">
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-100 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {tabs.map(({ id, icon: Icon, label, href }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id, href)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-green scale-105'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive ? 'bg-brand-green/10' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Safe area for bottom navigation */}
      <style>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
};
