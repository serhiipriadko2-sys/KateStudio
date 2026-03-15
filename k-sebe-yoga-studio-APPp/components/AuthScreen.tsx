import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Phone, ShieldCheck } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

type AuthMode = 'login' | 'register';
type IdentifierType = 'phone' | 'email';
type Step = 'form' | 'phone_otp' | 'email_sent';

export const AuthScreen: React.FC = () => {
  const {
    signUp,
    signIn,
    verifyPhoneRegistration,
    cancelPhoneVerification,
    authStatus,
    authError,
    authLoading,
    pendingPhone,
  } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('phone');
  const [step, setStep] = useState<Step>('form');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [visible, setVisible] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Sync step with authStatus
  useEffect(() => {
    if (authStatus === 'phone_otp_sent') setStep('phone_otp');
    if (authStatus === 'email_unverified') setStep('email_sent');
    if (authStatus === 'anonymous' && step !== 'form') setStep('form');
  }, [authStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus first OTP cell
  useEffect(() => {
    if (step === 'phone_otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleIdentifierTypeChange = (t: IdentifierType) => {
    if (t === identifierType) return;
    setIdentifierType(t);
    if (step === 'phone_otp') {
      cancelPhoneVerification();
      setStep('form');
    }
  };

  const handleAuthModeChange = (m: AuthMode) => {
    if (m === authMode) return;
    setAuthMode(m);
    setStep('form');
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    return digits.startsWith('7') ? `+${digits}` : `+7${digits}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        if (identifierType === 'phone') {
          await signUp(name, normalizePhone(phone), password, 'phone');
        } else {
          await signUp(name, email, password, 'email');
        }
      } else {
        if (identifierType === 'phone') {
          await signIn(normalizePhone(phone), password, 'phone');
        } else {
          await signIn(email, password, 'email');
        }
      }
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
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) void submitOtp(pasted);
  };

  const submitOtp = async (code: string) => {
    try {
      await verifyPhoneRegistration(code);
    } catch {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  const handleBack = () => {
    cancelPhoneVerification();
    setOtp(['', '', '', '', '', '']);
  };

  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
  const isFormValid =
    authMode === 'register'
      ? identifierType === 'phone'
        ? !!name.trim() && isPhoneValid && !!password
        : !!name.trim() && !!email.trim() && !!password
      : identifierType === 'phone'
        ? isPhoneValid && !!password
        : !!email.trim() && !!password;

  const passwordAutoComplete = authMode === 'register' ? 'new-password' : 'current-password';

  const inputCls =
    'w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-brand-mint/60 focus:bg-white/12 transition-all text-sm';
  const labelCls = 'block text-xs text-white/50 uppercase tracking-widest mb-1.5 pl-1';
  const submitCls =
    'mt-6 w-full bg-brand-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-green/90 active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20';

  return (
    <div
      className={`fixed inset-0 z-90 bg-[#0F2820] flex flex-col items-center justify-between transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-sm mx-auto">
        <div className="mb-8 opacity-90">
          <Logo className="w-28 h-auto" color="#FCEEAC" variant="symbol" />
        </div>

        <div className="w-full">
          {/* OTP step */}
          {step === 'phone_otp' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                type="button"
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
                Отправили SMS на <span className="text-white/70">{pendingPhone}</span>
              </p>

              <div
                className="flex gap-2 justify-center mb-2"
                role="group"
                aria-label="Код подтверждения"
              >
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
                    aria-label={`Цифра ${i + 1}`}
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
                type="button"
                onClick={() => void submitOtp(otp.join(''))}
                disabled={authLoading || otp.some((c) => !c)}
                className={submitCls}
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
              </button>
            </div>
          )}

          {/* Email sent step */}
          {step === 'email_sent' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-brand-mint" />
              </div>
              <h1 className="text-2xl font-serif text-white mb-3">Проверьте почту</h1>
              <p className="text-sm text-white/40 leading-relaxed mb-2">
                Мы отправили письмо на <span className="text-white/70">{email}</span>
              </p>
              <p className="text-sm text-white/30 leading-relaxed">
                Перейдите по ссылке в письме, чтобы подтвердить аккаунт
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setAuthMode('login');
                }}
                className="mt-8 text-sm text-brand-mint/70 hover:text-brand-mint transition-colors"
              >
                Уже подтвердили? Войти
              </button>
            </div>
          )}

          {/* Main form */}
          {step === 'form' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-serif text-white mb-1 text-center">
                {authMode === 'login' ? 'Войти в приложение' : 'Создать аккаунт'}
              </h1>
              <p className="text-sm text-white/40 text-center mb-5 leading-relaxed">
                Пространство только для своих
              </p>

              {/* Login / Register toggle */}
              <div className="flex rounded-2xl bg-white/8 p-1 mb-4">
                <button
                  type="button"
                  data-testid="mode-login"
                  onClick={() => handleAuthModeChange('login')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${authMode === 'login' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  Войти
                </button>
                <button
                  type="button"
                  data-testid="mode-register"
                  onClick={() => handleAuthModeChange('register')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${authMode === 'register' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  Зарегистрироваться
                </button>
              </div>

              {/* Phone / Email toggle */}
              <div className="flex rounded-2xl bg-white/8 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => handleIdentifierTypeChange('phone')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${identifierType === 'phone' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Телефон
                </button>
                <button
                  type="button"
                  onClick={() => handleIdentifierTypeChange('email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${identifierType === 'email' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                {/* Name — only on register */}
                {authMode === 'register' && (
                  <div>
                    <label htmlFor="auth-name" className={labelCls}>
                      Имя
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Как вас зовут?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                )}

                {/* Phone or Email */}
                {identifierType === 'phone' ? (
                  <div>
                    <label htmlFor="auth-phone" className={labelCls}>
                      Телефон
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="auth-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`${inputCls} pl-11`}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="auth-email" className={labelCls}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="auth-email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputCls} pl-11`}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="auth-password" className={labelCls}>
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={passwordAutoComplete}
                      placeholder="Минимум 6 символов"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputCls} pr-11`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && <p className="text-rose-400 text-xs text-center px-2">{authError}</p>}

                <button
                  type="submit"
                  data-testid="auth-submit"
                  disabled={authLoading || !isFormValid}
                  className={submitCls}
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : authMode === 'register' && identifierType === 'phone' ? (
                    'Получить код'
                  ) : authMode === 'register' ? (
                    'Зарегистрироваться'
                  ) : (
                    'Войти'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <p className="pb-10 text-[10px] text-white/20 text-center px-8">
        {authMode === 'register'
          ? 'Регистрируясь, вы соглашаетесь с условиями использования'
          : 'Нажимая «Войти», вы соглашаетесь с условиями использования'}
      </p>
    </div>
  );
};
