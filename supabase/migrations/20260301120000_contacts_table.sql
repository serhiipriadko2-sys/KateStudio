create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text,
  source text default 'web',
  ip_address text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.contacts enable row level security;

create index if not exists contacts_created_at_idx on public.contacts (created_at);
