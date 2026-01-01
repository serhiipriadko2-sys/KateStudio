import { ScrollProgress, BackToTop, CookieBanner, Marquee } from '@ksebe/shared';
import { Menu, X, Instagram, Send, RefreshCcw, WifiOff } from 'lucide-react';
import React, { useState, useEffect, Suspense } from 'react';
import { Hero } from './components/Hero';
import { Logo } from './components/Logo';
import { Preloader } from './components/Preloader';
// Retreats component available from './components/Retreats' when needed
import { registerServiceWorker } from './services/serviceWorker';
import { loadTheme, applyTheme } from './services/theme';
import { BookingDetails } from './types';

const About = React.lazy(() =>
  import('./components/About').then((module) => ({ default: module.About }))
);
const AdminPanel = React.lazy(() =>
  import('./components/AdminPanel').then((module) => ({ default: module.AdminPanel }))
);
const Benefits = React.lazy(() =>
  import('./components/Benefits').then((module) => ({ default: module.Benefits }))
);
const BookingModal = React.lazy(() =>
  import('./components/BookingModal').then((module) => ({ default: module.BookingModal }))
);
const ChatWidget = React.lazy(() =>
  import('./components/ChatWidget').then((module) => ({ default: module.ChatWidget }))
);
const Contact = React.lazy(() =>
  import('./components/Contact').then((module) => ({ default: module.Contact }))
);
const Directions = React.lazy(() =>
  import('./components/Directions').then((module) => ({ default: module.Directions }))
);
const FAQ = React.lazy(() =>
  import('./components/FAQ').then((module) => ({ default: module.FAQ }))
);
const FirstVisit = React.lazy(() =>
  import('./components/FirstVisit').then((module) => ({ default: module.FirstVisit }))
);
const Footer = React.lazy(() =>
  import('./components/Footer').then((module) => ({ default: module.Footer }))
);
const Gallery = React.lazy(() =>
  import('./components/Gallery').then((module) => ({ default: module.Gallery }))
);
const InstagramFeed = React.lazy(() =>
  import('./components/InstagramFeed').then((module) => ({ default: module.InstagramFeed }))
);
const LegalModals = React.lazy(() =>
  import('./components/LegalModals').then((module) => ({ default: module.LegalModals }))
);
const Philosophy = React.lazy(() =>
  import('./components/Philosophy').then((module) => ({ default: module.Philosophy }))
);
const Pricing = React.lazy(() =>
  import('./components/Pricing').then((module) => ({ default: module.Pricing }))
);
const Reviews = React.lazy(() =>
  import('./components/Reviews').then((module) => ({ default: module.Reviews }))
);
const Schedule = React.lazy(() =>
  import('./components/Schedule').then((module) => ({ default: module.Schedule }))
);

const SectionFallback = ({ className }: { className?: string }) => (
  <div className={className ?? 'py-16'} aria-hidden="true" />
);

