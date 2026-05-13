import {
  analytics,
  isSupabaseConfigured,
  supabase,
  ScrollProgress,
  BackToTop,
  CookieBanner,
  Marquee,
  FAQ,
} from '@ksebe/shared';
import { Menu, X, Send, RefreshCcw, WifiOff } from 'lucide-react';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { About } from './components/About';
import { BookingModal } from './components/BookingModal';
import { Contact } from './components/Contact';
import { Directions } from './components/Directions';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FirstVisit } from './components/FirstVisit';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { InstagramFeed } from './components/InstagramFeed';
import { LegalModalType } from './components/LegalModals';
import { Logo } from './components/Logo';
import { Philosophy } from './components/Philosophy';
import { Preloader } from './components/Preloader';
import { Pricing } from './components/Pricing';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { Reviews } from './components/Reviews';
import { Schedule } from './components/Schedule';
import { SEO } from './components/SEO';
import { TrainersPreview } from './components/TrainersPreview';
import { registerServiceWorker } from './services/serviceWorker';
import { loadTheme, applyTheme, saveTheme, ThemeColors } from './services/theme';
import { BookingDetails } from './types';

const AdminPanel = lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
const LegalModals = lazy(() => import('./components/LegalModals'));
const TrainersPage = lazy(() =>
  import('./components/TrainersPage').then((m) => ({ default: m.TrainersPage }))
);
const TrainerProfilePage = lazy(() =>
  import('./components/TrainerProfilePage').then((m) => ({ default: m.TrainerProfilePage }))
);

