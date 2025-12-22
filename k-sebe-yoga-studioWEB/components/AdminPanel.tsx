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
  FileJson,
  Trash2,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import { uploadImage, saveImageMapping } from '../services/content';
import { ThemeColors, loadTheme, saveTheme, resetTheme, applyTheme } from '../services/theme';
import { Image } from './Image';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Registry of all dynamic image blocks in the app
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'images' | 'backup'>('colors');
  const [colors, setColors] = useState<ThemeColors>(loadTheme());
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useScrollLock(isOpen);

  // Load theme on mount to ensure app matches saved state
  useEffect(() => {
    const saved = loadTheme();
    setColors(saved);
    applyTheme(saved);
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    applyTheme(newColors); // Real-time preview
  };

  const handleSaveTheme = () => {
    saveTheme(colors);
    showToast('Настройки темы сохранены!');
  };

  const handleResetTheme = () => {
    if (confirm('Сбросить цвета к заводским настройкам?')) {
      const defaults = resetTheme();
      setColors(defaults);
      showToast('Настройки сброшены');
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Файл слишком большой (>5MB)', 'error');
      return;
    }

    setUploadingKey(key);

    // 1. Prepare Base64 Fallback
    const base64Fallback = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    try {
      // 2. Try Cloud Upload
      const publicUrl = await uploadImage(file, key);

      if (publicUrl) {
        await saveImageMapping(key, publicUrl);
        // Save URL to local cache
        localStorage.setItem(`ksebe-img-${key}`, publicUrl);
        showToast('Изображение успешно загружено!');
      } else {
        throw new Error('Cloud unavailable');
      }
    } catch (e: any) {
      // 3. Fallback to Local Storage
      try {
        localStorage.setItem(`ksebe-img-${key}`, base64Fallback);
        showToast('Сохранено локально (Режим разработки)', 'success');
      } catch (storageError) {
        showToast('Ошибка: Файл слишком большой для браузера', 'error');
      }
    } finally {
      // Notify components to update
      window.dispatchEvent(new Event('storage'));
      setUploadingKey(null);
    }
  };

  const handleClearCache = () => {
    if (
      confirm(
        'Это удалит все локально сохраненные изображения (Base64) из браузера. Если они не были загружены в облако, они пропадут. Продолжить?'
      )
    ) {
      // Clear only image keys
      IMAGE_REGISTRY.forEach((item) => {
        localStorage.removeItem(`ksebe-img-${item.key}`);
      });
      window.dispatchEvent(new Event('storage'));
      showToast('Кэш изображений очищен');
    }
  };

  const handleExportConfig = () => {
    try {
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

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute(
        'download',
        `ksebe_config_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast('Конфигурация выгружена');
    } catch (e) {
      showToast('Ошибка экспорта', 'error');
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);

        // Restore Theme
        if (config.theme) {
          setColors(config.theme);
          saveTheme(config.theme);
        }

        // Restore Images
        if (config.images) {
          Object.entries(config.images).forEach(([key, url]) => {
            localStorage.setItem(`ksebe-img-${key}`, url as string);
            // Try to sync with Supabase if possible (fire and forget)
            saveImageMapping(key, url as string);
          });
        }

        // Trigger updates
        window.dispatchEvent(new Event('storage'));
        showToast('Конфигурация успешно импортирована');
      } catch (err) {
        showToast('Неверный формат файла', 'error');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white shadow-2xl h-full ml-auto flex flex-col animate-in slide-in-from-right duration-300 relative">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-dark text-white rounded-lg">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Developer Settings</h2>
              <p className="text-xs text-stone-500">Панель администратора студии</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'colors' ? 'bg-white text-brand-green border-b-2 border-brand-green' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
          >
            <Palette className="w-4 h-4" /> <span className="hidden sm:inline">Цвета</span>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'images' ? 'bg-white text-brand-green border-b-2 border-brand-green' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
          >
            <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Медиа</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'backup' ? 'bg-white text-brand-green border-b-2 border-brand-green' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
          >
            <Database className="w-4 h-4" /> <span className="hidden sm:inline">Бэкап</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorInput
                  label="Основной (Зеленый)"
                  variable="--color-brand-green"
                  value={colors['--color-brand-green']}
                  onChange={handleColorChange}
                />
                <ColorInput
                  label="Акцент (Мятный)"
                  variable="--color-brand-mint"
                  value={colors['--color-brand-mint']}
                  onChange={handleColorChange}
                />
                <ColorInput
                  label="Темный (Футер)"
                  variable="--color-brand-dark"
                  value={colors['--color-brand-dark']}
                  onChange={handleColorChange}
                />
                <ColorInput
                  label="Текст (Основной)"
                  variable="--color-brand-text"
                  value={colors['--color-brand-text']}
                  onChange={handleColorChange}
                />
                <ColorInput
                  label="Фон (Сайт)"
                  variable="--color-brand-light"
                  value={colors['--color-brand-light']}
                  onChange={handleColorChange}
                />
                <ColorInput
                  label="Вторичный акцент"
                  variable="--color-brand-accent"
                  value={colors['--color-brand-accent']}
                  onChange={handleColorChange}
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
                <button
                  onClick={handleSaveTheme}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl shadow-lg hover:bg-brand-green/90 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" /> Сохранить изменения
                </button>
                <button
                  onClick={handleResetTheme}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-rose-500 border border-stone-200 rounded-xl hover:bg-rose-50 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Сброс
                </button>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-6 flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-brand-green mt-1" />
                  <div>
                    <h4 className="font-bold text-stone-800">Управление хранилищем</h4>
                    <p className="text-sm text-stone-500 mt-1 max-w-sm">
                      Здесь вы можете загрузить изображения. Если облако недоступно, файлы
                      сохранятся локально (base64).
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-xs font-bold uppercase"
                >
                  <Trash2 className="w-3 h-3" /> Очистить кэш
                </button>
              </div>

              <div className="grid gap-4">
                {IMAGE_REGISTRY.map((item) => (
                  <div
                    key={item.key}
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 transition-all hover:border-brand-green/30"
                  >
                    <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 relative">
                      <Image
                        storageKey={item.key}
                        src="/placeholder.png" // Fallback
                        alt={item.label}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                        controlsClassName="hidden" // Hide on-image controls in admin list
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-700 truncate">{item.label}</h4>
                      <code className="text-xs text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                        {item.key}
                      </code>
                    </div>
                    <div>
                      <label
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadingKey === item.key ? 'bg-stone-100 text-stone-400 cursor-wait' : 'bg-brand-mint/50 text-brand-green hover:bg-brand-green hover:text-white'}`}
                      >
                        {uploadingKey === item.key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
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
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(item.key, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="text-lg font-serif text-brand-dark mb-4">Резервное копирование</h3>
                <p className="text-stone-500 mb-6 text-sm">
                  Вы можете скачать все текущие настройки (цветовую схему и ссылки на изображения) в
                  виде JSON файла. Это полезно для переноса настроек на другое устройство или для
                  восстановления после очистки кэша.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleExportConfig}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors font-medium border border-stone-200"
                  >
                    <Download className="w-5 h-5" />
                    Скачать конфиг
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 transition-colors font-medium cursor-pointer shadow-lg shadow-brand-green/20">
                    <Upload className="w-5 h-5" />
                    Импортировать
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

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <FileJson className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Формат файла</p>
                  <p>
                    Файл содержит JSON объект с ключами <code>theme</code> и <code>images</code>. Не
                    редактируйте его вручную, если не уверены в структуре.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl border ${notification.type === 'success' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-600 border-rose-100'}`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium text-stone-800">{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ColorInput: React.FC<{
  label: string;
  variable: string;
  value: string;
  onChange: (k: any, v: string) => void;
}> = ({ label, variable, value, onChange }) => (
  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <span className="text-xs text-stone-400 font-mono">{variable}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono bg-stone-50 px-2 py-1 rounded">{value}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(variable, e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
      />
    </div>
  </div>
);
