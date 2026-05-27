# Центральный индекс документации | KateStudio

> **Обновлено:** 27 мая 2026 | **Версия:** 9.3.4
> Рабочий канон: GitHub `main` + live Supabase metadata + current operational docs.

---

## Читать первым

- `CURRENT_TASKS.md` — актуальный operational backlog и честный статус запуска
- `docs/LAUNCH_CHECKLIST.md` — текущий go / no-go checklist
- `docs/RELEASE_EXECUTION_PACKET_2026_05_23.md` — единый execution packet по migration, CI, governance, security и финальному release gate
- `docs/EDGE_FUNCTIONS.md` — repo/live function inventory и drift map
- `docs/adr/ADR-2026-05-27-payment-contour-baseline.md` — canonical payment baseline: `WEB` storefront, `APP` real payment, legacy contour transitional baseline
- `docs/LEGACY_PAYMENT_RETIREMENT_DECISION_2026_05_27.md` — legacy payment contour now classified as retirement track
- `docs/LEGACY_PAYMENT_RETIREMENT_EXECUTION_PATH_2026_05_27.md` — controlled order, stop conditions and rollback checkpoints for live retirement
- `docs/ADMIN_SUBSCRIPTIONS_SURFACE_DECISION_2026_05_27.md` — admin legacy subscriptions surface is still a temporary bridge
- `docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md` — temporary acceptance and remediation path for the live `SECURITY DEFINER` RPC warning
- `docs/SECURITY_DECISION_LEAKED_PASSWORD_PROTECTION_2026_05_27.md` — explicit defer note and verification path for leaked password protection
- `docs/MIGRATION_FORWARD_SCHEMA_ARTIFACT_PROPOSAL_20260518205158.md` — forward artifact proposal for `dataset_runs` / `dataset_artifacts`
- `docs/RELEASE_GATE_2026_05_27.md` — current release gate receipt for repo/live checks
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` — historical bridge audit; не использовать как единственный current snapshot

---

## Рабочая документация

| Документ | Роль |
| --- | --- |
| `CURRENT_TASKS.md` | короткий оперативный канон |
| `docs/ARCHITECTURE.md` | структура monorepo, runtime contour, repo/live split |
| `docs/EDGE_FUNCTIONS.md` | function inventory и drift map |
| `docs/LAUNCH_CHECKLIST.md` | release readiness и blockers |
| `docs/RELEASE_EXECUTION_PACKET_2026_05_23.md` | пошаговый execution packet по текущим blockers |
| `docs/MIGRATION_SYNC_2026_05_23.md` | Git-tracked reconciliation path по live migration tail |
| `docs/adr/ADR-2026-05-27-payment-contour-baseline.md` | canonical payment baseline and governance decision |
| `docs/LEGACY_PAYMENT_RETIREMENT_DECISION_2026_05_27.md` | retirement-track decision for legacy payment contour |
| `docs/LEGACY_PAYMENT_RETIREMENT_EXECUTION_PATH_2026_05_27.md` | staged live retirement path for legacy payment contour |
| `docs/ADMIN_SUBSCRIPTIONS_SURFACE_DECISION_2026_05_27.md` | governance decision for legacy admin subscriptions surface |
| `docs/SECURITY_DECISION_BOOK_CLASS_WITH_ACCESS_2026_05_27.md` | temporary acceptance and remediation path for RPC security warning |
| `docs/SECURITY_DECISION_LEAKED_PASSWORD_PROTECTION_2026_05_27.md` | deferred live Auth setting decision with owner/expiry |
| `docs/MIGRATION_FORWARD_SCHEMA_ARTIFACT_PROPOSAL_20260518205158.md` | forward schema artifact proposal for the live-only dataset delta |
| `docs/RELEASE_GATE_2026_05_27.md` | current release gate receipt |
| `docs/PAYMENT_CONTOUR_DECISION_TEMPLATE.md` | template для решения по dual payment contour |
| `docs/SECURITY_DECISION_TEMPLATE_BOOK_CLASS_WITH_ACCESS.md` | template для security decision note по RPC warning |
| `docs/SECURITY_DECISION_TEMPLATE_LEAKED_PASSWORD_PROTECTION.md` | template для security decision note по Auth setting |
| `docs/RELEASE_GATE_WORKSHEET_TEMPLATE.md` | one-pass worksheet для финального release gate |
| `docs/APP_ONLY_YOOKASSA_CUTOVER_PLAN.md` | app-only payment cutover, rollback и verification order |
| `docs/ANDROID_STORE_READINESS.md` | Android publish path для Google Play и RuStore |
| `docs/TESTING.md` | test truth и ограничения проверки |
| `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` | historical bridge audit with 2026-05-23 drift note |
| `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md` | исторический audit snapshot, не текущий present-tense canon |

---

## Agent governance

| Document | Purpose |
| --- | --- |
| [docs/CHATGPT_AGENT_RUNTIME.md](./CHATGPT_AGENT_RUNTIME.md) | Canonical builder-runtime governance for the ChatGPT KateStudio agent |

---

## Что считать историческим, а не текущим operational truth

Следующие документы остаются полезными как история, но не должны считаться текущим operational truth без fresh check:

- `docs/SUPABASE_AUDIT_LIVE_2026_05_02.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_10.md`
- `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` как самостоятельный current snapshot без drift note от 2026-05-23

Причина: current live baseline уже выше старого refresh pack и now reaches **41 applied migrations**.

---

## Быстрые факты на 27 мая 2026

| Домен | Значение |
| --- | --- |
| Live applied migrations | 41 |
| Repo-confirmed live-tail migrations | PARTIAL + forward artifact proposal |
| Repo functions | 9 |
| Live functions | 11 |
| Live-only functions | `ai-run`, `ai-embeddings` |
| APP-target payment pair in live | present |
| Legacy payment contour status | retirement track |
| Legacy admin subscriptions surface | temporary bridge |
| Live security advisors | `2 warnings`, decision notes exist |
| Current-main CI proof policy | verify the latest pushed SHA in GitHub Actions after publication |
| Latest verified green CI baseline | SHA `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`, workflow run `26508804416` |
| Payment business canon | WEB non-payment, APP payment, RuStore publication/proof |

---

## Рабочее правило

Не использовать один документ как абсолютную истину. Для KateStudio сейчас truth собирается из трёх слоёв:

1. GitHub `main` как truth по repo intent.
2. Supabase live metadata как truth по deployed state.
3. `CURRENT_TASKS.md` + `docs/LAUNCH_CHECKLIST.md` + `docs/RELEASE_EXECUTION_PACKET_2026_05_23.md` как текущий operational synthesis.

Если документ говорит о текущем live state, он должен быть совместим с live baseline `41` и явно не маскировать `migration-sync` / CI gaps. Иначе это исторический документ, а не present-tense truth.
