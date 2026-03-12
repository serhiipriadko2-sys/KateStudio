-- Migration: Site Images Table 2026-03-12
-- Description: Adds table for key→url image mapping used by shared imageStorage service.

create table if not exists public.site_images (
  key text primary key,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_images enable row level security;

-- Policy: Public read
create policy "Enable read access for all users" on public.site_images
  for select using (true);

-- Policy: Admin write access
create policy "Enable write access for admins" on public.site_images
  for all using (public.is_admin());
