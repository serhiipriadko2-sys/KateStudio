import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { ThemeColors, loadTheme, applyTheme, resetTheme } from '../../../services/theme';

const COLOR_FIELDS: { label: string; variable: keyof ThemeColors }[] = [
  { label: 'Основной (Зеленый)', variable: '--color-brand-green' },
  { label: 'Акцент (Мятный)', variable: '--color-brand-mint' },
  { label: 'Темный (Футер)', variable: '--color-brand-dark' },
  { label: 'Текст', variable: '--color-brand-text' },
  { label: 'Фон', variable: '--color-brand-light' },
  { label: 'Вторичный акцент', variable: '--color-brand-accent' },
];

export const SettingsTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [localTheme, setLocalTheme] = useState<ThemeColors>(loadTheme());

  // Fetch Theme from DB
  const { data: dbTheme, isLoading } = useQuery({
    queryKey: ['settings', 'theme'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'theme')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
      return (data?.value as ThemeColors) || null;
    },
  });

  // Sync DB theme to local state on load
  useEffect(() => {
    if (dbTheme) {
      setLocalTheme(dbTheme);
      applyTheme(dbTheme);
    }
  }, [dbTheme]);

  // Mutation to save theme
  const saveMutation = useMutation({
    mutationFn: async (theme: ThemeColors) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'theme', value: theme, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'theme'] });
      toast('Тема сохранена в базе данных');
    },
    onError: (err) => toast(`Ошибка сохранения: ${err.message}`, 'error'),
  });

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const next = { ...localTheme, [key]: value };
    setLocalTheme(next);
    applyTheme(next);
  };

  const handleSave = () => {
    saveMutation.mutate(localTheme);
  };

  const handleReset = () => {
    if (!confirm('Сбросить цвета к стандартным?')) return;
    const defaults = resetTheme();
    setLocalTheme(defaults);
    applyTheme(defaults);
    saveMutation.mutate(defaults);
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка настроек...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Цветовая схема сайта</h3>
        {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-brand-green" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COLOR_FIELDS.map(({ label, variable }) => (
          <div
            key={variable}
            className="bg-white p-3 rounded-xl border border-stone-100 flex items-center justify-between shadow-sm"
          >
            <div>
              <div className="text-sm font-medium text-stone-700">{label}</div>
              <code className="text-[10px] text-stone-400">{variable}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-stone-50 px-2 py-1 rounded border border-stone-100">
                {localTheme[variable]}
              </span>
              <input
                type="color"
                value={localTheme[variable]}
                onChange={(e) => handleColorChange(variable, e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-stone-100">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        <button
          onClick={handleReset}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-rose-500 border border-stone-200 rounded-xl text-sm hover:bg-rose-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Сбросить
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 flex gap-2">
        <span className="text-lg">💡</span>
        <p>
          Изменения применяются мгновенно в этом браузере. После нажатия "Сохранить", новые цвета станут доступны всем посетителям сайта (требуется обновление страницы).
        </p>
      </div>
    </div>
  );
};
