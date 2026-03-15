-- Security hardening for admin analytics RPC.
-- Keeps execute grant on authenticated, but enforces admin check in function body.

create or replace function public.get_admin_analytics(period_days int default 7)
returns json
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required'
      using errcode = '42501';
  end if;

  return json_build_object(
    'period_days', period_days,

    -- PAGE VIEWS
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

    -- BOOKINGS
    'bookings_current', (
      select count(*) from public.bookings
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'bookings_previous', (
      select count(*) from public.bookings
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),

    -- CONTACTS
    'contacts_current', (
      select count(*) from public.contacts
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'contacts_previous', (
      select count(*) from public.contacts
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),

    -- NEW USERS (profiles created)
    'new_users_current', (
      select count(*) from public.profiles
      where created_at >= now() - (period_days || ' days')::interval
    ),
    'new_users_previous', (
      select count(*) from public.profiles
      where created_at >= now() - (period_days * 2 || ' days')::interval
        and created_at < now() - (period_days || ' days')::interval
    ),

    -- ACTIVE PREMIUM SUBSCRIPTIONS (snapshot, not period-bound)
    'premium_subscribers', (
      select count(*) from public.subscriptions
      where plan in ('premium', 'vip') and status = 'active'
    ),

    -- TOP EVENTS (last N days, top 10)
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

revoke execute on function public.get_admin_analytics(int) from public, anon, authenticated;
grant execute on function public.get_admin_analytics(int) to authenticated;
