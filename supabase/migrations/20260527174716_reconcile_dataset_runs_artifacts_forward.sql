-- Forward reconciliation for live-only migration
-- 20260518205158_create_dataset_runs_and_artifacts.
--
-- Goal:
-- - make fresh/staging environments aware of the dataset artifact tables
-- - avoid rewriting historical live migration timestamps
-- - keep the tables non-product-facing until ownership is defined
--
-- This migration is intentionally additive/idempotent. It should not be used
-- to infer that the original 20260518205158 DDL text is known exactly.

begin;

create table if not exists public.dataset_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  wallet text not null default '7BNaxx6KdUYrjACNQZ9He26NBFoFxujQMAfNLnArLGH5',
  label text,
  source text default 'pipeline',
  status text default 'completed',
  stats jsonb default '{}'::jsonb,
  notes text
);

alter table public.dataset_runs
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists wallet text not null default '7BNaxx6KdUYrjACNQZ9He26NBFoFxujQMAfNLnArLGH5',
  add column if not exists label text,
  add column if not exists source text default 'pipeline',
  add column if not exists status text default 'completed',
  add column if not exists stats jsonb default '{}'::jsonb,
  add column if not exists notes text;

alter table public.dataset_runs
  alter column id set default gen_random_uuid(),
  alter column created_at set default now(),
  alter column wallet set default '7BNaxx6KdUYrjACNQZ9He26NBFoFxujQMAfNLnArLGH5',
  alter column source set default 'pipeline',
  alter column status set default 'completed',
  alter column stats set default '{}'::jsonb;

create table if not exists public.dataset_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.dataset_runs(id) on delete cascade,
  artifact_type text not null,
  file_name text,
  content_format text default 'csv',
  row_count integer default 0,
  sha256 text,
  content_text text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.dataset_artifacts
  add column if not exists run_id uuid,
  add column if not exists artifact_type text,
  add column if not exists file_name text,
  add column if not exists content_format text default 'csv',
  add column if not exists row_count integer default 0,
  add column if not exists sha256 text,
  add column if not exists content_text text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table public.dataset_artifacts
  alter column id set default gen_random_uuid(),
  alter column content_format set default 'csv',
  alter column row_count set default 0,
  alter column metadata set default '{}'::jsonb,
  alter column created_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.dataset_artifacts'::regclass
      and contype = 'f'
      and confrelid = 'public.dataset_runs'::regclass
  ) then
    alter table public.dataset_artifacts
      add constraint dataset_artifacts_run_id_fkey
      foreign key (run_id)
      references public.dataset_runs(id)
      on delete cascade;
  end if;
end $$;

create index if not exists dataset_runs_created_at_idx
  on public.dataset_runs (created_at desc);

create index if not exists dataset_artifacts_run_id_created_at_idx
  on public.dataset_artifacts (run_id, created_at desc);

create index if not exists dataset_artifacts_artifact_type_idx
  on public.dataset_artifacts (artifact_type);

alter table public.dataset_runs enable row level security;
alter table public.dataset_artifacts enable row level security;

comment on table public.dataset_runs is
  'Forward-reconciled live-only dataset pipeline metadata. No public product API contract yet.';

comment on table public.dataset_artifacts is
  'Forward-reconciled live-only dataset artifact payloads. No public product API contract yet.';

commit;
