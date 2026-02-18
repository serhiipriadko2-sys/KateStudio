import { describe, it, expect, vi } from 'vitest';
import { dataService } from '../k-sebe-yoga-studio-APPp/services/dataService';

// Mock Supabase
vi.mock('../k-sebe-yoga-studio-APPp/services/supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

// Mock Cache Adapter
vi.mock('../k-sebe-yoga-studio-APPp/services/localCache', () => ({
  cacheAdapter: {
    getUser: vi.fn().mockResolvedValue(null),
    setUser: vi.fn(),
    getBookingsByPhone: vi.fn().mockResolvedValue([]),
    getPendingBookings: vi.fn().mockResolvedValue([]),
    upsertBookings: vi.fn(),
  },
}));

describe('Critical Paths Verification', () => {
  describe('Data Service', () => {
    it('should return empty array when Supabase is not configured and cache is empty', async () => {
      const user = {
        id: 'test-user',
        name: 'Test User',
        phone: '+79000000000',
        city: 'Moscow',
        isRegistered: true,
        createdAt: new Date().toISOString(),
      };

      const bookings = await dataService.getBookings(user);
      expect(bookings).toBeDefined();
      expect(Array.isArray(bookings)).toBe(true);
      expect(bookings.length).toBe(0);
    });

    it('should generate class schedule for offline classes', async () => {
      const classes = await dataService.getClassesForDate(new Date(), 'offline');
      expect(classes).toBeDefined();
      expect(Array.isArray(classes)).toBe(true);
      if (classes.length > 0) {
        expect(classes[0].price).toBeGreaterThan(0);
        expect(classes[0].isOnline).toBe(false);
      }
    });
  });
});
