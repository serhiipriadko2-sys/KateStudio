-- P0 live catch-up: RLS/governance hardening and app-contract alignment.
--
-- Context:
-- - Live Supabase has migration-history drift, so older repo hardening migrations
--   are not reliably present in production.
-- - This migration is designed as a single branch/staging remediation patch.
-- - It intentionally does not touch AI Edge Functions, AI routing, prompts, or AI env.
-- - It avoids destructive data deletes. The only column removal is the legacy
--   profiles.is_admin flag after backfilling public.admins.

-- ============================================================
-- 1. Schema alignment for app contracts
-- ============================================================

-- profiles: current app writes email-first profiles without phone at signup and
-- stores avatar/updated_at. Live currently has phone as primary key, which blocks
-- that path. Keep phone unique when present, but make user_id the conflict target.
alter table if exists public.profiles
  drop constraint if exists profiles_pkey;

alter table if exists public.profiles
  alter column phone drop not null;

alter table if exists public.profiles
  add column if not exists avatar text,
  add column if not exists updated_at timestamptz default timezone('utc'::text, now());

create unique index if not exists profiles_phone_unique
  on public.profiles (phone)
  where phone is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_user_id_key'
  ) then
    alter table public.profiles
      add constraint profiles_user_id_key unique (user_id);
  end if;
end $$;

-- classes: admin UI and public schedule expect these fields.
alter table if exists public.classes
  add column if not exists duration text,
  add column if not exists price integer,
  add column if not exists description text;

-- bookings: WEB admin/user-cabinet contract fields.
alter table if exists public.bookings
  add column if not exists name text,
  add column if not exists class_type text,
  add column if not exists class_date text,
  add column if not exists class_time text,
  add column if not exists is_purchase boolean default false,
  add column if not exists price text;

-- contacts: keep a nullable request metadata slot used by older shared types/tools.
alter table if exists public.contacts
  add column if not exists ip_address text;

-- ============================================================
-- 2. Admin boundary: backfill admins, remove legacy profiles.is_admin
-- ============================================================

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'is_admin'
  ) then
    insert into public.admins (user_id)
      select user_id
      from public.profiles
      where is_admin = true
        and user_id is not null
    on conflict (user_id) do nothing;

    drop index if exists public.idx_profiles_is_admin;

    alter table public.profiles
      drop column if exists is_admin;
  end if;
end $$;

