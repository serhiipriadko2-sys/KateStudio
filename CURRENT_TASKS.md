# Текущие задачи

> **Обновлено:** 25 мая 2026 | **Версия:** 5.6.3
> Источник истины: GitHub `main` + live Supabase metadata, function inventory, advisors и проверенные CI артефакты.
> Текущий режим: `release-hold` до закрытия migration-sync и current-main CI proof.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **41** | live `list_migrations` на 2026-05-23 reaches `20260518205158_create_dataset_runs_and_artifacts` |
| Repo/live tail reconciliation | **PARTIAL, STRATEGY FIXED** | exact match for `20260516182944`; semantic mappings exist for live `20260516202546` and `20260516202845`; unresolved delta `20260518205158` now has explicit additive reconstruction path |
| Live Edge Functions | **11** | Supabase `list_edge_functions` на 2026-05-23 |
| Live security advisors | **2 warnings** | `authenticated_security_definer_function_executable` для `book_class_with_access` + leaked password protection disabled |
| Live performance advisors | **warnings remain** | initplan + permissive-policy fan-out + unused indexes |
| Live APP payment tables | **present** | direct metadata confirms `payment_orders` and `user_passes` exist |
| Live APP payment traffic | **present** | app-target payment contour remains deployed and active |
| Live legacy payment pair | **still present** | `create-payment` and `payment-webhook` remain active |
| Live app-target payment pair | **present** | `create-yookassa-checkout` and `yookassa-webhook` are active |
| Fresh green CI on current `main` release path | **UNVERIFIED** | this pass did not obtain a fresh green run on the same current `main` ref |
| Latest verified green CI signal | **PR-only green** | PR `#498`, workflow `CI #1246`, all jobs green on PR head SHA `7bfcc466b08a5e2c4f097c7d5b4abadccbc37b73` |

Главное изменение по сравнению с предыдущим шагом: для unresolved delta `20260518205158` стратегия больше не обсуждается. В каноне зафиксирован `additive reconstruction path`.

---

## ✅ Что подтверждено

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Зафиксировать live baseline выше 16 мая | DONE | current live baseline is `41 migrations / 11 functions` |
| 2 | Подтвердить app-target payment contour в live | DONE | `create-yookassa-checkout` + `yookassa-webhook` remain active |
| 3 | Подтвердить repo/live совпадение по двум app-target payment functions | DONE | checked function code matches on inspected pair |
| 4 | Подтвердить один свежий green CI signal | DONE | PR `#498` / `CI #1246` passed lint, typecheck, tests, build:web, build:app |
| 5 | Сузить migration-sync uncertainty | DONE | live `20260516202546` maps semantically to repo `20260516211000`, and live `20260516202845` maps semantically to repo `20260516214500` |
| 6 | Закрыть Section 1 investigation path | DONE | unresolved delta `20260518205158` now has explicit reconciliation artifact instead of vague pending status |
| 7 | Зафиксировать стратегию для `20260518205158` | DONE | canonical path is now `additive reconstruction`, not open-ended search |
| 8 | Сохранить WEB non-payment canon | DONE | docs still keep WEB as storefront-only surface |

---

## 🔴 P0 — Текущие blockers

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 9 | Подготовить additive reconstruction artifact / migration-plan artifact для `20260518205158` | ⛔ | strategy is fixed, but execution-ready reconstruction artifact is still missing |
| 10 | Получить fresh green CI на том же current `main` ref | ⛔ | PR-only green does not substitute for release-path proof on the same `main` SHA |
| 11 | Разрешить dual payment contour | ⛔ | live still exposes both legacy and app-target payment pairs without explicit retirement criteria |
| 12 | Снять current live security warnings | ⛔ | `book_class_with_access` remains exposed as `SECURITY DEFINER` to `authenticated`; leaked password protection remains disabled |

---

## 🟠 P1 — Runtime and governance follow-up

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 13 | Разобрать `app_settings` public reads outside `studio_contacts` | ⏳ | prior runtime symptom remains unclosed in the canon |
| 14 | Разобрать empty `site_images` dataset | ⏳ | table exists, but operational intent is still not explicit |
| 15 | Явно зафиксировать canonical AI contour | ⏳ | live keeps `ai-run` / `ai-embeddings` alongside `gemini-proxy` |
| 16 | Обновить stale operational docs everywhere | ⏳ | older `38-migration` baseline must stop appearing as present-tense truth |

---

## 🟡 P2 — Техническая чистка после baseline reconciliation

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 17 | Полностью reconcile older repo/live migration history | ⏳ | one explicit parity pass across historical migrations still has value |
| 18 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this only after migration baseline is intentionally accepted |
| 19 | Reduce permissive-policy fan-out and initplan noise | ⏳ | performance advisors still flag hot tables including `payment_orders` and `user_passes` |

---

## Ближайший рабочий шаг

1. Prepare the additive reconstruction artifact or migration-plan artifact for `20260518205158`.
2. Obtain a fresh green CI run on the same current `main` SHA.
3. Decide whether the dual payment contour is an accepted transition window or an unwanted overlap.
4. Only after that, move from `FAIL` to `PARTIAL` or `PASS` in the release gate.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo/live docs coherence | PARTIAL |
| Live Supabase governance | PARTIAL |
| Migration-sync | PARTIAL with one explicitly tracked delta on additive reconstruction path |
| Live payment surface | PRESENT, but dual-contour |
| Live security advisors | **2 warnings remaining** |
| Fresh release-path CI | **UNVERIFIED on current `main`** |
| Overall launch readiness | **FAIL** until additive reconstruction artifact + current-main CI proof + payment/security decisions are resolved |