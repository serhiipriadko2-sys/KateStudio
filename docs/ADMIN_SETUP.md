# Настройка прав администратора

## Обзор

Начиная с версии 2026-02-16, административная панель защищена аутентификацией Supabase. Доступ к панели имеют только пользователи с флагом `is_admin = true` в таблице `profiles`.

## Как работает защита

1. **Кнопка в Footer** — видна только залогиненным пользователям с флагом `is_admin`
2. **AdminPanel** — проверяет права при открытии:
   - Показывает **Loading** пока идет проверка
   - Показывает **Access Denied** если пользователь не админ или не залогинен
   - Показывает **панель управления** только для админов

## Установка прав администратора

### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Table Editor** → **profiles**
4. Найдите строку с вашим `user_id` (или email)
5. Измените `is_admin` на `true`
6. Сохраните изменения

### Вариант 2: Через SQL Editor

```sql
-- Установить права администратора по email
UPDATE profiles
SET is_admin = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Или напрямую по user_id
UPDATE profiles
SET is_admin = true
WHERE user_id = 'your-user-id-uuid';
```

### Вариант 3: При первой регистрации

Если у вас еще нет профиля, он создастся автоматически при первом входе. После этого используйте Вариант 1 или 2.

## Проверка прав

1. Залогиньтесь на сайте через Supabase Auth
2. Откройте Footer внизу страницы
3. Если вы админ — увидите кнопку **"Управление"** (иконка Terminal)
4. Кликните на кнопку — откроется административная панель

## Безопасность

### ✅ Реализовано

- Проверка `is_admin` на клиенте через хук `useIsAdmin`
- Скрытие кнопки доступа от неадминов
- RLS политики в Supabase для защиты операций с БД

### ⚠️ Важно

- **Клиентская проверка** предотвращает случайный доступ
- **RLS политики** защищают реальные операции с данными
- Даже если кто-то обойдет клиентскую защиту, RLS политики не дадут изменить данные

### Структура RLS политик

Все таблицы (`classes`, `bookings`, `contacts`, `profiles`) защищены политиками:

```sql
-- Пример политики для classes
CREATE POLICY "Admin can manage classes" ON classes
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true)
  );
```

## Технические детали

### Используемые компоненты

- **`useIsAdmin` hook** (`shared/hooks/useIsAdmin.ts`)
  - Проверяет `supabase.auth.getUser()`
  - Загружает `is_admin` из `profiles`
  - Слушает изменения auth state
  - Возвращает: `{ isAdmin, isLoading, user }`

- **`Footer`** (`k-sebe-yoga-studioWEB/components/Footer.tsx`)
  - Использует `useIsAdmin()` для проверки прав
  - Показывает кнопку только если `isAdmin === true`

- **`AdminPanel`** (`k-sebe-yoga-studioWEB/components/AdminPanel.tsx`)
  - Проверяет права при каждом открытии
  - Показывает Access Denied если не админ

### Типы

```typescript
// shared/types/index.ts
export interface ProfileRow {
  id: string;
  user_id: string;
  phone: string | null;
  name: string | null;
  city: string | null;
  avatar: string | null;
  is_admin: boolean;
  created_at: string;
}

// shared/hooks/useIsAdmin.ts
export interface UseIsAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
}
```

## Отладка

### Проблема: Кнопка не появляется

1. Проверьте, что вы залогинены (откройте консоль, выполните `supabase.auth.getUser()`)
2. Проверьте `is_admin` в таблице `profiles`:
   ```sql
   SELECT user_id, is_admin FROM profiles WHERE user_id = 'your-user-id';
   ```
3. Проверьте консоль браузера на наличие ошибок от `useIsAdmin`

### Проблема: Access Denied после клика

1. Проверьте, что `is_admin = true` в базе данных
2. Проверьте, что миграция `20260216000000_schedule_admin_booking_status.sql` применена
3. Очистите кэш браузера и перезагрузите страницу

### Проблема: RLS блокирует операции

1. Убедитесь, что колонка `is_admin` существует в `profiles`:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'profiles' AND column_name = 'is_admin';
   ```
2. Проверьте индекс для производительности:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'profiles' AND indexname LIKE '%is_admin%';
   ```

## Миграции

### Добавление `is_admin` в profiles

Миграция: `supabase/migrations/20260216000000_schedule_admin_booking_status.sql`

```sql
-- Add is_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.is_admin IS 'Admin flag. Set manually in DB or via service role.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles (is_admin)
  WHERE is_admin = true;
```

## Резюме

- ✅ Админ-панель защищена Supabase Auth + флагом `is_admin`
- ✅ Кнопка видна только админам
- ✅ RLS политики защищают операции с данными
- ✅ Хук `useIsAdmin` реализует проверку прав
- 📝 Для получения прав — установите `is_admin = true` в Supabase Dashboard
