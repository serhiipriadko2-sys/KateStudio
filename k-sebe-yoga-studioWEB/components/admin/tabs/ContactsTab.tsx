import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
} from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { ContactRow } from '../types';

const formatCreatedAt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ContactsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { data, error } = await supabase
        .from('contacts')
        .select('id,name,phone,message,created_at,status')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as ContactRow[]) || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast('Обращение удалено');
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка удаления', 'error');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactRow['status'] }) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка обновления статуса', 'error');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить это обращение?')) deleteMutation.mutate(id);
  };

  const markAsRead = (id: string) => {
    statusMutation.mutate({ id, status: 'read' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">
          Обращения с сайта ({contacts.length})
        </h3>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
          title="Обновить"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Обращений пока нет</p>
          <p className="text-xs text-stone-300 mt-1">
            Они появятся, когда кто-то отправит форму на сайте
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const isOpen = expanded === c.id;
            const createdAt = formatCreatedAt(c.created_at);
            const isNew = c.status === 'new' || !c.status;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border transition-colors ${
                  isNew ? 'border-brand-green/30' : 'border-stone-100'
                }`}
              >
                <button
                  onClick={() => {
                    setExpanded(isOpen ? null : c.id);
                    if (isNew) markAsRead(c.id);
                  }}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium text-stone-700 text-sm truncate">
                      {c.name || 'Без имени'}
                      {isNew && (
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs text-stone-400 truncate">
                      {c.message
                        ? c.message.length > 60
                          ? c.message.slice(0, 60) + '...'
                          : c.message
                        : c.phone || '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400">{createdAt}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-stone-50 animate-in slide-in-from-top-1 duration-150">
                    <div className="mt-3 space-y-2">
                      {c.name && (
                        <div className="flex gap-2 text-xs">
                          <span className="text-stone-400 w-16 shrink-0">Имя</span>
                          <span className="text-stone-700 font-medium">{c.name}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex gap-2 text-xs">
                          <span className="text-stone-400 w-16 shrink-0">Телефон</span>
                          <a
                            href={`tel:${c.phone}`}
                            className="text-brand-green font-medium hover:underline"
                          >
                            {c.phone}
                          </a>
                        </div>
                      )}
                      {c.message && (
                        <div className="text-xs">
                          <span className="text-stone-400 block mb-1">Сообщение</span>
                          <p className="text-stone-700 bg-stone-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                            {c.message}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 text-xs items-center">
                         <span className="text-stone-400 w-16 shrink-0">Статус</span>
                         <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded capitalize">
                            {c.status || 'new'}
                         </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                       {c.status !== 'read' && c.status !== 'processed' && (
                         <button
                            onClick={() => markAsRead(c.id)}
                            className="text-xs text-brand-green hover:underline flex items-center gap-1"
                         >
                            <Check className="w-3 h-3" /> Прочитано
                         </button>
                       )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
