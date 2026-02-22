import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Copy,
  Users,
  Clock,
  MapPin,
  Flame,
  Save,
} from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { ClassRow, ClassFormData } from '../types';

const EMPTY_CLASS: ClassFormData = {
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  name: 'Inside Flow',
  instructor: 'Катя Габран',
  duration: '60 мин',
  spots_total: 12,
  location: 'Станционная ул., 5Б',
  intensity: 2,
  is_online: false,
};

const CLASS_PRESETS: { label: string; data: Partial<ClassFormData> }[] = [
  { label: 'Inside Flow', data: { name: 'Inside Flow', duration: '60 мин', intensity: 3 } },
  { label: 'Хатха Йога', data: { name: 'Хатха Йога', duration: '60 мин', intensity: 2 } },
  {
    label: 'Медитация',
    data: { name: 'Медитация + Sound Healing', duration: '60 мин', intensity: 1 },
  },
  {
    label: 'Утренний поток',
    data: {
      name: 'Утренний поток (Zoom)',
      duration: '45 мин',
      intensity: 2,
      is_online: true,
      location: 'Online',
    },
  },
  {
    label: 'Вечерняя растяжка',
    data: {
      name: 'Вечерняя растяжка (Zoom)',
      duration: '60 мин',
      intensity: 1,
      is_online: true,
      location: 'Online',
    },
  },
];

const formatDateRu = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' });
};

