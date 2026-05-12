# Центральный индекс документации | KateStudio

> **Обновлено:** 12 мая 2026 | **Версия:** 9.2.0
> Рабочий канон: refresh pack `2026-05-12` + live Supabase metadata + GitHub `main`.

---

## Читать первым

- `CURRENT_TASKS.md` — актуальный operational backlog и честный статус запуска
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` — canonical live audit на дату 2026-05-12
- `docs/LAUNCH_CHECKLIST.md` — go / no-go checklist после обновления facts
- `docs/APP_ONLY_YOOKASSA_CUTOVER_PLAN.md` — safe path для перевода APP на app-only YooKassa contour

---

## Рабочая документация

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | короткий оперативный канон |
| `docs/ARCHITECTURE.md` | структура monorepo, runtime contour, repo/live split |
| `docs/EDGE_FUNCTIONS.md` | function inventory и drift map |
| `docs/LAUNCH_CHECKLIST.md` | release readiness и blockers |
| `docs/APP_ONLY_YOOKASSA_CUTOVER_PLAN.md` | app-only payment cutover, rollback и verification order |
| `docs/ANDROID_STORE_READINESS.md` | Android publish path для Google Play и RuStore |
| `docs/TESTING.md` | test truth и ограничения проверки |
| `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` | текущий canonical live Supabase audit |
| `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md` | исторический audit snapshot, не текущий present-tense canon |

---

## Что считать историческим, а не текущим operational truth

Следующие документы остаются полезными как история, но не должны считаться текущим operational truth без fresh check:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md`

Причина: они фиксируют более ранние live checkpoints. На 2026-05-12 canonical present-tense snapshot уже другой: live applied migrations = `37`, `profiles` hardening уже отражён в live history, и security headline сузился до leaked-password protection.

---

## Быстрые факты на 12 мая 2026

| Домен | Значение |
| --- | --- |
| Repo migrations | 42 |
| Live applied migrations | 37 |
| Repo functions | 9 |
| Live functions | 9 |
| Live-only functions | `ai-run`, `ai-embeddings` |
| Repo-only functions | `create-yookassa-checkout`, `yookassa-webhook` |
| Live security advisors | `1 warning` |
| Payment business canon | WEB non-payment, APP payment, RuStore publication/proof |

---

## Рабочее правило

Не использовать один документ как абсолютную истину. Для KateStudio сейчас truth собирается из трёх слоёв:

1. GitHub `main` как truth по repo intent.
2. Supabase live metadata как truth по deployed state.
3. Refresh pack `2026-05-12` как мост между ними.

Если документ говорит о текущем live state, он должен быть совместим с canonical snapshot `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`. Иначе это исторический документ, а не present-tense truth.