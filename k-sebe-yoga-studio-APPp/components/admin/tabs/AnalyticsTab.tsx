import { supabase } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

type Period = 7 | 14 | 30;

interface AnalyticsData {
  period_days: number;
  page_views_current: number;
  page_views_previous: number;
  bookings_current: number;
  bookings_previous: number;
  contacts_current: number;
  contacts_previous: number;
  new_users_current: number;
  new_users_previous: number;
  premium_subscribers: number;
  top_events: { event_name: string; count: number }[] | null;
}

const calcTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const TrendBadge: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
  const pct = calcTrend(current, previous);
  if (previous === 0 && current === 0) return null;
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
        up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
      }`}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up && pct !== 0 ? '+' : ''}
      {pct}%
    </span>
  );
};

export const AnalyticsTab: React.FC = () => {
  const [period, setPeriod] = useState<Period>(7);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin_analytics', period],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.rpc('get_admin_analytics', {
        period_days: period,
      });
      if (error) throw error;
      return data as AnalyticsData;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка аналитики...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Ошибка: {error.message}</div>;

  const PERIODS: Period[] = [7, 14, 30];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Аналитика</h3>
        <div className="flex rounded-xl border border-stone-200 overflow-hidden">
          {PERIODS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-brand-green text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
            >
              {p} дн.
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-400 -mt-3">
        Текущий период vs предыдущий {period}-дневный период
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Просмотры страниц"
          current={data?.page_views_current ?? 0}
          previous={data?.page_views_previous ?? 0}
        />
        <MetricCard
          label="Записей на занятия"
          current={data?.bookings_current ?? 0}
          previous={data?.bookings_previous ?? 0}
        />
        <MetricCard
          label="Обращений"
          current={data?.contacts_current ?? 0}
          previous={data?.contacts_previous ?? 0}
        />
        <MetricCard
          label="Новых пользователей"
          current={data?.new_users_current ?? 0}
          previous={data?.new_users_previous ?? 0}
        />
      </div>

      {/* Premium snapshot */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-1">
            Premium + VIP подписчики
          </div>
          <div className="text-3xl font-bold text-stone-800">{data?.premium_subscribers ?? 0}</div>
          <div className="text-xs text-stone-400 mt-1">активные подписки прямо сейчас</div>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl">
          <BarChart2 className="w-7 h-7 text-amber-500" />
        </div>
      </div>

      {/* Top events */}
      {data?.top_events && data.top_events.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <h4 className="text-sm font-semibold text-stone-600 mb-3">
            Топ событий за {period} дней
          </h4>
          <div className="space-y-2">
            {data.top_events.map((ev) => {
              const max = data.top_events![0].count;
              const pct = max > 0 ? Math.round((ev.count / max) * 100) : 0;
              return (
                <div key={ev.event_name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600 font-mono truncate max-w-[70%]">
                      {ev.event_name}
                    </span>
                    <span className="text-stone-400 font-medium">{ev.count}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-green rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  current: number;
  previous: number;
}> = ({ label, current, previous }) => (
  <div className="bg-white rounded-2xl border border-stone-100 p-4">
    <div className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">{label}</div>
    <div className="flex items-end justify-between gap-2">
      <div className="text-2xl font-bold text-stone-800">{current}</div>
      <TrendBadge current={current} previous={previous} />
    </div>
    <div className="text-xs text-stone-300 mt-1">пред. период: {previous}</div>
  </div>
);
