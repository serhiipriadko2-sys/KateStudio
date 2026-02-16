-- Admin Security Layer (P0)
-- 1. Create Admins Table
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- Policy: Admin can read their own row (to check status)
create policy "admin can read own row" on public.admins
  for select using (auth.uid() = user_id);

-- 2. Helper Function: is_admin()
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- 3. Update RLS Policies for Core Tables

-- A. CLASSES (Admin manages everything, Public reads)
drop policy if exists "Enable write access for service role" on public.classes;
create policy "admin manage classes" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

-- Re-assert Service Role Access (for Edge Functions/Backoffice tools)
create policy "service role manage classes" on public.classes
  for all using (auth.role() = 'service_role');


-- B. BOOKINGS (User sees own, Admin sees all)
-- Assuming existing policy "Users can view own bookings" exists.
create policy "admin view all bookings" on public.bookings
  for select using (public.is_admin());

-- Admin can manage bookings (cancel/create for users) if needed
create policy "admin manage bookings" on public.bookings
  for all using (public.is_admin());


-- C. CONTACTS (Admin reads, Service Role reads)
-- Existing policies might be "Enable insert for all users" and "Enable read for service role only".
create policy "admin read contacts" on public.contacts
  for select using (public.is_admin());
