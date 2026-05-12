do $$
begin
  if to_regclass('public.class_recurring_rules') is null
     and to_regclass('public.recurring_class_rules') is not null then
    execute 'alter table public.recurring_class_rules rename to class_recurring_rules';
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_recurring_rules'
      and column_name = 'day_of_week'
  ) then
    execute 'alter table public.class_recurring_rules rename column day_of_week to weekday';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_recurring_rules'
      and column_name = 'active_from'
  ) then
    execute 'alter table public.class_recurring_rules rename column active_from to start_date';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_recurring_rules'
      and column_name = 'active_until'
  ) then
    execute 'alter table public.class_recurring_rules rename column active_until to end_date';
  end if;
end
$$;

alter table if exists public.class_recurring_rules
  add column if not exists timezone text,
  add column if not exists status text;

update public.class_recurring_rules
set
  instructor = coalesce(instructor, name),
  location = coalesce(location, 'Станционная ул., 5Б'),
  timezone = coalesce(timezone, 'Europe/Moscow'),
  status = coalesce(status, case when coalesce(is_active, true) then 'active' else 'paused' end)
where instructor is null
   or location is null
   or timezone is null
   or status is null;

alter table if exists public.class_recurring_rules
  alter column instructor set not null,
  alter column location set not null,
  alter column weekday set not null,
  alter column start_date set not null,
  alter column timezone set not null,
  alter column status set not null,
  alter column duration set default '60 мин',
  alter column spots_total set default 12,
  alter column intensity set default 2,
  alter column is_online set default false,
  alter column timezone set default 'Europe/Moscow',
  alter column status set default 'active';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_class_rules_trainer_id_fkey'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules drop constraint recurring_class_rules_trainer_id_fkey;
  end if;
end
$$;

alter table public.class_recurring_rules
  add constraint class_recurring_rules_trainer_id_fkey
  foreign key (trainer_id) references public.trainers(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_weekday_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_weekday_check
      check (weekday between 1 and 7);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_intensity_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_intensity_check
      check (intensity between 1 and 3);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_spots_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_spots_check
      check (spots_total > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_price_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_price_check
      check (price is null or price >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_status_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_status_check
      check (status in ('draft', 'active', 'paused', 'archived'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_recurring_rules_dates_check'
      and conrelid = 'public.class_recurring_rules'::regclass
  ) then
    alter table public.class_recurring_rules
      add constraint class_recurring_rules_dates_check
      check (end_date is null or end_date >= start_date);
  end if;
end
$$;

create index if not exists idx_class_recurring_rules_status_dates
  on public.class_recurring_rules (status, start_date, end_date);

create index if not exists idx_class_recurring_rules_trainer
  on public.class_recurring_rules (trainer_id);

alter table if exists public.classes
  add column if not exists recurring_rule_id uuid,
  add column if not exists series_index integer,
  add column if not exists generated_from_rule_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'classes_recurring_rule_id_fkey'
      and conrelid = 'public.classes'::regclass
  ) then
    alter table public.classes
      add constraint classes_recurring_rule_id_fkey
      foreign key (recurring_rule_id) references public.class_recurring_rules(id) on delete set null;
  end if;
end
$$;

create index if not exists idx_classes_recurring_rule_id
  on public.classes (recurring_rule_id);

create unique index if not exists idx_classes_recurring_rule_date_time_unique
  on public.classes (recurring_rule_id, date, time)
  where recurring_rule_id is not null;

comment on table public.class_recurring_rules is
  'Admin-managed weekly schedule rules. Generated instances are stored in classes for booking compatibility.';
comment on column public.class_recurring_rules.weekday is
  'ISO weekday: 1 Monday, 7 Sunday.';
comment on column public.class_recurring_rules.status is
  'draft/active/paused/archived lifecycle for future recurring admin workflows.';
comment on column public.classes.recurring_rule_id is
  'Source recurring rule for generated schedule instances. Null means one-off or legacy class.';
comment on column public.classes.series_index is
  'Zero-based position inside a generated recurring series.';
comment on column public.classes.generated_from_rule_at is
  'Timestamp when this class instance was generated from its recurring rule.';