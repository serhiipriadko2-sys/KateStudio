begin;

-- Replace security-definer views with direct table policies to avoid introducing new lint errors.
drop view if exists public.public_site_settings;
drop view if exists public.public_videos_catalog;

-- app_settings: public may read only studio_contacts; all other keys stay behind admin policies.
grant select on table public.app_settings to anon;

drop policy if exists "Public can read studio contacts setting" on public.app_settings;
create policy "Public can read studio contacts setting"
on public.app_settings
for select
to anon, authenticated
using (key = 'studio_contacts');

-- videos: public may read only unlocked videos; admin policy still covers full management.
grant select on table public.videos to anon;

drop policy if exists "Public can read unlocked videos" on public.videos;
create policy "Public can read unlocked videos"
on public.videos
for select
to anon, authenticated
using (is_locked is false);

commit;