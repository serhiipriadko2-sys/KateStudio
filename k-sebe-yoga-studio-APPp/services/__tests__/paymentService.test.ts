import { supabase } from '@ksebe/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { paymentService } from '../paymentService';

vi.mock('@ksebe/shared', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const mockSession = (token = 'token-123', userId = 'user-abc') =>
  (supabase.auth.getSession as Mock).mockResolvedValue({
    data: { session: { user: { id: userId }, access_token: token } },
  });

const mockNoSession = () =>
  (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('createCheckout', () => {
    it('requires an authenticated app user', async () => {
      mockNoSession();

      await expect(paymentService.createCheckout('plan-1')).rejects.toThrow(
        'Authentication required'
      );
    });

    it('calls the app-only YooKassa checkout Edge Function', async () => {
      mockSession('tok-abc');
      const payload = {
        orderId: 'order-1',
        paymentId: 'payment-1',
        confirmationUrl: 'https://yookassa.example/pay',
        status: 'pending',
      };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });

      const result = await paymentService.createCheckout('plan-1', 'https://app.example/return');

      expect(result).toEqual(payload);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/create-yookassa-checkout'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ authorization: 'Bearer tok-abc' }),
          body: JSON.stringify({
            pricingPlanId: 'plan-1',
            returnUrl: 'https://app.example/return',
          }),
        })
      );
    });
  });

  describe('getActivePasses', () => {
    it('returns active user passes ordered by expiration', async () => {
      mockSession();
      const passes = [{ id: 'pass-1', title: '4 занятия' }];
      const order = vi.fn().mockResolvedValue({ data: passes, error: null });
      const eqStatus = vi.fn().mockReturnValue({ order });
      const eqUser = vi.fn().mockReturnValue({ eq: eqStatus });
      const select = vi.fn().mockReturnValue({ eq: eqUser });
      (supabase.from as Mock).mockReturnValue({ select });

      const result = await paymentService.getActivePasses();

      expect(result).toEqual(passes);
      expect(supabase.from).toHaveBeenCalledWith('user_passes');
    });
  });
});
