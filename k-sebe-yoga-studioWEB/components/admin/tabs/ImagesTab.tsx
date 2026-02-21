import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Loader2, Image as ImageIcon, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';

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

export const ImagesTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'assignments' | 'gallery'>('assignments');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Fetch Image Map
  const { data: imageMap = {} } = useQuery({
    queryKey: ['settings', 'image_map'],
    queryFn: async () => {
      if (!supabase) return {};
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'image_map')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data?.value as Record<string, string>) || {};
    },
  });

  // Fetch Gallery Files
  const { data: galleryFiles, isLoading: isLoadingGallery } = useQuery({
    queryKey: ['storage', 'images'],
    enabled: activeView === 'gallery',
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.storage.from('images').list();
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation to update map
  const updateMapMutation = useMutation({
    mutationFn: async (newMap: Record<string, string>) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'image_map', value: newMap, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: (_, newMap) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'image_map'] });
      // Sync to localStorage for immediate effect on legacy components
      Object.entries(newMap).forEach(([k, v]) => localStorage.setItem(`ksebe-img-${k}`, v));
      window.dispatchEvent(new Event('storage'));
      toast('Настройки изображений обновлены');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const handleUpload = async (key: string, file: File) => {
    if (!supabase) return;
    setUploadingKey(key);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(data.path);

      const newMap = { ...imageMap, [key]: publicUrl };
      updateMapMutation.mutate(newMap);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(`Upload error: ${err.message}`, 'error');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDeleteAssignment = (key: string) => {
    if (!confirm('Сбросить изображение для этого блока?')) return;
    const newMap = { ...imageMap };
    delete newMap[key];
    updateMapMutation.mutate(newMap);
    localStorage.removeItem(`ksebe-img-${key}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Ссылка скопирована');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveView('assignments')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeView === 'assignments'
              ? 'bg-white text-brand-green shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Назначения
        </button>
        <button
          onClick={() => setActiveView('gallery')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeView === 'gallery'
              ? 'bg-white text-brand-green shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Все файлы
        </button>
      </div>

      {activeView === 'assignments' && (
        <div className="space-y-3">
          {IMAGE_REGISTRY.map((item) => {
            const currentUrl = imageMap[item.key];
            return (
              <div
                key={item.key}
                className="bg-white p-3 rounded-xl border border-stone-100 flex items-center gap-3 hover:border-brand-green/20 transition-colors"
              >
                <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 relative group">
                  {currentUrl ? (
                    <img src={currentUrl} alt={item.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-700 truncate">{item.label}</div>
                  <code className="text-[10px] text-stone-400">{item.key}</code>
                </div>

                <div className="flex items-center gap-2">
                  {currentUrl && (
                    <button
                      onClick={() => handleDeleteAssignment(item.key)}
                      className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
                      title="Сбросить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                        if (f) handleUpload(item.key, f);
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'gallery' && (
        <div>
          {isLoadingGallery ? (
            <div className="p-8 text-center text-stone-400">Загрузка файлов...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryFiles?.map((file) => {
                const url = supabase?.storage.from('images').getPublicUrl(file.name).data.publicUrl;
                return (
                  <div
                    key={file.id}
                    className="group relative bg-white rounded-xl border border-stone-100 overflow-hidden aspect-square"
                  >
                    <img src={url} alt={file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => url && copyToClipboard(url)}
                        className="p-2 bg-white rounded-full text-stone-700 hover:text-brand-green"
                        title="Копировать URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-[10px] text-white truncate">{file.name}</p>
                    </div>
                  </div>
                );
              })}
              {galleryFiles?.length === 0 && (
                <div className="col-span-full p-8 text-center text-stone-400 border border-dashed rounded-xl">
                  Нет файлов в хранилище
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
