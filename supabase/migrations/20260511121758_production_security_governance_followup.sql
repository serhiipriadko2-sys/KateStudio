-- Follow-up security/governance hardening for KateStudio production.
-- Goal: close confirmed live gaps without changing app-facing product flows.
-- Expected effect: remove mutable search_path warnings on helper functions,
-- deny all client access to shadow table public.dialogue,
-- and revoke accidental public execution on internal SECURITY DEFINER RPCs.
-- Reversibility: each function can be recreated from prior repo migrations;
-- revoked EXECUTE grants can be granted back explicitly if a legitimate caller is discovered.

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
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
    execute 'grant execute on function public.rls_auto_enable() to service_role';
  end if;

  if to_regprocedure('public.sync_recurring_classes(integer)') is not null then
    execute 'revoke execute on function public.sync_recurring_classes(integer) from public, anon, authenticated';
    execute 'grant execute on function public.sync_recurring_classes(integer) to service_role';
  end if;
end $$;

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