function App() {
  useEffect(() => {
    analytics.initWebVitals();
    analytics.pageView(window.location.pathname);
  }, []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(() =>
    window.location.hash.includes('type=recovery')
  );
  const scrollRAF = useRef<number>(0);

  const [bookingModalData, setBookingModalData] = useState<{
    isOpen: boolean;
    details: BookingDetails;
  }>({
    isOpen: false,
    details: { type: '' },
  });

  const openBooking = (details: BookingDetails) => {
    setBookingModalData({ isOpen: true, details });
  };

  const closeBooking = () => {
    setBookingModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const theme = loadTheme();
    applyTheme(theme);

    const syncSettings = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const fetchOptionalSetting = async (key: 'theme' | 'image_map') => {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (error) {
          console.warn(`Failed to sync ${key}`, error);
          return null;
        }

        return data?.value ?? null;
      };

      try {
        const [themeValue, imageMapValue] = await Promise.all([
          fetchOptionalSetting('theme'),
          fetchOptionalSetting('image_map'),
        ]);

        if (themeValue && typeof themeValue === 'object' && !Array.isArray(themeValue)) {
          const nextTheme = themeValue as ThemeColors;
          applyTheme(nextTheme);
          saveTheme(nextTheme);
        }

        if (imageMapValue && typeof imageMapValue === 'object' && !Array.isArray(imageMapValue)) {
          const map = imageMapValue as Record<string, string>;
          Object.entries(map).forEach(([k, v]) => {
            localStorage.setItem(`ksebe-img-${k}`, v);
          });
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.warn('Failed to sync settings', err);
      }
    };

    syncSettings();
  }, []);

  useEffect(() => {
    registerServiceWorker({
      onUpdate: (registration) => {
        setSwRegistration(registration);
        setUpdateAvailable(true);
      },
      onControllerChange: () => {
        window.location.reload();
      },
    });
  }, []);

  useEffect(() => {
    const handleNetworkChange = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    handleNetworkChange();
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRAF.current) return;
      scrollRAF.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        scrollRAF.current = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === 'Y' || e.key === 'y' || e.key === 'H' || e.key === 'h')
      ) {
        e.preventDefault();
        navigate('/admin');
      }
      if (e.key === 'Escape') {
        if (isMenuOpen) setIsMenuOpen(false);
        if (bookingModalData.isOpen) closeBooking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, bookingModalData.isOpen, navigate]);

  useEffect(() => {
    if (isMenuOpen || loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, loading]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleUpdateApp = () => {
    if (!swRegistration?.waiting) return;
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const noiseBg = `
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")
  `;

  const HomePage = () => (
    <>
      <SEO />
      <Hero onBook={() => openBooking({ type: 'Пробное занятие' })} />
      <Marquee />
      <About />
      <Philosophy />
      <Directions onBook={(type) => openBooking({ type })} />
      <FirstVisit onBook={() => openBooking({ type: 'Первый визит (Консультация)' })} />
      <Gallery />
      <Pricing onBook={(plan, price) => openBooking({ type: plan, price })} />
      <TrainersPreview />
      <Schedule onBook={(details) => openBooking(details)} />
      <InstagramFeed />
      <Reviews />
      <FAQ />
      <Contact />
    </>
  );

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      <div
        className={`min-h-screen bg-brand-light font-sans selection:bg-brand-green selection:text-white relative flex flex-col transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Перейти к основному содержимому
        </a>
        <a
          href="#footer"
          className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-4 focus:z-[100] focus:bg-brand-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Перейти к подвалу
        </a>

        <div
          className="fixed inset-0 z-[5] pointer-events-none opacity-[0.05] mix-blend-multiply"
          style={{ backgroundImage: noiseBg }}
        ></div>

        <ScrollProgress />

        <nav
          className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center transition-all duration-500 ease-in-out pointer-events-none
            ${isScrolled ? 'py-3 px-6 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'py-6 px-6 bg-transparent'}
          `}
        >
          <button
            onClick={scrollToTop}
            aria-label="Наверх"
            className={`relative z-50 pointer-events-auto transition-all duration-500 cursor-pointer ${isScrolled ? 'w-10 h-10' : 'w-16 h-16'}`}
          >
            <Logo
              className="w-full h-full drop-shadow-sm transition-colors duration-300"
              color={isScrolled && !isMenuOpen ? '#57a773' : '#fff'}
            />
          </button>

          <div className="flex items-center gap-2 z-50 pointer-events-auto">
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              className={`
                group p-3 rounded-full transition-all shadow-sm hover:shadow-md
                ${
                  isScrolled
                    ? 'bg-stone-100 hover:bg-stone-200 border border-stone-200'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'
                }
              `}
            >
              {isMenuOpen ? (
                <X
                  className={`w-6 h-6 transition-colors ${isScrolled ? 'text-stone-800' : 'text-brand-dark md:text-white'}`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 transition-colors ${isScrolled ? 'text-brand-green' : 'text-white'}`}
                />
              )}
            </button>
          </div>
        </nav>

        {(isOffline || updateAvailable) && (
          <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3 max-w-xs">
            {isOffline && (
              <div className="bg-brand-dark/90 text-white rounded-2xl shadow-lg px-4 py-3 backdrop-blur flex gap-3 items-start">
                <div className="mt-0.5">
                  <WifiOff className="w-5 h-5 text-brand-mint" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Оффлайн-режим</p>
                  <p className="text-white/80">Нет соединения. Страница доступна из кеша.</p>
                </div>
              </div>
            )}
            {updateAvailable && (
              <div className="bg-white rounded-2xl shadow-lg px-4 py-3 border border-brand-mint/40">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5">
                    <RefreshCcw className="w-5 h-5 text-brand-green" />
                  </div>
                  <div className="text-sm text-brand-text">
                    <p className="font-semibold text-brand-dark">Доступно обновление</p>
                    <p className="text-brand-text/70">
                      Обновите приложение, чтобы получить свежую версию.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleUpdateApp}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors"
                  >
                    Обновить
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                  >
                    Позже
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="fixed inset-0 z-[60] bg-[#fcfcfc] flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-5 duration-300"
          >
            <button
              onClick={toggleMenu}
              className="absolute top-8 right-8 p-3 rounded-full hover:bg-stone-100 transition-colors focus:outline-none"
            >
              <X className="w-8 h-8 text-stone-400" />
            </button>

            <nav className="flex flex-col items-center space-y-6 md:space-y-8 text-center">
              {[
                'Обо мне',
                'Направления',
                'Галерея',
                'Стоимость',
                'Расписание',
                'Тренеры',
                'Отзывы',
                'Контакты',
              ].map((item, i) => (
                <a
                  key={item}
                  href={
                    item === 'Тренеры'
                      ? '/trainers'
                      : `#${item === 'Обо мне' ? 'about' : item === 'Направления' ? 'directions' : item === 'Галерея' ? 'gallery' : item === 'Стоимость' ? 'pricing' : item === 'Расписание' ? 'schedule' : item === 'Отзывы' ? 'reviews' : 'contact'}`
                  }
                  onClick={toggleMenu}
                  className="text-3xl md:text-5xl font-serif text-stone-800 hover:text-brand-green hover:scale-105 transition-all duration-300 focus:outline-none focus:text-brand-green"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${i * 0.1}s forwards`,
                    opacity: 0,
                    transform: 'translateY(20px)',
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div
              className="absolute bottom-12 flex gap-6"
              style={{ animation: 'fade-in 0.5s ease-out 0.8s forwards', opacity: 0 }}
            >
              <a
                href="https://t.me/k_sebe_dubna"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="bg-brand-mint/50 p-4 rounded-full hover:bg-brand-mint transition-colors"
              >
                <Send className="w-6 h-6 text-brand-green" />
              </a>
            </div>
            <style>{`@keyframes fade-in-up { to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        <main id="main-content" tabIndex={-1} className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/trainers"
              element={
                <Suspense fallback={null}>
                  <TrainersPage />
                </Suspense>
              }
            />
            <Route
              path="/trainers/:slug"
              element={
                <Suspense fallback={null}>
                  <TrainerProfilePage />
                </Suspense>
              }
            />
          </Routes>
          <Footer onOpenAdmin={() => navigate('/admin')} onOpenLegal={setLegalModalType} />
        </main>

        <BackToTop />
        <CookieBanner />

        <BookingModal
          isOpen={bookingModalData.isOpen}
          onClose={closeBooking}
          details={bookingModalData.details}
        />

        <Routes>
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <AdminPanel isOpen={true} onClose={() => navigate('/')} />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>

        {showResetPassword && <ResetPasswordModal onClose={() => setShowResetPassword(false)} />}

        {legalModalType && (
          <Suspense fallback={null}>
            <LegalModals type={legalModalType} onClose={() => setLegalModalType(null)} />
          </Suspense>
        )}
      </div>
    </>
  );
}

export { App };
