import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface DBFAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export const FAQTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  // Fetch FAQs
  const { data: faqItems, isLoading, error } = useQuery({
    queryKey: ['faq_items'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DBFAQItem[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (item: Omit<DBFAQItem, 'id' | 'is_active' | 'display_order'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('faq_items').insert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq_items'] });
      toast('Вопрос добавлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (item: DBFAQItem) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('faq_items')
        .update({
          question: item.question,
          answer: item.answer,
          display_order: item.display_order,
          is_active: item.is_active,
        })
        .eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq_items'] });
      toast('Вопрос обновлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('faq_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq_items'] });
      toast('Вопрос удален');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить вопрос?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (item: DBFAQItem | Omit<DBFAQItem, 'id'>) => {
    if ('id' in item) {
      updateMutation.mutate(item as DBFAQItem);
    } else {
      createMutation.mutate(item as Omit<DBFAQItem, 'id'>);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка вопросов...</div>;
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
            <FAQEditor
              initialData={editingId === 'new' ? undefined : faqItems?.find((i) => i.id === editingId)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Частые вопросы ({faqItems?.length || 0})</h3>
        <button
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Добавить вопрос
        </button>
      </div>

      <div className="grid gap-3">
        {faqItems?.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${
              !item.is_active ? 'border-stone-100 opacity-60' : 'border-stone-100 hover:border-brand-green/20'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm mb-1">{item.question}</div>
              <p className="text-xs text-stone-500 line-clamp-2">{item.answer}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditingId(item.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {faqItems?.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            Список вопросов пуст
          </div>
        )}
      </div>
    </div>
  );
};

const FAQEditor: React.FC<{
  initialData?: DBFAQItem;
  onSave: (data: DBFAQItem | Omit<DBFAQItem, 'id'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBFAQItem>>(
    initialData || {
      question: '',
      answer: '',
      display_order: 0,
      is_active: true,
    }
  );

  const handleSubmit = () => {
    if (!draft.question || !draft.answer) return alert('Заполните вопрос и ответ');
    onSave(draft as any);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg mb-4">
        {initialData ? 'Редактировать вопрос' : 'Новый вопрос'}
      </h3>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Вопрос</span>
        <input
          type="text"
          value={draft.question}
          onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Ответ</span>
        <textarea
          value={draft.answer}
          onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))}
          rows={6}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none resize-y"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Порядок</span>
          <input
            type="number"
            value={draft.display_order}
            onChange={(e) => setDraft((d) => ({ ...d, display_order: Number(e.target.value) }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-lg mt-5">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
            className="w-4 h-4 text-brand-green rounded focus:ring-brand-green/30"
          />
          <span className="text-sm text-stone-600">Активен</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-stone-100">
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
