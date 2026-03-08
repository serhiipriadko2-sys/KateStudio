import { Loader2, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

type Step = 'phone' | 'otp';

export const AuthScreen: React.FC = () => {
  const { requestOtp, verifyOtp, cancelOtp, authStatus, authError, authLoading, pendingPhone } =
    useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [visible, setVisible] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Fade in on mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Keep step in sync with authStatus (e.g. after cancelOtp)
  useEffect(() => {
    if (authStatus === 'anonymous') setStep('phone');
    if (authStatus === 'otp_sent') setStep('otp');
  }, [authStatus]);

  // Auto-focus first OTP cell when step switches
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, '');
    if (!trimmedName || digits.length < 10) return;
    try {
      await requestOtp(trimmedName, digits.startsWith('7') ? `+${digits}` : `+7${digits}`);
    } catch {
      // error displayed via authError
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 filled
    if (next.every((c) => c !== '') && char) {
      void submitOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => {
      if (i < 6) next[i] = ch;
    });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 5);
    otpRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) {
      void submitOtp(pasted);
    }
  };

  const submitOtp = async (code: string) => {
    try {
      await verifyOtp(code);
    } catch {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  const handleBack = () => {
    cancelOtp();
    setOtp(['', '', '', '', '', '']);
    setStep('phone');
  };

  const formatPhoneDisplay = (raw: string) => {
    if (!raw) return '';
    const clean = raw.startsWith('+') ? raw : `+${raw}`;
    return clean;
  };

  return (
    <div
      className={`fixed inset-0 z-[90] bg-[#0F2820] flex flex-col items-center justify-between transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-sm mx-auto">
        <div className="mb-10 opacity-90">
          <Logo className="w-28 h-auto" color="#FCEEAC" variant="symbol" />
        </div>

        <div className="w-full">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-serif text-white mb-1 text-center">Войти в приложение</h1>
              <p className="text-sm text-white/40 text-center mb-8 leading-relaxed">
                Пространство только для своих
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-1.5 pl-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Как вас зовут?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-brand-mint/60 focus:bg-white/12 transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-1.5 pl-1">
                    Телефон
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/8 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-brand-mint/60 focus:bg-white/12 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {authError && (
                <p className="mt-3 text-rose-400 text-xs text-center px-2">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading || !name.trim() || phone.replace(/\D/g, '').length < 10}
                className="mt-6 w-full bg-brand-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-green/90 active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Получить код'
                )}
              </button>
            </form>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors mb-8"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Изменить номер
              </button>

              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-brand-mint/70" />
                <h1 className="text-2xl font-serif text-white">Введите код</h1>
              </div>
              <p className="text-sm text-white/40 mb-8 leading-relaxed">
                Отправили SMS на{' '}
                <span className="text-white/70">{formatPhoneDisplay(pendingPhone)}</span>
              </p>

              <div className="flex gap-2 justify-center mb-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-14 text-center text-xl font-bold bg-white/8 border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-mint/70 focus:bg-white/12 transition-all caret-brand-mint"
                  />
                ))}
              </div>

              {authError && (
                <p className="mt-3 text-rose-400 text-xs text-center px-2">{authError}</p>
              )}

              <button
                onClick={() => void submitOtp(otp.join(''))}
                disabled={authLoading || otp.some((c) => !c)}
                className="mt-6 w-full bg-brand-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-green/90 active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Войти'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="pb-10 text-[10px] text-white/20 text-center px-8">
        Нажимая «Войти», вы соглашаетесь с условиями использования
      </p>
    </div>
  );
};
