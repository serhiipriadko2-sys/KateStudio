import { isSupabaseConfigured, supabase } from '@ksebe/shared';

export interface CheckoutResponse {
  orderId: string;
  paymentId: string;
  confirmationUrl: string;
  status: string;
}

export interface PaymentOrder {
  id: string;
  user_id: string;
  pricing_plan_id: string | null;
  provider_payment_id: string | null;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'failed';
  amount_cents: number;
  currency: 'RUB';
  plan_snapshot: Record<string, unknown>;
  checkout_url: string | null;
  error_message: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface UserPass {
  id: string;
  user_id: string;
  payment_order_id: string;
  pricing_plan_id: string | null;
  title: string;
  visits_total: number;
  visits_remaining: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'expired' | 'canceled' | 'used';
  created_at: string;
}

const getSupabaseFunctionUrl = (path: string): string | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${path}`;
};

export const paymentService = {
  async createCheckout(pricingPlanId: string, returnUrl?: string): Promise<CheckoutResponse> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

    const url = getSupabaseFunctionUrl('create-yookassa-checkout');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!url || !anonKey) throw new Error('Supabase not configured');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: anonKey,
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pricingPlanId, returnUrl }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Payment error (${response.status})`);
    }

    return (await response.json()) as CheckoutResponse;
  },

  async getActivePasses(): Promise<UserPass[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_passes')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('valid_until', { ascending: true });

      if (error) {
        console.warn('Failed to fetch active passes', error);
        return [];
      }

      return (data ?? []) as UserPass[];
    } catch {
      return [];
    }
  },

  async getRecentOrders(): Promise<PaymentOrder[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Failed to fetch payment orders', error);
        return [];
      }

      return (data ?? []) as PaymentOrder[];
    } catch {
      return [];
    }
  },
};
