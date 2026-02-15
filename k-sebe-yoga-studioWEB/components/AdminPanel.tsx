import {
  X,
  Settings,
  Image as ImageIcon,
  Palette,
  Save,
  RotateCcw,
  Upload,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  CalendarDays,
  Plus,
  Pencil,
  Clock,
  MapPin,
  Flame,
  Users,
  BookOpen,
  ClipboardList,
  Phone,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageSquare,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ContentData, ContentMode, BlogArticle } from '../data/content';
import { useScrollLock } from '../hooks/useScrollLock';
import { uploadImage, saveImageMapping } from '../services/content';
import {
  getContentData,
  getContentMode,
  resetContentData,
  saveContentData,
  setContentMode,
} from '../services/contentStore';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { ThemeColors, loadTheme, saveTheme, resetTheme, applyTheme } from '../services/theme';
import { Image } from './Image';

// --- LOGIN COMPONENT ---
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
   Types
   ═══════════════════════════════════════════════════════════ */

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'schedule' | 'bookings' | 'contacts' | 'content' | 'images' | 'settings';

interface ClassRow {
  id: string;
  date: string;
  time: string;
  name: string;
  instructor: string | null;
  duration: string | null;
  spots_total: number | null;
  spots_booked: number | null;
  location: string | null;
  intensity: number | null;
  is_online: boolean | null;
}

interface ClassFormData {
  date: string;
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spots_total: number;
  location: string;
  intensity: 1 | 2 | 3;
  is_online: boolean;
}

interface BookingRow {
  id: string;
  phone: string | null;
  name: string | null;
  class_name: string | null;
  class_type: string | null;
  class_date: string | null;
  class_time: string | null;
  date: string | null;
  time: string | null;
  created_at: string;
  location: string | null;
  is_purchase: boolean | null;
  price: string | null;
}

interface ContactRow {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
}

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const IMAGE_REGISTRY = [
  { key: 'hero-main-bg', label: 'Главная: Герой (Фон)' },
  { key: 'about-katya-portrait', label: 'Обо мне: Портрет' },
  { key: 'retreat-cover-main', label: 'Ретриты: Обложка' },
  { key: 'retreat-modal-sidebar', label: 'Ретриты: Модальное окно' },
  { key: 'direction-inside-flow', label: 'Направления: Inside Flow' },
  { key: 'direction-hatha', label: 'Направления: Хатха' },
  { key: 'contact-map-bg', label: 'Контакты: Карта' },
  { key: 'gallery-image-1', label: 'Галерея: Фото 1' },
  { key: 'gallery-image-2', label: 'Галерея: Фото 2' },
  { key: 'gallery-image-3', label: 'Галерея: Фото 3' },
  { key: 'gallery-image-4', label: 'Галерея: Фото 4' },
];

const EMPTY_CLASS: ClassFormData = {
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  name: 'Inside Flow',
  instructor: 'Катя Габран',
  duration: '60 мин',
  spots_total: 12,
  location: 'Станционная ул., 5Б',
  intensity: 2,
  is_online: false,
};

const CLASS_PRESETS: { label: string; data: Partial<ClassFormData> }[] = [
  { label: 'Inside Flow', data: { name: 'Inside Flow', duration: '60 мин', intensity: 3 } },
  { label: 'Хатха Йога', data: { name: 'Хатха Йога', duration: '60 мин', intensity: 2 } },
  {
    label: 'Медитация',
    data: { name: 'Медитация + Sound Healing', duration: '60 мин', intensity: 1 },
  },
  {
    label: 'Утренний поток',
    data: {
      name: 'Утренний поток (Zoom)',
      duration: '45 мин',
      intensity: 2,
      is_online: true,
      location: 'Online',
    },
  },
  {
    label: 'Вечерняя растяжка',
    data: {
      name: 'Вечерняя растяжка (Zoom)',
      duration: '60 мин',
      intensity: 1,
      is_online: true,
      location: 'Online',
    },
  },
];

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

