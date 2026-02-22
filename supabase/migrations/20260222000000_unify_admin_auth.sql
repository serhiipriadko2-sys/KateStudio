-- Migration: Unify Admin Auth (Production Readiness)
-- Description:
--   Resolves the dual admin system:
--     System 1: public.admins table + is_admin() function
--     System 2: profiles.is_admin boolean column
--
--   After this migration:
--     - is_admin() checks profiles.is_admin (single source of truth)
--     - All RLS policies use is_admin() function
--     - Redundant inline-subquery policies are dropped
--     - Bug in analytics_events (WHERE id = auth.uid()) is fixed
--
--   The public.admins table is kept for backwards compatibility but
--   is no longer the authoritative source for admin checks.

-- ============================================================
-- 1. Sync existing admins: copy public.admins → profiles.is_admin
-- ============================================================

UPDATE public.profiles
SET is_admin = true
WHERE user_id IN (SELECT user_id FROM public.admins)
  AND (is_admin IS NULL OR is_admin = false);

-- ============================================================
-- 2. Rewrite is_admin() to check profiles.is_admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_admin = true
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Single source of truth for admin authorization. Checks profiles.is_admin column.';

-- ============================================================
-- 3. Drop redundant System 2 inline-subquery policies
--    (classes, bookings, contacts, profiles)
--    These are replaced by is_admin()-based policies from admin_security.sql
-- ============================================================

-- 3a. CLASSES — drop inline subquery policy, keep is_admin() policy
DROP POLICY IF EXISTS "Admin full access on classes" ON public.classes;

-- 3b. CONTACTS — drop inline subquery policies
DROP POLICY IF EXISTS "Admin can read contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin can delete contacts" ON public.contacts;

-- 3c. BOOKINGS — drop inline subquery policies (keep is_admin() ones)
DROP POLICY IF EXISTS "Admin can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can delete any booking" ON public.bookings;

-- 3d. PROFILES — drop inline subquery policy, create is_admin() based one
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;

CREATE POLICY "Admin can read all profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 4. Fix analytics_events broken policy (WHERE id → user_id)
-- ============================================================

DROP POLICY IF EXISTS "Allow admins to read analytics" ON public.analytics_events;

CREATE POLICY "Allow admins to read analytics" ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 5. Fix videos policy to use is_admin() function
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;

CREATE POLICY "Admins can manage videos" ON public.videos
  FOR ALL
  USING (public.is_admin());
