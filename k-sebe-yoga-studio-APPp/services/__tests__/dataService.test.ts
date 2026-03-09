import { supabase } from '@ksebe/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { dataService } from '../dataService';

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: '11111111-1111-4111-8111-111111111111' },
          },
        },
      }),
    },
  },
  isSupabaseConfigured: true,
}));

describe('dataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('registers user and caches profile data', async () => {
    (supabase.from as Mock).mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { avatar: 'avatar.png', created_at: '2024-01-01T00:00:00.000Z' },
            error: null,
          }),
        }),
      }),
    });

    const user = await dataService.registerUser(
      'Анна',
      '+79990001122',
      '11111111-1111-4111-8111-111111111111'
    );

    expect(user.avatar).toBe('avatar.png');
    expect(user.createdAt).toBe('2024-01-01T00:00:00.000Z');

    // Cache layer may be IndexedDB or localStorage depending on environment.
    // Validate via service API instead of assuming a specific storage backend.
    const stored = await dataService.getUser();
    expect(stored?.name).toBe('Анна');
    expect(stored?.phone).toBe('+79990001122');
  });

  it('maps bookings from Supabase payload', async () => {
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'booking-1',
              class_id: 'class-1',
              class_name: 'Inside Flow',
              date: '2024-02-01',
              time: '10:00',
              location: 'Studio',
              timestamp: 1234,
            },
          ],
          error: null,
        }),
      }),
    });

    const bookings = await dataService.getBookings({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Анна',
      phone: '+79990001122',
      city: 'Москва',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toMatchObject({
      id: 'booking-1',
      classId: 'class-1',
      className: 'Inside Flow',
      date: '2024-02-01',
      time: '10:00',
      location: 'Studio',
      timestamp: 1234,
    });
  });

  describe('getClassesForMonth', () => {
    // Clear in-memory month cache between tests
    beforeEach(() => {
      // Access the module-level monthCache through the service by calling with a unique month
      // We use different year/month per test to avoid cache collisions
    });

    it('returns classes from Supabase when data is available', async () => {
      const mockRows = [
        {
          id: 'uuid-class-1',
          date: '2030-01-15',
          time: '09:00',
          name: 'Inside Flow',
          instructor: 'Катя Габран',
          duration: '60 мин',
          spots_total: 12,
          spots_booked: 0,
          location: 'Станционная ул., 5Б',
          intensity: 3,
          price: 700,
          is_online: false,
        },
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
                }),
              }),
            }),
          }),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await dataService.getClassesForMonth(2030, 0, 'offline');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe('uuid-class-1');
      expect(result[0].name).toBe('Inside Flow');
      expect(result[0].spotsTotal).toBe(12);
      expect(result[0].isOnline).toBe(false);
    });

    it('applies defaults when DB fields are null', async () => {
      const mockRows = [
        {
          id: 'uuid-class-2',
          date: '2030-02-10',
          time: '18:00',
          name: 'Хатха',
          instructor: null,
          duration: null,
          spots_total: null,
          spots_booked: null,
          location: null,
          intensity: null,
          price: null,
          is_online: null,
        },
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
                }),
              }),
            }),
          }),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await dataService.getClassesForMonth(2030, 1, 'offline');
      const cls = result[0];

      expect(cls.instructor).toBe('Катя Габран');
      expect(cls.duration).toBe('60 мин');
      expect(cls.spotsTotal).toBe(12);
      expect(cls.location).toBe('Станционная ул., 5Б');
      expect(cls.intensity).toBe(2);
      expect(cls.price).toBe(700);
      expect(cls.isOnline).toBe(false);
    });

    it('adds booking counts to spotsBooked', async () => {
      const mockRows = [
        {
          id: 'uuid-class-3',
          date: '2030-03-05',
          time: '09:00',
          name: 'Flow',
          instructor: null,
          duration: null,
          spots_total: 10,
          spots_booked: 2,
          location: null,
          intensity: 2,
          price: 700,
          is_online: false,
        },
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
                }),
              }),
            }),
          }),
          in: vi.fn().mockResolvedValue({
            data: [
              { class_id: 'uuid-class-3' },
              { class_id: 'uuid-class-3' },
              { class_id: 'uuid-class-3' },
            ],
            error: null,
          }),
        })),
      });

      const result = await dataService.getClassesForMonth(2030, 2, 'offline');
      // spots_booked(2) + 3 real bookings = 5
      expect(result[0].spotsBooked).toBe(5);
    });

    it('falls back to mock data when Supabase returns empty array', async () => {
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await dataService.getClassesForMonth(2030, 3, 'offline');
      // Mock data should generate some classes
      expect(result.length).toBeGreaterThan(0);
      // Mock IDs have a date-based format, not UUID
      expect(result[0].id).toMatch(/^\d{4}-\d{2}-\d{2}-offline-\d/);
    });

    it('falls back to mock data when Supabase throws', async () => {
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockRejectedValue(new Error('Network error')),
                }),
              }),
            }),
          }),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await dataService.getClassesForMonth(2030, 4, 'offline');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('returns false for duplicate bookings', async () => {
    const registerSpy = vi.spyOn(dataService, 'registerUser').mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Анна',
      phone: '+79990001122',
      city: 'Москва',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'existing' }, error: null }),
          }),
        }),
      }),
    });

    const result = await dataService.bookClass(
      {
        id: '2024-02-01-offline-1',
        dateStr: '2024-02-01',
        time: '10:00',
        name: 'Inside Flow',
        instructor: 'Катя Габран',
        duration: '90 мин',
        spotsTotal: 10,
        spotsBooked: 0,
        location: 'Studio',
        intensity: 2,
        price: 800,
        isOnline: false,
      },
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Анна',
        phone: '+79990001122',
        city: 'Москва',
        isRegistered: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      }
    );

    expect(result).toBe(false);
    expect(registerSpy).toHaveBeenCalled();
  });
});