function App() {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'offer' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [waitingForRefresh, setWaitingForRefresh] = useState(false);

  // Global Booking State
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

  // Initialize Theme
  useEffect(() => {
    const theme = loadTheme();
    applyTheme(theme);
  }, []);

  // Service Worker registration for offline/update support
  useEffect(() => {
    registerServiceWorker({
      onUpdate: (registration) => {
        setSwRegistration(registration);
        setUpdateAvailable(true);
      },
    });
  }, []);

  useEffect(() => {
    if (!waitingForRefresh) return;
    const handleControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [waitingForRefresh]);

  // Online/offline listener
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

  // Scroll Listener for Smart Header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut to toggle Admin Panel (Ctrl + Shift + Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === 'Y' || e.key === 'y' || e.key === 'H' || e.key === 'h')
      ) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isMenuOpen) setIsMenuOpen(false);
        if (bookingModalData.isOpen) closeBooking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, bookingModalData.isOpen]);

  // Lock body scroll when menu is open or loading
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
    setWaitingForRefresh(true);
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const noiseBg = `
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")
  `;

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      <div
        className={`min-h-screen bg-brand-light font-sans selection:bg-brand-green selection:text-white relative flex flex-col transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Skip Links for Accessibility */}
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

        {/* Texture Overlay */}
        <div
          className="fixed inset-0 z-[5] pointer-events-none opacity-[0.05] mix-blend-multiply"
          style={{ backgroundImage: noiseBg }}
        ></div>

        <ScrollProgress />

        {/* --- Smart Glass Navigation Bar --- */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center transition-all duration-500 ease-in-out pointer-events-none
            ${isScrolled ? 'py-3 px-6 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'py-6 px-6 bg-transparent'}
          `}
        >
          <div
            onClick={scrollToTop}
            className={`relative z-50 pointer-events-auto transition-all duration-500 cursor-pointer ${isScrolled ? 'w-10 h-10' : 'w-16 h-16'}`}
            title="Наверх"
          >
            <Logo
              className="w-full h-full drop-shadow-sm transition-colors duration-300"
              color={isScrolled && !isMenuOpen ? '#57a773' : '#fff'}
            />
          </div>

          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className={`
              group p-3 rounded-full transition-all z-50 pointer-events-auto shadow-sm hover:shadow-md
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

        {/* --- Full Screen Menu Overlay --- */}
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
                'Instagram',
                'Отзывы',
                'Контакты',
              ].map((item, i) => (
                <a
                  key={item}
                  href={`#${item === 'Обо мне' ? 'about' : item === 'Направления' ? 'directions' : item === 'Галерея' ? 'gallery' : item === 'Стоимость' ? 'pricing' : item === 'Расписание' ? 'schedule' : item === 'Instagram' ? 'instagram' : item === 'Отзывы' ? 'reviews' : 'contact'}`}
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
                href="#"
                className="bg-brand-mint/50 p-4 rounded-full hover:bg-brand-mint transition-colors"
              >
                <Instagram className="w-6 h-6 text-brand-green" />
              </a>
              <a
                href="#"
                className="bg-brand-mint/50 p-4 rounded-full hover:bg-brand-mint transition-colors"
              >
                <Send className="w-6 h-6 text-brand-green" />
              </a>
            </div>
            <style>{`@keyframes fade-in-up { to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        {/* Main Content Flow */}
        <main id="main-content" tabIndex={-1} className="flex-1">
          <Hero onBook={() => openBooking({ type: 'Пробное занятие' })} />
          <Marquee />
          <Suspense fallback={<SectionFallback />}>
            <Benefits />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <About />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Philosophy />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Directions onBook={(type) => openBooking({ type })} />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <FirstVisit onBook={() => openBooking({ type: 'Первый визит (Консультация)' })} />
          </Suspense>
          <Suspense fallback={<SectionFallback className="py-20" />}>
            <Gallery />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Pricing onBook={(plan, price) => openBooking({ type: plan, price })} />
          </Suspense>
          {/* Retreats temporarily hidden - no upcoming retreat info */}
          {/* <Retreats onBook={(type) => openBooking({ type })} /> */}
          <Suspense fallback={<SectionFallback />}>
            <Schedule onBook={(details) => openBooking(details)} />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <InstagramFeed />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Reviews />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <FAQ />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Contact />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <Footer
              onOpenAdmin={() => setIsAdminOpen(true)}
              onOpenLegal={(type) => setLegalModalType(type)}
            />
          </Suspense>
        </main>

        <BackToTop />
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <CookieBanner />

        {/* Global Booking Modal */}
        {bookingModalData.isOpen && (
          <Suspense fallback={null}>
            <BookingModal
              isOpen={bookingModalData.isOpen}
              onClose={closeBooking}
              details={bookingModalData.details}
            />
          </Suspense>
        )}

        {/* Other Modals */}
        {isAdminOpen && (
          <Suspense fallback={null}>
            <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
          </Suspense>
        )}
        {legalModalType && (
          <Suspense fallback={null}>
            <LegalModals type={legalModalType} onClose={() => setLegalModalType(null)} />
          </Suspense>
        )}
      </div>
    </>
  );
}

export default App;
