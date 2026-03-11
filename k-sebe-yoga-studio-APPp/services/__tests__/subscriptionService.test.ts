import { supabase } from '@ksebe/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { subscriptionService } from '../subscriptionService';

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

const mockSession = (token = 'token-123', userId = 'user-abc') =>
  (supabase.auth.getSession as Mock).mockResolvedValue({
    data: { session: { user: { id: userId }, access_token: token } },
  });

const mockNoSession = () =>
  (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });

describe('subscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  // ─── getCurrentSubscription ──────────────────────────────────────────────────

  describe('getCurrentSubscription', () => {
    it('returns null when no session', async () => {
      mockNoSession();
      const result = await subscriptionService.getCurrentSubscription();
      expect(result).toBeNull();
    });

    it('returns subscription data when session exists', async () => {
      mockSession();
      const sub = { id: 's1', user_id: 'user-abc', plan: 'premium', status: 'active' };
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: sub, error: null }),
      });

      const result = await subscriptionService.getCurrentSubscription();
      expect(result).toEqual(sub);
    });

    it('returns null and warns when Supabase errors', async () => {
      mockSession();
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('db') }),
      });

      const result = await subscriptionService.getCurrentSubscription();
      expect(result).toBeNull();
    });
  });

  // ─── createPayment ────────────────────────────────────────────────────────────

  describe('createPayment', () => {
    it('throws when session is missing', async () => {
      mockNoSession();
      await expect(
        subscriptionService.createPayment({ id: 'premium' } as Parameters<
          typeof subscriptionService.createPayment
        >[0])
      ).rejects.toThrow('Authentication required');
    });

    it('calls Edge Function and returns response on success', async () => {
      mockSession('tok-abc');
      const payload = { status: 'pending', subscription: { id: 's1' } };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });

      const result = await subscriptionService.createPayment({ id: 'premium' } as Parameters<
        typeof subscriptionService.createPayment
      >[0]);
      expect(result).toEqual(payload);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/create-payment'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws when response is not ok', async () => {
      mockSession();
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server error'),
      });

      await expect(
        subscriptionService.createPayment({ id: 'premium' } as Parameters<
          typeof subscriptionService.createPayment
        >[0])
      ).rejects.toThrow('Server error');
    });
  });

  // ─── cancelSubscription ───────────────────────────────────────────────────────

  describe('cancelSubscription', () => {
    it('returns false when no session', async () => {
      mockNoSession();
      const result = await subscriptionService.cancelSubscription();
      expect(result).toBe(false);
    });

    it('returns true on successful cancellation', async () => {
      mockSession();
      (fetch as Mock).mockResolvedValue({ ok: true });

      const result = await subscriptionService.cancelSubscription();
      expect(result).toBe(true);
    });

    it('returns false when response is not ok', async () => {
      mockSession();
      (fetch as Mock).mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue('error'),
      });

      const result = await subscriptionService.cancelSubscription();
      expect(result).toBe(false);
    });

    it('returns false when fetch throws', async () => {
      mockSession();
      (fetch as Mock).mockRejectedValue(new Error('network error'));

      const result = await subscriptionService.cancelSubscription();
      expect(result).toBe(false);
    });
  });
});
