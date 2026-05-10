-- Link trainer profiles to public Supabase Storage images.
-- Storage source: bucket `images` in project qkaycdcbstjobacmuaro.
-- The frontend stores plain image URLs in <img src>, so trainer images must be
-- readable through the public object endpoint.

update storage.buckets
set public = true
where id = 'images';

update public.trainers
set
  avatar_url = 'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lizamain.jpg',
  cover_image_url = 'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lizamain.jpg',
  gallery_image_urls = array[
    'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/liza.jpg',
    'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/liza1.jpg'
  ]::text[],
  updated_at = now()
where slug = 'elizaveta-belonogova';

update public.trainers
set
  avatar_url = 'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lidamain.jpg',
  cover_image_url = 'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lidamain.jpg',
  gallery_image_urls = array[
    'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lida.jpg',
    'https://qkaycdcbstjobacmuaro.supabase.co/storage/v1/object/public/images/lida1.jpg'
  ]::text[],
  updated_at = now()
where slug = 'lidia-kuzina';
