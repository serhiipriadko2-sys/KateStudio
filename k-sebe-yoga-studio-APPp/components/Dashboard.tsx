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
import { uploadFile, supabase } from '../services/supabaseClient';
import { Booking } from '../types';
import { AICoach } from './AICoach';
import { Breathwork } from './Breathwork';
import { DeveloperSettings } from './DeveloperSettings';
import { FadeIn } from './FadeIn';
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
  } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'videos' | 'breath' | 'ai' | 'profile' | 'dev'
  >(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

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

  const handleCancelBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите отменить запись?')) return;

    const success = await dataService.cancelBooking(id);
    if (success) {
      // Optimistic update, though Real-time will also catch it
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showToast('Запись отменена', 'success');
    } else {
      showToast('Не удалось отменить запись', 'error');
    }
  };

  const handleStartEditProfile = () => {
    setEditName(user?.name || '');
    setEditCity(user?.city || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updatedUser = { ...user, name: editName, city: editCity };
    const success = await dataService.updateUserProfile(updatedUser);
    if (success) {
      setUser(updatedUser);
      setIsEditingProfile(false);
      showToast('Профиль обновлен', 'success');
    } else {
      showToast('Ошибка при обновлении профиля', 'error');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Файл слишком большой (макс 5MB)', 'error');
      return;
    }

    setIsAvatarUploading(true);
    try {
      const fileName = `${user.phone}-${Date.now()}`;
      const publicUrl = await uploadFile(file, 'avatars', fileName);

      if (publicUrl) {
        const updatedUser = { ...user, avatar: publicUrl };
        const success = await dataService.updateUserProfile(updatedUser);
        if (success) {
          setUser(updatedUser);
          showToast('Фото обновлено', 'success');
        } else {
          showToast('Не удалось сохранить ссылку', 'error');
        }
      } else {
        // Fallback to local base64 if cloud fails
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const updatedUser = { ...user, avatar: base64 };
          await dataService.updateUserProfile(updatedUser);
          setUser(updatedUser);
          showToast('Сохранено локально (облако недоступно)', 'info');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      showToast('Ошибка загрузки', 'error');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Главная', icon: <LayoutDashboard className="w-6 h-6" /> },
    { id: 'videos', label: 'Практики', icon: <Video className="w-6 h-6" /> },
    { id: 'breath', label: 'Дыхание', icon: <Wind className="w-6 h-6" /> },
    { id: 'ai', label: 'AI Тренер', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'profile', label: 'Профиль', icon: <User className="w-6 h-6" /> },
  ];

  const userName = user?.name || 'Гость';
  const userCity = user?.city || 'Москва';

  // If in Dev mode, render full screen dev component
  if (activeTab === 'dev') {
    return <DeveloperSettings onBack={() => setActiveTab('profile')} />;
  }

  return (
    <div className="h-[100dvh] bg-[#FDFBF7] flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-100 hidden md:flex flex-col p-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-12 pl-2">
          <Logo className="w-16 h-16" color="#57a773" />
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-sm font-semibold tracking-wide ${
                activeTab === item.id
                  ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-105'
                  : 'text-stone-400 hover:bg-stone-50 hover:text-brand-text'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-stone-400 hover:text-rose-500 transition-colors px-6 py-4 text-sm font-medium rounded-2xl hover:bg-rose-50"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-100 z-20 sticky top-0">
          <Logo className="w-10 h-10" color="#57a773" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-serif text-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-6 md:p-12 pb-28 md:pb-12 bg-[#F8F9FA]">
          {/* --- Overview Tab --- */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl mx-auto">
              <header className="flex justify-between items-end mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-2xl md:text-4xl font-serif text-brand-text mb-2">
                    Привет, {userName}!
                  </h1>
                  <p className="text-stone-400 font-light text-sm md:text-base">
                    Рады видеть тебя снова.
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Card 1 */}
                <div
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col justify-between h-40 md:h-48 relative overflow-hidden group animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '100ms' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-brand-green mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-4xl font-serif text-brand-text mb-1">{bookings.length}</p>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                      Всего записей
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="bg-brand-dark p-6 rounded-[2rem] shadow-xl shadow-stone-200 flex flex-col justify-between h-40 md:h-48 text-white relative overflow-hidden animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent"></div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-yellow mb-4 backdrop-blur-sm">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif mb-1">Практик</p>
                    <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                      Ваш статус
                    </p>
                  </div>
                </div>

                {/* Card 3 (Next Class) */}
                <div
                  className="bg-brand-green p-6 rounded-[2rem] shadow-xl shadow-brand-green/20 flex flex-col justify-between h-40 md:h-48 text-white relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 border-[6px] border-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    {nextBooking ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Ближайшее
                          </span>
                          <span className="flex w-2 h-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        </div>
                        <p className="text-xl font-serif mb-1 truncate">{nextBooking.className}</p>
                        <p className="text-white/70 text-sm">
                          {nextBooking.time} • {nextBooking.date}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                          Нет записей
                        </span>
                        <p className="text-xl font-serif mb-1">Записаться?</p>
                        <p className="text-white/70 text-sm">Выбери практику</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mt-auto">
                    Перейти <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Booking History / Tickets */}
              <div
                className="mb-24 md:mb-0 animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: '400ms' }}
              >
                <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-brand-green" />
                  Мои билеты
                </h3>

                {loading ? (
                  <div className="flex justify-center py-10 bg-white rounded-[2rem] border border-stone-100">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="grid gap-4">
                    {bookings.map((b) => {
                      const isFuture =
                        new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <div
                          key={b.id}
                          className={`relative bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${isFuture ? 'border-brand-green/30 shadow-md hover:shadow-lg' : 'border-stone-100 opacity-80 grayscale hover:grayscale-0'}`}
                        >
                          {/* Left: Content */}
                          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${isFuture ? 'bg-brand-mint text-brand-green' : 'bg-stone-100 text-stone-400'}`}
                                >
                                  {isFuture ? 'Активен' : 'Завершен'}
                                </span>
                                <h4 className="text-2xl font-serif text-brand-text">
                                  {b.className}
                                </h4>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-medium text-brand-text">{b.time}</div>
                                <div className="text-xs text-stone-400">{b.date}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-4 mt-2">
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <div className="p-1.5 bg-stone-50 rounded-full">
                                  <LayoutDashboard className="w-4 h-4" />
                                </div>
                                {b.location}
                              </div>
                              {isFuture && (
                                <button
                                  onClick={(e) => handleCancelBooking(b.id, e)}
                                  className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors"
                                >
                                  Отменить
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right: QR Stub */}
                          <div className="relative w-full md:w-32 bg-stone-50 flex items-center justify-center p-4 border-t md:border-t-0 md:border-l border-dashed border-stone-300">
                            {/* Cutout circles */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8F9FA] rounded-full hidden md:block"></div>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8F9FA] rounded-full hidden md:block"></div>

                            <div
                              className="opacity-20 hover:opacity-100 transition-opacity flex flex-col items-center gap-1 cursor-pointer"
                              onClick={() => setExpandedQr(b.id)}
                            >
                              <QrCode className="w-16 h-16" />
                              <span className="text-[9px] font-mono tracking-widest">SCAN</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                      <Ticket className="w-8 h-8" />
                    </div>
                    <p className="text-stone-400 text-sm">У вас пока нет билетов на практику.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ... Other Tabs remain identical ... */}
          {activeTab === 'videos' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">Видеотека</h1>
                <p className="text-stone-400 font-light text-sm">Твоя студия всегда с тобой.</p>
              </header>
              <VideoLibrary />
            </div>
          )}

          {activeTab === 'breath' && (
            <div className="max-w-lg mx-auto h-[70vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
              <header className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">Дыхание</h1>
                <p className="text-stone-400 font-light text-sm">Успокой ум за 4 минуты.</p>
              </header>
              <div className="flex-1 bg-white rounded-[3rem] shadow-xl shadow-stone-100 border border-stone-50 p-6 flex flex-col justify-center relative overflow-hidden">
                <Breathwork />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">AI Тренер</h1>
                <p className="text-stone-400 font-light text-sm">Анализ асан, чат и творчество.</p>
              </header>
              <AICoach />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
              {authStatus !== 'authenticated' && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 mb-6">
                  <h2 className="text-xl font-serif text-brand-text mb-2">Вход по телефону</h2>
                  <p className="text-stone-400 text-sm mb-4">
                    Подтверди номер — и откроются “дорогие” AI‑функции (анализ/генерации).
                  </p>

                  {authError && (
                    <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm">
                      {authError}
                    </div>
                  )}

                  {authStatus === 'otp_sent' ? (
                    <div className="space-y-3">
                      <div className="text-xs text-stone-400">
                        Код отправлен на: <span className="font-mono">{pendingPhone}</span>
                      </div>
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        inputMode="numeric"
                        placeholder="Код из SMS"
                        className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            cancelOtp();
                            setOtpCode('');
                          }}
                          disabled={authLoading}
                          className="flex-1 py-4 rounded-2xl bg-stone-50 text-stone-600 font-medium hover:bg-stone-100 transition-colors disabled:opacity-70"
                        >
                          Изменить номер
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await verifyOtp(otpCode);
                              showToast('Телефон подтверждён', 'success');
                            } catch {
                              // error shown in UI
                            }
                          }}
                          disabled={authLoading || !otpCode.trim()}
                          className="flex-1 py-4 rounded-2xl bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 disabled:opacity-70"
                        >
                          {authLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Проверяю…
                            </span>
                          ) : (
                            'Подтвердить'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="Имя"
                        className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400"
                      />
                      <input
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        inputMode="tel"
                        placeholder="Телефон (например: +79001234567)"
                        className="w-full bg-stone-50 border border-stone-100 text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const name = (loginName || user?.name || 'Пользователь').trim();
                          const phone = (loginPhone || user?.phone || '').trim();
                          if (!phone) {
                            showToast('Введите телефон', 'error');
                            return;
                          }
                          try {
                            await requestOtp(name, phone);
                            showToast('Код отправлен', 'success');
                          } catch {
                            // error shown in UI
                          }
                        }}
                        disabled={authLoading}
                        className="w-full py-4 rounded-2xl bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 disabled:opacity-70"
                      >
                        {authLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Отправляю…
                          </span>
                        ) : (
                          'Получить код'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col items-center mb-8 relative">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative group ${isEditingProfile ? 'cursor-pointer hover:border-brand-green/50' : ''}`}
                  onClick={() => isEditingProfile && fileInputRef.current?.click()}
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
                      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
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
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in"
          onClick={() => setExpandedQr(null)}
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
        {navItems.map((item) => {
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
