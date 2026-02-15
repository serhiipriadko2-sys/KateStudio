-- Migration: FAQ Table 2026-02-16
-- Description: Adds table for managing Frequently Asked Questions.

create table if not exists public.faq_items (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.faq_items enable row level security;

-- Policy: Public read for active items
create policy "Enable read access for all users" on public.faq_items
  for select using (true);

-- Policy: Admin write access
create policy "Enable write access for admins" on public.faq_items
  for all using (public.is_admin());
