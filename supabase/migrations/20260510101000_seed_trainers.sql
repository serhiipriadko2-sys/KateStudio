insert into public.trainers (
  slug,
  full_name,
  short_name,
  role_title,
  bio_short,
  bio_long,
  quote,
  specialties,
  teaching_formats,
  experience_years,
  instagram_url,
  sort_order,
  is_featured,
  is_active
)
values
  (
    'elizaveta-belonogova',
    'Елизавета Белоногова',
    'Елизавета',
    'Преподаватель Inside Flow и mindful movement',
    'Мягко соединяет движение, дыхание и музыку, чтобы вернуть тело в живой ритм.',
    'Елизавета ведёт практики, в которых важны не только форма и нагрузка, но и внутреннее ощущение потока. Её подход хорошо подходит тем, кто хочет одновременно собраться, разгрузить голову и почувствовать больше свободы в теле.',
    'Тело начинает говорить честнее, когда ему не мешают.',
    array['inside flow', 'mindful movement', 'дыхание'],
    array['studio', 'private']::text[],
    7,
    'https://instagram.com/ksebe_studio',
    10,
    true,
    true
  ),
  (
    'lidia-kuzina',
    'Лидия Кузина',
    'Лидия',
    'Преподаватель хатха-йоги и виньяса-флоу',
    'Ведёт практику собранно и ясно, помогая выстроить опору, внимание и устойчивость.',
    'Лидия работает с теми, кому важны структура, чистая техника и постепенное раскрытие тела без лишней спешки. На её занятиях много внимания к дыханию, осанке и качеству присутствия в асане.',
    'Сила появляется там, где есть устойчивость и слух к себе.',
    array['хатха-йога', 'виньяса-флоу', 'осознанное дыхание'],
    array['studio', 'online']::text[],
    10,
    'https://instagram.com/ksebe_studio',
    20,
    true,
    true
  )
on conflict (slug) do update
set
  full_name = excluded.full_name,
  short_name = excluded.short_name,
  role_title = excluded.role_title,
  bio_short = excluded.bio_short,
  bio_long = excluded.bio_long,
  quote = excluded.quote,
  specialties = excluded.specialties,
  teaching_formats = excluded.teaching_formats,
  experience_years = excluded.experience_years,
  instagram_url = excluded.instagram_url,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active;