-- Security fix: prevent privilege escalation via profiles.is_admin self-update
-- Context: users can update their own profile row; ensure they cannot flip is_admin.

-- Replace permissive profile update policies with a guarded version.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_admin IS NOT DISTINCT FROM (
      SELECT p.is_admin
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
    )
  );
