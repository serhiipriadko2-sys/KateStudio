begin;

-- Remove dead INSERT policies that are not reachable because only service_role has table INSERT grants.
do $$
begin
  if to_regclass('public.ai_jobs') is not null then
    execute 'drop policy if exists ai_jobs_service_insert on public.ai_jobs';
    execute 'create index if not exists idx_ai_jobs_prompt_request_id on public.ai_jobs (prompt_request_id)';
  end if;

  if to_regclass('public.api_logs') is not null then
    execute 'drop policy if exists api_logs_insert_service on public.api_logs';
    execute 'create index if not exists idx_api_logs_prompt_request_id on public.api_logs (prompt_request_id)';
  end if;

  if to_regclass('public.prompt_requests') is not null then
    execute 'create index if not exists idx_prompt_requests_model_id on public.prompt_requests (model_id)';
  end if;
end $$;

-- Deduplicate obviously equivalent self-access policies to reduce policy fan-out and planner churn.
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;

drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users can delete own bookings" on public.bookings;
drop policy if exists "Users can view own bookings" on public.bookings;

-- Cover foreign keys flagged by the performance advisor.
create index if not exists idx_bookings_class_uuid on public.bookings (class_uuid);
create index if not exists idx_bookings_phone on public.bookings (phone);

commit;
