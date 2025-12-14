import { ScrollProgress, BackToTop, CookieBanner, Marquee } from '@ksebe/shared';
import { Menu, X, Instagram, Send } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Contact } from './components/Contact';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Directions } from './components/Directions';
import { FAQ } from './components/FAQ';
import { Philosophy } from './components/Philosophy';
import { FirstVisit } from './components/FirstVisit';
import { Footer } from './components/Footer';
import { Blog } from './components/Blog';
import { AdminPanel } from './components/AdminPanel';
import { Benefits } from './components/Benefits';
import { LegalModals } from './components/LegalModals';
import { BookingModal } from './components/BookingModal';
import { ChatWidget } from './components/ChatWidget';
import { Gallery } from './components/Gallery';
import { Logo } from './components/Logo';
import { Preloader } from './components/Preloader';
import { Pricing } from './components/Pricing';
import { Retreats } from './components/Retreats';
import { Reviews } from './components/Reviews';
import { Schedule } from './components/Schedule';
import { loadTheme, applyTheme } from './services/theme';
import { BookingDetails } from './types';

function App() {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'offer' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const noiseBg = `
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")
  `;

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      <div
        className={`min-h-screen bg-brand-light font-sans selection:bg-brand-green selection:text-white relative flex flex-col transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
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
                'Блог',
                'Отзывы',
                'Контакты',
              ].map((item, i) => (
                <a
                  key={item}
                  href={`#${item === 'Обо мне' ? 'about' : item === 'Направления' ? 'directions' : item === 'Галерея' ? 'gallery' : item === 'Стоимость' ? 'pricing' : item === 'Расписание' ? 'schedule' : item === 'Блог' ? 'blog' : item === 'Отзывы' ? 'reviews' : 'contact'}`}
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
        <Hero onBook={() => openBooking({ type: 'Пробное занятие' })} />
        <Marquee />
        <Benefits />
        <About />
        <Philosophy />
        <Directions onBook={(type) => openBooking({ type })} />
        <FirstVisit onBook={() => openBooking({ type: 'Первый визит (Консультация)' })} />
        <Gallery />
        <Pricing onBook={(plan, price) => openBooking({ type: plan, price })} />
        <Retreats onBook={(type) => openBooking({ type })} />
        <Schedule onBook={(details) => openBooking(details)} />
        <Blog />
        <Reviews />
        <FAQ />
        <Contact />
        <Footer
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenLegal={(type) => setLegalModalType(type)}
        />

        <BackToTop />
        <ChatWidget />
        <CookieBanner />

        {/* Global Booking Modal */}
        <BookingModal
          isOpen={bookingModalData.isOpen}
          onClose={closeBooking}
          details={bookingModalData.details}
        />

        {/* Other Modals */}
        <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        <LegalModals type={legalModalType} onClose={() => setLegalModalType(null)} />
      </div>
    </>
  );
}

export default App;
