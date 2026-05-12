
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
