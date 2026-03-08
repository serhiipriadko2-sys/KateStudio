-- Security hardening: prevent users from self-escalating by updating profiles.is_admin.
-- RLS is row-level, so we enforce immutability of is_admin for user-owned profile updates.

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND coalesce(is_admin, false) = (
      SELECT coalesce(p.is_admin, false)
      FROM public.profiles AS p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
  );
