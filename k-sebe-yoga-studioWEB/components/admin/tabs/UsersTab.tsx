import { supabase } from '@ksebe/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Search, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { AdminTabProps } from '../types';

interface UserRow {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  email?: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: 'free' | 'premium' | 'vip';
  status: 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string | null;
}

interface PaymentOrderRow {
  id: string;
  user_id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'failed';
  amount_cents: number;
  currency: 'RUB';
  provider_payment_id: string | null;
  created_at: string;
}

interface UserPassRow {
  id: string;
  user_id: string;
  title: string;
  visits_total: number;
  visits_remaining: number;
  valid_until: string;
  status: 'active' | 'expired' | 'canceled' | 'used';
}

interface UserWithSub extends UserRow {
  subscription: SubscriptionRow | null;
  paymentOrders: PaymentOrderRow[];
  userPasses: UserPassRow[];
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  vip: 'VIP',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активна',
  pending: 'Ожидание',
  canceled: 'Отменена',
  past_due: 'Просрочена',
  trialing: 'Пробный',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-stone-100 text-stone-500',
  premium: 'bg-blue-100 text-blue-600',
  vip: 'bg-amber-100 text-amber-600',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-600',
  pending: 'bg-yellow-100 text-yellow-600',
  canceled: 'bg-rose-100 text-rose-500',
  past_due: 'bg-rose-100 text-rose-500',
  trialing: 'bg-purple-100 text-purple-600',
};

const isMissingPaymentsSchemaError = (message: string | undefined): boolean =>
  Boolean(
    message &&
      /(payment_orders|user_passes|amount_cents|visits_total|valid_days|is_payable)/i.test(message)
  );

async function safeOptionalTableQuery<T>(
  query: PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
  label: string
): Promise<T[]> {
  const { data, error } = await query;
  if (!error) return (data ?? []) as T[];
  if (isMissingPaymentsSchemaError(error.message)) {
    console.warn(`[admin_users] ${label} disabled until payment migrations are live`, error);
    return [];
  }
  throw error;
}

