begin;

-- Restrict public app settings reads to the single key used by the public clients.
drop policy if exists "Allow public read access to app_settings" on public.app_settings;
drop policy if exists "Enable read access for all users" on public.app_settings;
drop policy if exists "Public can read studio contacts setting" on public.app_settings;

grant select on table public.app_settings to anon;

create policy "Public can read studio contacts setting"
on public.app_settings
for select
to anon, authenticated
using (key = 'studio_contacts');

-- Public pricing should expose only active plans.
drop policy if exists "Enable read access for all users" on public.pricing_plans;
drop policy if exists "Public can read active pricing plans" on public.pricing_plans;

create policy "Public can read active pricing plans"
on public.pricing_plans
for select
to anon, authenticated
using (is_active is true);

-- Public video catalog should not expose locked rows.
drop policy if exists "Public videos are viewable by everyone" on public.videos;
drop policy if exists "Public can read unlocked videos" on public.videos;

grant select on table public.videos to anon;

create policy "Public can read unlocked videos"
on public.videos
for select
to anon, authenticated
using (is_locked is false);

commit;
