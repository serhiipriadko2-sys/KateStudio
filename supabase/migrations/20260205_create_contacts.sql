-- Create contacts table (for contact form submissions)
-- Inserts should be performed via server-side Edge Function (service_role)
-- to avoid public inserts and spam. Do not expose SUPABASE_SERVICE_ROLE_KEY to clients.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

alter table if exists public.contacts enable row level security;

-- No public insert policy is created intentionally.
-- Use the Edge Function with SUPABASE_SERVICE_ROLE_KEY to insert rows.