const formatDateRu = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' });
};

const formatCreatedAt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

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
  const [activeTab, setActiveTab] = useState<AdminTab>('schedule');
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
  if (
    !isSupabaseConfigured &&
    activeTab !== 'content' &&
    activeTab !== 'images' &&
    activeTab !== 'settings'
  ) {
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

  const tabs: { id: AdminTab; icon: React.ReactNode; label: string }[] = [
    { id: 'schedule', icon: <CalendarDays className="w-4 h-4" />, label: 'Расписание' },
    { id: 'bookings', icon: <ClipboardList className="w-4 h-4" />, label: 'Записи' },
    { id: 'contacts', icon: <MessageSquare className="w-4 h-4" />, label: 'Обращения' },
    { id: 'content', icon: <BookOpen className="w-4 h-4" />, label: 'Контент' },
    { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Медиа' },
    { id: 'settings', icon: <Palette className="w-4 h-4" />, label: 'Настройки' },
  ];

  return (
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
          {activeTab === 'schedule' && <ScheduleTab toast={toast} />}
          {activeTab === 'bookings' && <BookingsTab toast={toast} />}
          {activeTab === 'contacts' && <ContactsTab toast={toast} />}
          {activeTab === 'content' && <ContentTab toast={toast} />}
          {activeTab === 'images' && <ImagesTab toast={toast} />}
          {activeTab === 'settings' && <SettingsTab toast={toast} />}
        </div>

        {/* Toast */}
        {notification && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl border ${notification.type === 'success' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-600 border-rose-100'}`}
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
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 1: SCHEDULE (Расписание)
   ═══════════════════════════════════════════════════════════ */

const ScheduleTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormData>({ ...EMPTY_CLASS });
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const [year, month] = dateFilter.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      setClasses((data as ClassRow[]) || []);
    } catch (err) {
      console.error(err);
      toast('Ошибка загрузки расписания', 'error');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, toast]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_CLASS });
    setShowForm(true);
  };

  const openEdit = (cls: ClassRow) => {
    setEditingId(cls.id);
    setForm({
      date: cls.date,
      time: cls.time,
      name: cls.name,
      instructor: cls.instructor || 'Катя Габран',
      duration: cls.duration || '60 мин',
      spots_total: cls.spots_total || 12,
      location: cls.location || 'Станционная ул., 5Б',
      intensity: ([1, 2, 3].includes(cls.intensity || 0) ? cls.intensity : 2) as 1 | 2 | 3,
      is_online: cls.is_online || false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!supabase) {
      toast('Supabase не настроен', 'error');
      return;
    }
    if (!form.name.trim()) {
      toast('Укажите название занятия', 'error');
      return;
    }
    if (!form.date || !form.time) {
      toast('Укажите дату и время', 'error');
      return;
    }
    setSaving(true);
    try {
      const base = {
        date: form.date,
        time: form.time,
        name: form.name.trim(),
        instructor: form.instructor.trim(),
        duration: form.duration,
        spots_total: Math.max(1, form.spots_total),
        location: form.location.trim(),
        intensity: form.intensity,
        is_online: form.is_online,
      };

      if (editingId) {
        // NOTE: do NOT send spots_booked — it would reset existing bookings
        const { error } = await supabase.from('classes').update(base).eq('id', editingId);
        if (error) throw error;
        toast('Занятие обновлено');
      } else {
        const { error } = await supabase.from('classes').insert({ ...base, spots_booked: 0 });
        if (error) throw error;
        toast('Занятие добавлено');
      }
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      toast('Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Удалить это занятие?')) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      toast('Занятие удалено');
      fetchClasses();
    } catch (err) {
      console.error(err);
      toast('Ошибка удаления', 'error');
    }
  };

  const handleDuplicate = async (cls: ClassRow) => {
    if (!supabase) return;
    try {
      const nextDate = new Date(cls.date + 'T00:00:00');
      nextDate.setDate(nextDate.getDate() + 7);
      const newDate = nextDate.toISOString().slice(0, 10);
      const { error } = await supabase.from('classes').insert({
        date: newDate,
        time: cls.time,
        name: cls.name,
        instructor: cls.instructor,
        duration: cls.duration,
        spots_total: cls.spots_total,
        spots_booked: 0,
        location: cls.location,
        intensity: cls.intensity,
        is_online: cls.is_online,
      });
      if (error) throw error;
      toast(`Скопировано на ${formatDateRu(newDate)}`);
      fetchClasses();
    } catch (err) {
      console.error(err);
      toast('Ошибка копирования', 'error');
    }
  };

  const applyPreset = (preset: (typeof CLASS_PRESETS)[number]) => {
    setForm((prev) => ({ ...prev, ...preset.data }));
  };

  if (!isSupabaseConfigured) return <NoSupabase />;

  return (
    <div className="space-y-4">
      {/* Header: filter + add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Добавить занятие
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-green/20 shadow-md p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Редактировать занятие' : 'Новое занятие'}
          </h3>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {CLASS_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  form.name === p.data.name
                    ? 'bg-brand-green text-white border-brand-green'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-brand-green/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Дата</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Время</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs text-stone-500 font-medium">Название</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              placeholder="Inside Flow"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Преподаватель</span>
              <input
                type="text"
                value={form.instructor}
                onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Длительность</span>
              <select
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none bg-white"
              >
                <option>30 мин</option>
                <option>45 мин</option>
                <option>60 мин</option>
                <option>75 мин</option>
                <option>90 мин</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Мест</span>
              <input
                type="number"
                min={1}
                max={100}
                value={form.spots_total}
                onChange={(e) =>
                  setForm((f) => ({ ...f, spots_total: parseInt(e.target.value) || 1 }))
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Интенсивность</span>
              <div className="flex gap-1 pt-1.5">
                {([1, 2, 3] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, intensity: lvl }))}
                    className={`p-1.5 rounded-lg transition-colors ${form.intensity >= lvl ? 'text-brand-green' : 'text-stone-200'}`}
                  >
                    <Flame
                      className={`w-5 h-5 ${form.intensity >= lvl ? 'fill-brand-green' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Формат</span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    is_online: !f.is_online,
                    location: !f.is_online ? 'Online' : 'Станционная ул., 5Б',
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  form.is_online
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                {form.is_online ? 'Онлайн' : 'В студии'}
              </button>
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs text-stone-500 font-medium">Локация</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Classes list */}
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center">
          <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Нет занятий за этот месяц</p>
          <button
            onClick={openCreate}
            className="mt-3 text-brand-green text-sm font-medium hover:underline"
          >
            + Добавить первое занятие
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-4 hover:border-brand-green/20 transition-colors group"
            >
              <div className="min-w-[70px] text-center">
                <div className="text-xs text-stone-400">{formatDateRu(cls.date)}</div>
                <div className="text-lg font-semibold text-brand-text">{cls.time}</div>
              </div>
              <div className="w-px h-10 bg-stone-100" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-700 truncate">{cls.name}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cls.instructor || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.duration || '60 мин'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cls.location || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    {[1, 2, 3].map((i) => (
                      <Flame
                        key={i}
                        className={`w-3 h-3 ${i <= (cls.intensity || 1) ? 'text-brand-green fill-brand-green' : 'text-stone-200'}`}
                      />
                    ))}
                  </span>
                  <span>
                    {cls.spots_booked || 0}/{cls.spots_total || 0} мест
                  </span>
                  {cls.is_online && <span className="text-blue-500 font-medium">онлайн</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => handleDuplicate(cls)}
                  title="Копировать на +7 дней"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(cls)}
                  title="Редактировать"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  title="Удалить"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 2: BOOKINGS (Записи на занятия)
   ═══════════════════════════════════════════════════════════ */

const BookingsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id,phone,name,class_name,class_type,class_date,class_time,date,time,created_at,location,is_purchase,price'
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setBookings((data as BookingRow[]) || []);
    } catch (err) {
      console.error(err);
      toast('Ошибка загрузки записей', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Удалить эту запись?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      toast('Запись удалена');
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast('Ошибка удаления', 'error');
    }
  };

  if (!isSupabaseConfigured) return <NoSupabase />;

  const purchases = bookings.filter((b) => b.is_purchase);
  const classBookings = bookings.filter((b) => !b.is_purchase);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">
          Записи ({bookings.length})
          {purchases.length > 0 && (
            <span className="ml-2 text-xs font-normal text-stone-400">
              {purchases.length} покупок · {classBookings.length} занятий
            </span>
          )}
        </h3>
        <button
          onClick={fetchBookings}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
          title="Обновить"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center">
          <ClipboardList className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Записей пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const isOpen = expanded === b.id;
            const displayName = b.class_name || b.class_type || b.name || 'Запись';
            const displayDate = b.class_date || b.date || '';
            const displayTime = b.class_time || b.time || '';
            const createdAt = formatCreatedAt(b.created_at);
            const isPurchase = b.is_purchase;

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-stone-100 overflow-hidden transition-colors hover:border-stone-200"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPurchase ? 'bg-amber-50' : 'bg-brand-mint/30'}`}
                  >
                    {isPurchase ? (
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-brand-green" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-700 text-sm truncate flex items-center gap-2">
                      {displayName}
                      {isPurchase && b.price && (
                        <span className="text-xs font-normal bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                          {b.price}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400">
                      {b.name && <span className="mr-2">{b.name}</span>}
                      {displayDate && `${displayDate} `}
                      {displayTime && `в ${displayTime}`}
                      {!displayDate && !displayTime && !b.name && createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400">{createdAt}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-stone-50 animate-in slide-in-from-top-1 duration-150">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-3">
                      {b.phone && (
                        <>
                          <dt className="text-stone-400">Телефон</dt>
                          <dd className="text-stone-700 font-medium">{b.phone}</dd>
                        </>
                      )}
                      {b.name && (
                        <>
                          <dt className="text-stone-400">Имя</dt>
                          <dd className="text-stone-700">{b.name}</dd>
                        </>
                      )}
                      {b.class_name && (
                        <>
                          <dt className="text-stone-400">Занятие</dt>
                          <dd className="text-stone-700">{b.class_name}</dd>
                        </>
                      )}
                      {b.class_type && (
                        <>
                          <dt className="text-stone-400">Тип</dt>
                          <dd className="text-stone-700">{b.class_type}</dd>
                        </>
                      )}
                      {b.location && (
                        <>
                          <dt className="text-stone-400">Локация</dt>
                          <dd className="text-stone-700">{b.location}</dd>
                        </>
                      )}
                      {isPurchase && b.price && (
                        <>
                          <dt className="text-stone-400">Стоимость</dt>
                          <dd className="text-stone-700 font-medium">{b.price}</dd>
                        </>
                      )}
                    </dl>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 3: CONTACTS (Обращения с формы)
   ═══════════════════════════════════════════════════════════ */

const ContactsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id,name,phone,message,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setContacts((data as ContactRow[]) || []);
    } catch (err) {
      console.error(err);
      toast('Ошибка загрузки обращений', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Удалить это обращение?')) return;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      toast('Обращение удалено');
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast('Ошибка удаления', 'error');
    }
  };

  if (!isSupabaseConfigured) return <NoSupabase />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">
          Обращения с сайта ({contacts.length})
        </h3>
        <button
          onClick={fetchContacts}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
          title="Обновить"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Обращений пока нет</p>
          <p className="text-xs text-stone-300 mt-1">
            Они появятся, когда кто-то отправит форму на сайте
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const isOpen = expanded === c.id;
            const createdAt = formatCreatedAt(c.created_at);

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-stone-100 overflow-hidden transition-colors hover:border-stone-200"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-700 text-sm truncate">
                      {c.name || 'Без имени'}
                    </div>
                    <div className="text-xs text-stone-400 truncate">
                      {c.message
                        ? c.message.length > 60
                          ? c.message.slice(0, 60) + '...'
                          : c.message
                        : c.phone || '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400">{createdAt}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-stone-50 animate-in slide-in-from-top-1 duration-150">
                    <div className="mt-3 space-y-2">
                      {c.name && (
                        <div className="flex gap-2 text-xs">
                          <span className="text-stone-400 w-16 shrink-0">Имя</span>
                          <span className="text-stone-700 font-medium">{c.name}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex gap-2 text-xs">
                          <span className="text-stone-400 w-16 shrink-0">Телефон</span>
                          <a
                            href={`tel:${c.phone}`}
                            className="text-brand-green font-medium hover:underline"
                          >
                            {c.phone}
                          </a>
                        </div>
                      )}
                      {c.message && (
                        <div className="text-xs">
                          <span className="text-stone-400 block mb-1">Сообщение</span>
                          <p className="text-stone-700 bg-stone-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                            {c.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 4: CONTENT (Контент — статьи)
   ═══════════════════════════════════════════════════════════ */

const ContentTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [contentMode, setContentModeState] = useState<ContentMode>(getContentMode());
  const [data, setData] = useState<ContentData>(() => getContentData(contentMode));
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const contentImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(getContentData(contentMode));
  }, [contentMode]);

  const handleModeChange = (mode: ContentMode) => {
    setContentMode(mode);
    setContentModeState(mode);
    toast(`Режим: ${mode}`);
  };

  const saveArticle = (article: BlogArticle) => {
    const updated = { ...data };
    const idx = updated.articles.findIndex((a) => a.id === article.id);
    if (idx >= 0) {
      updated.articles[idx] = article;
    } else {
      updated.articles.push(article);
    }
    saveContentData(updated, contentMode);
    setData(getContentData(contentMode));
    setEditingArticle(null);
    toast('Статья сохранена');
  };

  const deleteArticle = (id: number) => {
    if (!confirm('Удалить статью?')) return;
    const updated = { ...data, articles: data.articles.filter((a) => a.id !== id) };
    saveContentData(updated, contentMode);
    setData(getContentData(contentMode));
    toast('Статья удалена');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ksebe_content_${contentMode}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Контент экспортирован');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as ContentData;
        saveContentData(parsed, contentMode);
        setData(getContentData(contentMode));
        toast('Контент импортирован');
      } catch {
        toast('Неверный формат JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm('Сбросить контент к значениям по умолчанию?')) return;
    resetContentData(contentMode);
    setData(getContentData(contentMode));
    toast('Контент сброшен');
  };

  return (
    <div className="space-y-4">
      {/* Mode switch + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleModeChange('demo')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${contentMode === 'demo' ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-stone-500 border-stone-200'}`}
        >
          Demo
        </button>
        <button
          onClick={() => handleModeChange('production')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${contentMode === 'production' ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-stone-500 border-stone-200'}`}
        >
          Production
        </button>
        <div className="flex-1" />
        <button
          onClick={handleExport}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
          title="Экспорт"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => contentImportRef.current?.click()}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
          title="Импорт"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          type="file"
          accept=".json"
          ref={contentImportRef}
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={handleReset}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-rose-400"
          title="Сброс"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Article editor overlay */}
      {editingArticle && (
        <ArticleEditor
          article={editingArticle}
          onSave={saveArticle}
          onCancel={() => setEditingArticle(null)}
        />
      )}

      {/* Articles list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-600">
            Статьи блога ({data.articles.length})
          </h3>
          <button
            onClick={() =>
              setEditingArticle({
                id: Date.now(),
                category: '',
                title: '',
                excerpt: '',
                image: '',
                date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                content: '',
              })
            }
            className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Новая статья
          </button>
        </div>
        {data.articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-4 group hover:border-brand-green/20 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0">
              {article.image && (
                <img src={article.image} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm truncate">
                {article.title || 'Без заголовка'}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {article.category} · {article.date}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setEditingArticle(article)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteArticle(article.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- Article Editor sub-component --- */

const ArticleEditor: React.FC<{
  article: BlogArticle;
  onSave: (a: BlogArticle) => void;
  onCancel: () => void;
}> = ({ article, onSave, onCancel }) => {
  const [draft, setDraft] = useState<BlogArticle>({ ...article });

  return (
    <div className="bg-white rounded-2xl border border-brand-green/20 shadow-md p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
      <h3 className="font-semibold text-stone-700 text-sm">Редактор статьи</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-stone-500">Категория</span>
          <input
            type="text"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            placeholder="Практика"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-stone-500">Дата</span>
          <input
            type="text"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            placeholder="12 Авг"
          />
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs text-stone-500">Заголовок</span>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs text-stone-500">Краткое описание</span>
        <textarea
          value={draft.excerpt}
          onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none resize-none"
        />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs text-stone-500">URL изображения</span>
        <input
          type="text"
          value={draft.image}
          onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          placeholder="/images/gallery/gallery-image-1.jpg"
        />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs text-stone-500">Содержание (HTML)</span>
        <textarea
          value={draft.content}
          onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-mono focus:ring-2 focus:ring-brand-green/30 focus:outline-none resize-y"
        />
      </label>
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors"
        >
          <Save className="w-4 h-4" /> Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 5: IMAGES (Медиа)
   ═══════════════════════════════════════════════════════════ */

const ImagesTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const handleImageUpload = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast('Файл > 5MB', 'error');
      return;
    }
    setUploadingKey(key);

    const base64Fallback = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    try {
      const publicUrl = await uploadImage(file, key);
      if (publicUrl) {
        await saveImageMapping(key, publicUrl);
        localStorage.setItem(`ksebe-img-${key}`, publicUrl);
        toast('Загружено в облако');
      } else {
        throw new Error('Cloud unavailable');
      }
    } catch {
      try {
        localStorage.setItem(`ksebe-img-${key}`, base64Fallback);
        toast('Сохранено локально');
      } catch {
        toast('Файл слишком большой', 'error');
      }
    } finally {
      window.dispatchEvent(new Event('storage'));
      setUploadingKey(null);
    }
  };

  const handleClearCache = () => {
    if (!confirm('Очистить все локальные изображения?')) return;
    IMAGE_REGISTRY.forEach((item) => localStorage.removeItem(`ksebe-img-${item.key}`));
    window.dispatchEvent(new Event('storage'));
    toast('Кэш очищен');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-stone-600">Изображения сайта</h3>
        <button
          onClick={handleClearCache}
          className="text-xs text-rose-500 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Очистить кэш
        </button>
      </div>
      <div className="grid gap-3">
        {IMAGE_REGISTRY.map((item) => (
          <div
            key={item.key}
            className="bg-white p-3 rounded-xl border border-stone-100 flex items-center gap-3 hover:border-brand-green/20 transition-colors"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0">
              <Image
                storageKey={item.key}
                src="/placeholder.png"
                alt={item.label}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                controlsClassName="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-700 truncate">{item.label}</div>
              <code className="text-[10px] text-stone-400">{item.key}</code>
            </div>
            <label
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                uploadingKey === item.key
                  ? 'bg-stone-100 text-stone-400'
                  : 'bg-brand-mint/50 text-brand-green hover:bg-brand-green hover:text-white'
              }`}
            >
              {uploadingKey === item.key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {uploadingKey === item.key ? '...' : 'Загрузить'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={uploadingKey !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(item.key, f);
                }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 6: SETTINGS (Цвета + Бэкап)
   ═══════════════════════════════════════════════════════════ */

const SettingsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const [colors, setColors] = useState<ThemeColors>(loadTheme());
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadTheme();
    setColors(saved);
    applyTheme(saved);
  }, []);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    applyTheme(next);
  };

  const handleSaveTheme = () => {
    saveTheme(colors);
    toast('Тема сохранена');
  };
  const handleResetTheme = () => {
    if (!confirm('Сбросить цвета?')) return;
    const defaults = resetTheme();
    setColors(defaults);
    toast('Цвета сброшены');
  };

  const handleExportConfig = () => {
    const config = {
      theme: colors,
      images: IMAGE_REGISTRY.reduce(
        (acc, item) => {
          const url = localStorage.getItem(`ksebe-img-${item.key}`);
          if (url) acc[item.key] = url;
          return acc;
        },
        {} as Record<string, string>
      ),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ksebe_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Конфиг экспортирован');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.theme) {
          setColors(config.theme);
          saveTheme(config.theme);
        }
        if (config.images) {
          Object.entries(config.images).forEach(([key, url]) => {
            localStorage.setItem(`ksebe-img-${key}`, url as string);
            saveImageMapping(key, url as string);
          });
        }
        window.dispatchEvent(new Event('storage'));
        toast('Конфиг импортирован');
      } catch {
        toast('Неверный формат', 'error');
      }
    };
    reader.readAsText(file);
  };

  const COLOR_FIELDS: { label: string; variable: keyof ThemeColors }[] = [
    { label: 'Основной (Зеленый)', variable: '--color-brand-green' },
    { label: 'Акцент (Мятный)', variable: '--color-brand-mint' },
    { label: 'Темный (Футер)', variable: '--color-brand-dark' },
    { label: 'Текст', variable: '--color-brand-text' },
    { label: 'Фон', variable: '--color-brand-light' },
    { label: 'Вторичный акцент', variable: '--color-brand-accent' },
  ];

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-600">Цветовая схема</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLOR_FIELDS.map(({ label, variable }) => (
            <div
              key={variable}
              className="bg-white p-3 rounded-xl border border-stone-100 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-stone-700">{label}</div>
                <code className="text-[10px] text-stone-400">{variable}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-stone-50 px-2 py-1 rounded">
                  {colors[variable]}
                </span>
                <input
                  type="color"
                  value={colors[variable]}
                  onChange={(e) => handleColorChange(variable, e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveTheme}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Сохранить
          </button>
          <button
            onClick={handleResetTheme}
            className="flex items-center gap-2 px-4 py-2 bg-white text-rose-500 border border-stone-200 rounded-xl text-sm hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Сброс
          </button>
        </div>
      </div>

      {/* Backup */}
      <div className="space-y-3 border-t border-stone-200 pt-5">
        <h3 className="text-sm font-semibold text-stone-600">Резервное копирование</h3>
        <p className="text-xs text-stone-400">
          Экспорт/импорт всех настроек (цвета + ссылки на изображения) в виде JSON.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExportConfig}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm hover:bg-stone-200 transition-colors border border-stone-200"
          >
            <Download className="w-4 h-4" /> Скачать
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-green text-white rounded-xl text-sm hover:bg-brand-green/90 transition-colors cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" /> Импортировать
            <input
              type="file"
              ref={importInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImportConfig}
            />
          </label>
        </div>
      </div>

      {/* Supabase status */}
      <div className="border-t border-stone-200 pt-5">
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}
        >
          <Database
            className={`w-5 h-5 ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`}
          />
          <div>
            <div
              className={`text-sm font-medium ${isSupabaseConfigured ? 'text-emerald-700' : 'text-amber-700'}`}
            >
              Supabase: {isSupabaseConfigured ? 'Подключен' : 'Не настроен'}
            </div>
            <div className="text-xs text-stone-400">
              {isSupabaseConfigured
                ? 'Расписание, записи и обращения из базы данных'
                : 'Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
