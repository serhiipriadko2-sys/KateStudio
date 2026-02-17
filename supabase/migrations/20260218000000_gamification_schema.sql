-- Create tables for gamification and progress tracking

-- User Progress Table
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  current_streak int default 0,
  longest_streak int default 0,
  total_practices int default 0,
  last_practice_date date,
  weekly_goal int default 5,
  weekly_progress int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User Achievements Table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- Push Notification Tokens
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  platform text not null check (platform in ('web', 'ios', 'android')),
  created_at timestamptz default now(),
  unique(user_id, token)
);

-- RLS Policies for user_progress

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

-- Only service role (Edge Functions) should modify progress directly in most cases,
-- but users might update goals.
create policy "Users can update own progress goals"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for user_achievements

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

-- Achievements are unlocked by system events (Edge Functions or Triggers),
-- but we might allow client-side unlocking for simple things if verified.
-- For now, restrict insert to service role or authenticated users for flexibility (review security later).
create policy "Users can insert own achievements"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- RLS Policies for push_tokens

alter table public.push_tokens enable row level security;

create policy "Users can view own push tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert own push tokens"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own push tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at on user_progress
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_progress_updated
  before update on public.user_progress
  for each row execute procedure public.handle_updated_at();
