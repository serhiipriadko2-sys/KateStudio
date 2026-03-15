-- ============================================
-- ADMIN PANEL — SQL CHECKLIST
-- ============================================
-- Execute this in Supabase Dashboard → SQL Editor
-- To verify admin setup is complete

-- ============================================
-- 1. CHECK: is_admin() function exists
-- ============================================
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'is_admin';

-- Expected: 1 row with security_type = 'DEFINER'

-- ============================================
-- 2. CHECK: admins table exists
-- ============================================
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'admins';

-- Expected: 1 row

-- ============================================
-- 3. CHECK: Current user is in admins table
-- ============================================
-- First get current user ID
SELECT auth.uid() as current_user_id;

-- Then check if in admins table
SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
) as is_admin;

-- Expected: true (if current user is admin)

-- ============================================
-- 4. CHECK: is_admin() function is executable
-- ============================================
SELECT public.is_admin() as admin_check;

-- Expected: true or false (no permission error)

-- ============================================
-- 5. CHECK: RLS policies on core tables
-- ============================================
-- Classes table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'classes'
  AND policyname LIKE '%admin%';

-- Contacts table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'contacts'
  AND policyname LIKE '%admin%';

-- Bookings table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'bookings'
  AND policyname LIKE '%admin%';

-- Profiles table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
  AND policyname LIKE '%admin%';

-- ============================================
-- 6. FIX: Grant execute on is_admin() (if needed)
-- ============================================
-- UNCOMMENT AND RUN IF RPC PERMISSION ERROR:
-- revoke execute on function public.is_admin() from public, anon;
-- grant execute on function public.is_admin() to authenticated;

-- ============================================
-- 7. FIX: Add current user to admins (if needed)
-- ============================================
-- UNCOMMENT AND RUN TO ADD ADMIN:
-- INSERT INTO public.admins (user_id)
-- VALUES ('259e55a3-1a0a-4a1f-8855-c53f75564e6c') -- serhiipriadko2@gmail.com
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 8. CHECK: get_admin_analytics() RPC exists
-- ============================================
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_admin_analytics';

-- Expected: 1 row
