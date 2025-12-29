import { saveImageMapping, uploadImage } from '@ksebe/shared';
import {
  Save,
  RotateCcw,
  Image as ImageIcon,
  Palette,
  Upload,
  Check,
  AlertTriangle,
  Download,
  FileJson,
  RefreshCw,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

// Define the critical image keys used in the app
const ASSET_SLOTS = [
  { key: 'hero-main-bg-v4', label: 'Главный экран (Hero)', desc: '1920x1080, затемненный' },
  // Match WEB keys so one config works for both
  { key: 'retreat-cover-main', label: 'Обложка Ретритов', desc: '1200x800' },
  { key: 'retreat-modal-sidebar', label: 'Ретрит (Внутри)', desc: '800x600' },
  { key: 'home-studio-promo', label: 'Промо Студии (Главная)', desc: 'Вертикальное' },
  { key: 'about-katya-portrait', label: 'Портрет Кати (Обо мне)', desc: '600x800' },
  { key: 'contact-map-bg', label: 'Фон карты (Контакты)', desc: 'Широкое' },
  { key: 'direction-inside-flow', label: 'Inside Flow (Направления)', desc: 'Квадрат/4:3' },
  { key: 'direction-hatha', label: 'Hatha Yoga (Направления)', desc: 'Квадрат/4:3' },
  { key: 'user-avatar-large', label: 'Аватар Профиля', desc: 'Квадратное' },
];

const THEME_VARS = [
  { name: '--brand-green', label: 'Основной Зеленый', default: '#57a773' },
  { name: '--brand-mint', label: 'Мятный (Фон)', default: '#d4eadd' },
  { name: '--brand-dark', label: 'Темный (Акцент)', default: '#1a1a1a' },
  { name: '--brand-text', label: 'Текст', default: '#333333' },
  { name: '--brand-yellow', label: 'Желтый (Неон)', default: '#fceeb5' },
];

const isQuotaExceeded = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const errorObj = err as { name?: string; message?: string };
  return (
    errorObj?.name === 'QuotaExceededError' ||
    errorObj?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    String(errorObj?.message ?? '')
      .toLowerCase()
      .includes('quota')
  );
};

const dataUrlToFile = (dataUrl: string, key: string): File | null => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];

  const ext =
    mime === 'image/png'
      ? 'png'
      : mime === 'image/webp'
        ? 'webp'
        : mime === 'image/gif'
          ? 'gif'
          : 'jpg';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const blob = new Blob([bytes], { type: mime });
  return new File([blob], `${key}.${ext}`, { type: mime });
};

