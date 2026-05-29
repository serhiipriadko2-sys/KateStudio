-- Canonical trainer + schedule migration for Ekaterina.
-- Mirrors the live trainer profile and recurring classes launched from 2026-05-21.

with trainer_payload as (
  select
    'ekaterina-hatha-yoga'::text as slug,
    'Екатерина'::text as full_name,
    'Екатерина'::text as short_name,
    'Хатха-йога · Йогатерапия · ЛФК'::text as role_title,
    'Инструктор по хатха-йоге, йогатерапевт и дипломированный инструктор-методист по ЛФК. Выстраивает безопасную, терапевтичную практику под реальные задачи тела.'::text as bio_short,
    $$Екатерина — инструктор по Хатха-йоге, йогатерапевт и дипломированный инструктор-методист по лечебной физической культуре. Её личная практика длится уже 21 год, а профессиональный стаж составляет 15 лет.

На занятиях Екатерина строит практику из ваших физических кондиций и запроса. Опираясь на знания анатомии, физиологии, биомеханики, йогатерапии и ЛФК, она помогает работать с позвоночником, суставами, балансом в теле и безопасным развитием гибкости.

Её подход сочетает принципы Ха-Тха, травмобезопасность и полный контроль движений. Это не просто растяжка, а умный йога-стретчинг и глубокая работа с телом, где каждое движение обосновано и направлено на реальное улучшение самочувствия.

Занятия подойдут тем, кто ценит безопасность, глубину и хочет чувствовать ощутимые перемены в здоровье, осанке и легкости движений.$$::text as bio_long,
    'Безопасная практика начинается с точного понимания тела.'::text as quote,
    null::text as avatar_url,
    null::text as cover_image_url,
    array[]::text[] as gallery_image_urls,
    array['хатха-йога', 'йогатерапия', 'ЛФК', 'здоровый позвоночник', 'умный йога-стретчинг', 'биомеханика']::text[] as specialties,
    array['studio']::text[] as teaching_formats,
    15::smallint as experience_years,
    null::text as instagram_url,
    null::text as telegram_url,
    35::integer as sort_order,
    true as is_featured,
    true as is_active
),
upsert_trainer as (
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
    gallery_image_urls,
    specialties,
    teaching_formats,
    experience_years,
    instagram_url,
    telegram_url,
    sort_order,
    is_featured,
    is_active
  )
  select
    slug,
    full_name,
    short_name,
    role_title,
    bio_short,
    bio_long,
    quote,
    avatar_url,
    cover_image_url,
    gallery_image_urls,
    specialties,
    teaching_formats,
    experience_years,
    instagram_url,
    telegram_url,
    sort_order,
    is_featured,
    is_active
  from trainer_payload
  on conflict (slug) do update
  set
    full_name = excluded.full_name,
    short_name = excluded.short_name,
    role_title = excluded.role_title,
    bio_short = excluded.bio_short,
    bio_long = excluded.bio_long,
    quote = excluded.quote,
    avatar_url = excluded.avatar_url,
    cover_image_url = excluded.cover_image_url,
    gallery_image_urls = excluded.gallery_image_urls,
    specialties = excluded.specialties,
    teaching_formats = excluded.teaching_formats,
    experience_years = excluded.experience_years,
    instagram_url = excluded.instagram_url,
    telegram_url = excluded.telegram_url,
    sort_order = excluded.sort_order,
    is_featured = excluded.is_featured,
    is_active = excluded.is_active,
    updated_at = now()
  returning id, full_name
),
rule_seed as (
  select
    'Хатха-йога'::text as name,
    2::smallint as weekday,
    '07:45:00'::time as time,
    '75 мин'::text as duration,
    12::integer as spots_total,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    2::integer as intensity,
    850::integer as price,
    'Хатха-йога с терапевтическим и травмобезопасным фокусом: сила, расслабление, контроль движений и работа с осанкой.'::text as description,
    '2026-05-26'::date as start_date,
    null::date as end_date,
    35::integer as sort_order,
    true as is_active,
    'Europe/Moscow'::text as timezone,
    'active'::text as status
  union all
  select
    'Умный йога-стретчинг'::text,
    4::smallint,
    '09:00:00'::time,
    '75 мин'::text,
    12::integer,
    false,
    'Станционная ул., 5Б'::text,
    1::integer,
    850::integer,
    'Безопасная глубокая работа с телом на базе йогатерапии, ЛФК и биомеханики. Стартовая открытая практика состоялась 2026-05-21.'::text,
    '2026-05-21'::date,
    null::date,
    36::integer,
    true,
    'Europe/Moscow'::text,
    'active'::text
),
updated_rules as (
  update public.class_recurring_rules r
  set
    instructor = t.full_name,
    duration = s.duration,
    spots_total = s.spots_total,
    is_online = s.is_online,
    location = s.location,
    intensity = s.intensity,
    price = s.price,
    description = s.description,
    start_date = s.start_date,
    end_date = s.end_date,
    sort_order = s.sort_order,
    is_active = s.is_active,
    timezone = s.timezone,
    status = s.status,
    updated_at = now()
  from rule_seed s
  cross join upsert_trainer t
  where r.trainer_id = t.id
    and r.name = s.name
    and r.weekday = s.weekday
    and r.time = s.time
  returning r.id
)
insert into public.class_recurring_rules (
  trainer_id,
  name,
  instructor,
  weekday,
  time,
  duration,
  spots_total,
  is_online,
  location,
  intensity,
  price,
  description,
  start_date,
  end_date,
  sort_order,
  is_active,
  timezone,
  status
)
select
  t.id,
  s.name,
  t.full_name,
  s.weekday,
  s.time,
  s.duration,
  s.spots_total,
  s.is_online,
  s.location,
  s.intensity,
  s.price,
  s.description,
  s.start_date,
  s.end_date,
  s.sort_order,
  s.is_active,
  s.timezone,
  s.status
