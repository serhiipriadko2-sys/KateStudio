# Текущие задачи

> **Update 2026-05-27 (pass #2, 21:40 MSK):** All 7 local gates PASS on HEAD `3ff4971`
> (72 files / 503 tests). ADRs created for both live security warnings with
> expiry dates. Legacy payment caller inventory complete: 0 repo-side callers.
> `book_class_with_access` function body verified via `pg_get_functiondef` —
> `auth.uid()` guard confirmed. Status: **release-candidate ready / live
> remediation in progress**. Production PASS withheld until leaked password
> protection is enabled (by 2026-06-03) and legacy payment functions are retired.
> Current receipts: `docs/RELEASE_GATE_2026_05_27.md` and
> `docs/LIVE_REMEDIATION_PACKET_2026_05_27.md`.
> ADRs: `docs/adr/ADR-2026-05-27-book-class-security-definer-accepted-risk.md`,
> `docs/adr/ADR-2026-05-27-leaked-password-protection-pending.md`.

> **Обновлено:** 25 мая 2026 | **Версия:** 5.6.3
> Источник истины: GitHub `main` + live Supabase metadata, function inventory, advisors и проверенные CI артефакты.
> Текущий режим: `release-hold` до закрытия migration-sync и current-main CI proof.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **41** | live `list_migrations` на 2026-05-23 reaches `20260518205158_create_dataset_runs_and_artifacts` |
| Repo/live tail reconciliation | **PARTIAL, FORWARD CANDIDATE READY** | exact match for `20260516182944`; semantic mappings exist for live `20260516202546` and `20260516202845`; unresolved delta `20260518205158` now has explicit forward migration candidate |
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
| 9 | Подготовить additive reconstruction artifact / migration-plan artifact для `20260518205158` | ✅ | forward migration candidate `20260527174716_reconcile_dataset_runs_artifacts_forward.sql` exists |
| 10 | Получить fresh green CI на том же current `main` ref | ✅ | current `main` `dbd8f2b` passed CI/deploy after release-format fix |
| 11 | Разрешить dual payment contour | ⏳ | stale WEB `create-payment` caller removed; live legacy functions still need staged retirement |
| 12 | Снять current live security warnings | ⏳ | leaked password: ADR expires 2026-06-03, manual Dashboard action required; `book_class_with_access`: ADR accepted until 2026-06-10, function body verified safe (`auth.uid()` guard confirmed) |

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

1. Enable leaked password protection through Supabase Dashboard → Authentication → Sign In / Providers → Email → Password security. Verify signup/login/reset. Re-run advisors.
2. Retire legacy payment functions (`create-payment`, `payment-webhook`, `cancel-subscription`) in staged order — 0 repo-side callers confirmed.
3. Optionally prepare Edge Function wrapper for `book_class_with_access` (not blocking until 2026-06-10 ADR expiry).
4. After steps 1-2: re-run full local gates + push to `main` + verify GitHub Actions.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo/live docs coherence | PARTIAL |
| Live Supabase governance | PARTIAL |
| Migration-sync | PARTIAL with forward migration candidate |
| Live payment surface | PRESENT, but dual-contour (0 repo-side callers on legacy) |
| Live security advisors | **2 warnings remaining** (both have ADRs with expiry dates) |
| Fresh release-path CI | **PASS on HEAD `3ff4971` (local gates), pre-pub baseline `dbd8f2b` (GitHub CI)** |
| Overall launch readiness | **PARTIAL** until leaked password protection enabled + legacy payment retired |
