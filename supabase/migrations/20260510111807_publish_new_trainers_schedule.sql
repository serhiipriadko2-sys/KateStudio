update public.trainers
set
  role_title = case slug
    when 'elizaveta-belonogova' then 'Smart Stretching · здоровый позвоночник'
    when 'lidia-kuzina' then 'Хатха-йога и виньяса-флоу'
    else role_title
  end,
  bio_short = case slug
    when 'elizaveta-belonogova' then 'Специалист по физической реабилитации с 10-летним опытом. Ведет Smart Stretching, мягкую растяжку и практики для здорового позвоночника.'
    when 'lidia-kuzina' then 'Сертифицированный мастер хатха-йоги и виньяса-флоу с более чем 10-летним опытом личной практики.'
    else bio_short
  end,
  bio_long = case slug
    when 'elizaveta-belonogova' then $$Елизавета Белоногова — специалист по физической реабилитации с 10-летним опытом. Она точно знает, как работает каждая мышца и как вернуть телу свободу без боли и дискомфорта.

В студии «К себе» Елизавета ведет направление Smart Stretching: умная растяжка, мягкая работа с мышцами спины и ног, здоровая подвижность суставов и выравнивание осанки под присмотром профессионала.

Практика подойдет тем, кто чувствует скованность в спине, «забитость» в ногах или тяжесть в стопах после рабочего дня. После занятия тело становится более свободным, гибким и энергичным, а осанка — более устойчивой и красивой.$$ 
    when 'lidia-kuzina' then $$Лидия Кузина — сертифицированный мастер хатха-йоги и виньяса-флоу с более чем 10-летним опытом личной практики. Ее путь в йоге — это не просто техника, а глубокое понимание того, как практика может исцелять и трансформировать нас изнутри.

Образование и практика Лидии опираются на обучение в Федерации йоги России, изучение построения асан и виньяс, техники пранаямы, работу с последовательностями в стиле виньяса-флоу, а также курс Льва Соловьева «7 минут медитации», посвященный практикам осознанности.

Для Лидии принцип «К себе нежно» — это не красивая фраза, а способ быть с телом в контакте. На занятиях через плавные медитативные потоки, дыхательные техники, мягкую светотерапию и музыкальное сопровождение участники учатся слышать тело, растворять телесные блоки и возвращаться к более глубокому ощущению себя.$$ 
    else bio_long
  end,
  quote = case slug
    when 'elizaveta-belonogova' then 'Путь к легкому телу начинается с внимательной работы.'
    when 'lidia-kuzina' then 'К себе нежно — это принцип контакта с телом, а не красивая фраза.'
    else quote
  end,
  specialties = case slug
    when 'elizaveta-belonogova' then array['Smart Stretching', 'здоровый позвоночник', 'реабилитация', 'мягкая растяжка']::text[]
    when 'lidia-kuzina' then array['хатха-йога', 'виньяса-флоу', 'пранаяма', 'медитация']::text[]
    else specialties
  end,
  teaching_formats = case slug
    when 'elizaveta-belonogova' then array['studio']::text[]
    when 'lidia-kuzina' then array['studio']::text[]
    else teaching_formats
  end,
  experience_years = case slug
    when 'elizaveta-belonogova' then 10
    when 'lidia-kuzina' then 10
    else experience_years
  end,
  instagram_url = case slug
    when 'lidia-kuzina' then 'https://instagram.com/LidiaKuzina'
    else instagram_url
  end,
  is_featured = true,
  is_active = true,
  updated_at = now()
where slug in ('elizaveta-belonogova', 'lidia-kuzina');

with trainer_map as (
  select id, slug, full_name
  from public.trainers
  where slug in ('elizaveta-belonogova', 'lidia-kuzina')
),
series as (
  select
    t.id as trainer_id,
    'Smart Stretching'::text as name,
    t.full_name as instructor,
    gs::date as date,
    '10:00'::time as time,
    '60 мин'::text as duration,
    12::integer as spots_total,
    0::integer as spots_booked,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    1::integer as intensity,
    700::integer as price,
    'Умная растяжка, мягкая работа со спиной и ногами, здоровая подвижность суставов и бережная работа с осанкой.'::text as description
  from trainer_map t
  cross join generate_series(current_date, current_date + interval '84 day', interval '1 day') gs
  where t.slug = 'elizaveta-belonogova'
    and extract(isodow from gs) = 3

  union all

  select
    t.id as trainer_id,
    'Виньяса-флоу'::text as name,
    t.full_name as instructor,
    gs::date as date,
    '19:00'::time as time,
    '60 мин'::text as duration,
    12::integer as spots_total,
    0::integer as spots_booked,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    2::integer as intensity,
    700::integer as price,
    'Плавная практика виньяса-флоу с акцентом на дыхание, внимание к телу и мягкое раскрытие.'::text as description
  from trainer_map t
  cross join generate_series(current_date, current_date + interval '84 day', interval '1 day') gs
  where t.slug = 'lidia-kuzina'
    and extract(isodow from gs) = 2

  union all

  select
    t.id as trainer_id,
    'Виньяса-флоу'::text as name,
    t.full_name as instructor,
    gs::date as date,
    '19:30'::time as time,
    '60 мин'::text as duration,
    12::integer as spots_total,
    0::integer as spots_booked,
    false as is_online,
    'Станционная ул., 5Б'::text as location,
    2::integer as intensity,
    700::integer as price,
    'Плавная практика виньяса-флоу с акцентом на дыхание, внимание к телу и мягкое раскрытие.'::text as description
  from trainer_map t
  cross join generate_series(current_date, current_date + interval '84 day', interval '1 day') gs
  where t.slug = 'lidia-kuzina'
    and extract(isodow from gs) = 5
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
  description
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
  s.description
from series s
where not exists (
  select 1
  from public.classes c
  where c.date = s.date
    and c.time = s.time
    and c.name = s.name
    and coalesce(c.instructor, '') = s.instructor
    and coalesce(c.is_online, false) = s.is_online
);