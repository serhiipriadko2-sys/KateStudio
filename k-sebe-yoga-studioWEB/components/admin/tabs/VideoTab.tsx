import { supabase } from '@ksebe/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Pencil, Plus, Save, Trash2, Unlock, X } from 'lucide-react';
import React, { useState } from 'react';
import { AdminTabProps } from '../types';

interface DBVideo {
  id: string;
  title: string;
  duration: string;
  level: 'Easy' | 'Medium' | 'Hard';
  image_url: string;
  video_url: string;
  is_locked: boolean;
  tags: string[];
}

const LEVELS: DBVideo['level'][] = ['Easy', 'Medium', 'Hard'];
const LEVEL_LABELS: Record<DBVideo['level'], string> = {
  Easy: 'Лёгкий',
  Medium: 'Средний',
  Hard: 'Сложный',
};

export const VideoTab: React.FC<AdminTabProps> = ({ toast }) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const {
    data: videos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin_videos'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      return data as DBVideo[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (video: Omit<DBVideo, 'id'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('videos').insert(video);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_videos'] });
      toast('Видео добавлено');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (video: DBVideo) => {
      if (!supabase) return;
      const { id, ...fields } = video;
      const { error } = await supabase.from('videos').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_videos'] });
      toast('Видео обновлено');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_videos'] });
      toast('Видео удалено');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const toggleLock = (video: DBVideo) => {
    updateMutation.mutate({ ...video, is_locked: !video.is_locked });
  };

  const handleSave = (video: DBVideo | Omit<DBVideo, 'id'>) => {
    if ('id' in video) {
      updateMutation.mutate(video);
    } else {
      createMutation.mutate(video);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка...</div>;
  if (error)
    return <div className="p-8 text-center text-rose-500">Ошибка загрузки: {error.message}</div>;

  return (
    <div className="space-y-4">
      {editingId && (
        <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <VideoEditor
              initialData={
                editingId === 'new' ? undefined : videos?.find((v) => v.id === editingId)
              }
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Видео ({videos?.length ?? 0})</h3>
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Добавить видео
        </button>
      </div>

      <div className="space-y-3">
        {videos?.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-4 group hover:border-brand-green/20 transition-colors"
          >
            <div className="w-16 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
              {video.image_url && (
                <img src={video.image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm truncate">{video.title}</div>
              <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                <span>{video.duration}</span>
                <span>·</span>
                <span>{LEVEL_LABELS[video.level] ?? video.level}</span>
                {video.tags?.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="truncate">{video.tags.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0 items-center">
              <button
                type="button"
                onClick={() => toggleLock(video)}
                title={video.is_locked ? 'Закрыто (Premium)' : 'Открыто (Free)'}
                className={`p-2 rounded-lg transition-colors ${
                  video.is_locked
                    ? 'text-amber-500 hover:bg-amber-50'
                    : 'text-stone-300 hover:bg-stone-100'
                }`}
              >
                {video.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(video.id)}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Удалить видео?')) deleteMutation.mutate(video.id);
                  }}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {videos?.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            Нет видео. Добавьте первое!
          </div>
        )}
      </div>
    </div>
  );
};

const VideoEditor: React.FC<{
  initialData?: DBVideo;
  onSave: (data: DBVideo | Omit<DBVideo, 'id'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBVideo>>(
    initialData ?? {
      title: '',
      duration: '',
      level: 'Easy',
      image_url: '',
      video_url: '',
      is_locked: true,
      tags: [],
    }
  );
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '));

  const handleSubmit = () => {
    if (!draft.title) return alert('Введите название');
    if (!draft.duration) return alert('Введите длительность');
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...draft, tags } as Omit<DBVideo, 'id'>);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg">
        {initialData ? 'Редактировать видео' : 'Новое видео'}
      </h3>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Название</span>
        <input
          type="text"
          value={draft.title ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Длительность</span>
          <input
            type="text"
            placeholder="45 мин"
            value={draft.duration ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Уровень</span>
          <select
            value={draft.level ?? 'Easy'}
            onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as DBVideo['level'] }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green bg-white"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">URL обложки</span>
        <input
          type="text"
          placeholder="https://..."
          value={draft.image_url ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">URL видео</span>
        <input
          type="text"
          placeholder="https://..."
          value={draft.video_url ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, video_url: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Теги (через запятую)</span>
        <input
          type="text"
          placeholder="Энергия, Покой, Здоровье"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.is_locked ?? true}
          onChange={(e) => setDraft((d) => ({ ...d, is_locked: e.target.checked }))}
          className="w-4 h-4 rounded accent-brand-green"
        />
        <span className="text-sm text-stone-600">Только для Premium (закрыто)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
        >
          <Save className="w-4 h-4" /> Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};