export const UsersTab: React.FC<AdminTabProps> = ({ toast }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithSub | null>(null);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const [profilesRes, subsRes, paymentOrders, userPasses] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, name, phone, city, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('subscriptions').select('*'),
        safeOptionalTableQuery<PaymentOrderRow>(
          supabase.from('payment_orders').select('*').order('created_at', { ascending: false }),
          'payment_orders'
        ),
        safeOptionalTableQuery<UserPassRow>(
          supabase.from('user_passes').select('*').order('valid_until', { ascending: false }),
          'user_passes'
        ),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (subsRes.error) throw subsRes.error;

      const subMap = new Map<string, SubscriptionRow>(
        (subsRes.data ?? []).map((s) => [s.user_id, s as SubscriptionRow])
      );
      const ordersByUser = new Map<string, PaymentOrderRow[]>();
      paymentOrders.forEach((order) => {
        ordersByUser.set(order.user_id, [...(ordersByUser.get(order.user_id) ?? []), order]);
      });
      const passesByUser = new Map<string, UserPassRow[]>();
      userPasses.forEach((pass) => {
        passesByUser.set(pass.user_id, [...(passesByUser.get(pass.user_id) ?? []), pass]);
      });

      return (profilesRes.data ?? [])
        .filter(
          (
            p
          ): p is {
            user_id: string;
            name: string | null;
            phone: string | null;
            city: string | null;
            created_at: string;
          } => Boolean(p.user_id)
        )
        .map(
          (p): UserWithSub => ({
            id: p.user_id,
            name: p.name,
            phone: p.phone,
            city: p.city,
            created_at: p.created_at,
            subscription: subMap.get(p.user_id) ?? null,
            paymentOrders: ordersByUser.get(p.user_id) ?? [],
            userPasses: passesByUser.get(p.user_id) ?? [],
          })
        );
    },
  });

  const upsertSubMutation = useMutation({
    mutationFn: async ({
      userId,
      plan,
      status,
      periodEnd,
    }: {
      userId: string;
      plan: 'free' | 'premium' | 'vip';
      status: 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';
      periodEnd: string | null;
    }) => {
      if (!supabase) return;
      const { error } = await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan,
          status,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast('Подписка обновлена');
      setEditingUser(null);
    },
    onError: (err) => toast(`Ошибка: ${err.message}`, 'error'),
  });

  const filtered = (users ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.city?.toLowerCase().includes(q)
    );
  });

  if (isLoading) return <div className="p-8 text-center text-stone-400">Загрузка...</div>;
  if (error)
    return <div className="p-8 text-center text-rose-500">Ошибка загрузки: {error.message}</div>;

  return (
    <div className="space-y-4">
      {editingUser && (
        <SubscriptionEditor
          user={editingUser}
          onSave={({ plan, status, periodEnd }) =>
            upsertSubMutation.mutate({ userId: editingUser.id, plan, status, periodEnd })
          }
          onCancel={() => setEditingUser(null)}
          saving={upsertSubMutation.isPending}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-600 shrink-0">
          Пользователи ({filtered.length})
        </h3>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, городу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-3 group hover:border-brand-green/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-stone-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-700 text-sm truncate">
                {user.name || 'Без имени'}
              </div>
              <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                {user.phone && <span>{user.phone}</span>}
                {user.city && <span>· {user.city}</span>}
                <span>·</span>
                <span>{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
              {(user.userPasses.length > 0 || user.paymentOrders.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {user.userPasses.slice(0, 2).map((pass) => (
                    <span
                      key={pass.id}
                      className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
                    >
                      {pass.title}: {pass.visits_remaining}/{pass.visits_total}
                    </span>
                  ))}
                  {user.paymentOrders.slice(0, 2).map((order) => (
                    <span
                      key={order.id}
                      className="px-2 py-0.5 rounded-full bg-stone-50 text-stone-500"
                    >
                      {order.status} · {(order.amount_cents / 100).toLocaleString('ru-RU')} ₽
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user.subscription ? (
                <>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[user.subscription.plan] ?? 'bg-stone-100 text-stone-500'}`}
                  >
                    {user.subscription.plan === 'vip' && (
                      <Crown className="w-3 h-3 inline mr-0.5" />
                    )}
                    {user.subscription.plan === 'premium' && (
                      <Shield className="w-3 h-3 inline mr-0.5" />
                    )}
                    {PLAN_LABELS[user.subscription.plan]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[user.subscription.status] ?? 'bg-stone-100 text-stone-500'}`}
                  >
                    {STATUS_LABELS[user.subscription.status]}
                  </span>
                </>
              ) : (
                <span className="text-xs text-stone-300">нет подписки</span>
              )}
              <button
                type="button"
                onClick={() => setEditingUser(user)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-green hover:underline px-2 py-1"
              >
                Изменить
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
            {search ? 'Ничего не найдено' : 'Нет пользователей'}
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionEditor: React.FC<{
  user: UserWithSub;
  onSave: (data: {
    plan: 'free' | 'premium' | 'vip';
    status: 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';
    periodEnd: string | null;
  }) => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ user, onSave, onCancel, saving }) => {
  const sub = user.subscription;
  const [plan, setPlan] = useState<'free' | 'premium' | 'vip'>(sub?.plan ?? 'free');
  const [status, setStatus] = useState<'active' | 'pending' | 'canceled' | 'past_due' | 'trialing'>(
    sub?.status ?? 'active'
  );
  const [periodEnd, setPeriodEnd] = useState<string>(
    sub?.current_period_end ? sub.current_period_end.slice(0, 10) : ''
  );

  return (
    <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <h3 className="font-semibold text-stone-700">Подписка: {user.name || 'Пользователь'}</h3>

        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">План</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as typeof plan)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green bg-white"
          >
            <option value="free">Free</option>
            <option value="premium">Premium — 990₽/мес</option>
            <option value="vip">VIP — 2 990₽/мес</option>
          </select>
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Статус</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green bg-white"
          >
            <option value="active">Активна</option>
            <option value="trialing">Пробный период</option>
            <option value="pending">Ожидание оплаты</option>
            <option value="past_due">Просрочена</option>
            <option value="canceled">Отменена</option>
          </select>
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-stone-500 font-medium">Действует до</span>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:outline-none focus:border-brand-green"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onSave({
                plan,
                status,
                periodEnd: periodEnd ? new Date(periodEnd).toISOString() : null,
              })
            }
            className="flex-1 py-2.5 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-stone-500 text-sm hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
