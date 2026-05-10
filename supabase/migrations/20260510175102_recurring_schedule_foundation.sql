-- Recurring schedule foundation.
-- Keeps current `classes` instances compatible with WEB/APP while adding a
-- durable rule object for the future admin recurring mechanism.

alter table public.trainers
  add column if not exists gallery_image_urls text[] not null default '{}';

comment on column public.trainers.gallery_image_urls is
  'Additional trainer photos for WEB/APP profile galleries. Main images remain avatar_url and cover_image_url.';

create table if not exists public.class_recurring_rules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete set null,
  name text not null,
  instructor text not null,
  duration text not null default '60 мин',
  spots_total integer not null default 12,
  location text not null default 'Станционная ул., 5Б',
  intensity smallint not null default 2,
  is_online boolean not null default false,
  price integer,
  description text,
  weekday smallint not null,
  time time not null,
  start_date date not null,
  end_date date,
  timezone text not null default 'Europe/Moscow',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_recurring_rules_weekday_check check (weekday between 1 and 7),
  constraint class_recurring_rules_intensity_check check (intensity between 1 and 3),
  constraint class_recurring_rules_spots_check check (spots_total > 0),
  constraint class_recurring_rules_price_check check (price is null or price >= 0),
  constraint class_recurring_rules_status_check check (
    status in ('draft', 'active', 'paused', 'archived')
  ),
  constraint class_recurring_rules_dates_check check (
    end_date is null or end_date >= start_date
  )
);

comment on table public.class_recurring_rules is
  'Admin-managed weekly schedule rules. Generated instances are stored in classes for booking compatibility.';
comment on column public.class_recurring_rules.weekday is
  'ISO weekday: 1 Monday, 7 Sunday.';
comment on column public.class_recurring_rules.status is
  'draft/active/paused/archived lifecycle for future recurring admin workflows.';

alter table public.class_recurring_rules enable row level security;

drop policy if exists "class_recurring_rules_admin_select" on public.class_recurring_rules;
create policy "class_recurring_rules_admin_select"
  on public.class_recurring_rules
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "class_recurring_rules_admin_insert" on public.class_recurring_rules;
create policy "class_recurring_rules_admin_insert"
  on public.class_recurring_rules
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "class_recurring_rules_admin_update" on public.class_recurring_rules;
create policy "class_recurring_rules_admin_update"
  on public.class_recurring_rules
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "class_recurring_rules_admin_delete" on public.class_recurring_rules;
create policy "class_recurring_rules_admin_delete"
  on public.class_recurring_rules
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "class_recurring_rules_service_role_manage" on public.class_recurring_rules;
create policy "class_recurring_rules_service_role_manage"
  on public.class_recurring_rules
  for all
  to service_role
  using (true)
  with check (true);

grant select, insert, update, delete on table public.class_recurring_rules to authenticated;
grant all on table public.class_recurring_rules to service_role;

create index if not exists idx_class_recurring_rules_status_dates
  on public.class_recurring_rules (status, start_date, end_date);

create index if not exists idx_class_recurring_rules_trainer
  on public.class_recurring_rules (trainer_id);

drop trigger if exists class_recurring_rules_updated_at on public.class_recurring_rules;
create trigger class_recurring_rules_updated_at
  before update on public.class_recurring_rules
  for each row execute function public.set_updated_at();

alter table public.classes
  add column if not exists recurring_rule_id uuid references public.class_recurring_rules(id) on delete set null,
  add column if not exists series_index integer,
  add column if not exists generated_from_rule_at timestamptz;

comment on column public.classes.recurring_rule_id is
  'Source recurring rule for generated schedule instances. Null means one-off or legacy class.';
comment on column public.classes.series_index is
  'Zero-based position inside a generated recurring series.';
comment on column public.classes.generated_from_rule_at is
  'Timestamp when this class instance was generated from its recurring rule.';

create index if not exists idx_classes_recurring_rule_id
  on public.classes (recurring_rule_id);

create unique index if not exists idx_classes_recurring_rule_date_time_unique
  on public.classes (recurring_rule_id, date, time)
  where recurring_rule_id is not null;
