-- Migration: Grant Execute on is_admin() RPC
-- Description:
--   Allow authenticated users to call the is_admin() helper function.
--   This is required for AuthContext.tsx to check admin status after login.

-- ============================================================
-- GRANT EXECUTE on is_admin() to authenticated users
-- ============================================================

-- Revoke from public first (security best practice)
revoke execute on function public.is_admin() from public, anon;

-- Grant to authenticated users only
grant execute on function public.is_admin() to authenticated;

-- Note: The function itself uses 'security definer' and checks the admins table,
-- so only users in the admins table will get true, others get false.
-- This grant just allows the RPC call to execute without permission error.
