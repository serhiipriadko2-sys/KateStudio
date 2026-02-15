import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Plus, Pencil, Trash2, Save, X, Star } from 'lucide-react';

interface DBReview {
  id: string;
  name: string;
  text: string;
  image_url: string;
  rating: number;
  display_order: number;
  is_active: boolean;
}

export const ReviewsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  // Fetch Reviews
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DBReview[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (review: Omit<DBReview, 'id' | 'is_active' | 'display_order'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('reviews').insert(review);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast('Отзыв добавлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (review: DBReview) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('reviews')
        .update({
          name: review.name,
          text: review.text,
          image_url: review.image_url,
          rating: review.rating,
          display_order: review.display_order,
          is_active: review.is_active,
        })
        .eq('id', review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast('Отзыв обновлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast('Отзыв удален');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить отзыв?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (review: DBReview | Omit<DBReview, 'id'>) => {
    if ('id' in review) {
      updateMutation.mutate(review as DBReview);
    } else {
      createMutation.mutate(review as Omit<DBReview, 'id'>);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка отзывов...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Ошибка: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Editor Overlay */}
      {editingId && (
        <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setEditingId(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <ReviewEditor
              initialData={editingId === 'new' ? undefined : reviews?.find((r) => r.id === editingId)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Отзывы ({reviews?.length || 0})</h3>
        <button
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Добавить отзыв
        </button>
      </div>

      <div className="grid gap-3">
        {reviews?.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${
              !review.is_active ? 'border-stone-100 opacity-60' : 'border-stone-100 hover:border-brand-green/20'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden shrink-0">
              {review.image_url ? (
                <img src={review.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                  Фото
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-medium text-stone-700 text-sm truncate">{review.name}</div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-stone-200 fill-stone-200'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2">{review.text}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditingId(review.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(review.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {reviews?.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            Список отзывов пуст
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewEditor: React.FC<{
  initialData?: DBReview;
  onSave: (data: DBReview | Omit<DBReview, 'id'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBReview>>(
    initialData || {
      name: '',
      text: '',
      image_url: '',
      rating: 5,
      display_order: 0,
      is_active: true,
    }
  );

  const handleSubmit = () => {
    if (!draft.name || !draft.text) return alert('Заполните имя и текст');
    onSave(draft as any);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg mb-4">
        {initialData ? 'Редактировать отзыв' : 'Новый отзыв'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Имя</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Оценка (1-5)</span>
          <input
            type="number"
            min="1"
            max="5"
            value={draft.rating}
            onChange={(e) => setDraft((d) => ({ ...d, rating: Number(e.target.value) }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Текст отзыва</span>
        <textarea
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none resize-none"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">URL фото/аватара</span>
        <input
          type="text"
          value={draft.image_url}
          onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          placeholder="https://..."
        />
      </label>

      <div className="flex gap-4 items-center pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
            className="w-4 h-4 text-brand-green rounded focus:ring-brand-green/30"
          />
          <span className="text-sm text-stone-600">Активен</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
        >
          <Save className="w-4 h-4" /> Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};
