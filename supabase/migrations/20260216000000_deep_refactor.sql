-- Migration: Deep Refactor 2026-02-16
-- Description: Adds tables for blog articles and app settings, and enhances bookings table.

-- 1. ARTICLES (Blog)
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  excerpt text,
  image_url text,
  content text,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.articles enable row level security;

-- Policy: Public read for published articles
create policy "Enable read access for all users" on public.articles
  for select using (true);

-- Policy: Admin write access
-- Assuming is_admin() function exists from previous migration
create policy "Enable write access for admins" on public.articles
  for all using (public.is_admin());


-- 2. APP SETTINGS (Theme, Config)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.app_settings enable row level security;

-- Policy: Public read
create policy "Enable read access for all users" on public.app_settings
  for select using (true);

-- Policy: Admin write access
create policy "Enable write access for admins" on public.app_settings
  for all using (public.is_admin());


-- 3. BOOKINGS ENHANCEMENT
-- Add UUID reference to classes for better integrity
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'class_uuid') then
    alter table public.bookings add column class_uuid uuid references public.classes(id);
  end if;
end $$;


-- 4. STORAGE POLICIES (If storage is enabled)
-- Ensure 'images' bucket exists and is public
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Allow public read of images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Allow admins to upload/update/delete images
create policy "Admin Upload"
on storage.objects for insert
with check ( bucket_id = 'images' and public.is_admin() );

create policy "Admin Update"
on storage.objects for update
using ( bucket_id = 'images' and public.is_admin() );

create policy "Admin Delete"
on storage.objects for delete
using ( bucket_id = 'images' and public.is_admin() );
