-- Fix: profiles_update_own policy referenced is_admin column that was dropped
-- in 20260308000000_unify_admin_roles.sql. Any profile update would fail with
-- "column does not exist" error. Replace with a simple owner-only update policy.

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
