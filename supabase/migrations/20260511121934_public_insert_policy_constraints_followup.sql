-- Tighten public INSERT policies for analytics and contacts without breaking the existing app flows.
-- Goal: preserve public form submission and client analytics while removing unrestricted WITH CHECK true policies.
-- Expected effect: reduce security-linter noise and narrow obvious abuse surface.
-- Reversibility: old policy names can be recreated if needed, but should not be necessary.

alter table if exists public.analytics_events enable row level security;
alter table if exists public.contacts enable row level security;

drop policy if exists "Allow public insert to analytics" on public.analytics_events;
drop policy if exists "Allow authenticated insert to analytics" on public.analytics_events;
drop policy if exists "Allow admins to read analytics" on public.analytics_events;

drop policy if exists "analytics_events_admin_select" on public.analytics_events;

create policy "analytics_events_admin_select"
  on public.analytics_events
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "analytics_events_insert_limited" on public.analytics_events;

create policy "analytics_events_insert_limited"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (
    length(event_name) between 1 and 64
    and octet_length(coalesce(event_data, '{}'::jsonb)::text) <= 4096
    and length(coalesce(session_id, '')) <= 128
    and length(coalesce(url, '')) <= 2048
    and length(coalesce(user_agent, '')) <= 512
  );

drop policy if exists "Enable insert for all users" on public.contacts;
drop policy if exists "Enable read for service role only" on public.contacts;
drop policy if exists "admin read contacts" on public.contacts;
drop policy if exists "admin delete contacts" on public.contacts;

drop policy if exists "contacts_public_insert_limited" on public.contacts;

create policy "contacts_public_insert_limited"
  on public.contacts
  for insert
  to anon, authenticated
  with check (
    (status is null or status = 'new'::public.contact_status)
    and length(coalesce(name, '')) between 1 and 120
    and length(coalesce(phone, '')) between 1 and 40
    and length(coalesce(message, '')) between 1 and 2000
  );

drop policy if exists "contacts_admin_select" on public.contacts;

create policy "contacts_admin_select"
  on public.contacts
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contacts_admin_update" on public.contacts;

create policy "contacts_admin_update"
  on public.contacts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contacts_admin_delete" on public.contacts;

create policy "contacts_admin_delete"
  on public.contacts
  for delete
  to authenticated
  using (public.is_admin());
