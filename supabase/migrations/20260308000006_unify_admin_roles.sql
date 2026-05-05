-- Migration: Unify Admin Roles (PR-2 Governance)
-- Description:
--   1. Backfill public.admins from profiles.is_admin = true
--   2. Drop old admin RLS policies that query the profiles table (RLS recursion risk)
--   3. Drop the is_admin column from public.profiles
--   4. Create new admin RLS policies using public.is_admin() exclusively

-- ============================================================
-- 1. BACKFILL admins table from profiles.is_admin = true
-- ============================================================

INSERT INTO public.admins (user_id)
  SELECT user_id FROM public.profiles WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 2. DROP OLD POLICIES that use profiles subquery
--    (created in 20260216000000_schedule_admin_booking_status.sql)
-- ============================================================

-- classes
DROP POLICY IF EXISTS "Admin full access on classes" ON public.classes;

-- contacts
DROP POLICY IF EXISTS "Admin can read contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin can delete contacts" ON public.contacts;

-- bookings
DROP POLICY IF EXISTS "Admin can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can delete any booking" ON public.bookings;

-- profiles
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- ============================================================
-- 3. DROP is_admin COLUMN from profiles
-- ============================================================

DROP INDEX IF EXISTS idx_profiles_is_admin;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS is_admin;

-- ============================================================
-- 4. CREATE NEW RLS POLICIES using public.is_admin()
-- ============================================================

-- 4a. CLASSES — admin full access (uses is_admin(), no profiles subquery)
--     Note: "admin manage classes" already exists from 20260215000000_admin_security.sql.
--     Re-assert with CREATE OR REPLACE via drop+create for clarity.
DROP POLICY IF EXISTS "admin manage classes" ON public.classes;
CREATE POLICY "admin manage classes" ON public.classes
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4b. CONTACTS — admin read + delete
DROP POLICY IF EXISTS "admin read contacts" ON public.contacts;
CREATE POLICY "admin read contacts" ON public.contacts
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin delete contacts" ON public.contacts;
CREATE POLICY "admin delete contacts" ON public.contacts
  FOR DELETE
  USING (public.is_admin());

-- 4c. BOOKINGS — admin full access
--     "admin manage bookings" already exists from 20260215000000_admin_security.sql;
--     drop duplicates and re-assert.
DROP POLICY IF EXISTS "admin view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "admin manage bookings" ON public.bookings;
CREATE POLICY "admin manage bookings" ON public.bookings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4d. PROFILES — admin can read all profiles
DROP POLICY IF EXISTS "admin read all profiles" ON public.profiles;
CREATE POLICY "admin read all profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());
