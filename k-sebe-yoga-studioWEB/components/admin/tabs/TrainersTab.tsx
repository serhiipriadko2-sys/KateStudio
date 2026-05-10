import {
  createTrainer,
  deleteTrainer,
  listAdminTrainers,
  updateTrainer,
} from '@ksebe/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { AdminTabProps, TrainerAdminRow } from '../types';

interface TrainerFormState {
  slug: string;
  full_name: string;
  short_name: string;
  role_title: string;
  bio_short: string;
  bio_long: string;
  quote: string;
  avatar_url: string;
  cover_image_url: string;
  specialties_text: string;
  teaching_formats_text: string;
  experience_years: string;
  instagram_url: string;
  telegram_url: string;
  sort_order: string;
  is_featured: boolean;
  is_active: boolean;
}

const EMPTY_FORM: TrainerFormState = {
  slug: '',
  full_name: '',
  short_name: '',
  role_title: 'Преподаватель',
  bio_short: '',
  bio_long: '',
  quote: '',
  avatar_url: '',
  cover_image_url: '',
  specialties_text: '',
  teaching_formats_text: 'studio',
  experience_years: '',
  instagram_url: '',
  telegram_url: '',
  sort_order: '0',
  is_featured: false,
  is_active: true,
};

const toFormState = (trainer: TrainerAdminRow): TrainerFormState => ({
  slug: trainer.slug,
  full_name: trainer.full_name,
  short_name: trainer.short_name ?? '',
  role_title: trainer.role_title,
  bio_short: trainer.bio_short,
  bio_long: trainer.bio_long ?? '',
  quote: trainer.quote ?? '',
  avatar_url: trainer.avatar_url ?? '',
  cover_image_url: trainer.cover_image_url ?? '',
  specialties_text: trainer.specialties.join(', '),
  teaching_formats_text: trainer.teaching_formats.join(', '),
  experience_years: trainer.experience_years?.toString() ?? '',
  instagram_url: trainer.instagram_url ?? '',
  telegram_url: trainer.telegram_url ?? '',
  sort_order: trainer.sort_order.toString(),
  is_featured: trainer.is_featured,
  is_active: trainer.is_active,
});

const normalizeList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toPayload = (form: TrainerFormState) => ({
  slug: form.slug.trim(),
  full_name: form.full_name.trim(),
  short_name: form.short_name.trim() || null,
  role_title: form.role_title.trim(),
  bio_short: form.bio_short.trim(),
  bio_long: form.bio_long.trim() || null,
  quote: form.quote.trim() || null,
  avatar_url: form.avatar_url.trim() || null,
  cover_image_url: form.cover_image_url.trim() || null,
  specialties: normalizeList(form.specialties_text),
  teaching_formats: normalizeList(form.teaching_formats_text) as Array<
    'studio' | 'online' | 'retreat' | 'private'
  >,
  experience_years: form.experience_years ? Number(form.experience_years) : null,
  instagram_url: form.instagram_url.trim() || null,
  telegram_url: form.telegram_url.trim() || null,
  sort_order: Number(form.sort_order || '0'),
  is_featured: form.is_featured,
  is_active: form.is_active,
});

export const TrainersTab: React.FC<AdminTabProps> = ({ toast }) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<TrainerFormState>(EMPTY_FORM);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['admin_trainers'],
    queryFn: listAdminTrainers,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: TrainerFormState) => createTrainer(toPayload(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_trainers'] });
      toast('Тренер добавлен');
      setIsCreating(false);
      setFormData(EMPTY_FORM);
    },
    onError: () => toast('Ошибка при создании тренера', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TrainerFormState }) =>
      updateTrainer(id, toPayload(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_trainers'] });
      toast('Тренер обновлен');
      setEditingId(null);
      setFormData(EMPTY_FORM);
    },
    onError: () => toast('Ошибка при обновлении тренера', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_trainers'] });
      toast('Тренер удален');
    },
    onError: () => toast('Ошибка при удалении тренера', 'error'),
  });

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const startEdit = (trainer: TrainerAdminRow) => {
    setEditingId(trainer.id);
    setIsCreating(false);
    setFormData(toFormState(trainer));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.slug.trim() || !formData.full_name.trim() || !formData.bio_short.trim()) {
      toast('Заполните slug, имя и короткое описание', 'error');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: formData });
      return;
    }

    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-stone-400">Загрузка тренеров...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-stone-800">Тренеры</h3>
          <p className="text-sm text-stone-400 mt-1">
            Единый список преподавателей для сайта, приложения и админки.
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить тренера
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Slug</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="lidia-kuzina"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Полное имя</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="Лидия Кузина"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Короткое имя</span>
              <input
                type="text"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="Лидия"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Роль</span>
              <input
                type="text"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="Преподаватель хатха-йоги"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-stone-500 mb-1">
              Короткое описание
            </span>
            <textarea
              value={formData.bio_short}
              onChange={(e) => setFormData({ ...formData, bio_short: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none min-h-[80px]"
              placeholder="Короткое описание для карточки"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-stone-500 mb-1">Полное описание</span>
            <textarea
              value={formData.bio_long}
              onChange={(e) => setFormData({ ...formData, bio_long: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none min-h-[140px]"
              placeholder="Подробный текст для страницы тренера"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Специализации</span>
              <input
                type="text"
                value={formData.specialties_text}
                onChange={(e) => setFormData({ ...formData, specialties_text: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="хатха-йога, виньяса-флоу"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Форматы</span>
              <input
                type="text"
                value={formData.teaching_formats_text}
                onChange={(e) =>
                  setFormData({ ...formData, teaching_formats_text: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="studio, private"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Опыт, лет</span>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="10"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Порядок</span>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="0"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Avatar URL</span>
              <input
                type="text"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="https://..."
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Cover URL</span>
              <input
                type="text"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="https://..."
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Instagram URL</span>
              <input
                type="text"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="https://instagram.com/..."
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-stone-500 mb-1">Telegram URL</span>
              <input
                type="text"
                value={formData.telegram_url}
                onChange={(e) => setFormData({ ...formData, telegram_url: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="https://t.me/..."
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-stone-500 mb-1">Цитата</span>
            <input
              type="text"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
              placeholder="К себе нежно."
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Показывать как featured
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Активный профиль
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-white text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 border border-stone-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 flex items-center gap-2"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-white p-5 rounded-2xl border border-stone-100 flex justify-between items-start gap-4 group hover:border-brand-green/30 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-stone-800">{trainer.full_name}</h4>
                {!trainer.is_active && (
                  <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-md uppercase tracking-wide">
                    hidden
                  </span>
                )}
                {trainer.is_featured && (
                  <span className="inline-block px-2 py-0.5 bg-brand-mint text-brand-green text-[10px] rounded-md uppercase tracking-wide">
                    featured
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-green">{trainer.role_title}</p>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{trainer.bio_short}</p>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-block px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-md uppercase tracking-wide"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(trainer)}
                className="p-2 text-stone-400 hover:text-brand-green hover:bg-stone-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Удалить профиль ${trainer.full_name}?`)) {
                    deleteMutation.mutate(trainer.id);
                  }
                }}
                className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {trainers.length === 0 && (
          <div className="text-center py-12 bg-stone-50 rounded-2xl text-stone-400">
            Профили тренеров пока не добавлены
          </div>
        )}
      </div>
    </div>
  );
};