-- ============================================================
-- 3. Harden helper functions and RPCs
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_push_token_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Keep the RPC in public for the existing client call, but make it invoker
-- and hard-gate it before counting anything. Admin access is then enforced by
-- both the function guard and table RLS policies.
create or replace function public.get_admin_analytics(period_days int default 7)
returns json
language plpgsql
security invoker
stable
set search_path = public, pg_catalog
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required'
      using errcode = '42501';
  end if;

  return json_build_object(
    'period_days', period_days,
    'page_views_current', (
      select count(*) from public.analytics_events
      where event_name = 'page_view'
        and created_at >= now() - (period_days || ' days')::interval
    ),
    'page_views_previous', (
      select count(*) from public.analytics_events
      where event_name = 'page_view'
        and created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),
    'bookings_current', (
      select count(*) from public.bookings
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'bookings_previous', (
      select count(*) from public.bookings
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),
    'contacts_current', (
      select count(*) from public.contacts
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'contacts_previous', (
      select count(*) from public.contacts
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),
    'new_users_current', (
      select count(*) from public.profiles
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'new_users_previous', (
      select count(*) from public.profiles
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),
    'premium_subscribers', (
      select count(*) from public.subscriptions
      where plan in ('premium', 'vip') and status = 'active'
    ),
    'top_events', (
      select json_agg(row_to_json(t)) from (
        select event_name, count(*) as count
        from public.analytics_events
        where created_at >= now() - (period_days || ' days')::interval
        group by event_name
        order by count desc
        limit 10
      ) t
    )
  );
end;
$$;

revoke execute on function public.get_admin_analytics(int) from public, anon;
grant execute on function public.get_admin_analytics(int) to authenticated;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. RLS consolidation for non-AI app tables
-- ============================================================

alter table if exists public.profiles enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.contacts enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.app_settings enable row level security;
alter table if exists public.subscriptions enable row level security;
alter table if exists public.dialogue enable row level security;

-- profiles
drop policy if exists "Allow public read/write profiles" on public.profiles;
drop policy if exists "Admin can read all profiles" on public.profiles;
drop policy if exists "admin read all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_access"
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- bookings
drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users can delete own bookings" on public.bookings;
drop policy if exists "admin view all bookings" on public.bookings;
drop policy if exists "admin manage bookings" on public.bookings;
drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_insert_own" on public.bookings;
drop policy if exists "bookings_update_own" on public.bookings;
drop policy if exists "bookings_delete_own" on public.bookings;

create policy "bookings_select_access"
  on public.bookings
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "bookings_insert_access"
  on public.bookings
  for insert
  to authenticated
  with check (user_id = (select auth.uid()) or public.is_admin());

create policy "bookings_update_access"
  on public.bookings
  for update
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

create policy "bookings_delete_access"
  on public.bookings
  for delete
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- contacts
drop policy if exists "Enable insert for all users" on public.contacts;
drop policy if exists "Enable read for service role only" on public.contacts;
drop policy if exists "admin read contacts" on public.contacts;
drop policy if exists "admin delete contacts" on public.contacts;

create policy "contacts_public_insert_limited"
  on public.contacts
  for insert
  to anon, authenticated
  with check (
    (status is null or status = 'new'::public.contact_status)
    and length(coalesce(name, '')) <= 120
    and length(coalesce(phone, '')) <= 40
    and length(coalesce(message, '')) <= 2000
    and length(coalesce(ip_address, '')) <= 64
  );

create policy "contacts_admin_select"
  on public.contacts
  for select
  to authenticated
  using (public.is_admin());

create policy "contacts_admin_update"
  on public.contacts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contacts_admin_delete"
  on public.contacts
  for delete
  to authenticated
  using (public.is_admin());

-- classes
drop policy if exists "admin manage classes" on public.classes;
drop policy if exists "service role manage classes" on public.classes;
drop policy if exists "Enable write access for service role" on public.classes;
drop policy if exists "Admin full access on classes" on public.classes;

create policy "classes_admin_insert"
  on public.classes
  for insert
  to authenticated
  with check (public.is_admin());

create policy "classes_admin_update"
  on public.classes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "classes_admin_delete"
  on public.classes
  for delete
  to authenticated
  using (public.is_admin());

-- app_settings
drop policy if exists "Allow public read access to app_settings" on public.app_settings;
drop policy if exists "Allow admin write access to app_settings" on public.app_settings;
drop policy if exists "Enable write access for admins" on public.app_settings;
drop policy if exists "Enable read access for all users" on public.app_settings;

create policy "app_settings_public_select"
  on public.app_settings
  for select
  to anon, authenticated
  using (true);

create policy "app_settings_admin_insert"
  on public.app_settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy "app_settings_admin_update"
  on public.app_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_settings_admin_delete"
  on public.app_settings
  for delete
  to authenticated
  using (public.is_admin());

-- subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "admin read all subscriptions" on public.subscriptions;
drop policy if exists "admin insert subscriptions" on public.subscriptions;
drop policy if exists "admin update subscriptions" on public.subscriptions;
drop policy if exists "admin delete subscriptions" on public.subscriptions;

create policy "subscriptions_select_access"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "subscriptions_admin_insert"
  on public.subscriptions
  for insert
  to authenticated
  with check (public.is_admin());

create policy "subscriptions_admin_update"
  on public.subscriptions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subscriptions_admin_delete"
  on public.subscriptions
  for delete
  to authenticated
  using (public.is_admin());

-- analytics: keep public write for lightweight client analytics, but remove
-- the advisor-triggering unrestricted WITH CHECK true.
drop policy if exists "Allow admins to read analytics" on public.analytics_events;
drop policy if exists "Allow public insert to analytics" on public.analytics_events;
drop policy if exists "Allow authenticated insert to analytics" on public.analytics_events;

create policy "analytics_events_admin_select"
  on public.analytics_events
  for select
  to authenticated
  using (public.is_admin());

create policy "analytics_events_insert_limited"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (
    length(event_name) between 1 and 64
    and octet_length(coalesce(event_data, '{}'::jsonb)::text) <= 4096
    and length(coalesce(session_id, '')) <= 128
    and length(coalesce(url, '')) <= 2048
    and length(coalesce(user_agent, '')) <= 512
  );

-- dialogue: explicit deny instead of RLS-enabled/no-policy ambiguity when the
-- shadow table exists in live.
do $$
begin
  if to_regclass('public.dialogue') is not null then
    execute 'drop policy if exists "dialogue_no_client_access" on public.dialogue';

    execute 'create policy "dialogue_no_client_access"
      on public.dialogue
      for all
      to anon, authenticated
      using (false)
      with check (false)';
  end if;
end $$;

-- ============================================================
-- 5. Storage hardening
-- ============================================================

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
where id = 'images';

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Admin Read" on storage.objects;
drop policy if exists "Admin Upload" on storage.objects;
drop policy if exists "Admin Update" on storage.objects;
drop policy if exists "Admin Delete" on storage.objects;

create policy "Admin Read"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'images' and public.is_admin());

create policy "Admin Upload"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'images' and public.is_admin());

create policy "Admin Update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "Admin Delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- ============================================================
-- 6. Performance advisor fixes that are safe and non-AI-adjacent
-- ============================================================

create index if not exists idx_bookings_class_uuid
  on public.bookings (class_uuid);

create index if not exists idx_bookings_phone
  on public.bookings (phone);