export const ScheduleTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormData>({ ...EMPTY_CLASS });
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // --- QUERIES ---
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes', dateFilter],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not initialized');
      const [year, month] = dateFilter.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      const { data, error } = await supabase
        .from('classes')
        .select(
          'id,date,time,name,instructor,duration,spots_total,spots_booked,location,intensity,is_online'
        )
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return (data as ClassRow[]) || [];
    },
  });

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: ClassMutationPayload }) => {
      if (!supabase) throw new Error('Supabase not initialized');
      if (payload.id) {
        const { error } = await supabase.from('classes').update(payload.data).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert({ ...payload.data, spots_booked: 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast(editingId ? 'Занятие обновлено' : 'Занятие добавлено');
      setShowForm(false);
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка сохранения', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast('Занятие удалено');
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка удаления', 'error');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (cls: ClassRow) => {
      if (!supabase) throw new Error('Supabase not initialized');
      const nextDate = new Date(cls.date + 'T00:00:00');
      nextDate.setDate(nextDate.getDate() + 7);
      const newDate = nextDate.toISOString().slice(0, 10);

      const { error } = await supabase.from('classes').insert({
        date: newDate,
        time: cls.time,
        name: cls.name,
        instructor: cls.instructor,
        duration: cls.duration,
        spots_total: cls.spots_total,
        spots_booked: 0,
        location: cls.location,
        intensity: cls.intensity,
        is_online: cls.is_online,
      });
      if (error) throw error;
      return newDate;
    },
    onSuccess: (newDate) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast(`Скопировано на ${formatDateRu(newDate)}`);
    },
    onError: (err) => {
      console.error(err);
      toast('Ошибка копирования', 'error');
    },
  });

  // --- HANDLERS ---
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_CLASS });
    setShowForm(true);
  };

  const openEdit = (cls: ClassRow) => {
    setEditingId(cls.id);
    setForm({
      date: cls.date,
      time: cls.time,
      name: cls.name,
      instructor: cls.instructor || 'Катя Габран',
      duration: cls.duration || '60 мин',
      spots_total: cls.spots_total || 12,
      location: cls.location || 'Станционная ул., 5Б',
      intensity: ([1, 2, 3].includes(cls.intensity || 0) ? cls.intensity : 2) as 1 | 2 | 3,
      is_online: cls.is_online || false,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast('Укажите название', 'error');

    const base = {
      date: form.date,
      time: form.time,
      name: form.name.trim(),
      instructor: form.instructor.trim(),
      duration: form.duration,
      spots_total: Math.max(1, form.spots_total),
      location: form.location.trim(),
      intensity: form.intensity,
      is_online: form.is_online,
    };

    saveMutation.mutate({ id: editingId || undefined, data: base });
  };

  const applyPreset = (preset: (typeof CLASS_PRESETS)[number]) => {
    setForm((prev: ClassFormData) => ({ ...prev, ...preset.data }));
  };

  return (
    <div className="space-y-4">
      {/* Header: filter + add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Добавить занятие
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-green/20 shadow-md p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Редактировать занятие' : 'Новое занятие'}
          </h3>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {CLASS_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  form.name === p.data.name
                    ? 'bg-brand-green text-white border-brand-green'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-brand-green/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Дата</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f: ClassFormData) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Время</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f: ClassFormData) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs text-stone-500 font-medium">Название</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f: ClassFormData) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              placeholder="Inside Flow"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Преподаватель</span>
              <input
                type="text"
                value={form.instructor}
                onChange={(e) =>
                  setForm((f: ClassFormData) => ({ ...f, instructor: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Длительность</span>
              <select
                value={form.duration}
                onChange={(e) =>
                  setForm((f: ClassFormData) => ({ ...f, duration: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none bg-white"
              >
                <option>30 мин</option>
                <option>45 мин</option>
                <option>60 мин</option>
                <option>75 мин</option>
                <option>90 мин</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Мест</span>
              <input
                type="number"
                min={1}
                max={100}
                value={form.spots_total}
                onChange={(e) =>
                  setForm((f: ClassFormData) => ({
                    ...f,
                    spots_total: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Интенсивность</span>
              <div className="flex gap-1 pt-1.5">
                {([1, 2, 3] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm((f: ClassFormData) => ({ ...f, intensity: lvl }))}
                    className={`p-1.5 rounded-lg transition-colors ${form.intensity >= lvl ? 'text-brand-green' : 'text-stone-200'}`}
                  >
                    <Flame
                      className={`w-5 h-5 ${form.intensity >= lvl ? 'fill-brand-green' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Формат</span>
              <button
                type="button"
                onClick={() =>
                  setForm((f: ClassFormData) => ({
                    ...f,
                    is_online: !f.is_online,
                    location: !f.is_online ? 'Online' : 'Станционная ул., 5Б',
                  }))
                }
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  form.is_online
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                {form.is_online ? 'Онлайн' : 'В студии'}
              </button>
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-xs text-stone-500 font-medium">Локация</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f: ClassFormData) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSave()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Classes list */}
      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto" />
        </div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center">
          <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">Нет занятий за этот месяц</p>
          <button
            onClick={openCreate}
            className="mt-3 text-brand-green text-sm font-medium hover:underline"
          >
            + Добавить первое занятие
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-4 hover:border-brand-green/20 transition-colors group"
            >
              <div className="min-w-[70px] text-center">
                <div className="text-xs text-stone-400">{formatDateRu(cls.date)}</div>
                <div className="text-lg font-semibold text-brand-text">{cls.time}</div>
              </div>
              <div className="w-px h-10 bg-stone-100" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-700 truncate">{cls.name}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cls.instructor || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.duration || '60 мин'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cls.location || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    {[1, 2, 3].map((i) => (
                      <Flame
                        key={i}
                        className={`w-3 h-3 ${i <= (cls.intensity || 1) ? 'text-brand-green fill-brand-green' : 'text-stone-200'}`}
                      />
                    ))}
                  </span>
                  <span>
                    {cls.spots_booked || 0}/{cls.spots_total || 0} мест
                  </span>
                  {cls.is_online && <span className="text-blue-500 font-medium">онлайн</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => duplicateMutation.mutate(cls)}
                  disabled={duplicateMutation.isPending}
                  title="Копировать на +7 дней"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-600 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(cls)}
                  title="Редактировать"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Удалить это занятие?')) deleteMutation.mutate(cls.id);
                  }}
                  title="Удалить"
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
type ClassMutationPayload = {
  date: string;
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spots_total: number;
  location: string;
  intensity: 1 | 2 | 3;
  is_online: boolean;
};
