import {
  X,
  Settings,
  Image as ImageIcon,
  Palette,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  BookOpen,
  ClipboardList,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { AdminQueryProvider } from './admin/AdminQueryProvider';
import { ScheduleTab } from './admin/tabs/ScheduleTab';
import { BookingsTab } from './admin/tabs/BookingsTab';
import { ContactsTab } from './admin/tabs/ContactsTab';
import { ContentTab } from './admin/tabs/ContentTab';
import { ReviewsTab } from './admin/tabs/ReviewsTab';
import { ImagesTab } from './admin/tabs/ImagesTab';
import { SettingsTab } from './admin/tabs/SettingsTab';
import { DashboardTab } from './admin/tabs/DashboardTab';
import { AdminTab } from './admin/types';

/* ═══════════════════════════════════════════════════════════
   Login Screen
   ═══════════════════════════════════════════════════════════ */

const LoginScreen: React.FC<{
  onLogin: () => void;
}> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-brand-green text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-green/20">
        <Database className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif text-brand-dark mb-2">Вход в систему</h2>
      <p className="text-stone-500 mb-8 max-w-xs">
        Для управления студией необходима авторизация администратора.
      </p>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти'}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════ */

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════
   Toast hook
   ═══════════════════════════════════════════════════════════ */

function useToast() {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  }, []);

  return { notification, toast };
}

/* ═══════════════════════════════════════════════════════════
   Supabase placeholder
   ═══════════════════════════════════════════════════════════ */

const NoSupabase = () => (
  <div className="text-center py-12">
    <Database className="w-10 h-10 text-stone-300 mx-auto mb-3" />
    <p className="text-stone-500 mb-2">Supabase не подключен</p>
    <p className="text-stone-400 text-sm">
      Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab | 'dashboard'>('dashboard');
  const [session, setSession] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { notification, toast } = useToast();

  useScrollLock(isOpen);

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isOpen) return null;

  // 1. Supabase Config Check
  if (!isSupabaseConfigured) {
    return <NoSupabase />;
  }

  // 2. Auth Gate
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-[100] flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-100 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <LoginScreen onLogin={() => setSession(true)} />
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab | 'dashboard'; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Обзор' },
    { id: 'schedule', icon: <CalendarDays className="w-4 h-4" />, label: 'Расписание' },
    { id: 'bookings', icon: <ClipboardList className="w-4 h-4" />, label: 'Записи' },
    { id: 'contacts', icon: <MessageSquare className="w-4 h-4" />, label: 'Обращения' },
    { id: 'reviews', icon: <MessageSquare className="w-4 h-4" />, label: 'Отзывы' },
    { id: 'content', icon: <BookOpen className="w-4 h-4" />, label: 'Контент' },
    { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Медиа' },
    { id: 'settings', icon: <Palette className="w-4 h-4" />, label: 'Настройки' },
  ];

  return (
    <AdminQueryProvider>
      <div className="fixed inset-0 z-[100] flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-3xl bg-white shadow-2xl h-full ml-auto flex flex-col animate-in slide-in-from-right duration-300 relative">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-green text-white rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">Управление студией</h2>
                <p className="text-xs text-stone-400">Админ-панель К Себе</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-100 overflow-x-auto shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 min-w-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-green border-b-2 border-brand-green'
                    : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-stone-50/50">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'schedule' && <ScheduleTab toast={toast} />}
            {activeTab === 'bookings' && <BookingsTab toast={toast} />}
            {activeTab === 'contacts' && <ContactsTab toast={toast} />}
            {activeTab === 'reviews' && <ReviewsTab toast={toast} />}
            {activeTab === 'content' && <ContentTab toast={toast} />}
            {activeTab === 'images' && <ImagesTab toast={toast} />}
            {activeTab === 'settings' && <SettingsTab toast={toast} />}
          </div>

          {/* Toast */}
          {notification && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl border ${
                  notification.type === 'success'
                    ? 'bg-white text-emerald-600 border-emerald-100'
                    : 'bg-white text-rose-600 border-rose-100'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminQueryProvider>
  );
};
