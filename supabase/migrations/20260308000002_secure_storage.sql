-- Обновляем конфигурацию бакета 'images'
UPDATE storage.buckets
SET 
  -- Ограничение размера файла (10MB = 10485760 bytes)
  file_size_limit = 10485760, 
  -- Ограничение по MIME-типам (jpeg, png, webp, gif, svg)
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
WHERE id = 'images';

-- Убеждаемся, что RLS политики используют новую функцию is_admin() из PR-2
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND public.is_admin());
