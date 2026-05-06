import { supabase } from '@ksebe/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { AdminTabProps } from '../types';

interface DBRetreat {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  price: number;
  spots_total: number;
  spots_booked: number;
  is_active: boolean;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

export const RetreatsTab: React.FC<AdminTabProps> = ({ toast }) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const {
    data: retreats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin_retreats'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('retreats')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data as DBRetreat[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (retreat: Omit<DBRetreat, 'id'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('retreats').insert(retreat);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_retreats'] });
      toast('Ретрит создан');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (retreat: DBRetreat) => {
      if (!supabase) return;
      const { id, ...fields } = retreat;
      const { error } = await supabase.from('retreats').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_retreats'] });
      toast('Ретрит обновлён');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('retreats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_retreats'] });
      toast('Ретрит удалён');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const toggleActive = (retreat: DBRetreat) => {
    updateMutation.mutate({ ...retreat, is_active: !retreat.is_active });
  };

  const handleSave = (retreat: DBRetreat | Omit<DBRetreat, 'id'>) => {
    if ('id' in retreat) updateMutation.mutate(retreat);
    else createMutation.mutate(retreat);
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
            <RetreatEditor
              initialData={
                editingId === 'new' ? undefined : retreats?.find((r) => r.id === editingId)
              }
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Ретриты ({retreats?.length ?? 0})</h3>
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Новый ретрит
        </button>
      </div>

      <div className="space-y-3">
        {retreats?.map((retreat) => (
          <div
            key={retreat.id}
            className={`bg-white rounded-xl border p-4 flex items-center gap-4 group transition-colors ${
              retreat.is_active
                ? 'border-stone-100 hover:border-brand-green/20'
                : 'border-stone-100 opacity-60'
            }`}
          >
            <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0">
              {retreat.image_url && (
                <img src={retreat.image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm truncate">{retreat.title}</div>
              <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{retreat.location}</span>
                <span>·</span>
                <span className="whitespace-nowrap">
                  {formatDate(retreat.start_date)} — {formatDate(retreat.end_date)}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {retreat.price.toLocaleString('ru-RU')} ₽ · мест: {retreat.spots_booked}/
                {retreat.spots_total}
              </div>
            </div>
            <div className="flex gap-1 shrink-0 items-center">
              <button
                type="button"
                onClick={() => toggleActive(retreat)}
                title={retreat.is_active ? 'Скрыть' : 'Показать'}
                className={`p-2 rounded-lg transition-colors ${
                  retreat.is_active
                    ? 'text-emerald-500 hover:bg-emerald-50'
                    : 'text-stone-300 hover:bg-stone-100'
                }`}
              >
                {retreat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(retreat.id)}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Удалить ретрит?')) deleteMutation.mutate(retreat.id);
                  }}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {retreats?.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            Нет ретритов. Создайте первый!
          </div>
        )}
      </div>
    </div>
  );
};

const RetreatEditor: React.FC<{
  initialData?: DBRetreat;
  onSave: (data: DBRetreat | Omit<DBRetreat, 'id'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBRetreat>>(
    initialData ?? {
      title: '',
      subtitle: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      image_url: '',
      price: 0,
      spots_total: 10,
      spots_booked: 0,
      is_active: true,
    }
  );

  const handleSubmit = () => {
    if (!draft.title) return alert('Введите название');
    if (!draft.location) return alert('Введите место проведения');
    if (!draft.start_date || !draft.end_date) return alert('Укажите даты');
    onSave(draft as Omit<DBRetreat, 'id'>);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg">
        {initialData ? 'Редактировать ретрит' : 'Новый ретрит'}
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

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Подзаголовок</span>
        <input
          type="text"
          value={draft.subtitle ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Место проведения</span>
        <input
          type="text"
          placeholder="Дубна, Подмосковье"
          value={draft.location ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Дата начала</span>
          <input
            type="date"
            value={draft.start_date ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, start_date: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Дата окончания</span>
          <input
            type="date"
            value={draft.end_date ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, end_date: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Цена (₽)</span>
          <input
            type="number"
            min={0}
            value={draft.price ?? 0}
            onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Мест всего</span>
          <input
            type="number"
            min={1}
            value={draft.spots_total ?? 10}
            onChange={(e) => setDraft((d) => ({ ...d, spots_total: Number(e.target.value) }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">URL изображения</span>
        <input
          type="text"
          placeholder="https://..."
          value={draft.image_url ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Описание</span>
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green resize-none"
        />
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.is_active ?? true}
          onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
          className="w-4 h-4 rounded accent-brand-green"
        />
        <span className="text-sm text-stone-600">Показывать на сайте</span>
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
