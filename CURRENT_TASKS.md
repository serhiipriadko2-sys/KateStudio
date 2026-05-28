# Текущие задачи

> **Update 2026-05-28:** targeted reconciliation pass for live delta
> `20260518205158_create_dataset_runs_and_artifacts` is now accepted as
> **forward reconciliation**, not an open release blocker. Current release/security
> focus is narrowed to one live issue only: dual payment contour retirement.

> **Обновлено:** 28 мая 2026 | **Версия:** 5.6.4
> Источник истины: GitHub `main` + live Supabase metadata, function inventory,
> advisors и проверенные CI артефакты.
> Текущий режим: `release-candidate / targeted live remediation`.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **41** | live `list_migrations` reaches `20260518205158_create_dataset_runs_and_artifacts` |
| Repo/live tail reconciliation | **PARTIAL, ACCEPTED FORWARD RECONCILIATION** | exact match for `20260516182944`; semantic mappings exist for `20260516202546` and `20260516202845`; `20260518205158` is now covered by accepted forward reconciliation artifact `20260527174716_reconcile_dataset_runs_artifacts_forward.sql` |
| Live Edge Functions | **11** | Supabase `list_edge_functions` |
| Live security advisors | **1 warning** | `book_class_with_access` remains flagged as authenticated security-definer RPC, but is now accepted in canon as a narrow wrapper with branch-proof evidence |
| Live performance advisors | **warnings remain** | initplan + permissive-policy fan-out + unused indexes; non-gating in this pass |
| Live APP payment tables | **present** | direct metadata confirms `payment_orders` and `user_passes` exist |
| Live legacy payment pair | **still present** | `create-payment` and `payment-webhook` remain active |
| Live app-target payment pair | **present** | `create-yookassa-checkout` and `yookassa-webhook` remain active |
| Fresh green CI on current `main` release path | **UNVERIFIED IN THIS PASS** | not re-checked in the current targeted reconciliation pass |
| Latest verified green CI signal | **repo evidence exists** | current canon keeps prior green release-path evidence; CI is not the primary blocker in this pass |

Главное изменение по сравнению с предыдущим каноном: `20260518205158` больше не
держится как open migration blocker. Для него принят путь
`accepted forward reconciliation`.

Второе важное изменение: `book_class_with_access` больше не держится как
неопределённое accepted-risk окно. В текущем каноне он принят как narrow
`SECURITY DEFINER` wrapper с branch-proof evidence и сохранённым APP contract.

---

## ✅ Что подтверждено

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Зафиксировать live baseline выше 16 мая | DONE | current live baseline remains `41 migrations / 11 functions` |
| 2 | Подтвердить app-target payment contour в live | DONE | `create-yookassa-checkout` + `yookassa-webhook` remain active |
| 3 | Подтвердить repo/live совпадение по app-target payment schema surface | DONE | `payment_orders` and `user_passes` are present in live and tracked in repo canon |
| 4 | Сузить migration-sync uncertainty | DONE | live `20260516202546` and `20260516202845` remain semantically mapped to repo files |
| 5 | Зафиксировать verdict по `20260518205158` | DONE | live delta is now treated as **accepted forward reconciliation**, not as an unresolved blocker |
| 6 | Сохранить WEB non-payment canon | DONE | docs still keep WEB as storefront-only surface |
| 7 | Подтвердить текущий live security tail | DONE | only `book_class_with_access` remains in security advisors, and its wrapper posture is now accepted in canon |
| 8 | Подтвердить dual payment contour как live governance issue | DONE | legacy and app-target payment pairs remain live side-by-side |
| 9 | Принять branch-proof verdict по `book_class_with_access` | DONE | narrow `SECURITY DEFINER` wrapper accepted with canonical-class persistence and self-scoped pass usage evidence |

---

## 🔴 Открытые release/security blockers

| # | Задача | Статус | Почему это открыто |
| --- | --- | --- | --- |
| 1 | Разрешить dual payment contour | ⏳ | stale WEB `create-payment` caller removed; live legacy functions still need staged retirement or explicit transition-window acceptance |

---

## 🟠 Background follow-up (non-gating in this pass)

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 2 | Разобрать `app_settings` public reads outside `studio_contacts` | ⏳ | keep as runtime/governance follow-up, not as current release blocker |
| 3 | Разобрать empty `site_images` dataset | ⏳ | accepted as non-blocking in current runtime posture |
| 4 | Явно зафиксировать canonical AI contour | ⏳ | live keeps `ai-run` / `ai-embeddings` alongside `gemini-proxy` |
| 5 | Полностью reconcile older repo/live migration history | ⏳ | still useful for long-term hygiene, but `20260518205158` is no longer gating |
| 6 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this only after broader baseline housekeeping is intentionally scheduled |
| 7 | Reduce permissive-policy fan-out and initplan noise | ⏳ | performance advisors remain non-gating in this pass |

---

## Ближайший рабочий шаг

1. Retire legacy payment functions (`create-payment`, `payment-webhook`, `cancel-subscription`) in staged order after one final function inventory and APP YooKassa smoke.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo/live docs coherence | PARTIAL, but `20260518205158` and `book_class_with_access` are now reconciled in canon |
| Live Supabase governance | PARTIAL |
| Migration-sync | PARTIAL with accepted forward reconciliation for `20260518205158` |
| Live payment surface | PRESENT, but dual-contour |
| Live security advisors | **1 warning remaining** (`book_class_with_access`, accepted in canon as narrow wrapper) |
| Overall launch readiness | **PARTIAL** until dual payment contour is resolved or explicitly accepted at release time, and fresh same-ref CI proof is attached |
