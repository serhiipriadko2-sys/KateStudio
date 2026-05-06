import { isSupabaseConfigured, supabase, useIsAdmin } from '@ksebe/shared';
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Database,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Settings,
  Users,
  Video,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { AdminQueryProvider } from './admin/AdminQueryProvider';
import {
  AnalyticsTab,
  ArticlesTab,
  BookingsTab,
  ContactsTab,
  DashboardTab,
  FAQTab,
  ImagesTab,
  PricingTab,
  RetreatsTab,
  ReviewsTab,
  ScheduleTab,
  SettingsTab,
  UsersTab,
  VideoTab,
} from './admin/tabs';
import { AdminTab } from './admin/types';

/* ═══════════════════════════════════════════════════════════
   Login Screen (Embedded)
   ═══════════════════════════════════════════════════════════ */

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setLocalError(null);
    try {
      await signIn(email.trim(), password, 'email');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setLocalError('Введите email выше');
      return;
    }
    if (!supabase) return;
    setMagicLoading(true);
    setLocalError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setMagicLoading(false);
    if (error) {
      setLocalError(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center">
      <div className="w-16 h-16 bg-brand-green text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-green/20">
        <Database className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif text-brand-dark mb-2">Вход в систему</h2>
      <p className="text-stone-500 mb-8 max-w-xs">
        Для управления студией необходима авторизация администратора.
      </p>

      {magicLinkSent ? (
        <div className="flex flex-col items-center gap-3 text-brand-green">
          <CheckCircle className="w-10 h-10" />
          <p className="font-medium">Ссылка отправлена на {email}</p>
          <p className="text-stone-400 text-sm">Откройте письмо и нажмите на ссылку для входа.</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
          />

          {localError && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {localError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти с паролем'}
          </button>

          <div className="relative flex items-center gap-3 text-stone-300 text-xs">
            <div className="flex-1 h-px bg-stone-100" />
            или
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={magicLoading}
            className="w-full py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {magicLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Войти по ссылке на почту
              </>
            )}
          </button>
        </form>
      )}
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

interface TabItem {
  id: AdminTab;
  icon: React.ReactNode;
  label: string;
}

interface TabGroup {
  label: string;
  tabs: TabItem[];
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
   Tab Groups
   ═══════════════════════════════════════════════════════════ */

const TAB_GROUPS: TabGroup[] = [
  {
    label: 'Операции',
    tabs: [
      { id: 'schedule', icon: <CalendarDays className="w-4 h-4" />, label: 'Расписание' },
      { id: 'bookings', icon: <ClipboardList className="w-4 h-4" />, label: 'Записи' },
      { id: 'contacts', icon: <MessageSquare className="w-4 h-4" />, label: 'Обращения' },
    ],
  },
  {
    label: 'Контент',
    tabs: [
      { id: 'articles', icon: <BookOpen className="w-4 h-4" />, label: 'Блог' },
      { id: 'videos', icon: <Video className="w-4 h-4" />, label: 'Видео' },
      { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Медиа' },
      { id: 'faq', icon: <HelpCircle className="w-4 h-4" />, label: 'FAQ' },
      { id: 'retreats', icon: <MapPin className="w-4 h-4" />, label: 'Ретриты' },
      { id: 'reviews', icon: <MessageSquare className="w-4 h-4" />, label: 'Отзывы' },
    ],
  },
  {
    label: 'Аудитория',
    tabs: [
      { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Пользователи' },
      { id: 'analytics', icon: <BarChart2 className="w-4 h-4" />, label: 'Аналитика' },
    ],
  },
  {
    label: 'Система',
    tabs: [
      { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Обзор' },
      { id: 'pricing', icon: <ClipboardList className="w-4 h-4" />, label: 'Тарифы' },
      { id: 'settings', icon: <Palette className="w-4 h-4" />, label: 'Настройки' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { notification, toast } = useToast();
  const { logout } = useAuth();

  const { isAdmin, isLoading: isLoadingAdmin, user } = useIsAdmin();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  if (!isSupabaseConfigured) {
    return <NoSupabase />;
  }

  if (isLoadingAdmin) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-100 flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-100 relative overflow-hidden">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <LoginScreen />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-100 flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-100 p-8 text-center relative">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Доступ запрещен</h2>
          <p className="text-stone-500 mb-6">
            Ваш аккаунт ({user.email}) не обладает правами администратора.
          </p>
          <button
            type="button"
            onClick={logout}
            className="px-6 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminQueryProvider>
      <div className="fixed inset-0 z-100 flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
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
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="p-2 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {/* Grouped Navigation */}
          <div className="flex flex-col border-b border-stone-100 shrink-0 bg-stone-50">
            {TAB_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center gap-0 overflow-x-auto">
                <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-widest px-3 whitespace-nowrap shrink-0 hidden sm:block">
                  {group.label}
                </span>
                <div className="flex">
                  {group.tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2.5 px-3 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white text-brand-green border-b-2 border-brand-green'
                          : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex-1 border-b border-stone-100" />
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-stone-50/50">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'schedule' && <ScheduleTab toast={toast} />}
            {activeTab === 'bookings' && <BookingsTab toast={toast} />}
            {activeTab === 'contacts' && <ContactsTab toast={toast} />}
            {activeTab === 'reviews' && <ReviewsTab toast={toast} />}
            {activeTab === 'pricing' && <PricingTab toast={toast} />}
            {activeTab === 'articles' && <ArticlesTab toast={toast} />}
            {activeTab === 'videos' && <VideoTab toast={toast} />}
            {activeTab === 'images' && <ImagesTab toast={toast} />}
            {activeTab === 'faq' && <FAQTab toast={toast} />}
            {activeTab === 'retreats' && <RetreatsTab toast={toast} />}
            {activeTab === 'users' && <UsersTab toast={toast} />}
            {activeTab === 'analytics' && <AnalyticsTab />}
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
