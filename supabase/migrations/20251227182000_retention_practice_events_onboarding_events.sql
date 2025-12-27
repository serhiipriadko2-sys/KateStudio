-- Phase 2 (Retention-core): practice streak + onboarding preferences + minimal events
-- Tables:
--  - public.practice_events: one row per user per day (streak marker)
--  - public.user_preferences: onboarding answers (jsonb) per user
--  - public.app_events: minimal product events for authenticated users

-- 0) Extensions (safe no-op if already enabled)
create extension if not exists pgcrypto;

-- 1) practice_events (streak markers)
create table if not exists public.practice_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null default 'streak',
  source text not null default 'app',
  created_at timestamptz not null default now()
);

-- One streak marker per day per user
create unique index if not exists practice_events_user_day_kind_unique
  on public.practice_events (user_id, day, kind);

create index if not exists practice_events_user_day_idx
  on public.practice_events (user_id, day desc);

alter table public.practice_events enable row level security;

drop policy if exists "practice_events_select_own" on public.practice_events;
create policy "practice_events_select_own"
  on public.practice_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "practice_events_insert_own" on public.practice_events;
create policy "practice_events_insert_own"
  on public.practice_events
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "practice_events_delete_own" on public.practice_events;
create policy "practice_events_delete_own"
  on public.practice_events
  for delete
  using (auth.uid() = user_id);

-- 2) user_preferences (onboarding answers)
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  onboarding jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) app_events (minimal analytics for authenticated users)
create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  props jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_user_created_idx
  on public.app_events (user_id, created_at desc);

alter table public.app_events enable row level security;

drop policy if exists "app_events_select_own" on public.app_events;
create policy "app_events_select_own"
  on public.app_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "app_events_insert_own" on public.app_events;
create policy "app_events_insert_own"
  on public.app_events
  for insert
  with check (auth.uid() = user_id);

