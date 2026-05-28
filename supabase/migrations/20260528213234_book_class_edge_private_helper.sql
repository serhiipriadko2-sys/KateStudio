-- Move APP class booking mutation behind an authenticated Edge Function.
--
-- The previous public.book_class_with_access RPC stayed callable by
-- authenticated users as SECURITY DEFINER, which Supabase advisor 0029 flags.
-- Keep the transactional booking/pass decrement logic, but make it callable
-- only by the server-side service_role used by the Edge Function.

create or replace function public.book_class_with_access_internal(
  p_user_id uuid,
  p_class_id text,
  p_class_name text,
  p_class_date date,
  p_class_time text,
  p_class_location text,
  p_class_timestamp bigint default null
)
returns table (
  ok boolean,
  code text,
  booking_id uuid,
  pass_id uuid,
  visits_remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := p_user_id;
  v_booking_id uuid;
  v_pass record;
  v_spots_total integer;
  v_booking_count integer;
  v_now timestamptz := now();
  v_timestamp bigint := coalesce(
    p_class_timestamp,
    floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );
  v_has_expired boolean := false;
  v_has_empty_pass boolean := false;
begin
  if v_user_id is null then
    return query
      select false, 'auth_required', null::uuid, null::uuid, null::integer;
    return;
  end if;

  select c.spots_total
    into v_spots_total
  from public.classes as c
  where c.id::text = p_class_id
  for update;

  if not found then
    return query
      select false, 'class_not_found', null::uuid, null::uuid, null::integer;
    return;
  end if;

  if exists (
    select 1
    from public.bookings as b
    where b.user_id = v_user_id
      and b.class_id = p_class_id
  ) then
    return query
      select false, 'duplicate', null::uuid, null::uuid, null::integer;
    return;
  end if;

  select up.id, up.visits_remaining
    into v_pass
  from public.user_passes as up
  where up.user_id = v_user_id
    and up.status = 'active'
    and up.visits_remaining > 0
    and up.valid_until >= v_now
  order by up.valid_until asc, up.created_at asc
  limit 1
  for update;

  if not found then
    select exists (
      select 1
      from public.user_passes as up
      where up.user_id = v_user_id
        and up.status = 'active'
        and up.valid_until < v_now
    ) into v_has_expired;

    select exists (
      select 1
      from public.user_passes as up
      where up.user_id = v_user_id
        and up.status = 'active'
        and up.valid_until >= v_now
        and up.visits_remaining <= 0
    ) into v_has_empty_pass;

    return query
      select
        false,
        case
          when v_has_expired then 'pass_expired'
          when v_has_empty_pass then 'no_visits_left'
          else 'no_access'
        end,
        null::uuid,
        null::uuid,
        null::integer;
    return;
  end if;

  select count(*)::integer
    into v_booking_count
  from public.bookings as b
  where b.class_id = p_class_id;

  if coalesce(v_booking_count, 0) >= coalesce(v_spots_total, 12) then
    return query
      select false, 'class_full', null::uuid, null::uuid, v_pass.visits_remaining::integer;
    return;
  end if;

  insert into public.bookings (
    user_id,
    class_id,
    class_name,
    date,
    time,
    location,
    timestamp
  )
  values (
    v_user_id,
    p_class_id,
    p_class_name,
    p_class_date,
    p_class_time,
    p_class_location,
    v_timestamp
  )
  returning id into v_booking_id;

  update public.user_passes as up
  set
    visits_remaining = greatest(up.visits_remaining - 1, 0),
    status = case when up.visits_remaining - 1 <= 0 then 'used' else up.status end,
    updated_at = v_now
  where up.id = v_pass.id;

  return query
    select
      true,
      'success',
      v_booking_id,
      v_pass.id::uuid,
      greatest(v_pass.visits_remaining - 1, 0)::integer;
end;
$$;

revoke all on function public.book_class_with_access_internal(uuid, text, text, date, text, text, bigint) from public;
revoke execute on function public.book_class_with_access_internal(uuid, text, text, date, text, text, bigint) from anon;
revoke execute on function public.book_class_with_access_internal(uuid, text, text, date, text, text, bigint) from authenticated;
grant execute on function public.book_class_with_access_internal(uuid, text, text, date, text, text, bigint) to service_role;

comment on function public.book_class_with_access_internal(uuid, text, text, date, text, text, bigint)
  is 'Server-only class booking helper for book-class-with-access Edge Function. Not executable by anon/authenticated.';

revoke execute on function public.book_class_with_access(text, text, date, text, text, bigint) from public;
revoke execute on function public.book_class_with_access(text, text, date, text, text, bigint) from anon;
revoke execute on function public.book_class_with_access(text, text, date, text, text, bigint) from authenticated;

comment on function public.book_class_with_access(text, text, date, text, text, bigint)
  is 'Deprecated direct APP RPC. Use book-class-with-access Edge Function.';

notify pgrst, 'reload schema';
