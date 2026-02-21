import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { AdminTabProps, FAQItem } from '../types';

export const FAQTab: React.FC<AdminTabProps> = ({ toast }) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQItem>>({});

  // Fetch FAQs
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin_faqs'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as FAQItem[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newItem: Partial<FAQItem>) => {
      if (!supabase) throw new Error('No Supabase');
      // Get max order_index
      const { data: maxOrder } = await supabase
        .from('faq_items')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrder?.order_index ?? 0) + 1;

      const { error } = await supabase.from('faq_items').insert([{ ...newItem, order_index: nextOrder }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faqs'] });
      toast('Вопрос добавлен');
      setIsCreating(false);
      setFormData({});
    },
    onError: () => toast('Ошибка при создании', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FAQItem> }) => {
      if (!supabase) throw new Error('No Supabase');
      const { error } = await supabase.from('faq_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faqs'] });
      toast('Вопрос обновлен');
      setEditingId(null);
      setFormData({});
    },
    onError: () => toast('Ошибка при обновлении', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('No Supabase');
      const { error } = await supabase.from('faq_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faqs'] });
      toast('Вопрос удален');
    },
    onError: () => toast('Ошибка при удалении', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast('Заполните вопрос и ответ', 'error');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (item: FAQItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка FAQ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-800">FAQ (Вопросы и ответы)</h3>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить вопрос
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Вопрос</label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="Например: Как записаться?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Ответ</label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none min-h-[100px]"
                placeholder="Текст ответа..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Категория (опционально)</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-brand-green outline-none"
                placeholder="common, pricing, schedule..."
              />
            </div>
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
              {(createMutation.isPending || updateMutation.isPending) ? (
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
        {faqs?.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-stone-100 flex justify-between items-start gap-4 group hover:border-brand-green/30 transition-colors"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-stone-800">{item.question}</h4>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">{item.answer}</p>
              {item.category && (
                <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] rounded-md mt-2 uppercase tracking-wide">
                  {item.category}
                </span>
              )}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(item)}
                className="p-2 text-stone-400 hover:text-brand-green hover:bg-stone-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Удалить этот вопрос?')) {
                    deleteMutation.mutate(item.id);
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
        {faqs?.length === 0 && (
          <div className="text-center py-12 bg-stone-50 rounded-2xl text-stone-400">
            Список вопросов пуст
          </div>
        )}
      </div>
    </div>
  );
};
