import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';

// DB Type
interface DBArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  image_url: string;
  content: string;
  published_at: string; // ISO string
}

const formatDateForDisplay = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const ContentTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  // Fetch Articles
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as DBArticle[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (article: Omit<DBArticle, 'id' | 'created_at'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('articles').insert(article);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast('Статья создана');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (article: DBArticle) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('articles')
        .update({
            title: article.title,
            category: article.category,
            excerpt: article.excerpt,
            image_url: article.image_url,
            content: article.content,
            published_at: article.published_at
        })
        .eq('id', article.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast('Статья обновлена');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast('Статья удалена');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить статью?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (article: DBArticle | Omit<DBArticle, 'id'>) => {
    if ('id' in article) {
      updateMutation.mutate(article as DBArticle);
    } else {
      createMutation.mutate(article as Omit<DBArticle, 'id'>);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Ошибка загрузки: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Editor Overlay */}
      {editingId && (
        <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                 <button
                    onClick={() => setEditingId(null)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
                 >
                     <XIcon className="w-5 h-5" />
                 </button>
                 <ArticleEditor
                    initialData={editingId === 'new' ? undefined : articles?.find(a => a.id === editingId)}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                 />
            </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">
          Статьи блога ({articles?.length || 0})
        </h3>
        <button
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Новая статья
        </button>
      </div>

      <div className="space-y-3">
        {articles?.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-4 group hover:border-brand-green/20 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0">
              {article.image_url && (
                <img src={article.image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm truncate">
                {article.title || 'Без заголовка'}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {article.category} · {formatDateForDisplay(article.published_at)}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setEditingId(article.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(article.id)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {articles?.length === 0 && (
             <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
                 Нет статей. Создайте первую!
             </div>
        )}
      </div>
    </div>
  );
};

const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ArticleEditor: React.FC<{
  initialData?: DBArticle;
  onSave: (data: DBArticle | Omit<DBArticle, 'id'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBArticle>>(
    initialData || {
      title: '',
      category: '',
      excerpt: '',
      image_url: '',
      content: '',
      published_at: new Date().toISOString(),
    }
  );

  const handleSubmit = () => {
      if (!draft.title) return alert('Введите заголовок');
      onSave(draft as any);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg mb-4">
          {initialData ? 'Редактировать статью' : 'Новая статья'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Категория</span>
          <input
            type="text"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
            placeholder="Практика"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Дата публикации</span>
          <input
            type="datetime-local"
            value={draft.published_at?.slice(0, 16)}
            onChange={(e) => setDraft((d) => ({ ...d, published_at: new Date(e.target.value).toISOString() }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Заголовок</span>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Краткое описание</span>
        <textarea
          value={draft.excerpt}
          onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green resize-none"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">URL изображения</span>
        <input
          type="text"
          value={draft.image_url}
          onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          placeholder="https://..."
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Содержание (HTML)</span>
        <textarea
          value={draft.content}
          onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          rows={8}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green resize-y"
        />
      </label>

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

export { ContentTab };
