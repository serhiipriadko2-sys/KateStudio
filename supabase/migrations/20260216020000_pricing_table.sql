-- Migration: Pricing Plans Table 2026-02-16
-- Description: Adds table for managing pricing plans and subscriptions.

create type pricing_category as enum ('yoga', 'personal', 'sound', 'massage');

create table if not exists public.pricing_plans (
  id uuid default gen_random_uuid() primary key,
  category pricing_category not null,
  title text not null,
  price text not null,
  subtitle text,
  description text,
  features jsonb default '[]'::jsonb, -- Array of strings
  is_popular boolean default false,
  is_dark boolean default false,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pricing_plans enable row level security;

-- Policy: Public read for active plans
create policy "Enable read access for all users" on public.pricing_plans
  for select using (true);

-- Policy: Admin write access
create policy "Enable write access for admins" on public.pricing_plans
  for all using (public.is_admin());
