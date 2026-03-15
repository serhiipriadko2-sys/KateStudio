-- Retreats table: managed via AdminPanel, displayed in APP/WEB

create table if not exists public.retreats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  location text not null,
  start_date date not null,
  end_date date not null,
  image_url text,
  price numeric(10, 2) not null default 0,
  spots_total int not null default 10,
  spots_booked int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.retreats enable row level security;

-- Public can read active retreats
create policy "public read active retreats" on public.retreats
  for select using (is_active = true);

-- Admin full access
create policy "admin manage retreats" on public.retreats
  for all using (public.is_admin()) with check (public.is_admin());

-- Service role full access (Edge Functions)
create policy "service role manage retreats" on public.retreats
  for all using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger retreats_updated_at
  before update on public.retreats
  for each row execute function public.set_updated_at();
