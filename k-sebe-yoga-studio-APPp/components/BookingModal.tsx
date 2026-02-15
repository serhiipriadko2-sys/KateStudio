import {
  AlertCircle,
  ArrowRight,
  CalendarPlus,
  Check,
  Loader2,
  Sparkles,
  X,
  KeyRound,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { ClassSession } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classDetails: ClassSession;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  classDetails,
  onSuccess,
}) => {
  const { user, setUser, authStatus, requestOtp, verifyOtp, authError } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Auto-fill if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user, isOpen]);

  // Lock Body Scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Auth Flow: Request OTP
      if (authStatus === 'anonymous' && !user) {
        if (!name || !phone) {
          setError('Пожалуйста, заполните имя и телефон');
          setIsLoading(false);
          return;
        }
        await requestOtp(name, phone);
        setIsLoading(false);
        return; // Wait for OTP entry
      }

      // 2. Auth Flow: Verify OTP
      if (authStatus === 'otp_sent') {
        if (!otpCode || otpCode.length < 6) {
          setError('Введите 6-значный код из СМС');
          setIsLoading(false);
          return;
        }
        await verifyOtp(otpCode);
        // After verify, authStatus becomes 'authenticated', flow continues automatically or on next click
        // But verifyOtp updates user state, so we can proceed immediately if we want,
        // or let the user click "Book" one more time?
        // Let's try to proceed immediately.
        // We need the updated user object. verifyOtp sets it in context, but React state update might be async.
        // For safety, let's stop here and let the UI re-render with authenticated state,
        // then the user clicks "Book" (which is the same button).
        // Actually, UX is better if we auto-submit.
        // But verifying OTP might not immediately make 'user' available in this closure.
        setIsLoading(false);
        return;
      }

      // 3. Booking Flow (Authenticated)
      if (authStatus === 'authenticated' && user) {
        const success = await dataService.bookClass(classDetails, user);

        if (success) {
          const cached = await dataService.getUser();
          if (cached) setUser(cached);

          setIsSubmitted(true);
          if (onSuccess) onSuccess();
        } else {
          setError('Не удалось записаться. Попробуйте еще раз.');
        }
      }
    } catch (e: unknown /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error(e);
      setError((e as Error).message || 'Ошибка соединения. Проверьте интернет.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    setPhone(val);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 6) val = val.slice(0, 6);
    setOtpCode(val);
  };

  const addToCalendarUrl = () => {
    const title = encodeURIComponent(`Йога: ${classDetails.name}`);
    const details = encodeURIComponent(`Студия "К Себе". ${classDetails.location || ''}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  const isOtpSent = authStatus === 'otp_sent';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-booking-modal-title"
    >
      <div
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {isSubmitted ? (
          <div className="p-12 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            {/* CSS Confetti/Particles */}
            <style>{`
              @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
              }
              .particle {
                 position: absolute;
                 width: 8px; height: 8px;
                 background: var(--brand-green);
                 animation: confetti 1.5s ease-out forwards;
              }
            `}</style>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  top: '20%',
                  left: `${10 + Math.random() * 80}%`,
                  backgroundColor: Math.random() > 0.5 ? '#57a773' : '#fceeb5',
                  animationDelay: `${Math.random() * 0.5}s`,
                  transform: `scale(${0.5 + Math.random()})`,
                }}
              ></div>
            ))}

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="w-20 h-20 bg-brand-mint rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 relative z-10">
              <Check className="w-10 h-10 text-brand-green" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-brand-yellow animate-bounce" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-serif text-brand-text mb-2">Вы записаны!</h3>
              <p className="text-stone-500 leading-relaxed">
                Ждем вас на практике.
                <br />
                Пожалуйста, приходите за 15 минут.
              </p>
            </div>

            <a
              href={addToCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-50 text-stone-600 rounded-xl hover:bg-stone-100 transition-colors font-medium text-sm relative z-10"
            >
              <CalendarPlus className="w-5 h-5" />
              Добавить в Google Календарь
            </a>

            <button
              onClick={onClose}
              className="text-brand-green hover:text-brand-text font-medium text-sm transition-colors relative z-10"
            >
              Вернуться на сайт
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/50 px-3 py-1 rounded-full">
                Бронирование
              </span>
              <h3 id="app-booking-modal-title" className="text-3xl font-serif text-brand-text mt-4">
                {classDetails.name}
              </h3>
              <div className="flex items-center gap-2 text-stone-500 mt-2 text-sm">
                <span>
                  {new Date(classDetails.dateStr).toLocaleDateString('ru', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                <span>{classDetails.time}</span>
                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                <span>{classDetails.price} ₽</span>
              </div>
            </div>

            {(error || authError) && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isOtpSent && (
                <>
                  <div className="space-y-1">
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше имя"
                      disabled={isLoading || !!user}
                      className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 disabled:opacity-70"
                    />
                  </div>

                  <div className="space-y-1">
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="Телефон"
                      disabled={isLoading || !!user}
                      className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 disabled:opacity-70"
                    />
                  </div>
                </>
              )}

              {isOtpSent && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-sm font-medium text-stone-500 ml-1">
                    Код из СМС
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={otpCode}
                      onChange={handleOtpChange}
                      placeholder="000000"
                      disabled={isLoading}
                      className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 text-center text-2xl tracking-widest font-mono"
                    />
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                  </div>
                  <p className="text-xs text-stone-400 text-center">
                    Мы отправили код на {phone}
                  </p>
                </div>
              )}

              {!user && !isOtpSent && (
                <div className="flex items-start gap-3 pt-2 group cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    id="privacy"
                    className="mt-1 w-4 h-4 accent-brand-green cursor-pointer"
                  />
                  <label
                    htmlFor="privacy"
                    className="text-xs text-stone-400 leading-relaxed cursor-pointer group-hover:text-stone-500 transition-colors"
                  >
                    Я подтверждаю, что у меня нет медицинских противопоказаний к занятиям спортом
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-green text-white font-medium py-4 rounded-2xl mt-4 hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isOtpSent
                        ? 'Подтвердить и записаться'
                        : user
                          ? 'Записаться'
                          : 'Получить код'}
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
