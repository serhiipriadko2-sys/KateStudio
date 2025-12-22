import { Booking, UserProfile } from '../types';

export type BookingStatus = 'synced' | 'pending';

export interface CachedBooking extends Booking {
  phone: string;
  status: BookingStatus;
}

export interface CacheAdapter {
  getUser: () => Promise<UserProfile | null>;
  setUser: (user: UserProfile) => Promise<void>;
  clearUser: () => Promise<void>;
  getBookingsByPhone: (phone: string) => Promise<CachedBooking[]>;
  getPendingBookings: (phone: string) => Promise<CachedBooking[]>;
  findBookingByClassId: (phone: string, classId: string) => Promise<CachedBooking | undefined>;
  getBookingById: (id: string) => Promise<CachedBooking | undefined>;
  upsertBookings: (bookings: CachedBooking[]) => Promise<void>;
  removeBooking: (id: string) => Promise<void>;
}

const DB_NAME = 'ksebe-cache';
const DB_VERSION = 1;

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('bookings')) {
        const store = db.createObjectStore('bookings', { keyPath: 'id' });
        store.createIndex('phone', 'phone', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('phone_status', ['phone', 'status'], { unique: false });
        store.createIndex('phone_classId', ['phone', 'classId'], { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  storeName: 'user' | 'bookings',
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> => {
  const db = await openDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await callback(store);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return result;
};

const indexedDbAdapter: CacheAdapter = {
  getUser: () =>
    withStore('user', 'readonly', async (store) => {
      const entry = await requestToPromise<{ key: string; value: UserProfile } | undefined>(
        store.get('current')
      );
      return entry?.value ?? null;
    }),
  setUser: (user: UserProfile) =>
    withStore('user', 'readwrite', async (store) => {
      await requestToPromise(store.put({ key: 'current', value: user }));
    }),
  clearUser: () =>
    withStore('user', 'readwrite', async (store) => {
      await requestToPromise(store.delete('current'));
    }),
  getBookingsByPhone: (phone: string) =>
    withStore('bookings', 'readonly', async (store) => {
      const index = store.index('phone');
      return requestToPromise<CachedBooking[]>(index.getAll(phone));
    }),
  getPendingBookings: (phone: string) =>
    withStore('bookings', 'readonly', async (store) => {
      const index = store.index('phone_status');
      return requestToPromise<CachedBooking[]>(index.getAll([phone, 'pending']));
    }),
  findBookingByClassId: (phone: string, classId: string) =>
    withStore('bookings', 'readonly', async (store) => {
      const index = store.index('phone_classId');
      return requestToPromise<CachedBooking | undefined>(index.get([phone, classId]));
    }),
  getBookingById: (id: string) =>
    withStore('bookings', 'readonly', async (store) =>
      requestToPromise<CachedBooking | undefined>(store.get(id))
    ),
  upsertBookings: (bookings: CachedBooking[]) =>
    withStore('bookings', 'readwrite', async (store) => {
      await Promise.all(bookings.map((booking) => requestToPromise(store.put(booking))));
    }),
  removeBooking: (id: string) =>
    withStore('bookings', 'readwrite', async (store) => {
      await requestToPromise(store.delete(id));
    }),
};

const LOCAL_USER_KEY = 'ksebe_cache_user';
const LOCAL_BOOKINGS_KEY = 'ksebe_cache_bookings';

const readLocalBookings = (): CachedBooking[] => {
  const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CachedBooking[];
  } catch {
    return [];
  }
};

const localStorageAdapter: CacheAdapter = {
  getUser: async () => {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },
  setUser: async (user) => {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  },
  clearUser: async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
  },
  getBookingsByPhone: async (phone) => readLocalBookings().filter((b) => b.phone === phone),
  getPendingBookings: async (phone) =>
    readLocalBookings().filter((b) => b.phone === phone && b.status === 'pending'),
  findBookingByClassId: async (phone, classId) =>
    readLocalBookings().find((b) => b.phone === phone && b.classId === classId),
  getBookingById: async (id) => readLocalBookings().find((b) => b.id === id),
  upsertBookings: async (bookings) => {
    const existing = readLocalBookings();
    const updated = [...existing];
    bookings.forEach((booking) => {
      const idx = updated.findIndex((item) => item.id === booking.id);
      if (idx >= 0) {
        updated[idx] = booking;
      } else {
        updated.push(booking);
      }
    });
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(updated));
  },
  removeBooking: async (id) => {
    const updated = readLocalBookings().filter((b) => b.id !== id);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(updated));
  },
};

const createCacheAdapter = (): CacheAdapter => {
  if (typeof indexedDB !== 'undefined') {
    return indexedDbAdapter;
  }
  return localStorageAdapter;
};

export const cacheAdapter = createCacheAdapter();
