import { Booking, ClassSession, UserProfile } from '../types';
import { cacheAdapter, CachedBooking } from './localCache';
import { supabase } from './supabaseClient';

export const DATA_SOURCES = {
  userProfile: 'supabase',
  bookings: 'supabase',
  classSchedule: 'local-generated',
  cachedUser: 'local-cache',
  cachedBookings: 'local-cache',
  pendingBookings: 'local-cache',
} as const;

// --- Mock Data Generators ---
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const dataService = {
  // --- Auth & User ---

  // Sync method for initialization state, reads from cache
  getUser: async (): Promise<UserProfile | null> => cacheAdapter.getUser(),

  // Async method to register/login with Supabase
  registerUser: async (name: string, phone: string): Promise<UserProfile> => {
    const user: UserProfile = {
      id: phone, // using phone as ID for simplicity in this demo
      name,
      phone,
      city: 'Москва',
      isRegistered: true,
      createdAt: new Date().toISOString(),
    };

    try {
      // Upsert into Supabase profiles
      // We select avatar as well to ensure we get the latest if it exists
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            phone: user.phone,
            name: user.name,
            city: user.city,
            // Only set created_at if not exists (handled by DB default usually, but good to pass if table structure supports it)
          },
          { onConflict: 'phone' }
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
      const updates: any = {
        name: user.name,
        city: user.city,
      };

      if (user.avatar) {
        updates.avatar = user.avatar;
      }

      const { error } = await supabase.from('profiles').update(updates).eq('phone', user.phone);

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
  getClassesForDate: async (date: Date, type: 'offline' | 'online'): Promise<ClassSession[]> => {
    const dateStr = date.toISOString().split('T')[0];
    const daySeed = date.getFullYear() * 1000 + (date.getMonth() + 1) * 100 + date.getDate();

    // 1. Generate Base Schedule Templates
    const templates =
      type === 'offline'
        ? [
            {
              name: 'Inside Flow',
              time: '09:00',
              duration: '90 мин',
              spots: 12,
              loc: 'Зал на Мира',
              int: 3,
              price: 800,
            },
            {
              name: 'Хатха Йога',
              time: '18:30',
              duration: '60 мин',
              spots: 15,
              loc: 'Зал на Ленина',
              int: 2,
              price: 700,
            },
            {
              name: 'Медитация + Sound Healing',
              time: '20:00',
              duration: '60 мин',
              spots: 10,
              loc: 'Зал на Мира',
              int: 1,
              price: 1000,
            },
            {
              name: 'Vinyasa Flow',
              time: '12:00',
              duration: '75 мин',
              spots: 12,
              loc: 'Зал на Ленина',
              int: 3,
              price: 800,
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

    // 2. Filter randomly to create variety
    const todaysClasses = templates.filter((_, i) => pseudoRandom(daySeed + i) > 0.3);

    // 3. Prepare IDs
    const classesWithIds = todaysClasses.map((tmpl, idx) => ({
      ...tmpl,
      id: `${dateStr}-${type}-${idx}`,
    }));

    const classIds = classesWithIds.map((c) => c.id);
    const bookingCounts: Record<string, number> = {};

    // 4. Try Fetch real booking counts from Supabase
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('class_id')
        .in('class_id', classIds);

      if (error) throw error;

      if (bookings) {
        bookings.forEach((b: any) => {
          bookingCounts[b.class_id] = (bookingCounts[b.class_id] || 0) + 1;
        });
      }
    } catch (e) {
      // Silent fail for offline mode
    }

    // 5. Map final objects
    return classesWithIds.map((tmpl, idx) => {
      const initialBooked = Math.floor(pseudoRandom(daySeed + idx * 10) * (tmpl.spots / 3)); // Some fake initial load
      const realBookings = bookingCounts[tmpl.id] || 0;

      return {
        id: tmpl.id,
        dateStr,
        time: tmpl.time,
        name: tmpl.name,
        instructor: 'Катя Габран',
        duration: tmpl.duration,
        spotsTotal: tmpl.spots,
        spotsBooked: Math.min(initialBooked + realBookings, tmpl.spots),
        location: tmpl.loc,
        intensity: tmpl.int as 1 | 2 | 3,
        price: tmpl.price,
        isOnline: type === 'online',
      };
    });
  },

  // --- Booking ---
  getBookings: async (phone: string): Promise<Booking[]> => {
    await dataService.syncPendingBookings(phone);
    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('phone', phone);

      if (error) throw error;

      const bookings = data.map((b: any) => ({
        id: b.id,
        classId: b.class_id,
        className: b.class_name,
        date: b.date,
        time: b.time,
        location: b.location,
        timestamp: b.timestamp,
      }));

      await cacheAdapter.upsertBookings(
        bookings.map((booking) => ({
          ...booking,
          phone,
          status: 'synced',
        }))
      );

      const pending = await cacheAdapter.getPendingBookings(phone);
      return [...bookings, ...pending.map(dataService.stripCachedBooking)];
    } catch (e) {
      console.warn('Failed to fetch bookings from DB', e);
      const cached = await cacheAdapter.getBookingsByPhone(phone);
      return cached.map(dataService.stripCachedBooking);
    }
  },

  bookClass: async (cls: ClassSession, user: UserProfile): Promise<boolean> => {
    // 1. Ensure user exists (local or remote)
    await dataService.registerUser(user.name, user.phone);

    const existingLocal = await cacheAdapter.findBookingByClassId(user.phone, cls.id);
    if (existingLocal) {
      return false;
    }

    const bookingPayload = {
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
        .eq('phone', user.phone)
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
      const pendingBooking: CachedBooking = {
        id: `pending-${Date.now()}-${cls.id}`,
        classId: cls.id,
        className: cls.name,
        date: cls.dateStr,
        time: cls.time,
        location: cls.location,
        timestamp: Date.now(),
        phone: user.phone,
        status: 'pending',
      };
      await cacheAdapter.upsertBookings([pendingBooking]);
      // Simulate success for demo purposes if backend fails
      return true;
    }
  },

  cancelBooking: async (bookingId: string): Promise<boolean> => {
    const pending = await cacheAdapter.getBookingById(bookingId);
    if (pending?.status === 'pending') {
      await cacheAdapter.removeBooking(bookingId);
      return true;
    }

    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) throw error;
      await cacheAdapter.removeBooking(bookingId);
      return true;
    } catch (e) {
      console.error('Cancellation error', e);
      return false;
    }
  },

  syncPendingBookings: async (phone: string): Promise<void> => {
    const pending = await cacheAdapter.getPendingBookings(phone);
    if (!pending.length) return;

    await Promise.all(
      pending.map(async (booking) => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .insert({
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
