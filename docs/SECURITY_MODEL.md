# Security Model | KateStudio

> **Обновлено:** 28 мая 2026
> Этот документ описывает security model и текущие подтверждённые security deltas.
> Для present-tense launch/status claims используйте `CURRENT_TASKS.md` и
> `docs/LAUNCH_CHECKLIST.md`.

---

## Роли и границы доступа

### App User

- Аутентифицируется через Supabase Auth.
- Видит только свои записи: профиль, бронирования, подписку, пользовательские события и прогресс.
- Изоляция строится на RLS по `auth.uid() = user_id` на чувствительных таблицах.
- Не получает admin-права через клиентский код или публичный API.

> Важно: не считать APP auth OTP-only или Magic-Link-only каноном. Текущие
> live auth evidence уже не поддерживают такую упрощённую картину.

### Studio Admin

- Работает через отдельную admin boundary в WEB.
- Права администратора хранятся в таблице `admins` и проверяются серверной логикой.
- Клиент не должен выводить admin-права из JWT claims или публичных полей профиля.

### Edge Functions

- Хранят и используют секреты server-side: `SUPABASE_SERVICE_ROLE_KEY`, `YOOKASSA_*`, `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, прочие webhook/ops secrets.
- Закрывают чувствительные операции: платежи, AI, push, cron/maintenance.
- Должны проверять auth, webhook secret или ops secret в зависимости от контура.

---

## Что клиент получает, а что нет

| Surface | Статус |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | публично допустимо |
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
| HMAC/basic-secret webhook verification | защита payment callback / ops callback контуров |
| JWT validation | закрытые Edge Function endpoints |
| Zod/input validation | валидация входов в Edge Functions |
| CORS allowlists | ограничение browser-facing function origins |
| Rate limiting | защита AI и дорогих операций |
| Ops secrets (`CRON_SECRET` etc.) | maintenance/admin automation paths |

> Точный domain allowlist не держите в голове по этому документу. Для
> present-tense значений смотрите код конкретной функции и deployment evidence.

---

## Текущие подтверждённые security deltas

| Домен | Подтверждённое состояние |
| --- | --- |
| Live security advisors | остался `1 warning` |
| Current warning | `book_class_with_access` remains callable as authenticated `SECURITY DEFINER` RPC |
| `book_class_with_access` policy decision | accepted as a narrow `SECURITY DEFINER` wrapper with branch-proof evidence and preserved APP contract |
| Leaked password protection | resolved in current canon; no longer treated as open warning |
| GraphQL discoverability | снят из live canonical snapshot |
| `vector` in `public` | снят; extension moved out of public surface |
| `profiles` public drift | historical blocker closed in current live migration history |

---

## Что остаётся открытым

| Риск | Статус |
| --- | --- |
| dual payment contour in live (`create-payment` / `payment-webhook` alongside app-target pair) | open |

`book_class_with_access` no longer remains an open remediation item in this
document. The current canon accepts it as a narrow `SECURITY DEFINER` wrapper
because branch proof confirmed self-scoped booking behavior, canonical class
data persistence, and preserved APP contract, even though the advisor warning
remains at policy level.

`20260518205158` does not remain an open security blocker in this document. Its
current status belongs to release/schema reconciliation and is accepted there as
forward reconciliation.

---

## Правило для разработчиков

> Секреты живут только в Vault, deployment secrets и server-side runtime.
> `.env.example` не должен содержать настоящих секретов.
> Любой present-tense security verdict проверяйте по `CURRENT_TASKS.md` и
> `docs/LAUNCH_CHECKLIST.md`, а не по старым narrative docs.
