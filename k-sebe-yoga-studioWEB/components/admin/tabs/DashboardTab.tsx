import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { ClipboardList, MessageSquare, TrendingUp, CalendarDays } from 'lucide-react';

export const DashboardTab: React.FC = () => {
  // Fetch Stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      if (!supabase) return { bookings: 0, contacts: 0, todayBookings: 0 };

      const [bookingsAll, contactsAll, bookingsToday] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
      ]);

      return {
        bookings: bookingsAll.count || 0,
        contacts: contactsAll.count || 0,
        todayBookings: bookingsToday.count || 0,
      };
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent_bookings'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data } = await supabase
        .from('bookings')
        .select('name, class_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка дашборда...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Всего записей"
          value={stats?.bookings || 0}
          icon={<ClipboardList className="w-5 h-5 text-blue-500" />}
          trend="+12% (нед)"
        />
        <StatCard
          label="Записей сегодня"
          value={stats?.todayBookings || 0}
          icon={<CalendarDays className="w-5 h-5 text-emerald-500" />}
          trend="Активность"
        />
        <StatCard
          label="Обращений"
          value={stats?.contacts || 0}
          icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
          trend="Новые"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <h3 className="text-lg font-serif text-brand-dark mb-4">Последние записи</h3>
        <div className="space-y-4">
          {recentBookings?.map((booking: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between border-b border-stone-50 pb-2 last:border-0 last:pb-0">
              <div>
                <div className="font-medium text-stone-700">{booking.name}</div>
                <div className="text-xs text-stone-400">{booking.class_name || 'Занятие'}</div>
              </div>
              <div className="text-xs text-stone-400">
                {new Date(booking.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentBookings?.length === 0 && (
            <div className="text-center text-stone-400 py-4">Нет записей</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; trend?: string }> = ({
  label,
  value,
  icon,
  trend,
}) => (
  <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-start justify-between">
    <div>
      <div className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-stone-800">{value}</div>
      {trend && <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {trend}</div>}
    </div>
    <div className="p-3 bg-stone-50 rounded-xl">{icon}</div>
  </div>
);
