/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { IMAGES } from '@ksebe/shared';
// import { Paywall } from '@ksebe/shared'; // Временно скрыто вместе с AI-подпиской
import {
  LogOut,
  LayoutDashboard,
  Video,
  Wind,
  Calendar,
  Trophy,
  ChevronRight,
  User,
  Sparkles,
  Loader2,
  X,
  Edit2,
  Save,
  Terminal,
  Ticket,
  QrCode,
  Camera,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dataService } from '../services/dataService';
// import { subscriptionService } from '../services/subscriptionService'; // Временно скрыто вместе с AI-подпиской
import { uploadFile, supabase } from '../services/supabaseClient';
import { Booking } from '../types';
// import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../types'; // Временно скрыто вместе с AI-подпиской
import { AICoach } from './AICoach';
import { Breathwork } from './Breathwork';
import { DeveloperSettings } from './DeveloperSettings';
// FadeIn available from './FadeIn' when needed
import { Image } from './Image';
import { Logo } from './Logo';
import { VideoLibrary } from './VideoLibrary';

interface DashboardProps {
  onBack: () => void;
  initialTab?: 'overview' | 'videos' | 'breath' | 'ai' | 'profile' | 'dev';
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack, initialTab = 'overview' }) => {
  const {
    user,
    setUser,
    logout,
    authStatus,
    requestOtp,
    verifyOtp,
    cancelOtp,
    authError,
    authLoading,
    pendingPhone,
    isSupabaseConfigured,
  } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'videos' | 'breath' | 'ai' | 'profile' | 'dev'
  >(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);
  // Временно скрыто вместе с AI-подпиской
  // const [subscription, setSubscription] = useState<Subscription | null>(null);
  // const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  // const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth (OTP) UI state
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const fetchBookings = useCallback(async () => {
    if (authStatus === 'authenticated' && user?.phone) {
      // Only show loading on initial fetch if list is empty
      if (bookings.length === 0) setLoading(true);
      const allBookings = await dataService.getBookings(user);
      setBookings(allBookings.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    }
  }, [authStatus, user, bookings.length]);

  // Initial Load & Real-time Subscription
  useEffect(() => {
    fetchBookings();

    if (authStatus === 'authenticated' && user?.id) {
      const channel = supabase
        .channel(`user_bookings:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Refresh data on any change (INSERT/DELETE)
            fetchBookings();
            if (payload.eventType === 'INSERT') showToast('Новая запись добавлена!', 'success');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [authStatus, user?.id, fetchBookings, showToast]);

  const nextBooking = bookings.length > 0 ? bookings[0] : null;

  const handleLogout = () => {
    logout();
    onBack();
    showToast('Вы вышли из системы', 'info');
  };

  // Profile Logic
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditCity(user.city || '');
    }
  }, [user]);

  const handleStartEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await dataService.updateUser(user.phone, {
        name: editName,
        city: editCity,
      });
      setUser(updatedUser);
      setIsEditingProfile(false);
      showToast('Профиль обновлен', 'success');
    } catch (e) {
      console.error(e);
      showToast('Ошибка обновления профиля', 'error');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setIsAvatarUploading(true);
    try {
      const publicUrl = await uploadFile(file, 'avatars');
      if (publicUrl) {
        const updatedUser = await dataService.updateUser(user.phone, { avatar: publicUrl });
        setUser(updatedUser);
        showToast('Фото обновлено', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка загрузки фото', 'error');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  // Auth Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginName) {
      showToast('Заполните имя и телефон', 'error');
      return;
    }
    try {
      await requestOtp(loginName, loginPhone);
    } catch {
      // Error handled in context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showToast('Введите 6-значный код', 'error');
      return;
    }
    try {
      await verifyOtp(otpCode);
      showToast('Вы успешно вошли!', 'success');
    } catch {
      // Error handled in context
    }
  };

  const handleCancelOtp = () => {
    cancelOtp();
    setOtpCode('');
  };

  // Render Content
  if (activeTab === 'videos') {
    return (
      <div className="px-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100"
          >
            <ChevronRight className="w-6 h-6 rotate-180 text-stone-400" />
          </button>
          <h2 className="text-3xl font-serif text-brand-text">Видеотека</h2>
        </div>
        <VideoLibrary />
      </div>
    );
  }

  if (activeTab === 'breath') {
    return (
      <div className="h-full bg-stone-50">
        <div className="px-6 pt-4 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 text-stone-400 hover:text-brand-green transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Назад
          </button>
        </div>
        <Breathwork />
      </div>
    );
  }

  if (activeTab === 'ai') {
    return (
      <div className="h-full">
        <div className="px-6 pt-4 mb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 text-stone-400 hover:text-brand-green transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Назад
          </button>
        </div>
        <AICoach />
      </div>
    );
  }

  if (activeTab === 'dev') {
    return (
      <div className="px-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100"
          >
            <ChevronRight className="w-6 h-6 rotate-180 text-stone-400" />
          </button>
          <h2 className="text-2xl font-serif text-brand-text">Настройки разработчика</h2>
        </div>
        <DeveloperSettings />
      </div>
    );
  }

  // --- Main Dashboard / Profile View ---

  const userName = user?.name || 'Гость';
  const userCity = user?.city || 'Москва'; // Fallback city

  return (
    <div className="px-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all">
            <LogOut className="w-5 h-5 text-stone-400 rotate-180" />
          </button>
          <h1 className="text-2xl font-serif text-brand-text">Личный кабинет</h1>
        </div>
        {user && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-100">
            <Sparkles className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
            <span className="text-xs font-bold text-stone-600">{user.streak || 0} дней</span>
          </div>
        )}
      </div>

      <main className="space-y-6">
        {/* Auth Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Режим демонстрации</strong>
                <p className="mt-1 opacity-80">
                  База данных не подключена. Данные сохраняются только в браузере.
                </p>
              </div>
            </div>
          )}

          {authStatus === 'anonymous' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-stone-400" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-brand-text mb-2">Войти в профиль</h2>
                <p className="text-stone-400 text-sm">
                  Чтобы сохранять прогресс, историю посещений и получать рекомендации.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-center placeholder:text-stone-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-center placeholder:text-stone-400"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-brand-dark text-white font-medium py-4 rounded-2xl hover:bg-stone-800 transition-all shadow-lg shadow-brand-dark/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Получить код'}
                </button>
              </form>
            </div>
          )}

          {authStatus === 'otp_sent' && (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-brand-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-brand-green" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-brand-text mb-2">Введите код</h2>
                <p className="text-stone-400 text-sm">Мы отправили СМС на номер {pendingPhone}</p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-center text-2xl tracking-widest font-mono placeholder:text-stone-300"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-brand-green text-white font-medium py-4 rounded-2xl hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelOtp}
                  className="text-stone-400 text-sm hover:text-stone-600 transition-colors"
                >
                  Изменить номер
                </button>
              </form>
            </div>
          )}

          {authStatus === 'authenticated' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col items-center mb-8 relative">
                <div
                  role={isEditingProfile ? 'button' : undefined}
                  tabIndex={isEditingProfile ? 0 : -1}
                  aria-label={isEditingProfile ? 'Загрузить новое фото профиля' : undefined}
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative group ${isEditingProfile ? 'cursor-pointer hover:border-brand-green/50' : ''}`}
                  onClick={() => isEditingProfile && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (isEditingProfile && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {isAvatarUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  ) : null}

                  {/* Overlay for upload hint */}
                  {isEditingProfile && !isAvatarUploading && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}

                  <Image
                    src={
                      user?.avatar ||
                      IMAGES.reviews.avatars[0] // Use a valid placeholder
                    }
                    alt="User"
                    storageKey="user-avatar-large"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                    controlsClassName="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {!isEditingProfile ? (
                  <>
                    <h2 className="text-2xl font-serif text-brand-text">{userName}</h2>
                    <p className="text-stone-400">{userCity}</p>
                    <button
                      onClick={handleStartEditProfile}
                      className="absolute top-0 right-0 p-2 text-stone-400 hover:text-brand-green"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-2 mt-2">
                    <p className="text-xs text-stone-400 text-center mb-2">
                      Нажмите на фото, чтобы изменить
                    </p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 text-center border border-stone-200 rounded-lg text-lg font-serif focus:outline-none focus:border-brand-green"
                      placeholder="Имя"
                    />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full p-2 text-center border border-stone-200 rounded-lg text-sm text-stone-500 focus:outline-none focus:border-brand-green"
                      placeholder="Город"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="p-2 text-stone-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={handleSaveProfile} className="p-2 text-brand-green">
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-stone-100 divide-y divide-stone-50">
                <div className="w-full flex items-center justify-between p-5 rounded-xl">
                  <span className="text-brand-text font-medium">Телефон</span>
                  <span className="text-stone-400 text-sm">{user?.phone || 'Не указан'}</span>
                </div>

                <button
                  onClick={() => setActiveTab('dev')}
                  className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors rounded-xl group"
                >
                  <span className="text-brand-text font-medium flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stone-400" />
                    Настройки разработчика
                  </span>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-brand-green" />
                </button>

                <button className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors rounded-xl group">
                  <span className="text-brand-text font-medium">Поддержка</span>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-brand-green" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 py-4 text-rose-500 font-medium text-sm bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      {expandedQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR-код бронирования"
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in"
          onClick={() => setExpandedQr(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setExpandedQr(null);
            }
          }}
        >
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm aspect-square flex items-center justify-center relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-green/20 animate-scan"></div>
            <QrCode className="w-full h-full text-brand-dark" />
          </div>
          <p className="text-white/50 mt-8 text-center">Покажите QR-код администратору</p>
          <button
            onClick={() => setExpandedQr(null)}
            className="mt-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200/50 pb-safe z-50 flex justify-around items-center px-1 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] safe-area-bottom">
        {[
          { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Кабинет' },
          { id: 'videos', icon: <Video size={20} />, label: 'Видео' },
          { id: 'breath', icon: <Wind size={20} />, label: 'Дыхание' },
          { id: 'ai', icon: <Sparkles size={20} />, label: 'AI' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px] relative ${isActive ? 'text-brand-green' : 'text-stone-400'}`}
            >
              <div
                className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[9px] font-bold tracking-wide transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 absolute -bottom-2'}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-3 w-8 h-1 bg-brand-green rounded-b-lg shadow-[0_2px_8px_rgba(87,167,115,0.4)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
