-- Migration: Schema Baseline 2026
-- Description: Creates missing tables (contacts, classes, bookings, profiles) and applies RLS.

-- 1. CONTACTS
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  name text,
  phone text,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contacts enable row level security;

-- Policy: Allow public to insert (Contact Form)
create policy "Enable insert for all users" on public.contacts
  for insert with check (true);

-- Policy: Service role only for viewing (Backoffice)
create policy "Enable read for service role only" on public.contacts
  for select using (auth.role() = 'service_role');


-- 2. CLASSES
create table if not exists public.classes (
  id uuid default gen_random_uuid() primary key,
  date date,
  time text,
  name text,
  instructor text,
  duration text,
  spots_total int default 20,
  spots_booked int default 0,
  location text,
  intensity int,
  is_online boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.classes enable row level security;

-- Policy: Public read
create policy "Enable read access for all users" on public.classes
  for select using (true);

-- Policy: Service role write
create policy "Enable write access for service role" on public.classes
  for all using (auth.role() = 'service_role');


-- 3. PROFILES
create table if not exists public.profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  name text,
  phone text,
  city text,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Policy: Users can insert their own profile (on registration)
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);


-- 4. BOOKINGS
-- Supporting both APP and WEB schema variations in one table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Common
  phone text,
  name text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- APP specific
  class_id text,
  class_name text,
  date text, -- APP uses text date
  time text,
  timestamp bigint, -- APP uses raw timestamp

  -- WEB specific
  class_type text,
  class_date text,
  class_time text,
  is_purchase boolean default false,
  price text
);

alter table public.bookings enable row level security;

-- Policy: Users can view own bookings
create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

-- Policy: Users can create bookings
create policy "Users can create bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

-- Policy: Users can delete own bookings (Cancel)
create policy "Users can delete own bookings" on public.bookings
  for delete using (auth.uid() = user_id);
