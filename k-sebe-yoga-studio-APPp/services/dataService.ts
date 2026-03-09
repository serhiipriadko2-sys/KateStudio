import { isSupabaseConfigured, supabase } from '@ksebe/shared';
import { Booking, ClassSession, UserProfile } from '../types';
import { cacheAdapter, CachedBooking } from './localCache';

export const DATA_SOURCES = {
  userProfile: 'supabase',
  bookings: 'supabase',
  classSchedule: 'supabase-with-mock-fallback',
  cachedUser: 'local-cache',
  cachedBookings: 'local-cache',
  pendingBookings: 'local-cache',
} as const;

const isUuid = (value?: string) =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getAuthenticatedUserId = async (expectedUserId?: string): Promise<string | null> => {
  if (!isSupabaseConfigured) return null;
  if (expectedUserId && !isUuid(expectedUserId)) return null;
  const session = await supabase.auth.getSession();
  const sessionUserId = session.data.session?.user?.id;
  if (!sessionUserId) return null;
  if (expectedUserId && sessionUserId !== expectedUserId) return null;
  return sessionUserId;
};

// --- Mock Data Generators ---
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// In-memory cache: key = "YYYY-MM-type" → array of ClassSessions for the whole month
const monthCache = new Map<string, ClassSession[]>();

const getMonthCacheKey = (year: number, month: number, type: 'offline' | 'online') =>
  `${year}-${String(month + 1).padStart(2, '0')}-${type}`;

