import { supabase } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart2,
  CalendarDays,
  ClipboardList,
  Globe,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

type Period = 7 | 14 | 30;

interface AnalyticsData {
  page_views_current: number;
  page_views_previous: number;
  bookings_current: number;
  bookings_previous: number;
  contacts_current: number;
  contacts_previous: number;
  new_users_current: number;
  new_users_previous: number;
  premium_subscribers: number;
}

interface RecentBooking {
  name: string | null;
  class_name: string | null;
  created_at: string;
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
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? 'text-emerald-500' : 'text-rose-500'
      }`}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up && pct !== 0 ? '+' : ''}
      {pct}%
    </span>
  );
};

export const DashboardTab: React.FC = () => {
  const [period, setPeriod] = useState<Period>(7);

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['dashboard_analytics', period],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.rpc('get_admin_analytics', { period_days: period });
      if (error) throw error;
      return data as AnalyticsData;
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent_bookings'],
    queryFn: async () => {
      if (!supabase) return [] as RecentBooking[];
      const { data } = await supabase
        .from('bookings')
        .select('name, class_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      return (data ?? []) as RecentBooking[];
    },
  });

  const PERIODS: Period[] = [7, 14, 30];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-600">Обзор студии</h3>
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

      {/* Stat cards */}
      {loadingAnalytics ? (
        <div className="text-center py-6 text-stone-400 text-sm">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Просмотры"
            value={analytics?.page_views_current ?? 0}
            icon={<Globe className="w-5 h-5 text-indigo-500" />}
            current={analytics?.page_views_current ?? 0}
            previous={analytics?.page_views_previous ?? 0}
          />
          <StatCard
            label="Записей"
            value={analytics?.bookings_current ?? 0}
            icon={<CalendarDays className="w-5 h-5 text-emerald-500" />}
            current={analytics?.bookings_current ?? 0}
            previous={analytics?.bookings_previous ?? 0}
          />
          <StatCard
            label="Обращений"
            value={analytics?.contacts_current ?? 0}
            icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
            current={analytics?.contacts_current ?? 0}
            previous={analytics?.contacts_previous ?? 0}
          />
          <StatCard
            label="Новых пользователей"
            value={analytics?.new_users_current ?? 0}
            icon={<Users className="w-5 h-5 text-blue-500" />}
            current={analytics?.new_users_current ?? 0}
            previous={analytics?.new_users_previous ?? 0}
          />
        </div>
      )}

      {/* Premium subscribers highlight */}
      <div className="bg-linear-to-r from-brand-green/10 to-brand-mint/10 rounded-2xl border border-brand-green/20 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-1">
            Premium + VIP подписчики
          </div>
          <div className="text-3xl font-bold text-stone-800">
            {analytics?.premium_subscribers ?? 0}
          </div>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <BarChart2 className="w-6 h-6 text-brand-green" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-stone-400" /> Последние записи
          </h3>
          <div className="space-y-3">
            {recentBookings?.map((booking, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-stone-50 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-medium text-stone-700 text-sm">{booking.name ?? '—'}</div>
                  <div className="text-xs text-stone-400">{booking.class_name ?? 'Занятие'}</div>
                </div>
                <div className="text-xs text-stone-400">
                  {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
            {(recentBookings?.length ?? 0) === 0 && (
              <div className="text-center text-stone-400 py-4 text-sm">Нет записей</div>
            )}
          </div>
        </div>

        {/* System health */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-400" /> Состояние системы
          </h3>
          <div className="space-y-3">
            <HealthRow label="Supabase" sub="База данных" status="online" />
            <HealthRow label="WEB Client" sub="ksebe-studio.ru" status="stable" />
            <HealthRow label="APP Client" sub="app.ksebe-studio.ru" status="stable" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  current: number;
  previous: number;
}> = ({ label, value, icon, current, previous }) => (
  <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
    <div className="flex items-start justify-between mb-2">
      <div className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</div>
      <div className="p-2 bg-stone-50 rounded-xl">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-stone-800 mb-1">{value}</div>
    <TrendBadge current={current} previous={previous} />
  </div>
);

const HealthRow: React.FC<{
  label: string;
  sub: string;
  status: 'online' | 'stable' | 'error';
}> = ({ label, sub, status }) => {
  const colors = {
    online: 'bg-green-100 text-green-700',
    stable: 'bg-blue-100 text-blue-700',
    error: 'bg-rose-100 text-rose-600',
  };
  const labels = { online: 'Online', stable: 'Stable', error: 'Error' };
  return (
    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
      <div>
        <div className="text-sm font-medium text-stone-700">{label}</div>
        <div className="text-xs text-stone-400">{sub}</div>
      </div>
      <span className={`px-2 py-1 text-xs rounded-lg font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    </div>
  );
};
