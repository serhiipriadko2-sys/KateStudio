import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Save, X, Star, Moon } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';

type PricingCategory = 'yoga' | 'personal' | 'sound' | 'massage';

interface DBPricingPlan {
  id: string;
  category: PricingCategory;
  title: string;
  price: string;
  subtitle?: string;
  description?: string;
  features: string[]; // JSONB array stored as string[]
  is_popular: boolean;
  is_dark: boolean;
  display_order: number;
  is_active: boolean;
}

const CATEGORY_LABELS: Record<PricingCategory, string> = {
  yoga: 'Йога-абонементы',
  personal: 'Персональные',
  sound: 'Саундхилинг',
  massage: 'Массаж',
};

export const PricingTab: React.FC<{ toast: (m: string, t?: 'success' | 'error') => void }> = ({
  toast,
}) => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<PricingCategory>('yoga');
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  // Fetch Plans
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pricing_plans', activeCategory],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('category', activeCategory)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DBPricingPlan[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (plan: Omit<DBPricingPlan, 'id'>) => {
      if (!supabase) return;
      const { error } = await supabase.from('pricing_plans').insert(plan);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_plans'] });
      toast('Тариф добавлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (plan: DBPricingPlan) => {
      if (!supabase) return;
      const { error } = await supabase
        .from('pricing_plans')
        .update({
          category: plan.category,
          title: plan.title,
          price: plan.price,
          subtitle: plan.subtitle,
          description: plan.description,
          features: plan.features,
          is_popular: plan.is_popular,
          is_dark: plan.is_dark,
          display_order: plan.display_order,
          is_active: plan.is_active,
        })
        .eq('id', plan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_plans'] });
      toast('Тариф обновлен');
      setEditingId(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return;
      const { error } = await supabase.from('pricing_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_plans'] });
      toast('Тариф удален');
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Удалить тариф?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (plan: DBPricingPlan | Omit<DBPricingPlan, 'id'>) => {
    if ('id' in plan) {
      updateMutation.mutate(plan as DBPricingPlan);
    } else {
      createMutation.mutate(plan as Omit<DBPricingPlan, 'id'>);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка тарифов...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Ошибка: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.keys(CATEGORY_LABELS) as PricingCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
              activeCategory === cat
                ? 'bg-brand-green text-white border-brand-green'
                : 'bg-white text-stone-500 border-stone-200 hover:border-brand-green/30'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

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
            <PlanEditor
              category={activeCategory}
              initialData={editingId === 'new' ? undefined : plans?.find((p) => p.id === editingId)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">
          Тарифы: {CATEGORY_LABELS[activeCategory]} ({plans?.length || 0})
        </h3>
        <button
          onClick={() => setEditingId('new')}
          className="text-xs text-brand-green font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Добавить тариф
        </button>
      </div>

      <div className="grid gap-3">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl border p-4 transition-colors relative group ${
              !plan.is_active
                ? 'border-stone-100 opacity-60'
                : plan.is_popular
                  ? 'border-brand-green/50 shadow-sm'
                  : 'border-stone-100 hover:border-brand-green/20'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-stone-800">{plan.title}</span>
                  {plan.is_popular && (
                    <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> ХИТ
                    </span>
                  )}
                  {plan.is_dark && (
                    <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Moon className="w-3 h-3 fill-current" /> DARK
                    </span>
                  )}
                </div>
                <div className="text-lg font-serif text-brand-green mb-1">{plan.price}</div>
                {plan.description && (
                  <p className="text-xs text-stone-500 mb-2">{plan.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-stone-50 text-stone-500 px-2 py-1 rounded border border-stone-100"
                    >
                      {f}
                    </span>
                  ))}
                  {plan.features.length > 3 && (
                    <span className="text-[10px] text-stone-400 px-1 py-1">
                      +{plan.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => setEditingId(plan.id)}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-blue-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {plans?.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            В этой категории пока нет тарифов
          </div>
        )}
      </div>
    </div>
  );
};

const PlanEditor: React.FC<{
  category: PricingCategory;
  initialData?: DBPricingPlan;
  onSave: (data: DBPricingPlan | Omit<DBPricingPlan, 'id'>) => void;
  onCancel: () => void;
}> = ({ category, initialData, onSave, onCancel }) => {
  const [draft, setDraft] = useState<Partial<DBPricingPlan>>(
    initialData || {
      category,
      title: '',
      price: '',
      subtitle: '',
      description: '',
      features: [],
      is_popular: false,
      is_dark: false,
      display_order: 0,
      is_active: true,
    }
  );
  const [featureInput, setFeatureInput] = useState('');

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setDraft((d) => ({ ...d, features: [...(d.features || []), featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setDraft((d) => ({ ...d, features: d.features?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    if (!draft.title || !draft.price) return alert('Заполните название и цену');
    onSave(draft as DBPricingPlan | Omit<DBPricingPlan, 'id'>);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-semibold text-stone-700 text-lg mb-4">
        {initialData ? 'Редактировать тариф' : 'Новый тариф'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Название</span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            placeholder="Разовое"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Цена</span>
          <input
            type="text"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            placeholder="700 ₽"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-stone-500 font-medium">Краткое описание</span>
        <input
          type="text"
          value={draft.description || ''}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          placeholder="Для знакомства со студией"
        />
      </label>

      {/* Feature List Builder */}
      <div className="space-y-2">
        <span className="text-xs text-stone-500 font-medium">Особенности (список)</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFeature()}
            className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
            placeholder="Например: Срок действия 30 дней"
          />
          <button
            onClick={addFeature}
            className="p-2 bg-stone-100 rounded-xl text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.features?.map((feat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-brand-mint/30 text-brand-green px-2 py-1 rounded-lg text-xs font-medium"
            >
              {feat}
              <button
                onClick={() => removeFeature(idx)}
                className="hover:text-rose-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
          <input
            type="checkbox"
            checked={draft.is_popular}
            onChange={(e) => setDraft((d) => ({ ...d, is_popular: e.target.checked }))}
            className="w-4 h-4 text-brand-green rounded focus:ring-brand-green/30"
          />
          <span className="text-sm text-stone-600 flex items-center gap-1">
            <Star className="w-3 h-3" /> Популярный
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-lg">
          <input
            type="checkbox"
            checked={draft.is_dark}
            onChange={(e) => setDraft((d) => ({ ...d, is_dark: e.target.checked }))}
            className="w-4 h-4 text-brand-green rounded focus:ring-brand-green/30"
          />
          <span className="text-sm text-stone-600 flex items-center gap-1">
            <Moon className="w-3 h-3" /> Темный стиль
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Порядок сортировки</span>
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
