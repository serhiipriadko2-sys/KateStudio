import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataService } from '../dataService';

const { mockFrom, mockGetSession, mockRpc } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetSession: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      getSession: mockGetSession,
    },
  },
  isSupabaseConfigured: true,
}));

const authenticatedSession = {
  data: {
    session: {
      user: { id: '11111111-1111-4111-8111-111111111111' },
    },
  },
};

const createClassesQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(result),
          }),
        }),
      }),
    }),
  }),
});

const createBookingsInQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnValue({
    in: vi.fn().mockResolvedValue(result),
  }),
});

const createBookingsListQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue(result),
  }),
});

const createProfileUpdateQuery = (result: { error: unknown }) => ({
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue(result),
});

const createBookingDeleteQuery = (result: { error: unknown }) => ({
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue(result),
});

const createBookClassRpcQuery = (result: { data: unknown; error: unknown }) => ({
  single: vi.fn().mockResolvedValue(result),
});

describe('dataService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockFrom.mockReset();
    mockRpc.mockReset();
    mockGetSession.mockReset();
    localStorage.clear();
    dataService.logout();
    mockGetSession.mockResolvedValue(authenticatedSession);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('registers user and caches profile data', async () => {
    mockFrom.mockReturnValue({
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
      'Anna',
      '+79990001122',
      '11111111-1111-4111-8111-111111111111'
    );

    expect(user.avatar).toBe('avatar.png');
    expect(user.createdAt).toBe('2024-01-01T00:00:00.000Z');

    const stored = await dataService.getUser();
    expect(stored?.name).toBe('Anna');
    expect(stored?.phone).toBe('+79990001122');
  });

  it('returns server bookings with truthful source metadata', async () => {
    mockFrom.mockReturnValue(
      createBookingsListQuery({
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
      })
    );

    const result = await dataService.getBookings({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Anna',
      phone: '+79990001122',
      city: 'Moscow',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(result.source).toBe('server');
    expect(result.degraded).toBe(false);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'booking-1',
      classId: 'class-1',
      className: 'Inside Flow',
    });
  });

  it('returns cached bookings with auth_required reason when server auth is missing', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    localStorage.setItem(
      'ksebe_cache_bookings',
      JSON.stringify([
        {
          id: 'cached-1',
          classId: 'class-1',
          className: 'Inside Flow',
          date: '2024-02-01',
          time: '10:00',
          location: 'Studio',
          timestamp: 1234,
          phone: '+79990001122',
          status: 'synced',
        },
      ])
    );

    const result = await dataService.getBookings({
      id: 'not-a-uuid',
      name: 'Anna',
      phone: '+79990001122',
      city: 'Moscow',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(result.source).toBe('cache');
    expect(result.degraded).toBe(true);
    expect(result.reason).toBe('auth_required');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('cached-1');
  });

  describe('getClassesForMonth', () => {
    it('returns server classes and marks seat counts degraded when booking counts fail', async () => {
      mockFrom
        .mockReturnValueOnce(
          createClassesQuery({
            data: [
              {
                id: 'uuid-class-1',
                date: '2030-01-15',
                time: '09:00',
                name: 'Inside Flow',
                instructor: 'Teacher',
                duration: '60 min',
                spots_total: 12,
                spots_booked: 2,
                location: 'Studio',
                intensity: 3,
                price: 700,
                is_online: false,
              },
            ],
            error: null,
          })
        )
        .mockReturnValueOnce(
          createBookingsInQuery({ data: null, error: new Error('counts down') })
        );

      const result = await dataService.getClassesForMonth(2030, 0, 'offline');

      expect(result.source).toBe('server');
      expect(result.degraded).toBe(true);
      expect(result.reason).toBe('booking_counts_unavailable');
      expect(result.data[0].spotsBooked).toBe(2);
    });

    it('returns mock classes with missing_server_data reason when server month is empty', async () => {
      mockFrom
        .mockReturnValueOnce(createClassesQuery({ data: [], error: null }))
        .mockReturnValueOnce(createBookingsInQuery({ data: [], error: null }));

      const result = await dataService.getClassesForMonth(2030, 3, 'offline');

      expect(result.source).toBe('mock');
      expect(result.degraded).toBe(true);
      expect(result.reason).toBe('missing_server_data');
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getClassesForDate', () => {
    it('filters the selected day and preserves truth metadata', async () => {
      mockFrom
        .mockReturnValueOnce(
          createClassesQuery({
            data: [
              {
                id: 'uuid-d1',
                date: '2030-06-15',
                time: '10:00',
                name: 'Flow',
                instructor: null,
                duration: null,
                spots_total: 10,
                spots_booked: 0,
                location: null,
                intensity: 2,
                price: 700,
                is_online: false,
              },
              {
                id: 'uuid-d2',
                date: '2030-06-16',
                time: '18:00',
                name: 'Yin',
                instructor: null,
                duration: null,
                spots_total: 10,
                spots_booked: 0,
                location: null,
                intensity: 1,
                price: 700,
                is_online: false,
              },
            ],
            error: null,
          })
        )
        .mockReturnValueOnce(createBookingsInQuery({ data: [], error: null }));

      const result = await dataService.getClassesForDate(new Date('2030-06-15'), 'offline');

      expect(result.source).toBe('server');
      expect(result.degraded).toBe(false);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('uuid-d1');
    });
  });

  describe('updateUserProfile', () => {
    const user = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Updated Name',
      phone: '+79990001122',
      city: 'SPB',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    it('returns a success mutation result when Supabase update succeeds', async () => {
      mockFrom.mockReturnValue(createProfileUpdateQuery({ error: null }));

      const result = await dataService.updateUserProfile(user);

      expect(result).toMatchObject({
        ok: true,
        status: 'success',
        source: 'server',
      });
    });

    it('returns a degraded mutation result when Supabase update fails', async () => {
      mockFrom.mockReturnValue(createProfileUpdateQuery({ error: new Error('db fail') }));

      const result = await dataService.updateUserProfile(user);

      expect(result).toMatchObject({
        ok: true,
        status: 'degraded',
        source: 'cache',
        reason: 'server_unavailable',
      });
    });
  });

  describe('bookClass', () => {
    const user = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Anna',
      phone: '+79990001122',
      city: 'Moscow',
      isRegistered: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    const cls = {
      id: '2024-02-01-offline-1',
      dateStr: '2024-02-01',
      time: '10:00',
      name: 'Inside Flow',
      instructor: 'Teacher',
      duration: '90 min',
      spotsTotal: 10,
      spotsBooked: 0,
      location: 'Studio',
      intensity: 2 as const,
      price: 800,
      isOnline: false,
    };

    it('returns duplicate when booking already exists on server', async () => {
      vi.spyOn(dataService, 'registerUser').mockResolvedValue(user);
      mockRpc.mockReturnValue(
        createBookClassRpcQuery({
          data: {
            ok: false,
            code: 'duplicate',
            booking_id: null,
            pass_id: null,
            visits_remaining: null,
          },
          error: null,
        })
      );

      const result = await dataService.bookClass(cls, user);

      expect(result).toMatchObject({
        ok: false,
        status: 'duplicate',
        source: 'server',
      });
      expect(mockRpc).toHaveBeenCalledWith('book_class_with_access', {
        p_class_id: cls.id,
        p_class_name: cls.name,
        p_class_date: cls.dateStr,
        p_class_time: cls.time,
        p_class_location: cls.location,
        p_class_timestamp: expect.any(Number),
      });
    });

    it('invalidates the cached month after a successful booking', async () => {
      vi.spyOn(dataService, 'registerUser').mockResolvedValue(user);

      mockFrom
        .mockReturnValueOnce(
          createClassesQuery({
            data: [
              {
                id: cls.id,
                date: '2024-02-01',
                time: '10:00',
                name: 'Inside Flow',
                instructor: 'Teacher',
                duration: '90 min',
                spots_total: 10,
                spots_booked: 0,
                location: 'Studio',
                intensity: 2,
                price: 800,
                is_online: false,
              },
            ],
            error: null,
          })
        )
        .mockReturnValueOnce(createBookingsInQuery({ data: [], error: null }));

      await dataService.getClassesForMonth(2024, 1, 'offline');
      expect(mockFrom).toHaveBeenCalledTimes(2);

      mockRpc.mockReturnValue(
        createBookClassRpcQuery({
          data: {
            ok: true,
            code: 'success',
            booking_id: 'booking-1',
            pass_id: 'pass-1',
            visits_remaining: 4,
          },
          error: null,
        })
      );

      const bookingResult = await dataService.bookClass(cls, user);
      expect(bookingResult).toMatchObject({
        ok: true,
        status: 'success',
        source: 'server',
      });

      mockFrom
        .mockReturnValueOnce(
          createClassesQuery({
            data: [
              {
                id: cls.id,
                date: '2024-02-01',
                time: '10:00',
                name: 'Inside Flow',
                instructor: 'Teacher',
                duration: '90 min',
                spots_total: 10,
                spots_booked: 1,
                location: 'Studio',
                intensity: 2,
                price: 800,
                is_online: false,
              },
            ],
            error: null,
          })
        )
        .mockReturnValueOnce(createBookingsInQuery({ data: [], error: null }));

      await dataService.getClassesForMonth(2024, 1, 'offline');
      expect(mockRpc).toHaveBeenCalledTimes(1);
      expect(mockFrom).toHaveBeenCalledTimes(4);
    });
  });

  describe('cancelBooking', () => {
    it('returns success when Supabase deletes successfully', async () => {
      mockFrom.mockReturnValue(createBookingDeleteQuery({ error: null }));

      const result = await dataService.cancelBooking('booking-uuid');

      expect(result).toMatchObject({
        ok: true,
        status: 'success',
        source: 'server',
      });
    });

    it('returns auth_required when cancellation cannot be tied to an authenticated user', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const result = await dataService.cancelBooking('booking-uuid');

      expect(result).toMatchObject({
        ok: false,
        status: 'auth_required',
        source: 'cache',
        reason: 'auth_required',
      });
    });
  });

  describe('stripCachedBooking', () => {
    it('removes phone and status from cached booking', () => {
      const cached = {
        id: 'b1',
        classId: 'c1',
        className: 'Flow',
        date: '2026-01-01',
        time: '10:00',
        location: 'Studio',
        timestamp: 12345,
        phone: '+79001234567',
        status: 'synced' as const,
      };

      const stripped = dataService.stripCachedBooking(cached);
      expect(stripped).not.toHaveProperty('phone');
      expect(stripped).not.toHaveProperty('status');
      expect(stripped.id).toBe('b1');
    });
  });

  describe('logout', () => {
    it('clears the cache without throwing', () => {
      expect(() => dataService.logout()).not.toThrow();
    });
  });
});
