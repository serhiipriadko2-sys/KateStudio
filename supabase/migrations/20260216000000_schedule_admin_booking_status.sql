-- Migration: Schedule & Admin & Booking Status overhaul
-- Description:
--   1. Add price/description columns to classes
--   2. Add status column to bookings + class_id FK reference
--   3. Add is_admin to profiles for admin panel access
--   4. Add admin-aware RLS policies for classes, bookings, contacts
--   5. Add indexes for performance

-- ============================================================
-- 1. CLASSES: add price and description columns
-- ============================================================

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS price integer,
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.classes.price IS 'Class price in RUB (e.g. 700)';
COMMENT ON COLUMN public.classes.description IS 'Optional class description for students';

-- ============================================================
-- 2. BOOKINGS: add status column and class_id for WEB bookings
-- ============================================================

-- Status: pending (just created), confirmed (admin approved), cancelled, completed
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

COMMENT ON COLUMN public.bookings.status IS 'Booking lifecycle: pending | confirmed | cancelled | completed';

-- Ensure class_id exists (APP already uses it, WEB will start using it)
-- It already exists from baseline but as text — that's fine, we keep it text
-- since APP generates string IDs like "2026-02-16-offline-0"

-- ============================================================
-- 3. PROFILES: add is_admin flag
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.is_admin IS 'Admin flag. Set manually in DB or via service role.';

-- ============================================================
-- 4. ADMIN RLS POLICIES
-- ============================================================

-- Helper: check if current user is admin
-- We use a subquery against profiles for RLS policy definitions

-- 4a. CLASSES — allow admin insert/update/delete
-- Drop the old service_role-only write policy if it exists
DROP POLICY IF EXISTS "Enable write access for service role" ON public.classes;

-- Admin can do all operations
CREATE POLICY "Admin full access on classes" ON public.classes
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- 4b. CONTACTS — allow admin to read all contacts
DROP POLICY IF EXISTS "Enable read for service role only" ON public.contacts;

CREATE POLICY "Admin can read contacts" ON public.contacts
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can delete contacts
CREATE POLICY "Admin can delete contacts" ON public.contacts
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- 4c. BOOKINGS — allow admin to read ALL bookings (not just own)
CREATE POLICY "Admin can read all bookings" ON public.bookings
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can update booking status
CREATE POLICY "Admin can update bookings" ON public.bookings
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can delete any booking
CREATE POLICY "Admin can delete any booking" ON public.bookings
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- 4d. PROFILES — allow admin to read all profiles
CREATE POLICY "Admin can read all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- ============================================================
-- 5. INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_classes_date ON public.classes (date);
CREATE INDEX IF NOT EXISTS idx_classes_date_is_online ON public.classes (date, is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON public.bookings (class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin) WHERE is_admin = true;
