export type AdminTab = 'schedule' | 'bookings' | 'contacts' | 'content' | 'images' | 'settings' | 'reviews' | 'pricing';

export interface ClassRow {
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
  is_online: boolean | null;
}

export interface ClassFormData {
  date: string;
  time: string;
  name: string;
  instructor: string;
  duration: string;
  spots_total: number;
  location: string;
  intensity: 1 | 2 | 3;
  is_online: boolean;
}

export interface BookingRow {
  id: string;
  phone: string | null;
  name: string | null;
  class_name: string | null;
  class_type: string | null;
  class_date: string | null;
  class_time: string | null;
  date: string | null;
  time: string | null;
  created_at: string;
  location: string | null;
  is_purchase: boolean | null;
  price: string | null;
  status?: 'active' | 'cancelled' | 'completed' | 'no_show';
}

export interface ContactRow {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  status?: 'new' | 'read' | 'processed' | 'spam';
}
