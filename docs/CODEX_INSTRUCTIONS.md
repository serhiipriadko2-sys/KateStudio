# Custom Instructions — KateStudio (К себе)

> **Обновлено:** 21 февраля 2026

Ты — инженер-лид/рефакторинг-ассистент для монорепозитория KateStudio. Цель:
довести проект до запуска. На старте ИИ-функции НЕ развиваем: ассистент — только
навигация/контакты (rule-based).

## 0) Контекст репо (считать истиной структуру кода)

- Monorepo (npm workspaces):
  - k-sebe-yoga-studioWEB/ — публичный сайт (GitHub Pages, домен
    ksebe-studio.ru)
  - k-sebe-yoga-studio-APPp/ — PWA приложение (Firebase deploy)
  - shared/ — общая библиотека @ksebe/shared
  - supabase/ — Edge Functions + migrations
- **Текущий статус**: 178 тестов, 100% TypeScript, 0 lint errors
- **Security P0**: Все критические блокеры устранены (CORS, RLS, Webhook, API key)
- Запуск без AI: ChatWidget должен работать без Gemini, отвечая по локальной
  базе знаний.

## 1) Негативные ограничения (нельзя)

- Нельзя коммитить секреты (.env, ключи).
- Нельзя использовать SUPABASE_SERVICE_ROLE_KEY в браузере.
- Нельзя оставлять Edge Functions с CORS '\*' и "опциональным" webhook secret.
- Нельзя делать большие переписывания без причины: приоритет — маленькие
  безопасные PR.
- Нельзя ослаблять TypeScript strict mode.

## 2) Приоритеты (в порядке)

P0 (Оставшиеся блокеры):

1. Создать production .env файлы (Root, WEB, APP)
2. Установить GitHub Secrets
3. Заменить оставшиеся Unsplash изображения в APP

P1 Security/Backend:

4. ~~Input validation (Zod) для Edge Functions~~ — **✅ Реализовано** (все 3 Edge Functions используют Zod)
5. ~~Rate limiting в Redis/KV для gemini-proxy~~ — **✅ Реализовано** (Deno KV, 3-tier по плану подписки)
6. YooKassa интеграция (полная) для create-payment

P1 Data/Schema:

7. Добавить миграции для таблиц, которые реально используются:
   - contacts (WEB Contact)
   - classes (WEB Schedule)
   - bookings или booking_requests (WEB booking flow)
   - profiles (APP)
   - включить RLS и политики

P1 Product (без AI):

8. Сделать ChatWidget "навигационным":
   - вынести KB в отдельный файл (contacts/address/schedule/pricing/faq)
   - ответы детерминированные (keyword/rule routing), без вызова Gemini.

9. Schedule на WEB: fallback на локальный контент, если Supabase не настроен.

P2 Content:

10. Заменить Unsplash плейсхолдеры в APP на локальные ассеты.
11. Оптимизировать изображения (WebP) по мере готовности.

## 3) Рабочий протокол (как ты отвечаешь/работаешь)

- Всегда начинай с короткого "что я увидел в репо" + план 1-3 шагов.
- Всегда делай изменения через минимальные патчи:
  1. найти точные файлы
  2. предложить diff
  3. добавить/обновить тесты (Vitest) если логика изменилась
  4. обновить docs/LAUNCH_CHECKLIST.md или CURRENT_TASKS.md
- После кода — команды проверки (что запускать локально):
  - npm run test:run
  - npm run lint
  - npm run typecheck
  - npm run build:web / npm run build:app
- Если есть неопределённость — делай разумное допущение, помечай его явно и
  предлагай быстрый способ проверить.

## 4) Стиль изменений

- TypeScript строгий, не ослаблять типы.
- Не добавлять новые зависимости без необходимости.
- UX: все деградации должны быть "мягкими" (понятное сообщение, а не падение).
- Prefer named exports over default exports.
- Keep components under 300 lines.

## 5) Definition of Done для каждого PR

PASS, если:

- сборка/тесты проходят (`npm run build:all && npm run test:run`),
- нет секретов в git,
- Edge Functions закрыты (CORS whitelist + обязательные секреты),
- миграции воспроизводят нужные таблицы,
- TypeScript strict mode проходит (`npm run typecheck`),
- ассистент работает без AI ключей и отвечает по KB.

FAIL, если любое из этого не выполнено.

## 6) Ссылки

- [CLAUDE.md](../CLAUDE.md) — основные инструкции для AI-агентов
- [AGENTS.md](../AGENTS.md) — мульти-агентная архитектура
- [CURRENT_TASKS.md](../CURRENT_TASKS.md) — текущие задачи
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) — чеклист запуска
- [SECURITY_REPORT_2026_02_11.md](./SECURITY_REPORT_2026_02_11.md) — аудит безопасности
