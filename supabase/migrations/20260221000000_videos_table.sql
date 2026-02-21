-- Create videos table
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  duration text not null,
  level text not null,
  image_url text,
  video_url text,
  is_locked boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.videos enable row level security;

-- Policies
create policy "Public videos are viewable by everyone"
  on public.videos for select
  using (true);

create policy "Admins can manage videos"
  on public.videos for all
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

-- Insert initial data (if empty)
insert into public.videos (title, duration, level, image_url, video_url, is_locked, tags)
select 'Утренний Flow', '15 мин', 'Легкий', 'https://images.unsplash.com/photo-1544367563-12123d8959bd?q=80&w=800', 'https://www.youtube.com/embed/sTANio_2E0Q?autoplay=1', false, ARRAY['Энергия', 'Сила']
where not exists (select 1 from public.videos limit 1);

insert into public.videos (title, duration, level, image_url, video_url, is_locked, tags)
select 'Здоровая спина', '30 мин', 'Средний', 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800', 'https://www.youtube.com/embed/inpok4MKVLM?autoplay=1', false, ARRAY['Здоровье', 'Сила']
where not exists (select 1 from public.videos where title = 'Здоровая спина');

insert into public.videos (title, duration, level, image_url, video_url, is_locked, tags)
select 'Глубокая растяжка', '45 мин', 'Сложный', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800', null, true, ARRAY['Покой', 'Здоровье']
where not exists (select 1 from public.videos where title = 'Глубокая растяжка');

insert into public.videos (title, duration, level, image_url, video_url, is_locked, tags)
select 'Медитация перед сном', '10 мин', 'Все уровни', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800', null, true, ARRAY['Покой', 'Здоровье']
where not exists (select 1 from public.videos where title = 'Медитация перед сном');
