alter table public.trainers
  add column if not exists gallery_image_urls text[] not null default '{}';

comment on column public.trainers.gallery_image_urls is 'Additional trainer gallery images for WEB and APP profiles.';

create table if not exists public.recurring_class_rules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  name text not null,
  instructor text,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  time time not null,
  duration text not null default '60 мин',
  spots_total integer not null default 12 check (spots_total > 0),
  is_online boolean not null default false,
  location text,
  intensity integer not null default 2 check (intensity between 1 and 3),
  price integer,
  description text,
  active_from date not null default current_date,
  active_until date,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.recurring_class_rules is 'Admin-managed recurring schedule templates used to generate future classes.';

create unique index if not exists idx_recurring_class_rules_signature
  on public.recurring_class_rules (coalesce(trainer_id, '00000000-0000-0000-0000-000000000000'::uuid), name, day_of_week, time, coalesce(is_online, false));

create index if not exists idx_recurring_class_rules_active
  on public.recurring_class_rules (is_active, day_of_week, sort_order);

alter table public.recurring_class_rules enable row level security;

drop policy if exists "recurring_rules_admin_select" on public.recurring_class_rules;
create policy "recurring_rules_admin_select"
  on public.recurring_class_rules
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "recurring_rules_admin_insert" on public.recurring_class_rules;
create policy "recurring_rules_admin_insert"
  on public.recurring_class_rules
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "recurring_rules_admin_update" on public.recurring_class_rules;
create policy "recurring_rules_admin_update"
  on public.recurring_class_rules
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recurring_rules_admin_delete" on public.recurring_class_rules;
create policy "recurring_rules_admin_delete"
  on public.recurring_class_rules
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "recurring_rules_service_role_manage" on public.recurring_class_rules;
create policy "recurring_rules_service_role_manage"
  on public.recurring_class_rules
  for all
  to service_role
  using (true)
  with check (true);

grant select, insert, update, delete on public.recurring_class_rules to authenticated;
grant all on public.recurring_class_rules to service_role;

drop trigger if exists recurring_class_rules_updated_at on public.recurring_class_rules;
create trigger recurring_class_rules_updated_at
  before update on public.recurring_class_rules
  for each row execute function public.set_updated_at();

create or replace function public.sync_recurring_classes(weeks_ahead integer default 12)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  horizon_end date := current_date + (greatest(1, weeks_ahead) * 7);
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  with generated as (
    select
      r.id as rule_id,
      coalesce(r.instructor, t.full_name, 'Преподаватель') as instructor,
      r.trainer_id,
      r.name,
      gs::date as class_date,
      r.time,
      r.duration,
      r.spots_total,
      r.is_online,
      coalesce(r.location, case when r.is_online then 'Online' else 'Станционная ул., 5Б' end) as location,
      r.intensity,
      r.price,
      r.description,
      r.sort_order
    from public.recurring_class_rules r
    left join public.trainers t on t.id = r.trainer_id
    cross join generate_series(current_date, horizon_end, interval '1 day') gs
    where r.is_active = true
      and gs::date >= r.active_from
      and (r.active_until is null or gs::date <= r.active_until)
      and extract(isodow from gs) = r.day_of_week
  ), inserted as (
    insert into public.classes (
      date,
      time,
      name,
      instructor,
      trainer_id,
      duration,
      spots_total,
      spots_booked,
      is_online,
      location,
      intensity,
      price,
      description
    )
    select
      g.class_date,
      g.time,
      g.name,
      g.instructor,
      g.trainer_id,
      g.duration,
      g.spots_total,
      0,
      g.is_online,
      g.location,
      g.intensity,
      g.price,
      g.description
    from generated g
    where not exists (
      select 1
      from public.classes c
      where c.date = g.class_date
        and c.time = g.time
        and c.name = g.name
        and coalesce(c.instructor, '') = g.instructor
        and coalesce(c.is_online, false) = g.is_online
    )
    returning 1
  )
  select count(*) into inserted_count from inserted;

  return inserted_count;
end;
$$;

grant execute on function public.sync_recurring_classes(integer) to authenticated;
grant execute on function public.sync_recurring_classes(integer) to service_role;

insert into public.recurring_class_rules (
  trainer_id,
  name,
  instructor,
  day_of_week,
  time,
  duration,
  spots_total,
  is_online,
  location,
  intensity,
  price,
  description,
  sort_order,
  is_active
)
select t.id, 'Smart Stretching', t.full_name, 3, '10:00'::time, '60 мин', 12, false, 'Станционная ул., 5Б', 1, 700,
  'Умная растяжка, мягкая работа со спиной и ногами, здоровая подвижность суставов и бережная работа с осанкой.', 10, true
from public.trainers t
where t.slug = 'elizaveta-belonogova'
on conflict do nothing;

insert into public.recurring_class_rules (
  trainer_id,
  name,
  instructor,
  day_of_week,
  time,
  duration,
  spots_total,
  is_online,
  location,
  intensity,
  price,
  description,
  sort_order,
  is_active
)
select t.id, 'Виньяса-флоу', t.full_name, 2, '19:00'::time, '60 мин', 12, false, 'Станционная ул., 5Б', 2, 700,
  'Плавная практика виньяса-флоу с акцентом на дыхание, внимание к телу и мягкое раскрытие.', 20, true
from public.trainers t
where t.slug = 'lidia-kuzina'
on conflict do nothing;

insert into public.recurring_class_rules (
  trainer_id,
  name,
  instructor,
  day_of_week,
  time,
  duration,
  spots_total,
  is_online,
  location,
  intensity,
  price,
  description,
  sort_order,
  is_active
)
select t.id, 'Виньяса-флоу', t.full_name, 5, '19:30'::time, '60 мин', 12, false, 'Станционная ул., 5Б', 2, 700,
  'Плавная практика виньяса-флоу с акцентом на дыхание, внимание к телу и мягкое раскрытие.', 30, true
from public.trainers t
where t.slug = 'lidia-kuzina'
on conflict do nothing;