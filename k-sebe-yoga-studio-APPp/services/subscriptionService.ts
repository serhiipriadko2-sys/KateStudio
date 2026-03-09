import { supabase } from '@ksebe/shared';
import type { Subscription, SubscriptionPlan } from '../types';

const getSupabaseFunctionUrl = (path: string): string | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${path}`;
};

export const subscriptionService = {
  async getCurrentSubscription(): Promise<Subscription | null> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch subscription', error);
      return null;
    }

    return data as Subscription | null;
  },

  async createPayment(plan: SubscriptionPlan, returnUrl?: string) {
    const url = getSupabaseFunctionUrl('create-payment');
    if (!url) throw new Error('Supabase not configured');

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!anonKey || !token) throw new Error('Authentication required');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: anonKey,
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, returnUrl }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Payment error (${response.status})`);
    }

    return (await response.json()) as {
      status: string;
      subscription: Subscription;
      paymentUrl?: string | null;
      message?: string;
    };
  },

  async cancelSubscription(): Promise<boolean> {
    const url = getSupabaseFunctionUrl('cancel-subscription');
    if (!url) return false;

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!anonKey || !token) return false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: anonKey,
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('Failed to cancel subscription', await response.text());
        return false;
      }

      return true;
    } catch (e) {
      console.warn('Cancel subscription error', e);
      return false;
    }
  },
};
