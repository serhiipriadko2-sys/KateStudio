-- Push notification tokens
-- Stores FCM tokens per user per device/browser session.

create table if not exists public.user_push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  token       text not null,
  platform    text not null check (platform in ('web', 'android', 'ios')),
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One token value can be registered once per user
  unique (user_id, token)
);

-- Index for fast lookup when sending pushes
create index if not exists user_push_tokens_user_id_idx
  on public.user_push_tokens (user_id);

-- RLS: users can only manage their own tokens
alter table public.user_push_tokens enable row level security;

create policy "Users manage own push tokens"
  on public.user_push_tokens
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can read all tokens (for sending pushes via Edge Function)
create policy "Service role reads all tokens"
  on public.user_push_tokens
  for select
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.touch_push_token_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_token_updated_at on public.user_push_tokens;
create trigger push_token_updated_at
  before update on public.user_push_tokens
  for each row execute procedure public.touch_push_token_updated_at();
