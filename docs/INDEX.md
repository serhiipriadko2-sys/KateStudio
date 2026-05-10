# Центральный индекс документации | KateStudio

> **Обновлено:** 10 мая 2026 | **Версия:** 9.0.0
> Рабочий канон: этот refresh pack + live Supabase metadata + GitHub `main`.

---

## Читать первым

- `CURRENT_TASKS.md` — актуальный operational backlog и честный статус запуска
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md` — новый live audit на дату 2026-05-10
- `docs/LAUNCH_CHECKLIST.md` — go / no-go checklist после обновления facts

---

## Рабочая документация

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | короткий оперативный канон |
| `docs/ARCHITECTURE.md` | структура monorepo, runtime contour, repo/live split |
| `docs/EDGE_FUNCTIONS.md` | function inventory и drift map |
| `docs/LAUNCH_CHECKLIST.md` | release readiness и blockers |
| `docs/TESTING.md` | test truth и ограничения проверки |
| `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md` | полный live Supabase audit |

---

## Что считать устаревшим

Следующие документы остаются полезными как история, но не должны считаться текущим operational truth без сверки:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- текущий repo `docs/INDEX.md` от 2026-05-02
- текущий repo `docs/ARCHITECTURE.md` от 2026-03-15
- текущий repo `docs/EDGE_FUNCTIONS.md` от 2026-03-15
- текущий repo `docs/TESTING.md` от 2026-03-15

Причина: они фиксируют состояние до trainer migrations и до live deployment wave от 2026-05-09/10.

---

## Быстрые факты на 10 мая 2026

| Домен | Значение |
| --- | --- |
| Repo migrations | 42 |
| Live applied migrations | 14 |
| Repo functions | 9 |
| Live functions | 9 |
| Live-only functions | `ai-run`, `ai-embeddings` |
| Repo-only functions | `create-yookassa-checkout`, `yookassa-webhook` |
| Persistent P0 | `profiles` public `ALL true/true` policy |

---

## Рабочее правило

Не использовать один документ как абсолютную истину. Для KateStudio сейчас truth собирается из трёх слоёв:

1. GitHub `main` как truth по repo intent.
2. Supabase live metadata как truth по deployed state.
3. Refresh pack 2026-05-10 как мост между ними.
