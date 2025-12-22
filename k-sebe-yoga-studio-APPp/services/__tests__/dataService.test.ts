import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { dataService } from '../dataService';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
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

    const user = await dataService.registerUser('Анна', '+79990001122');

    expect(user.avatar).toBe('avatar.png');
    expect(user.createdAt).toBe('2024-01-01T00:00:00.000Z');

    const stored = JSON.parse(localStorage.getItem('ksebe_user') || '{}');
    expect(stored.name).toBe('Анна');
    expect(stored.phone).toBe('+79990001122');
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

    const bookings = await dataService.getBookings('+79990001122');

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

  it('returns false for duplicate bookings', async () => {
    const registerSpy = vi.spyOn(dataService, 'registerUser').mockResolvedValue({
      id: '+79990001122',
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
        id: '+79990001122',
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
