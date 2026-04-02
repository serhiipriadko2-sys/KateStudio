import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataService } from '../k-sebe-yoga-studio-APPp/services/dataService';

vi.mock('@ksebe/shared', () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../k-sebe-yoga-studio-APPp/services/localCache', () => ({
  cacheAdapter: {
    getUser: vi.fn().mockResolvedValue(null),
    setUser: vi.fn(),
    clearUser: vi.fn(),
    getBookingsByPhone: vi.fn().mockResolvedValue([]),
    getPendingBookings: vi.fn().mockResolvedValue([]),
    findBookingByClassId: vi.fn().mockResolvedValue(undefined),
    getBookingById: vi.fn().mockResolvedValue(undefined),
    upsertBookings: vi.fn(),
    removeBooking: vi.fn(),
  },
}));

describe('Critical Paths Verification', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Data Service', () => {
    it('returns an honest cache result when Supabase is not configured and cache is empty', async () => {
      const user = {
        id: 'test-user',
        name: 'Test User',
        phone: '+79000000000',
        city: 'Moscow',
        isRegistered: true,
        createdAt: new Date().toISOString(),
      };

      const bookingsResult = await dataService.getBookings(user);
      expect(bookingsResult).toBeDefined();
      expect(Array.isArray(bookingsResult.data)).toBe(true);
      expect(bookingsResult.source).toBe('cache');
      expect(bookingsResult.degraded).toBe(true);
      expect(bookingsResult.reason).toBe('auth_required');
      expect(bookingsResult.data.length).toBe(0);
    });

    it('returns a mock schedule result for offline classes when cloud data is disabled', async () => {
      const classesResult = await dataService.getClassesForDate(new Date(), 'offline');
      expect(classesResult).toBeDefined();
      expect(Array.isArray(classesResult.data)).toBe(true);
      expect(classesResult.source).toBe('mock');
      expect(classesResult.degraded).toBe(true);
      expect(classesResult.reason).toBe('supabase_unavailable');
      if (classesResult.data.length > 0) {
        expect(classesResult.data[0].price).toBeGreaterThan(0);
        expect(classesResult.data[0].isOnline).toBe(false);
      }
    });
  });
});
