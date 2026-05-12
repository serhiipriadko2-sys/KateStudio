begin;

-- 1. Remove broad public reads from app_settings and expose only the public-safe slice.
drop policy if exists "Allow public read access to app_settings" on public.app_settings;
drop policy if exists "Enable read access for all users" on public.app_settings;

revoke select on table public.app_settings from anon;

drop view if exists public.public_site_settings;
create view public.public_site_settings as
select key, value, updated_at
from public.app_settings
where key = 'studio_contacts';

grant select on table public.public_site_settings to anon, authenticated;

-- 2. Align pricing plan reads with the public client contract.
drop policy if exists "Enable read access for all users" on public.pricing_plans;
create policy "Public can read active pricing plans"
on public.pricing_plans
for select
to anon, authenticated
using (is_active is true);

-- 3. Move public video reads onto a curated catalog view.
drop policy if exists "Public videos are viewable by everyone" on public.videos;

revoke select on table public.videos from anon;

drop view if exists public.public_videos_catalog;
create view public.public_videos_catalog as
select
  id,
  title,
  duration,
  level,
  image_url,
  case
    when is_locked is true then null
    else video_url
  end as video_url,
  is_locked,
  tags,
  created_at
from public.videos;

grant select on table public.public_videos_catalog to anon, authenticated;

commit;