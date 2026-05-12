alter table public.profiles
  add column if not exists avatar text,
  add column if not exists updated_at timestamptz default now();

update public.profiles
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.bookings
  drop constraint if exists bookings_phone_fkey;

alter table public.profiles
  drop constraint if exists profiles_pkey;

alter table public.profiles
  alter column user_id set not null;

alter table public.profiles
  add constraint profiles_pkey primary key (user_id);

alter table public.profiles
  alter column phone drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_phone_key'
  ) then
    alter table public.profiles
      add constraint profiles_phone_key unique (phone);
  end if;
end $$;

alter table public.bookings
  add constraint bookings_phone_fkey
  foreign key (phone) references public.profiles(phone) not valid;

alter table public.bookings
  validate constraint bookings_phone_fkey;