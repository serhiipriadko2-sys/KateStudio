-- YooKassa APP-only payments for fixed-price studio passes.
-- No production data mutation outside schema/backfill defaults; no AI tables/functions touched.

alter table public.pricing_plans
  add column if not exists amount_cents integer,
  add column if not exists currency text not null default 'RUB',
  add column if not exists visits_total integer,
  add column if not exists valid_days integer,
  add column if not exists is_payable boolean not null default false;

alter table public.pricing_plans
  drop constraint if exists pricing_plans_amount_cents_positive,
  add constraint pricing_plans_amount_cents_positive
    check (amount_cents is null or amount_cents > 0);

alter table public.pricing_plans
  drop constraint if exists pricing_plans_currency_rub,
  add constraint pricing_plans_currency_rub check (currency = 'RUB');

alter table public.pricing_plans
  drop constraint if exists pricing_plans_visits_total_positive,
  add constraint pricing_plans_visits_total_positive
    check (visits_total is null or visits_total > 0);

alter table public.pricing_plans
  drop constraint if exists pricing_plans_valid_days_positive,
  add constraint pricing_plans_valid_days_positive
    check (valid_days is null or valid_days > 0);

update public.pricing_plans
set
  amount_cents = nullif(regexp_replace(price, '[^0-9]', '', 'g'), '')::integer * 100,
  currency = 'RUB',
  visits_total = case
    when title ~ '4' then 4
    when title ~ '9' then 9
    else 1
  end,
  valid_days = case
    when title ilike '%раз%' then 7
    else 30
  end,
  is_payable = price !~* '^\s*от\b' and nullif(regexp_replace(price, '[^0-9]', '', 'g'), '') is not null
where amount_cents is null;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pricing_plan_id uuid references public.pricing_plans (id) on delete set null,
  provider text not null default 'yookassa',
  provider_payment_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'waiting_for_capture', 'succeeded', 'canceled', 'failed')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'RUB' check (currency = 'RUB'),
  plan_snapshot jsonb not null default '{}'::jsonb,
  checkout_url text,
  provider_payload jsonb,
  error_message text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_orders_user_id_created_at_idx
  on public.payment_orders (user_id, created_at desc);

create index if not exists payment_orders_pricing_plan_id_idx
  on public.payment_orders (pricing_plan_id);

create table if not exists public.user_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payment_order_id uuid not null unique references public.payment_orders (id) on delete restrict,
  pricing_plan_id uuid references public.pricing_plans (id) on delete set null,
  title text not null,
  visits_total integer not null check (visits_total > 0),
  visits_remaining integer not null check (visits_remaining >= 0),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'expired', 'canceled', 'used')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_passes_user_id_valid_until_idx
  on public.user_passes (user_id, valid_until desc);

create index if not exists user_passes_pricing_plan_id_idx
  on public.user_passes (pricing_plan_id);

alter table public.payment_orders enable row level security;
alter table public.user_passes enable row level security;

drop policy if exists "payment_orders_select_own" on public.payment_orders;
create policy "payment_orders_select_own"
  on public.payment_orders
  for select
  using (auth.uid() = user_id);

drop policy if exists "payment_orders_admin_all" on public.payment_orders;
create policy "payment_orders_admin_all"
  on public.payment_orders
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "user_passes_select_own" on public.user_passes;
create policy "user_passes_select_own"
  on public.user_passes
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_passes_admin_all" on public.user_passes;
create policy "user_passes_admin_all"
  on public.user_passes
  for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.payment_orders to authenticated;
grant select on public.user_passes to authenticated;
