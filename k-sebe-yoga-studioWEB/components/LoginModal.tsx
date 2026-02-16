import { X, Mail, Lock, User, Loader2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, authError, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);
  useFocusTrap(dialogRef, isOpen, closeButtonRef);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = true;
    if (password.length < 6) newErrors.password = true;
    if (mode === 'register' && !name.trim()) newErrors.name = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    setStatus('loading');
    try {
      if (mode === 'register') {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      setStatus('success');
      setTimeout(() => {
        resetForm();
      }, 500);
    } catch {
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setShowPassword(false);
    clearError();
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    clearError();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        tabIndex={-1}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
      >
        <button
          onClick={resetForm}
          ref={closeButtonRef}
          aria-label="Закрыть"
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <div className="w-14 h-14 bg-brand-mint/30 rounded-2xl flex items-center justify-center mb-4">
              <User className="w-7 h-7 text-brand-green" />
            </div>
            <h3
              id="login-modal-title"
              className="text-3xl font-serif text-brand-text leading-tight"
            >
              {mode === 'login' ? 'Вход' : 'Регистрация'}
            </h3>
            <p className="text-stone-400 text-sm mt-2">
              {mode === 'login'
                ? 'Войдите, чтобы записываться на занятия и управлять бронированиями'
                : 'Создайте аккаунт для записи на занятия'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder="Ваше имя"
                  disabled={status === 'loading'}
                  className={`w-full bg-stone-50 border ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-stone-100'} text-brand-text pl-12 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400`}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: false }));
                }}
                placeholder="Email"
                disabled={status === 'loading'}
                autoComplete="email"
                className={`w-full bg-stone-50 border ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-stone-100'} text-brand-text pl-12 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: false }));
                }}
                placeholder="Пароль (мин. 6 символов)"
                disabled={status === 'loading'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className={`w-full bg-stone-50 border ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-stone-100'} text-brand-text pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {authError && (
              <div className="text-sm text-rose-500 flex items-center gap-2 bg-rose-50 px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`w-full bg-brand-green text-white font-medium py-4 rounded-2xl mt-2 hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 group active:scale-[0.98]
                ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}`}
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-stone-400 hover:text-brand-green transition-colors"
            >
              {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
