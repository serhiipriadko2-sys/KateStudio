import { FadeIn } from '@ksebe/shared';
import {
  Home,
  Calendar,
  Sparkles,
  MapPin,
  User,
  Bell,
  Search,
  Zap,
  Moon,
  Heart,
  Activity,
  ChevronRight,
  X,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { About } from './components/About';
import { AICoach } from './components/AICoach';
import { Directions } from './components/Directions';
import { Contact } from './components/Contact';
import { ChatWidget } from './components/ChatWidget';
import { Dashboard } from './components/Dashboard';
import { Gallery } from './components/Gallery';
import { Image } from './components/Image';
import { Logo } from './components/Logo';
import { Philosophy } from './components/Philosophy';
import { Pricing } from './components/Pricing';
import { Retreats } from './components/Retreats';
import { Reviews } from './components/Reviews';
import { Schedule } from './components/Schedule';
import { VideoLibrary } from './components/VideoLibrary';
import { useAuth } from './context/AuthContext';

type Tab = 'home' | 'schedule' | 'ai' | 'studio' | 'profile';

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isSparking, setIsSparking] = useState(false);
  const [isIgnited, setIsIgnited] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [shake, setShake] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rewindRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleteRef = useRef(false);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rewindRef.current) clearInterval(rewindRef.current);
      if (shakeRef.current) clearInterval(shakeRef.current);
    };
  }, []);

  const startShake = () => {
    if (shakeRef.current) clearInterval(shakeRef.current);
    shakeRef.current = setInterval(() => {
      setShake(Math.random() * 2 - 1);
    }, 50);
  };

  const stopShake = () => {
    if (shakeRef.current) clearInterval(shakeRef.current);
    setShake(0);
  };

  const startPress = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isCompleteRef.current) return;
    if (rewindRef.current) {
      clearInterval(rewindRef.current);
      rewindRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSparking(true);
    startShake();

    let current = progress;
    timerRef.current = setInterval(() => {
      current += 1.0;
      if (current > 70) current += 0.5;

      if (current >= 100) {
        current = 100;
        if (timerRef.current) clearInterval(timerRef.current);
        handleSuccess();
      }
      setProgress(current);
    }, 16);
  };

  const endPress = () => {
    if (isCompleteRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSparking(false);
    stopShake();

    if (progress > 0) {
      if (rewindRef.current) clearInterval(rewindRef.current);
      rewindRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev - 3;
          if (next <= 0) {
            if (rewindRef.current) clearInterval(rewindRef.current);
            return 0;
          }
          return next;
        });
      }, 10);
    }
  };

  const handleSuccess = () => {
    isCompleteRef.current = true;
    setIsSparking(false);
    stopShake();
    setIsIgnited(true);
    setTimeout(() => {
      setShowWelcome(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0F2820] flex flex-col items-center justify-center select-none touch-none transition-opacity duration-1000 ${showWelcome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={`relative transition-transform duration-[1500ms] ease-out ${showWelcome ? 'scale-125' : 'scale-100'}`}
        style={{ transform: `translate(${shake}px, ${shake}px) scale(${showWelcome ? 1.2 : 1})` }}
      >
        <div className="relative z-10">
          <Logo
            className="w-80 h-auto md:w-96"
            progress={progress}
            isSparking={isSparking}
            isIgnited={isIgnited}
            variant="full"
          />
        </div>

        {isSparking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-75"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-24 left-0 right-0 text-center pointer-events-none px-4 h-16 transition-opacity duration-500 ${isIgnited ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className={`transition-opacity duration-300 ${progress > 5 ? 'opacity-100' : 'opacity-40'}`}
        >
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-brand-mint/50 font-medium animate-pulse">
            {progress > 0 ? 'Заряжаем...' : 'Удерживайте'}
          </p>
        </div>
      </div>

      {!isIgnited && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-[#FCEEAC] transition-all duration-75 ease-linear shadow-[0_0_20px_#FCEEAC]"
          style={{ width: `${progress}%` }}
        ></div>
      )}
    </div>
  );
};

export default function App() {
  const [introFinished, setIntroFinished] = useState(() => {
    return localStorage.getItem('ksebe_intro_complete') === 'true';
  });
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('ksebe_theme_config');
      if (savedTheme) {
        const colors = JSON.parse(savedTheme);
        Object.entries(colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, String(value));
        });
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 20);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleIntroComplete = () => {
    localStorage.setItem('ksebe_intro_complete', 'true');
    setIntroFinished(true);
  };

  if (!introFinished) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  if (activeTab === 'profile') {
    return <Dashboard initialTab="profile" onBack={() => handleTabChange('home')} />;
  }

  return (
    <div
      className="flex flex-col h-[100dvh] bg-[#FDFBF7] text-brand-text overflow-hidden relative selection:bg-brand-green selection:text-white animate-in fade-in duration-1000"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header
        className={`absolute top-0 left-0 right-0 z-30 pt-safe px-6 pb-4 transition-all duration-300 flex justify-between items-center pointer-events-none ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden p-2">
            <Logo className="w-full h-full" color="#fff" variant="symbol" />
          </div>
          <span
            className={`font-serif text-lg font-medium transition-opacity duration-300 ${scrolled ? 'opacity-100 text-brand-text' : 'opacity-0'}`}
          >
            К себе
          </span>
        </div>
        <div className="pointer-events-auto flex gap-3">
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-stone-100 flex items-center justify-center text-stone-600 hover:text-brand-green shadow-sm active:scale-95 transition-all">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-stone-100 flex items-center justify-center text-stone-600 hover:text-brand-green shadow-sm active:scale-95 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative pb-24"
        onScroll={handleScroll}
      >
        {activeTab === 'home' && <HomeView setActiveTab={handleTabChange} />}

        {activeTab === 'schedule' && (
          <div className="pt-20 view-transition">
            <Schedule />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="pt-24 px-4 h-full flex flex-col view-transition">
            <AICoach />
          </div>
        )}

        {activeTab === 'studio' && <StudioView />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200/50 pb-safe z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-end h-16 px-2">
          <NavButton
            active={activeTab === 'home'}
            onClick={() => handleTabChange('home')}
            icon={<Home />}
            label="Главная"
          />
          <NavButton
            active={activeTab === 'schedule'}
            onClick={() => handleTabChange('schedule')}
            icon={<Calendar />}
            label="Расписание"
          />

          <div className="relative -top-6">
            <button
              onClick={() => handleTabChange('ai')}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 ${activeTab === 'ai' ? 'bg-brand-dark scale-110 text-brand-yellow' : 'bg-brand-green text-white hover:scale-105'}`}
            >
              <Sparkles className={`w-8 h-8 ${activeTab === 'ai' ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <NavButton
            active={activeTab === 'studio'}
            onClick={() => handleTabChange('studio')}
            icon={<MapPin />}
            label="Студия"
          />
          <NavButton
            active={false}
            onClick={() => handleTabChange('profile')}
            icon={<User />}
            label="Профиль"
          />
        </div>
      </nav>

      <ChatWidget hidden={activeTab === 'ai'} />
    </div>
  );
}

const NavButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 ${active ? 'text-brand-green' : 'text-stone-400 hover:text-stone-600'}`}
  >
    <div className={`transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
      {React.cloneElement(
        icon as React.ReactElement,
        { size: 24, strokeWidth: active ? 2.5 : 2 } as any
      )}
    </div>
    <span
      className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 hidden'}`}
    >
      {label}
    </span>
  </button>
);

const HomeView = ({ setActiveTab }: { setActiveTab: (t: Tab) => void }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const toggleMood = (mood: string) => {
    setSelectedMood((prev) => (prev === mood ? null : mood));
  };

  // Ambient Color Logic
  const getAmbientColor = () => {
    switch (selectedMood) {
      case 'Энергия':
        return 'bg-amber-400/10';
      case 'Покой':
        return 'bg-indigo-400/10';
      case 'Здоровье':
        return 'bg-rose-400/10';
      case 'Сила':
        return 'bg-emerald-400/10';
      default:
        return 'bg-transparent';
    }
  };

  return (
    <div className="view-transition relative">
      {/* Ambient Mood Overlay */}
      <div
        className={`fixed inset-0 pointer-events-none transition-colors duration-1000 z-0 ${getAmbientColor()}`}
      ></div>

      <div className="relative z-10">
        <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
          <Image
            src="/hero.jpg"
            fallbackSrc="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1920&auto=format&fit=crop"
            alt="Yoga"
            storageKey="hero-main-bg-v4"
            showControlsLabel={true}
            containerClassName="absolute inset-0 w-full h-full"
            className="w-full h-full object-cover brightness-[0.85]"
            controlsClassName="top-24 right-4 z-40"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2820]/90 via-transparent to-black/20 pointer-events-none"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80 animate-in fade-in slide-in-from-bottom-2">
                Доброе утро
              </h3>
              <h1 className="text-5xl font-serif mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 delay-100">
                Время
                <br />
                выбрать себя
              </h1>
              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-6 delay-200">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="flex-1 bg-white text-brand-dark py-4 rounded-2xl font-bold uppercase text-xs tracking-wider hover:bg-brand-mint transition-colors shadow-lg"
                >
                  Расписание
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-6">
          <div className="px-6 mb-2 flex justify-between items-end">
            <h2 className="text-2xl font-serif text-brand-text">Состояние</h2>
            {selectedMood && (
              <button
                onClick={() => setSelectedMood(null)}
                className="text-xs text-stone-400 flex items-center gap-1 hover:text-rose-500 transition-colors"
              >
                <X className="w-3 h-3" /> Сбросить
              </button>
            )}
          </div>
          <p className="px-6 text-sm text-stone-400 font-light mb-6 max-w-sm leading-relaxed">
            Прислушайтесь к телу. Выберите, чего вам хочется прямо сейчас.
          </p>
          <div className="flex overflow-x-auto px-6 gap-4 pb-8 scrollbar-hide snap-x">
            {[
              {
                icon: <Zap />,
                title: 'Энергия',
                color: 'bg-amber-100 text-amber-600',
                activeColor:
                  'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-200',
              },
              {
                icon: <Moon />,
                title: 'Покой',
                color: 'bg-indigo-100 text-indigo-600',
                activeColor:
                  'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-200',
              },
              {
                icon: <Heart />,
                title: 'Здоровье',
                color: 'bg-rose-100 text-rose-600',
                activeColor:
                  'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-200',
              },
              {
                icon: <Activity />,
                title: 'Сила',
                color: 'bg-emerald-100 text-emerald-600',
                activeColor:
                  'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-200',
              },
            ].map((item, i) => {
              const isActive = selectedMood === item.title;
              return (
                <div
                  key={i}
                  onClick={() => toggleMood(item.title)}
                  className="snap-center shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`
                      w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2
                      transition-all duration-300 transform
                      ${isActive ? `${item.activeColor} scale-110 border-transparent rotate-3` : `${item.color} border-white group-hover:scale-105 group-hover:-rotate-3`}
                   `}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<any>, {
                      className: `w-7 h-7 transition-colors ${isActive ? 'text-white' : ''}`,
                    })}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-text font-bold' : 'text-stone-500'}`}
                  >
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Philosophy Section including Breathing Animation */}
        <Philosophy />

        <div className="px-4 mb-8 mt-12">
          <div className="bg-[#1a1a1a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl group">
            <div
              onClick={() => setActiveTab('studio')}
              className="absolute inset-0 z-0 cursor-pointer"
            ></div>

            <div className="relative z-10 pointer-events-none">
              <span className="px-3 py-1 bg-brand-green rounded-full text-[10px] font-bold uppercase mb-4 inline-block">
                Новое
              </span>
              <h3 className="text-3xl font-serif mb-2">Inside Flow</h3>
              <p className="text-white/60 text-sm mb-6 max-w-[200px]">
                Танцуй своим дыханием под современную музыку.
              </p>
              <div
                onClick={() => setActiveTab('studio')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-green pointer-events-auto cursor-pointer"
              >
                Подробнее <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="absolute top-0 right-0 w-1/2 h-full opacity-50 z-10 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=400&fit=crop"
                storageKey="home-studio-promo"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover mask-linear"
                alt="Flow"
                showControlsLabel={true}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1a1a1a] pointer-events-none"></div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <h2 className="text-2xl font-serif text-brand-text mb-4 px-2">
            {selectedMood ? 'Рекомендуемые практики' : 'Популярные практики'}
          </h2>
          <VideoLibrary selectedMood={selectedMood} />
        </div>
      </div>
    </div>
  );
};

const StudioView = () => (
  <div className="view-transition">
    <div className="pt-24 px-6 mb-8">
      <h1 className="text-4xl font-serif text-brand-text mb-2">Пространство</h1>
      <p className="text-stone-400">Где живет тишина.</p>
    </div>
    <About />
    <Directions />
    <Pricing />
    <Retreats />
    <Gallery />
    <Reviews />
    <div className="px-4 pb-8">
      <Contact />
    </div>
  </div>
);
