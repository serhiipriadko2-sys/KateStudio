-- Fix misleading booking status comment left by migration 20260216000000.
-- That migration attempted ADD COLUMN IF NOT EXISTS (no-op, column already existed
-- as public.booking_status enum from 20260215010000) but the COMMENT still ran,
-- leaving incorrect documentation.
--
-- Actual column type: public.booking_status ENUM
-- Actual values:      active | cancelled | completed | no_show

COMMENT ON COLUMN public.bookings.status IS
  'Booking lifecycle: active (default) | cancelled | completed | no_show';
