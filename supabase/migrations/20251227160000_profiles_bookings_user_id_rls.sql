-- Sprint 1 (Security/Data): move to auth-first user_id + RLS
-- Target tables (already used by the apps): public.profiles, public.bookings

-- 1) Columns + constraints (nullable to avoid breaking existing demo rows)
alter table if exists public.profiles
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create unique index if not exists profiles_user_id_unique
  on public.profiles (user_id)
  where user_id is not null;

alter table if exists public.bookings
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists bookings_user_id_idx
  on public.bookings (user_id);

-- 2) Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.bookings enable row level security;

-- 3) Policies: profiles (owner only)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) Policies: bookings (owner only)
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings
  for select
  using (auth.uid() = user_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
  on public.bookings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookings_delete_own" on public.bookings;
create policy "bookings_delete_own"
  on public.bookings
  for delete
  using (auth.uid() = user_id);

