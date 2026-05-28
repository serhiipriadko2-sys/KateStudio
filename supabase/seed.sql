-- Canonical seed data for public.pricing_plans.
-- Mirrors shared/constants/pricing.ts DEFAULT_PRICING_DATA.

insert into public.pricing_plans (
  id,
  category,
  title,
  price,
  subtitle,
  description,
  features,
  is_popular,
  is_dark,
  display_order,
  is_active,
  amount_cents,
  currency,
  visits_total,
  valid_days,
  is_payable
)
values
  (
    '3a111111-1111-4111-8111-111111111111',
    'yoga',
    'Разовое',
    '850 ₽',
    null,
    'Для знакомства со студией',
    '["1 посещение любой практики", "Срок действия: 7 дней"]'::jsonb,
    false,
    false,
    10,
    true,
    85000,
    'RUB',
    1,
    7,
    true
  ),
  (
    '3a111111-1111-4111-8111-222222222222',
    'yoga',
    '4 занятия',
    '3 100 ₽',
    null,
    'Срок 1 месяц с первого посещения',
    '["775 ₽ за занятие", "4 посещения", "Экономия 300 ₽", "Срок действия: 30 дней"]'::jsonb,
    false,
    false,
    20,
    true,
    310000,
    'RUB',
    4,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-333333333333',
    'yoga',
    '9 занятий',
    '6 300 ₽',
    null,
    'Срок 1 месяц с первого посещения',
    '["700 ₽ за занятие", "9 посещений", "Экономия 1 350 ₽", "Срок действия: 30 дней"]'::jsonb,
    true,
    false,
    30,
    true,
    630000,
    'RUB',
    9,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-444444444444',
    'personal',
    'Персональная (1 чел)',
    '1 800 ₽',
    null,
    'Индивидуальный подход',
    '["Удобное время", "Индивидуальный подход", "1 человек"]'::jsonb,
    false,
    true,
    10,
    true,
    180000,
    'RUB',
    1,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-555555555555',
    'Персональная (2 чел)',
    '2 500 ₽',
    null,
    'Занятие для двоих',
    '["Удобное время", "Индивидуальный подход", "2 человека"]'::jsonb,
    false,
    true,
    20,
    true,
    250000,
    'RUB',
    1,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-666666666666',
    'sound',
    'Групповая сессия',
    '1 500 ₽',
    null,
    'Саундхилинг в группе',
    '["Глубокая релаксация", "Снятие стресса и тревожности", "Гармонизация энергии"]'::jsonb,
    false,
    false,
    10,
    true,
    150000,
    'RUB',
    1,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-777777777777',
    'sound',
    'Индивидуальная',
    'от 3 000 ₽',
    null,
    'Персональная сессия',
    '["Чаши - 3 000 ₽", "Гонг + чаши - 3 500 ₽", "Индивидуальный подход", "Глубокое исцеление"]'::jsonb,
    true,
    false,
    20,
    true,
    null,
    'RUB',
    null,
    null,
    false
  ),
  (
    '3a111111-1111-4111-8111-888888888888',
    'sound',
    'Парная',
    'от 3 500 ₽',
    null,
    'Сессия для двоих',
    '["Чаши - 3 500 ₽", "Гонг + чаши - 4 000 ₽", "2 человека", "Совместное погружение"]'::jsonb,
    false,
    false,
    30,
    true,
    null,
    'RUB',
    null,
    null,
    false
  ),
  (
    '3a111111-1111-4111-8111-999999999999',
    'massage',
    'Индивидуальный',
    '3 500 ₽',
    null,
    'Массаж тибетскими чашами',
    '["Глубокое расслабление", "Снятие мышечных зажимов", "Улучшение сна", "Энергетический баланс"]'::jsonb,
    false,
    false,
    10,
    true,
    350000,
    'RUB',
    1,
    30,
    true
  ),
  (
    '3a111111-1111-4111-8111-aaaaaaaaaaaa',
    'massage',
    'Для двоих',
    '6 000 ₽',
    null,
    'Массаж для пары',
    '["Совместное расслабление", "Гармонизация энергии", "Улучшение кровообращения", "Медитативное погружение"]'::jsonb,
    false,
    true,
    20,
    true,
    600000,
    'RUB',
    1,
    30,
    true
  )
on conflict (id) do update
set
  category = excluded.category,
  title = excluded.title,
  price = excluded.price,
  subtitle = excluded.subtitle,
  description = excluded.description,
  features = excluded.features,
  is_popular = excluded.is_popular,
  is_dark = excluded.is_dark,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  amount_cents = excluded.amount_cents,
  currency = excluded.currency,
  visits_total = excluded.visits_total,
  valid_days = excluded.valid_days,
  is_payable = excluded.is_payable;

