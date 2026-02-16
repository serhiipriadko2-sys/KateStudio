import { IMAGES } from '@ksebe/shared';
import {
  Activity,
  Calendar,
  ChevronRight,
  Heart,
  Moon,
  QrCode,
  Sparkles,
  User,
  Video,
  X,
  Zap,
} from 'lucide-react';
import React, { Suspense, useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { About } from './components/About';
import { AICoach } from './components/AICoach';
import { BackToTop } from './components/BackToTop';
import { Breathwork } from './components/Breathwork';
import { Contact } from './components/Contact';
import { CookieBanner } from './components/CookieBanner';
import { Dashboard } from './components/Dashboard';
import { Directions } from './components/Directions';
import { Footer } from './components/Footer';
import { Image } from './components/Image';
import { LegalModals } from './components/LegalModals';
import { LoadingFallback } from './components/LoadingFallback';
import { Philosophy } from './components/Philosophy';
import { Pricing } from './components/Pricing';
import { Retreats } from './components/Retreats';
import { Reviews } from './components/Reviews';
import { Schedule } from './components/Schedule';
import { ScrollProgress } from './components/ScrollProgress';
import { StreakCard } from './components/StreakCard';
import { WeeklyRecapCard } from './components/WeeklyRecapCard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Lazy load heavy components
const Gallery = React.lazy(() =>
  import('./components/Gallery').then((module) => ({ default: module.Gallery }))
);
const VideoLibrary = React.lazy(() =>
  import('./components/VideoLibrary').then((module) => ({ default: module.VideoLibrary }))
);

type Tab = 'home' | 'schedule' | 'ai' | 'studio' | 'profile' | 'videos' | 'breath' | 'dev';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Load app settings from localStorage (synced from DB in main entry logic if needed)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }, []);

  // Sync theme color
  useEffect(() => {
    if (settings.themeColor) {
      document.documentElement.style.setProperty('--brand-green', settings.themeColor);
    }
  }, [settings.themeColor]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView setActiveTab={setActiveTab} />;
      case 'schedule':
        return (
          <div className="view-transition px-4 pt-24 pb-24">
            <h2 className="text-3xl font-serif text-brand-text mb-6">Расписание</h2>
            <Schedule />
          </div>
        );
      case 'ai':
        return (
          <div className="view-transition pt-10 pb-24 h-[100dvh]">
            <AICoach />
          </div>
        );
      case 'videos':
        return (
          <div className="view-transition px-4 pt-24 pb-24">
            <h2 className="text-3xl font-serif text-brand-text mb-6">Видеотека</h2>
            <Suspense fallback={<LoadingFallback />}>
              <VideoLibrary />
            </Suspense>
          </div>
        );
      case 'breath':
        return (
          <div className="view-transition pt-24 pb-24 h-[100dvh] bg-stone-50">
            <Breathwork />
          </div>
        );
      case 'profile':
      case 'dev':
        return (
          <div className="view-transition pt-24 pb-24">
            <Dashboard onBack={() => setActiveTab('home')} initialTab={activeTab === 'dev' ? 'dev' : 'overview'} />
          </div>
        );
      case 'studio':
        return <StudioView />;
      default:
        return <HomeView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-brand-green/20 selection:text-brand-dark overflow-x-hidden">
      <ScrollProgress />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="min-h-screen relative">{renderContent()}</main>
      <CookieBanner />
      <BackToTop />
    </div>
  );
};

const Header = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 overflow-hidden rounded-full border border-current transition-colors">
            <Image
              src={IMAGES.brand.logo}
              alt="Logo"
              className="w-full h-full object-cover"
              fallbackSrc="/logo.png"
            />
          </div>
          <span className="font-serif text-lg tracking-wide group-hover:opacity-80 transition-opacity">
            К СЕБЕ
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
            Расписание
          </NavButton>
          <NavButton active={activeTab === 'studio'} onClick={() => setActiveTab('studio')}>
            Студия
          </NavButton>
          <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
            AI Coach
          </NavButton>
          <button
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <User className="w-5 h-5 text-stone-600" />
          </button>
        </nav>

        {/* Mobile Profile Icon (Top Right) */}
        <button
          onClick={() => setActiveTab('profile')}
          className="md:hidden w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-black/5 flex items-center justify-center"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

const NavButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`text-sm font-medium tracking-wide transition-colors hover:text-brand-green ${active ? 'text-brand-green' : 'text-stone-600'}`}
  >
    {children}
  </button>
);

const navItems = [
  { id: 'home' as Tab, icon: <Sparkles size={20} />, label: 'Главная' },
  { id: 'schedule' as Tab, icon: <Calendar size={20} />, label: 'Расписание' },
  { id: 'ai' as Tab, icon: <Activity size={20} />, label: 'AI Coach' },
  { id: 'videos' as Tab, icon: <Video size={20} />, label: 'Видео' },
];

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
            fallbackSrc={IMAGES.hero.mainBg}
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

        <StreakCard onOpenRecommended={() => setActiveTab('ai')} />
        <WeeklyRecapCard />

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
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`${item.title} настроение`}
                  onClick={() => toggleMood(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleMood(item.title);
                    }
                  }}
                  className="snap-center shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`
                      w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2
                      transition-all duration-300 transform
                      ${isActive ? `${item.activeColor} scale-110 border-transparent rotate-3` : `${item.color} border-white group-hover:scale-105 group-hover:-rotate-3`}
                   `}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
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
          <div
            role="button"
            tabIndex={0}
            aria-label="Узнать больше о Inside Flow"
            onClick={() => setActiveTab('studio')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('studio');
              }
            }}
            className="bg-[#1a1a1a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl group cursor-pointer"
          >
            <div className="relative z-10">
              <span className="px-3 py-1 bg-brand-green rounded-full text-[10px] font-bold uppercase mb-4 inline-block">
                Новое
              </span>
              <h3 className="text-3xl font-serif mb-2">Inside Flow</h3>
              <p className="text-white/60 text-sm mb-6 max-w-[200px]">
                Танцуй своим дыханием под современную музыку.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-green">
                Подробнее <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="absolute top-0 right-0 w-1/2 h-full opacity-50 z-10 pointer-events-none">
              <Image
                src={IMAGES.studio[6]}
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
          <Suspense fallback={<LoadingFallback />}>
            <VideoLibrary selectedMood={selectedMood} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const StudioView: React.FC = () => {
  const [legalOpen, setLegalOpen] = useState<'privacy' | 'offer' | null>(null);

  return (
    <div className="view-transition">
      <div className="pt-24 px-6 mb-8">
        <h1 className="text-4xl font-serif text-brand-text mb-2">Пространство</h1>
        <p className="text-stone-400">Где живет тишина.</p>
      </div>
      <About />
      <Directions />
      <Pricing />
      <Retreats />
      <Suspense fallback={<LoadingFallback />}>
        <Gallery />
      </Suspense>
      <Reviews />
      <div className="px-4 pb-8">
        <Contact />
      </div>
      <Footer onOpenLegal={(t) => setLegalOpen(t)} />
      <LegalModals type={legalOpen} onClose={() => setLegalOpen(null)} />
    </div>
  );
};

// Root Render
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
