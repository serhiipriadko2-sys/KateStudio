import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Phone,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  XCircle,
  UserX,
  PlayCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { BookingRow } from '../types';

const formatCreatedAt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const BookingsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'classes'>('all');

  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id,phone,name,class_name,class_type,class_date,class_time,date,time,created_at,location,is_purchase,price,status'
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as BookingRow[]) || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast('Запись удалена');
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка удаления', 'error');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingRow['status'] }) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast('Статус обновлен');
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка обновления статуса', 'error');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту запись?')) deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: BookingRow['status']) => {
    statusMutation.mutate({ id, status });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'purchases') return b.is_purchase;
    if (filter === 'classes') return !b.is_purchase;
    return true;
  });

  const purchasesCount = bookings.filter((b) => b.is_purchase).length;
  const classesCount = bookings.filter((b) => !b.is_purchase).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-stone-600">
          Записи ({bookings.length})
          <span className="ml-2 text-xs font-normal text-stone-400">
            {purchasesCount} покупок · {classesCount} занятий
          </span>
        </h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'purchases' | 'classes')}
            className="px-2 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
          >
            <option value="all">Все</option>
            <option value="classes">Занятия</option>
            <option value="purchases">Покупки</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-12 text-center">
          <ClipboardList className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Записей пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBookings.map((b) => {
            const isOpen = expanded === b.id;
            const displayName = b.class_name || b.class_type || b.name || 'Запись';
            const displayDate = b.class_date || b.date || '';
            const displayTime = b.class_time || b.time || '';
            const createdAt = formatCreatedAt(b.created_at);
            const isPurchase = b.is_purchase;
            const status = b.status || 'active';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-xl border transition-colors hover:border-stone-300 ${
                  status === 'cancelled' || status === 'no_show'
                    ? 'border-stone-100 opacity-60'
                    : 'border-stone-200'
                }`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isPurchase ? 'bg-amber-50' : 'bg-brand-mint/30'
                    }`}
                  >
                    {isPurchase ? (
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-brand-green" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-700 text-sm truncate flex items-center gap-2">
                      {displayName}
                      {isPurchase && b.price && (
                        <span className="text-xs font-normal bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                          {b.price}
                        </span>
                      )}
                      {status !== 'active' && (
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : status === 'cancelled'
                                ? 'bg-rose-100 text-rose-500'
                                : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {status === 'no_show'
                            ? 'Неявка'
                            : status === 'cancelled'
                              ? 'Отмена'
                              : status === 'completed'
                                ? 'Завершено'
                                : status}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400">
                      {b.name && <span className="mr-2">{b.name}</span>}
                      {displayDate && `${displayDate} `}
                      {displayTime && `в ${displayTime}`}
                      {!displayDate && !displayTime && !b.name && createdAt}
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
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-3">
                      {b.phone && (
                        <>
                          <dt className="text-stone-400">Телефон</dt>
                          <dd className="text-stone-700 font-medium">
                            <a href={`tel:${b.phone}`} className="hover:text-brand-green">
                              {b.phone}
                            </a>
                          </dd>
                        </>
                      )}
                      {b.name && (
                        <>
                          <dt className="text-stone-400">Имя</dt>
                          <dd className="text-stone-700">{b.name}</dd>
                        </>
                      )}
                      {b.class_name && (
                        <>
                          <dt className="text-stone-400">Занятие</dt>
                          <dd className="text-stone-700">{b.class_name}</dd>
                        </>
                      )}
                      {b.location && (
                        <>
                          <dt className="text-stone-400">Локация</dt>
                          <dd className="text-stone-700">{b.location}</dd>
                        </>
                      )}
                      {isPurchase && b.price && (
                        <>
                          <dt className="text-stone-400">Стоимость</dt>
                          <dd className="text-stone-700 font-medium">{b.price}</dd>
                        </>
                      )}
                    </dl>

                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2 justify-end">
                      {status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'active')}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs hover:bg-stone-50 flex items-center gap-1.5"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Активен
                        </button>
                      )}

                      {status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100 flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Завершено
                        </button>
                      )}

                      {status !== 'no_show' && !isPurchase && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'no_show')}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs hover:bg-stone-50 flex items-center gap-1.5"
                        >
                          <UserX className="w-3.5 h-3.5" /> Неявка
                        </button>
                      )}

                      {status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-lg border border-rose-100 text-rose-600 text-xs hover:bg-rose-50 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Отмена
                        </button>
                      )}

                      <div className="flex-1"></div>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-xs text-rose-400 hover:text-rose-600 hover:underline flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Удалить запись
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
