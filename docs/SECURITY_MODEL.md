# Security Model | KateStudio

> **Обновлено:** 16 июня 2026
> Этот документ описывает security model и текущие подтверждённые security deltas.
> Для present-tense launch/status claims используйте `CURRENT_TASKS.md`,
> `docs/LAUNCH_CHECKLIST.md`, и операционную память (`project-memory.md`, `open-loops.md`).

---

## Роли и границы доступа

### App User

- Аутентифицируется через Supabase Auth.
- Видит только свои записи: профиль, бронирования, подписку, пользовательские события и прогресс.
- Изоляция строится на RLS по `auth.uid() = user_id` на чувствительных таблицах.
- Не получает admin-права через клиентский код или публичный API.
- Бронирование происходит через `book-class-with-access` Edge Function, который проверяет JWT и вызывает service-role-only внутренний RPC.

> Важно: не считать APP auth OTP-only или Magic-Link-only каноном. Текущие
> live auth evidence уже не поддерживают такую упрощённую картину.

### Studio Admin

- Работает через отдельную admin boundary в WEB.
- Права администратора хранятся в таблице `admins` и проверяются серверной логикой.
- Клиент не должен выводить admin-права из JWT claims или публичных полей профиля.

### Edge Functions

- Хранят и используют секреты server-side: `SUPABASE_SERVICE_ROLE_KEY`, `YOOKASSA_*`, `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `CRON_SECRET`, `MAILCHIMP_API_KEY`, прочие webhook/ops secrets.
- Закрывают чувствительные операции: платежи, AI, push, cron/maintenance, рассылка.
- Проверяют auth, webhook secret или ops secret в зависимости от контура.

---

## Что клиент получает, а что нет

| Surface | Статус |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` / publishable key | публично допустимо |
| Session JWT текущего пользователя | допустимо, но не даёт admin-прав |
| `SUPABASE_SERVICE_ROLE_KEY` | никогда не уходит в клиент |
| `GEMINI_API_KEY`, `YOOKASSA_SECRET_KEY`, webhook secrets | никогда не уходит в клиент |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | никогда не уходит в клиент |

---

## Механизмы защиты

| Механизм | Что закрывает |
| --- | --- |
| Supabase RLS | изоляция пользовательских данных |
| `admins` table + server-side checks | отдельная admin boundary |
| JWT validation in Edge Functions | закрытые endpoints (`book-class-with-access`, `create-yookassa-checkout`, `gemini-proxy`) |
| Basic auth / ops secret verification | защита external webhooks (`yookassa-webhook`) и cron (`cron-maintenance`) |
| Service-role-only internal RPC | `book_class_with_access_internal` не доступен напрямую из клиента |
| Zod/input validation | валидация входов в Edge Functions |
| CORS allowlists | ограничение browser-facing function origins |
| Rate limiting | защита AI и дорогих операций (`gemini-proxy`) |

> Точный domain allowlist не держите в голове по этому документу. Для
> present-tense значений смотрите код конкретной функции и deployment evidence.

---

## Текущие подтверждённые security deltas

| Домен | Подтверждённое состояние |
| --- | --- |
| Live security advisors | **NO WARN BLOCKERS** после 2026-05-30 reconciliation |
| `book_class_with_access` | service-role-only internal RPC; public APP contract через `book-class-with-access` Edge Function |
| Legacy payment trio | retired in place; endpoints return 410 и не мутируют state |
| APP-target payment pair | canonical: `create-yookassa-checkout` + `yookassa-webhook` |
| Leaked password protection | resolved в текущем canon; не является open warning |
| GraphQL discoverability | снят из live canonical snapshot |
| `vector` in `public` | снят; extension moved out of public surface |
| `profiles` public drift | historical blocker closed в текущей live migration history |

---

## Что остаётся открытым

В текущем security canon нет отдельного live payment blocker-а.

`book_class_with_access` **не** остаётся open remediation item. Он теперь service-role-only internal RPC; публичный контракт реализован через Edge Function.

`20260518205158` не остаётся open security blocker. Его статус — accepted forward reconciliation.

Однако идентифицированы три HIGH-RISK security item-а, которые должны быть закрыты перед следующим production change:

1. `supabase/config.toml` `project_id` mismatch — см. `open-loops.md`.
2. Missing least-privilege `permissions:` в `.github/workflows` — см. `open-loops.md`.
3. Plaintext password logging в `scripts/create-admin.ts` — см. `open-loops.md`.

---

## Правило для разработчиков

> Секреты живут только в Vault, deployment secrets и server-side runtime.
> `.env.example` не должен содержать настоящих секретов.
> Любой present-tense security verdict проверяйте по `CURRENT_TASKS.md`,
> `docs/LAUNCH_CHECKLIST.md`, и `project-memory.md` / `open-loops.md`,
> а не по старым narrative docs.