export const dataService = {
  // --- Auth & User ---

  // Sync method for initialization state, reads from cache
  getUser: async (): Promise<UserProfile | null> => cacheAdapter.getUser(),

  // Async method to register/login with Supabase
  registerUser: async (name: string, phone: string, userId?: string): Promise<UserProfile> => {
    const user: UserProfile = {
      id: userId || phone, // use Supabase Auth user id when available
      name,
      phone,
      city: 'Москва',
      isRegistered: true,
      createdAt: new Date().toISOString(),
    };

    try {
      // In auth-first mode we only write to Supabase when userId is present (authenticated).
      const authUserId = await getAuthenticatedUserId(userId);
      if (!authUserId) throw new Error('AUTH_REQUIRED');
      user.id = authUserId;

      // Upsert into Supabase profiles
      // We select avatar as well to ensure we get the latest if it exists
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: authUserId,
            phone: user.phone,
            name: user.name,
            city: user.city,
            // Only set created_at if not exists (handled by DB default usually, but good to pass if table structure supports it)
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        if (data.avatar) user.avatar = data.avatar;
        if (data.created_at) user.createdAt = data.created_at;
      }
    } catch (e) {
      console.warn('Supabase registration failed, falling back to local storage', e);
      // Fallback: Proceed without throwing, just cache locally
    }

    // Cache locally
    await cacheAdapter.setUser(user);
    return user;
  },

  updateUserProfile: async (user: UserProfile): Promise<boolean> => {
    try {
      // Auth-first: updates must be tied to the authenticated user_id.
      const authUserId = await getAuthenticatedUserId(user.id);
      if (!authUserId) throw new Error('Missing authenticated user id');
      const updates: { name: string; city: string; avatar?: string } = {
        name: user.name,
        city: user.city,
      };

      if (user.avatar) {
        updates.avatar = user.avatar;
      }

      const { error } = await supabase.from('profiles').update(updates).eq('user_id', authUserId);

      if (error) throw error;
    } catch (e) {
      console.warn('Supabase update failed, using local only', e);
    }

    // Update local cache
    await cacheAdapter.setUser(user);
    return true;
  },

  logout: () => {
    cacheAdapter.clearUser();
  },

  // --- Schedule ---

  // Fetches all classes for a whole month in one batch and caches the result.
  // Primary: Supabase `classes` table. Fallback: locally-generated mock data.
  // Subsequent calls for the same month+type are served from the in-memory cache.
  getClassesForMonth: async (
    year: number,
    month: number,
    type: 'offline' | 'online'
  ): Promise<ClassSession[]> => {
    const cacheKey = getMonthCacheKey(year, month, type);
    if (monthCache.has(cacheKey)) {
      return monthCache.get(cacheKey)!;
    }

    // --- Primary: fetch from Supabase ---
    if (isSupabaseConfigured) {
      try {
        const pad = (n: number) => String(n).padStart(2, '0');
        const startDate = `${year}-${pad(month + 1)}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

        const { data: rows, error } = await supabase
          .from('classes')
          .select('*')
          .eq('is_online', type === 'online')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (!error && rows && rows.length > 0) {
          // Batch-fetch booking counts for all classes in the month
          const classIds = rows.map((r: { id: string }) => r.id);
          const bookingCounts: Record<string, number> = {};
          const { data: bookings } = await supabase
            .from('bookings')
            .select('class_id')
            .in('class_id', classIds);
          if (bookings) {
            bookings.forEach((b: { class_id: string }) => {
              bookingCounts[b.class_id] = (bookingCounts[b.class_id] || 0) + 1;
            });
          }

          const sessions: ClassSession[] = rows.map(
            (row: {
              id: string;
              date: string;
              time: string;
              name: string;
              instructor: string | null;
              duration: string | null;
              spots_total: number | null;
              spots_booked: number | null;
              location: string | null;
              intensity: number | null;
              price: number | null;
              is_online: boolean | null;
            }) => {
              const spotsTotal = row.spots_total ?? 12;
              const bookedBase = row.spots_booked ?? 0;
              const bookedReal = bookingCounts[row.id] ?? 0;
              return {
                id: row.id,
                dateStr: row.date,
                time: row.time,
                name: row.name,
                instructor: row.instructor ?? 'Катя Габран',
                duration: row.duration ?? '60 мин',
                spotsTotal,
                spotsBooked: Math.min(bookedBase + bookedReal, spotsTotal),
                location: row.location ?? 'Станционная ул., 5Б',
                intensity: (row.intensity ?? 2) as 1 | 2 | 3,
                price: row.price ?? 700,
                isOnline: row.is_online ?? false,
              };
            }
          );

          monthCache.set(cacheKey, sessions);
          return sessions;
        }
      } catch {
        // Fall through to mock data
      }
    }

    // --- Fallback: locally-generated mock data ---
    const templates =
      type === 'offline'
        ? [
            {
              name: 'Inside Flow',
              time: '09:00',
              duration: '60 мин',
              spots: 12,
              loc: 'Станционная ул., 5Б',
              int: 3,
              price: 700,
            },
            {
              name: 'Хатха Йога',
              time: '18:30',
              duration: '60 мин',
              spots: 15,
              loc: 'Станционная ул., 5Б',
              int: 2,
              price: 700,
            },
            {
              name: 'Медитация + Sound Healing',
              time: '20:00',
              duration: '60 мин',
              spots: 10,
              loc: 'Станционная ул., 5Б',
              int: 1,
              price: 1500,
            },
            {
              name: 'Vinyasa Flow',
              time: '12:00',
              duration: '60 мин',
              spots: 12,
              loc: 'Станционная ул., 5Б',
              int: 3,
              price: 700,
            },
          ]
        : [
            {
              name: 'Утренний поток (Zoom)',
              time: '08:00',
              duration: '45 мин',
              spots: 50,
              loc: 'Online',
              int: 2,
              price: 400,
            },
            {
              name: 'Вечерняя растяжка (Zoom)',
              time: '19:00',
              duration: '60 мин',
              spots: 50,
              loc: 'Online',
              int: 1,
              price: 400,
            },
          ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const allClassIds: string[] = [];
    const monthClassEntries: Array<{
      dateStr: string;
      daySeed: number;
      template: (typeof templates)[number];
      id: string;
    }> = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySeed = year * 1000 + (month + 1) * 100 + day;
      const todaysClasses = templates.filter((_, i) => pseudoRandom(daySeed + i) > 0.3);
      todaysClasses.forEach((template, idx) => {
        const id = `${dateStr}-${type}-${idx}`;
        allClassIds.push(id);
        monthClassEntries.push({ dateStr, daySeed, template, id });
      });
    }

    const bookingCounts: Record<string, number> = {};
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('class_id')
        .in('class_id', allClassIds);
      if (error) throw error;
      if (bookings) {
        bookings.forEach((b: { class_id: string }) => {
          bookingCounts[b.class_id] = (bookingCounts[b.class_id] || 0) + 1;
        });
      }
    } catch {
      // Silent fail for offline mode
    }

    const sessions: ClassSession[] = monthClassEntries.map(
      ({ dateStr, daySeed, template, id }, idx) => {
        const initialBooked = Math.floor(pseudoRandom(daySeed + idx * 10) * (template.spots / 3));
        const realBookings = bookingCounts[id] || 0;
        return {
          id,
          dateStr,
          time: template.time,
          name: template.name,
          instructor: 'Катя Габран',
          duration: template.duration,
          spotsTotal: template.spots,
          spotsBooked: Math.min(initialBooked + realBookings, template.spots),
          location: template.loc,
          intensity: template.int as 1 | 2 | 3,
          price: template.price,
          isOnline: type === 'online',
        };
      }
    );

    monthCache.set(cacheKey, sessions);
    return sessions;
  },

  // Delegates to getClassesForMonth and filters by the requested day.
  // Backward-compatible — callers are unchanged.
  getClassesForDate: async (date: Date, type: 'offline' | 'online'): Promise<ClassSession[]> => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const monthSessions = await dataService.getClassesForMonth(year, month, type);
    return monthSessions.filter((s) => s.dateStr === dateStr);
  },

  // --- Booking ---
  getBookings: async (user: UserProfile): Promise<Booking[]> => {
    await dataService.syncPendingBookings(user);
    try {
      const authUserId = await getAuthenticatedUserId(user.id);
      if (!authUserId) throw new Error('Missing user id');
      const { data, error } = await supabase.from('bookings').select('*').eq('user_id', authUserId);

      if (error) throw error;

      const bookings = data.map(
        (b: {
          id: string;
          class_id: string;
          class_name: string;
          date: string;
          time: string;
          location: string;
          timestamp: number;
        }) => ({
          id: b.id,
          classId: b.class_id,
          className: b.class_name,
          date: b.date,
          time: b.time,
          location: b.location,
          timestamp: b.timestamp,
        })
      );

      await cacheAdapter.upsertBookings(
        bookings.map((booking) => ({
          ...booking,
          phone: user.phone,
          status: 'synced',
        }))
      );

      const pending = await cacheAdapter.getPendingBookings(user.phone);
      return [...bookings, ...pending.map(dataService.stripCachedBooking)];
    } catch (e) {
      console.warn('Failed to fetch bookings from DB', e);
      const cached = await cacheAdapter.getBookingsByPhone(user.phone);
      return cached.map(dataService.stripCachedBooking);
    }
  },

  bookClass: async (cls: ClassSession, user: UserProfile): Promise<boolean> => {
    // Auth-first: real bookings require authenticated user_id (RLS).
    // If user.id is not a UUID, treat as unauthenticated.
    const authUserId = await getAuthenticatedUserId(user.id);
    if (!authUserId) {
      // Keep local profile cached for UX, but don't attempt DB booking.
      await cacheAdapter.setUser({ ...user, isRegistered: true });
      return false;
    }

    // Ensure profile exists server-side (best-effort).
    await dataService.registerUser(user.name, user.phone, authUserId);

    const existingLocal = await cacheAdapter.findBookingByClassId(user.phone, cls.id);
    if (existingLocal) {
      return false;
    }

    const bookingPayload = {
      user_id: authUserId,
      phone: user.phone,
      class_id: cls.id,
      class_name: cls.name,
      date: cls.dateStr,
      time: cls.time,
      location: cls.location,
      timestamp: Date.now(),
    };

    try {
      // 2. Check for duplicate booking
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', authUserId)
        .eq('class_id', cls.id)
        .single();

      if (existing) {
        return false; // Already booked
      }

      // 3. Insert Booking
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const cachedBooking: CachedBooking = {
          id: data.id,
          classId: data.class_id,
          className: data.class_name,
          date: data.date,
          time: data.time,
          location: data.location,
          timestamp: data.timestamp,
          phone: user.phone,
          status: 'synced',
        };
        await cacheAdapter.upsertBookings([cachedBooking]);
      }

      return true;
    } catch (e) {
      console.error('Booking error, falling back to simulation', e);
      return false;
    }
  },

  cancelBooking: async (bookingId: string): Promise<boolean> => {
    const pending = await cacheAdapter.getBookingById(bookingId);
    if (pending?.status === 'pending') {
      await cacheAdapter.removeBooking(bookingId);
      return true;
    }

    try {
      const authUserId = await getAuthenticatedUserId();
      if (!authUserId) throw new Error('AUTH_REQUIRED');
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) throw error;
      await cacheAdapter.removeBooking(bookingId);
      return true;
    } catch (e: unknown) {
      console.error('Cancellation error', e);
      return false;
    }
  },

  syncPendingBookings: async (user: UserProfile): Promise<void> => {
    // Only sync when we have a real authenticated user id.
    const authUserId = await getAuthenticatedUserId(user.id);
    if (!authUserId) return;

    const pending = await cacheAdapter.getPendingBookings(user.phone);
    if (!pending.length) return;

    await Promise.all(
      pending.map(async (booking) => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .insert({
              user_id: authUserId,
              phone: booking.phone,
              class_id: booking.classId,
              class_name: booking.className,
              date: booking.date,
              time: booking.time,
              location: booking.location,
              timestamp: booking.timestamp,
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const synced: CachedBooking = {
              id: data.id,
              classId: data.class_id,
              className: data.class_name,
              date: data.date,
              time: data.time,
              location: data.location,
              timestamp: data.timestamp,
              phone: booking.phone,
              status: 'synced',
            };
            await cacheAdapter.removeBooking(booking.id);
            await cacheAdapter.upsertBookings([synced]);
          }
        } catch {
          // keep pending for next attempt
        }
      })
    );
  },

  stripCachedBooking: (booking: CachedBooking): Booking => ({
    id: booking.id,
    classId: booking.classId,
    className: booking.className,
    date: booking.date,
    time: booking.time,
    location: booking.location,
    timestamp: booking.timestamp,
  }),
};
