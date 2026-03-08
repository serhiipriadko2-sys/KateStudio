-- 1. Добавляем колонку для хранения IP отправителя
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS ip_address text;

-- 2. Функция для проверки лимита (3 сообщения в 15 минут с одного IP)
CREATE OR REPLACE FUNCTION public.enforce_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_ip text;
  recent_count integer;
BEGIN
  -- Извлекаем IP из заголовка x-forwarded-for (Supabase / PostgREST)
  client_ip := trim(split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1));
  
  -- Fallback для локальной разработки / тестов
  IF client_ip IS NULL OR client_ip = '' THEN
    client_ip := '127.0.0.1';
  END IF;

  NEW.ip_address := client_ip;

  -- Считаем количество обращений с этого IP за последние 15 минут
  SELECT count(*)
  INTO recent_count
  FROM public.contacts
  WHERE ip_address = client_ip
    AND created_at > now() - interval '15 minutes';

  -- Если лимит превышен, блокируем вставку (PostgREST вернет 400 Bad Request)
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many requests from this IP.'
      USING ERRCODE = '42900';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Создаем триггер, который срабатывает перед каждой вставкой
DROP TRIGGER IF EXISTS tr_enforce_contact_rate_limit ON public.contacts;
CREATE TRIGGER tr_enforce_contact_rate_limit
  BEFORE INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_contact_rate_limit();

-- 4. Индекс для быстрого подсчета
CREATE INDEX IF NOT EXISTS idx_contacts_ip_created_at 
  ON public.contacts(ip_address, created_at);
