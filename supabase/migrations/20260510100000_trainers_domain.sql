-- Trainers domain for KateStudio
create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  short_name text,
  role_title text not null default 'Преподаватель',
  bio_short text not null,
  bio_long text,
  quote text,
  avatar_url text,
  cover_image_url text,
  specialties text[] not null default '{}',
  teaching_formats text[] not null default '{}',
  experience_years smallint,
  instagram_url text,
  telegram_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainers_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint trainers_experience_nonnegative check (
    experience_years is null or experience_years >= 0
  ),
  constraint trainers_formats_allowed check (
    teaching_formats <@ array['studio', 'online', 'retreat', 'private']::text[]
  )
);

alter table public.trainers enable row level security;

drop policy if exists "public read active trainers" on public.trainers;
create policy "public read active trainers"
  on public.trainers
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "admin manage trainers" on public.trainers;
create policy "admin manage trainers"
  on public.trainers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "service role manage trainers" on public.trainers;
create policy "service role manage trainers"
  on public.trainers
  for all
  to service_role
  using (true)
  with check (true);

alter table public.classes
  add column if not exists trainer_id uuid references public.trainers(id) on delete set null;

create index if not exists idx_trainers_active_sort
  on public.trainers (is_active, sort_order, full_name);

create index if not exists idx_classes_trainer_id
  on public.classes (trainer_id);

drop trigger if exists trainers_updated_at on public.trainers;
create trigger trainers_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

comment on table public.trainers is 'Public profiles of studio trainers used by WEB, APP and admin surfaces.';
comment on column public.classes.trainer_id is 'Optional relation to trainers. Keep instructor text as fallback during migration.';