export const DeveloperSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { showToast } = useToast();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'colors' | 'assets' | 'backup'>('colors');
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>(
    {}
  );

  useEffect(() => {
    // Load current colors from root
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const initialColors: Record<string, string> = {};

    THEME_VARS.forEach((v) => {
      const val = computed.getPropertyValue(v.name).trim();
      initialColors[v.name] = val || v.default;
    });
    setColors(initialColors);
  }, []);

  const handleColorChange = (name: string, value: string) => {
    setColors((prev) => ({ ...prev, [name]: value }));
    document.documentElement.style.setProperty(name, value);
  };

  const saveTheme = () => {
    localStorage.setItem('ksebe_theme_config', JSON.stringify(colors));
    showToast('Тема сохранена', 'success');
  };

  const resetTheme = () => {
    if (!window.confirm('Сбросить цвета к заводским настройкам?')) return;
    THEME_VARS.forEach((v) => {
      document.documentElement.style.setProperty(v.name, v.default);
    });
    localStorage.removeItem('ksebe_theme_config');
    // Reload state
    const resetState: Record<string, string> = {};
    THEME_VARS.forEach((v) => (resetState[v.name] = v.default));
    setColors(resetState);
    showToast('Настройки сброшены', 'info');
  };

  const handleImageUpload = (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Файл слишком большой (макс 5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result as string;
        localStorage.setItem(key, base64);
        setUploadStatus((prev) => ({ ...prev, [key]: 'success' }));
        setTimeout(() => setUploadStatus((prev) => ({ ...prev, [key]: 'idle' })), 2000);
        showToast('Изображение обновлено', 'success');
      } catch (e) {
        console.error(e);
        showToast('Ошибка сохранения: Память переполнена', 'error');
        setUploadStatus((prev) => ({ ...prev, [key]: 'error' }));
      }
    };
    reader.readAsDataURL(file);
  };

  // --- BACKUP LOGIC ---
  interface BackupData {
    version: string;
    timestamp: string;
    theme: string | null;
    user: string | null;
    assets: Record<string, string>;
  }
  const handleExportBackup = () => {
    const backupData: BackupData = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      theme: localStorage.getItem('ksebe_theme_config'),
      user: localStorage.getItem('ksebe_user'), // Include User Profile
      assets: {},
    };

    // Gather all known assets
    ASSET_SLOTS.forEach((slot) => {
      const val = localStorage.getItem(slot.key);
      if (val) backupData.assets[slot.key] = val;
    });

    // Also grab gallery images dynamic keys just in case
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('gallery-') || key.startsWith('review-')) &&
        !backupData.assets[key]
      ) {
        backupData.assets[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ksebe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Бэкап скачан (Профиль + Ассеты)', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const apply = async () => {
        try {
          interface BackupFile {
            version?: string;
            theme?: string | object;
            user?: string;
            assets?: Record<string, string>;
          }
          const json = JSON.parse(event.target?.result as string) as BackupFile;

          // --- Theme ---
          if (typeof json.theme === 'string') {
            localStorage.setItem('ksebe_theme_config', json.theme);
          } else if (json.theme && typeof json.theme === 'object' && !Array.isArray(json.theme)) {
            localStorage.setItem('ksebe_theme_config', JSON.stringify(json.theme));
          }

          // --- User (APP backup only) ---
          if (typeof json.user === 'string') {
            localStorage.setItem('ksebe_user', json.user);
          }

          // --- Assets (APP backup) + Images (WEB export) ---
          const entries: Array<[string, string]> = [];
          if (json.assets && typeof json.assets === 'object') {
            Object.entries(json.assets as Record<string, unknown>).forEach(([key, val]) => {
              if (typeof val === 'string') entries.push([key, val]);
            });
          }
          if (json.images && typeof json.images === 'object') {
            Object.entries(json.images as Record<string, unknown>).forEach(([key, val]) => {
              if (typeof val === 'string') entries.push([key, val]);
            });
          }

          let stored = 0;
          let uploaded = 0;

          for (const [key, val] of entries) {
            // Save for Image component compatibility
            try {
              localStorage.setItem(key, val);
              localStorage.setItem(`ksebe-img-${key}`, val);
              stored += 1;
            } catch (err) {
              if (!isQuotaExceeded(err)) throw err;

              // If we got base64 (data URL) — try to upload to Supabase Storage and store URL instead.
              if (val.startsWith('data:')) {
                const file = dataUrlToFile(val, key);
                if (file) {
                  const publicUrl = await uploadImage(file, key);
                  if (publicUrl) {
                    localStorage.setItem(key, publicUrl);
                    localStorage.setItem(`ksebe-img-${key}`, publicUrl);
                    // Best-effort mapping (optional)
                    await saveImageMapping(key, publicUrl);
                    uploaded += 1;
                    stored += 1;
                    continue;
                  }
                }
              }

              // Couldn't store it; skip but keep going
            }
          }

          showToast(
            uploaded > 0
              ? `Импорт: сохранено ${stored}, загружено в облако ${uploaded}. Перезагрузка...`
              : `Импорт: сохранено ${stored}. Перезагрузка...`,
            'success'
          );
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          console.error(err);
          showToast(
            'Импорт не удался. Если файл большой (base64) — включите Supabase в APP, чтобы загружать в облако.',
            'error'
          );
        }
      };

      void apply();
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full flex flex-col bg-[#111] text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111] z-10">
        <div>
          <h2 className="text-xl font-mono font-bold text-brand-green flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            DEV_MODE
          </h2>
          <p className="text-xs text-stone-500 font-mono">Настройки разработчика v1.1</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-mono transition-colors"
        >
          EXIT
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 py-4 font-mono text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'colors' ? 'bg-white/5 text-white border-b-2 border-brand-green' : 'text-stone-500 hover:text-white'}`}
        >
          <Palette className="w-4 h-4" /> <span className="hidden sm:inline">Цвета</span>
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-4 font-mono text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'assets' ? 'bg-white/5 text-white border-b-2 border-brand-green' : 'text-stone-500 hover:text-white'}`}
        >
          <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Ассеты</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 py-4 font-mono text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'backup' ? 'bg-white/5 text-white border-b-2 border-brand-green' : 'text-stone-500 hover:text-white'}`}
        >
          <FileJson className="w-4 h-4" /> <span className="hidden sm:inline">Бэкап</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'colors' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-mono text-sm text-stone-400 mb-6 uppercase tracking-widest border-b border-white/5 pb-2">
                Глобальные переменные
              </h3>
              <div className="space-y-4">
                {THEME_VARS.map((v) => (
                  <div key={v.name} className="flex items-center justify-between group">
                    <div>
                      <p className="font-medium text-sm">{v.label}</p>
                      <p className="text-[10px] text-stone-500 font-mono">{v.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-stone-400">{colors[v.name]}</span>
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-inner">
                        <input
                          type="color"
                          value={colors[v.name] || '#000000'}
                          onChange={(e) => handleColorChange(v.name, e.target.value)}
                          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveTheme}
                className="flex-1 py-4 bg-brand-green text-white font-mono text-sm rounded-xl hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Сохранить
              </button>
              <button
                onClick={resetTheme}
                className="px-6 py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl transition-colors"
                title="Сбросить"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-200/80 leading-relaxed font-mono">
                Для полной защиты от потери данных при очистке кэша используйте вкладку "Бэкап".
              </div>
            </div>

            <div className="grid gap-4">
              {ASSET_SLOTS.map((slot) => {
                const status = uploadStatus[slot.key] || 'idle';
                return (
                  <div
                    key={slot.key}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-stone-600 font-mono text-xs border border-white/5 shrink-0 overflow-hidden relative group">
                        {/* Preview if exists in localstorage */}
                        {localStorage.getItem(slot.key) ? (
                          <img
                            src={localStorage.getItem(slot.key)!}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          'IMG'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-200">{slot.label}</h4>
                        <code className="text-[10px] text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded block w-fit mt-1 mb-1">
                          {slot.key}
                        </code>
                        <p className="text-[10px] text-stone-500">{slot.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {status === 'success' && (
                        <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}

                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 whitespace-nowrap">
                        <Upload className="w-3 h-3" />
                        {status === 'idle' ? 'Загрузить' : 'Обновить'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(slot.key, e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif text-brand-green">Резервное копирование</h3>
              <p className="text-stone-400 text-sm">
                Браузер может очистить данные сайта (картинки и цвета). <br />
                Сохраните файл бэкапа на устройство, чтобы восстановить настройки в любой момент.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green mb-4">
                  <Download className="w-8 h-8" />
                </div>
                <h4 className="font-bold mb-2">Скачать настройки</h4>
                <p className="text-xs text-stone-500 mb-6 flex-1">
                  Сохраняет текущие цвета темы и все загруженные изображения в файл .json
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-3 bg-brand-green text-white rounded-xl font-mono text-xs font-bold hover:bg-brand-green/90 transition-colors"
                >
                  СКАЧАТЬ БЭКАП
                </button>
              </div>

              {/* Import Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h4 className="font-bold mb-2">Восстановить</h4>
                <p className="text-xs text-stone-500 mb-6 flex-1">
                  Загрузите ранее сохраненный файл .json, чтобы вернуть все настройки.
                </p>
                <label className="w-full py-3 bg-blue-600 text-white rounded-xl font-mono text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer flex items-center justify-center">
                  <span>ЗАГРУЗИТЬ БЭКАП</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>

            <div className="bg-stone-900 rounded-xl p-4 border border-white/5">
              <h5 className="font-mono text-xs text-stone-500 mb-2 uppercase">
                Техническая информация
              </h5>
              <div className="font-mono text-[10px] text-stone-600 space-y-1">
                <p>
                  LocalStorage Usage: ~
                  {(JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>Max Limit: ~5-10 MB (depends on browser)</p>
                <p>Keys Tracked: {ASSET_SLOTS.length} assets + Theme + User</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
