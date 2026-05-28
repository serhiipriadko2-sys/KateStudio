begin;

alter table if exists public.admins enable row level security;

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
      and policyname = 'admin can read own row'
  ) and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
      and policyname = 'authenticated can check admin status'
  ) then
    execute 'alter policy "admin can read own row" on public.admins rename to "authenticated can check admin status"';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
      and policyname = 'authenticated can check admin status'
  ) then
    execute $policy$
      create policy "authenticated can check admin status"
      on public.admins
      for select
      to authenticated
      using (user_id = (select auth.uid()))
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
      and policyname = 'authenticated can check admin status'
  ) then
    execute $policy$
      alter policy "authenticated can check admin status" on public.admins
      to authenticated
      using (user_id = (select auth.uid()))
    $policy$;
  end if;
end
$$;

commit;
