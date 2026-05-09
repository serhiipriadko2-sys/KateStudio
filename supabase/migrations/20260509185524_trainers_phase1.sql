-- Phase 1: first-class trainers domain.
-- Adds trainer profiles, links classes to trainers, and seeds the first two new trainers.

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  short_name text,
  role_title text not null default 'Преподаватель',
  bio_short text not null,
  bio_long text,
  quote text,
  avatar_url text,
  cover_image_url text,
  specialties text[] not null default '{}',
  teaching_formats text[] not null default '{}',
  experience_years smallint,
  instagram_url text,
  telegram_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainers_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint trainers_experience_nonnegative check (
    experience_years is null or experience_years >= 0
  ),
  constraint trainers_formats_allowed check (
    teaching_formats <@ array['studio', 'online', 'retreat', 'private']::text[]
  )
);

comment on table public.trainers is 'Public and admin-managed instructor profiles for WEB and APP.';
comment on column public.trainers.slug is 'Stable public route segment, e.g. /trainers/lidia-kuzina.';
comment on column public.trainers.is_active is 'Public visibility switch. Inactive trainers are hidden from public clients.';
comment on column public.trainers.is_featured is 'Used by homepage or app overview surfaces to prioritize trainers.';

alter table public.trainers enable row level security;

drop policy if exists "trainers_public_select_active" on public.trainers;
create policy "trainers_public_select_active"
  on public.trainers
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "trainers_admin_select" on public.trainers;
create policy "trainers_admin_select"
  on public.trainers
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "trainers_admin_insert" on public.trainers;
create policy "trainers_admin_insert"
  on public.trainers
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "trainers_admin_update" on public.trainers;
create policy "trainers_admin_update"
  on public.trainers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trainers_admin_delete" on public.trainers;
create policy "trainers_admin_delete"
  on public.trainers
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "trainers_service_role_manage" on public.trainers;
create policy "trainers_service_role_manage"
  on public.trainers
  for all
  to service_role
  using (true)
  with check (true);

-- Explicit grants keep the table reachable via supabase-js as Supabase moves
-- public-schema Data API exposure from implicit to opt-in defaults.
grant select on table public.trainers to anon, authenticated;
grant insert, update, delete on table public.trainers to authenticated;
grant all on table public.trainers to service_role;

alter table public.classes
  add column if not exists trainer_id uuid references public.trainers(id) on delete set null;

comment on column public.classes.trainer_id is 'Optional structured trainer reference. classes.instructor remains as text fallback.';

create index if not exists idx_trainers_active_sort
  on public.trainers (is_active, sort_order, full_name);

create index if not exists idx_trainers_featured_sort
  on public.trainers (is_featured, is_active, sort_order);

create index if not exists idx_classes_trainer_id
  on public.classes (trainer_id);

drop trigger if exists trainers_updated_at on public.trainers;
create trigger trainers_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

insert into public.trainers (
  slug,
  full_name,
  short_name,
  role_title,
  bio_short,
  bio_long,
  quote,
  avatar_url,
  cover_image_url,
  specialties,
  teaching_formats,
  experience_years,
  instagram_url,
  telegram_url,
  sort_order,
  is_featured,
  is_active
) values
(
  'elizaveta-belonogova',
  'Елизавета Белоногова',
  'Елизавета',
  'Специалист по физической реабилитации',
  'Специалист по физической реабилитации с 10-летним опытом. Ведет Smart Stretching и практики для здорового позвоночника.',
  $$Елизавета Белоногова — специалист по физической реабилитации с 10-летним опытом. Она точно знает, как работает каждая мышца и как вернуть телу свободу без боли и дискомфорта.

В студии «К себе» Елизавета ведет направление Smart Stretching: умная растяжка, мягкая работа с мышцами спины и ног, здоровая подвижность суставов и выравнивание осанки под присмотром профессионала.

Практика подойдет тем, кто чувствует скованность в спине, забитость в ногах или тяжесть в стопах после рабочего дня. Занятие помогает вернуть легкость, гибкость, энергию и более свободное ощущение тела.$$,
  'Путь к легкому телу начинается с внимательной работы.',
  null,
  null,
  array['Smart Stretching', 'здоровый позвоночник', 'реабилитация', 'мягкая растяжка']::text[],
  array['studio']::text[],
  10,
  null,
  null,
  20,
  true,
  true
),
(
  'lidia-kuzina',
  'Лидия Кузина',
  'Лидия',
  'Преподаватель хатха-йоги и виньяса-флоу',
  'Сертифицированный мастер хатха-йоги и виньяса-флоу с более чем 10-летним опытом личной практики.',
  $$Лидия Кузина — сертифицированный мастер хатха-йоги и виньяса-флоу с более чем 10-летним опытом личной практики. Ее путь в йоге — это не только техника, но и глубокое понимание того, как практика может исцелять и трансформировать изнутри.

Лидия обучалась в Федерации йоги России, изучала построение асан и виньяс, техники пранаямы, составление последовательностей и ведение занятий в стиле виньяса-флоу. Также она проходила курс Льва Соловьева «7 минут медитации», посвященный практикам осознанности.

На занятиях Лидии принцип «К себе нежно» становится практикой: через плавные медитативные потоки, дыхательные техники, мягкую светотерапию и музыкальное сопровождение участники учатся слышать тело, растворять телесные блоки и возвращаться к более глубокому ощущению себя.$$,
  'К себе нежно — это принцип контакта с телом, а не красивая фраза.',
  null,
  null,
  array['хатха-йога', 'виньяса-флоу', 'пранаяма', 'медитация']::text[],
  array['studio']::text[],
  10,
  'https://instagram.com/LidiaKuzina',
  null,
  30,
  true,
  true
)
on conflict (slug) do update set
  full_name = excluded.full_name,
  short_name = excluded.short_name,
  role_title = excluded.role_title,
  bio_short = excluded.bio_short,
  bio_long = excluded.bio_long,
  quote = excluded.quote,
  avatar_url = coalesce(public.trainers.avatar_url, excluded.avatar_url),
  cover_image_url = coalesce(public.trainers.cover_image_url, excluded.cover_image_url),
  specialties = excluded.specialties,
  teaching_formats = excluded.teaching_formats,
  experience_years = excluded.experience_years,
  instagram_url = excluded.instagram_url,
  telegram_url = excluded.telegram_url,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active,
  updated_at = now();

update public.classes c
set trainer_id = t.id
from public.trainers t
where c.trainer_id is null
  and c.instructor is not null
  and lower(trim(c.instructor)) = lower(trim(t.full_name));
