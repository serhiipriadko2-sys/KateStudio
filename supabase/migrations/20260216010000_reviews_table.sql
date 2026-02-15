-- Migration: Reviews Table 2026-02-16
-- Description: Adds table for managing customer reviews/testimonials.

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  text text not null,
  image_url text,
  rating int default 5,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

-- Policy: Public read for active reviews
create policy "Enable read access for all users" on public.reviews
  for select using (true);

-- Policy: Admin write access
create policy "Enable write access for admins" on public.reviews
  for all using (public.is_admin());