-- Canonical seed data for public.trainers and recurring trainer schedule.

with trainer_payload as (
  select
    'viola-villa-my'::text as slug,
    'Виола'::text as full_name,
    'Виола'::text as short_name,
    'Deep Work · Power Pilates'::text as role_title,
    'Дипломированный тренер по умному движению, мягкому и силовому пилатесу. Помогает выстроить сильное, функциональное тело без перегруза.'::text as bio_short,
    $$Виола — ваш проводник в мир умного движения и сильного тела. Дипломированный тренер, который помогает сделать тело не только гибким, но и по-настоящему сильным.

В работе Виола мастерски совмещает два подхода: Deep Work (мягкий пилатес) и Power Pilates (силовой пилатес). Через глубокую работу с мышцами, коррекцию осанки, устранение биомеханических блоков и развитие мышечного корсета занятия помогают вернуть телу свободу, устойчивость и энергию.

Практика подойдет и начинающим, которым нужен безопасный фундамент, и тем, кто уже занимается спортом и хочет повысить контроль над телом. Если ваша цель — здоровый позвоночник, сильный центр и легкость движений, Виола поможет прийти к этому кратчайшим путем.$$::text as bio_long,
    'Сильное тело начинается с умного движения.'::text as quote,
    $$data:image/webp;base64,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$$::text as image_data_uri,
    array['Deep Work', 'мягкий пилатес', 'Power Pilates', 'силовой пилатес', 'осанка', 'сильный центр']::text[] as specialties,
    array['studio']::text[] as teaching_formats,
    null::smallint as experience_years,
    'https://instagram.com/Villa_My'::text as instagram_url,
    null::text as telegram_url,
    25::integer as sort_order,
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
    image_data_uri,
    image_data_uri,
    array[image_data_uri]::text[],
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
trainer_ref as (
  select id, full_name
  from upsert_trainer
),
rule_seed as (
  select
    'Deep Work'::text as name,
    3::smallint as weekday,
    '17:30:00'::time as time,
    '60 мин'::text as duration,
    12::integer as spots_total,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    1::integer as intensity,
    850::integer as price,
    'Мягкий пилатес: глубокая работа с мышцами, осанкой, координацией и биомеханикой.'::text as description,
    '2026-05-27'::date as start_date,
    null::date as end_date,
    25::integer as sort_order,
    true as is_active,
    'Europe/Moscow'::text as timezone,
    'active'::text as status
  union all
  select
    'Power Pilates'::text,
    5::smallint,
    '10:30:00'::time,
    '60 мин'::text,
    12::integer,
    false,
    'Станционная ул., 5Б'::text,
    3::integer,
    850::integer,
    'Силовой пилатес: выносливость, сильный центр и функциональное тело.'::text,
    '2026-05-29'::date,
    null::date,
    26::integer,
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
  cross join trainer_ref t
  where r.trainer_id = t.id
    and r.name = s.name
    and r.weekday = s.weekday
    and r.time = s.time
  returning r.id
),
inserted_rules as (
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
  cross join trainer_ref t
  where not exists (
    select 1
    from public.class_recurring_rules r
    where r.trainer_id = t.id
      and r.name = s.name
      and r.weekday = s.weekday
      and r.time = s.time
  )
  returning id
),
rule_map as (
  select
    r.id,
    r.name,
    r.time,
    r.start_date,
    r.trainer_id
  from public.class_recurring_rules r
  join trainer_ref t on t.id = r.trainer_id
  where (r.name, r.weekday, r.time) in (
    ('Deep Work', 3, '17:30:00'::time),
    ('Power Pilates', 5, '10:30:00'::time)
  )
),
class_seed as (
  select
    rm.trainer_id,
    rm.id as recurring_rule_id,
    rm.name,
    t.full_name as instructor,
    (rm.start_date + (gs.n * interval '7 days'))::date as date,
    rm.time,
    '60 мин'::text as duration,
    12::integer as spots_total,
    0::integer as spots_booked,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    case when rm.name = 'Deep Work' then 1 else 3 end::integer as intensity,
    850::integer as price,
    case
      when rm.name = 'Deep Work'
        then 'Мягкий пилатес: глубокая работа с мышцами, осанкой, координацией и биомеханикой.'
      else 'Силовой пилатес: выносливость, сильный центр и функциональное тело.'
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
