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
  BookOpen,
  ClipboardList,
  MessageSquare,
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
import { AdminQueryProvider } from './admin/AdminQueryProvider';
import { ScheduleTab } from './admin/tabs/ScheduleTab';
import { BookingsTab } from './admin/tabs/BookingsTab';
import { ContactsTab } from './admin/tabs/ContactsTab';
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