from rule_seed s
cross join upsert_trainer t
where not exists (
  select 1
  from public.class_recurring_rules r
  where r.trainer_id = t.id
    and r.name = s.name
    and r.weekday = s.weekday
    and r.time = s.time
);

with trainer_ref as (
  select id, full_name from public.trainers where slug = 'ekaterina-hatha-yoga'
),
rule_map as (
  select r.id, r.name, r.time, r.start_date, r.trainer_id
  from public.class_recurring_rules r
  join trainer_ref t on t.id = r.trainer_id
),
class_seed as (
  select
    rm.trainer_id,
    rm.id as recurring_rule_id,
    rm.name,
    t.full_name as instructor,
    (rm.start_date + (gs.n * interval '7 days'))::date as date,
    rm.time,
    '75 мин'::text as duration,
    12::integer as spots_total,
    0::integer as spots_booked,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    case when rm.name = 'Хатха-йога' then 2 else 1 end::integer as intensity,
    850::integer as price,
    case
      when rm.name = 'Хатха-йога' then 'Хатха-йога с терапевтическим и травмобезопасным фокусом: сила, расслабление, контроль движений и работа с осанкой.'
      else 'Безопасная глубокая работа с телом на базе йогатерапии, ЛФК и биомеханики.'
    end::text as description,
    gs.n::integer as series_index
  from rule_map rm
  join trainer_ref t on t.id = rm.trainer_id
  cross join generate_series(0, 11) as gs(n)
)
insert into public.classes (
  date,
  time,
  name,
  instructor,
  trainer_id,
  duration,
  spots_total,
  spots_booked,
  is_online,
  location,
  intensity,
  price,
  description,
  recurring_rule_id,
  series_index,
  generated_from_rule_at
)
select
  s.date,
  s.time,
  s.name,
  s.instructor,
  s.trainer_id,
  s.duration,
  s.spots_total,
  s.spots_booked,
  s.is_online,
  s.location,
  s.intensity,
  s.price,
  s.description,
  s.recurring_rule_id,
  s.series_index,
  now()
from class_seed s
where not exists (
  select 1
  from public.classes c
  where c.trainer_id = s.trainer_id
    and c.date = s.date
    and c.time = s.time
    and c.name = s.name
    and coalesce(c.instructor, '') = s.instructor
    and coalesce(c.is_online, false) = s.is_online
);
