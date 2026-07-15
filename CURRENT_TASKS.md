# Текущие задачи

> **Update 2026-06-16:** governance and memory-stack sync after full sweep.
> Stale operational canon reconciled to live/code state.
> Three new HIGH-RISK security items identified and queued for fix.

> **Обновлено:** 16 июня 2026 | **Версия:** 5.7.0
> Источник истины: GitHub `main` + live Supabase metadata, function inventory,
> advisors, verified CI артефакты, и memory stack (`project-memory.md`, `open-loops.md`).
> Текущий режим: `release-candidate / post-retirement canon sync / memory-stack active`.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **41** | live `list_migrations` reaches `20260530155036_security_reconcile_grants_search_path_book_class_ledger` |
| Repo/live tail reconciliation | **ACCEPTED** | `20260518205158` covered by forward reconciliation; `20260530155036` reconciled in repo and live |
| Live Edge Functions | **12** | Supabase `list_edge_functions` |
| Live security advisors | **INFO/WARN hygiene only** | no WARN blockers after 2026-05-30 reconciliation; remaining lints are permissive-policy clutter and initplan hints |
| Fresh same-ref release gate | **VERIFIED** | `docs/RELEASE_EVIDENCE_2026_05_30.md` — CI run `26588248604` on SHA `cd0e0d871603329bf6173c7275230851b8cb76fb`, 9 checks green |
| Latest deploy receipts | **VERIFIED** | Pages `26588248681`, Firebase `26588248787` |
| Live APP payment tables | **present** | `payment_orders`, `user_passes` |
| Live legacy payment trio | **retired in place** | `create-payment`, `payment-webhook`, `cancel-subscription` return controlled 410 stubs |
| Live app-target payment pair | **canonical** | `create-yookassa-checkout` + `yookassa-webhook` |
| Live booking contour | **Edge Function + internal RPC** | `book-class-with-access` v7 (`verify_jwt=true`) → `book_class_with_access_internal` (service-role-only) |
| Memory stack | **active** | `project-memory.md`, `open-loops.md`, `adr-log.md`, `development-diary.md`, `evidence-index.md` in use |

---

## ✅ Что подтверждено

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Зафиксировать live baseline выше 16 мая | DONE | current live baseline remains `41 migrations / 12 functions` |
| 2 | Подтвердить app-target payment contour в live | DONE | `create-yookassa-checkout` + `yookassa-webhook` remain active |
| 3 | Подтвердить repo/live совпадение по app-target payment schema surface | DONE | `payment_orders` and `user_passes` are present in live and tracked in repo canon |
| 4 | Сузить migration-sync uncertainty | DONE | live `20260516202546` and `20260516202845` semantically mapped to repo files; `20260530155036` reconciled |
| 5 | Зафиксировать verdict по `20260518205158` | DONE | live delta treated as accepted forward reconciliation |
| 6 | Сохранить WEB non-payment canon | DONE | docs keep WEB as storefront-only surface |
| 7 | Закрыть dual payment contour как live blocker | DONE | legacy trio retired in place |
| 8 | Пересобрать fresh same-ref release gate | DONE | verified by `docs/RELEASE_EVIDENCE_2026_05_30.md` / CI run `26588248604` |
| 9 | Синхронизировать operational canon с book-class Edge Function design | DONE | ADR-2026-05-27 superseded; `book_class_with_access` is service-role-only internal RPC |
| 10 | Реализовать memory stack | DONE | files created/updated per `adr-log.md` ADR-2026-06-16-001 |

---

## 🔴 Бывшие HIGH-RISK blockers (Устранены)

| # | Задача | Статус | Почему это открыто |
| --- | --- | --- | --- |
| 1 | Выровнять `supabase/config.toml` project_id с live ref | ✅ DONE | Выполнено (отражено в main) |
| 2 | Добавить least-privilege `permissions:` в workflow-файлы | ✅ DONE | Выполнено (отражено в main) |
| 3 | Убрать plaintext password logging из `scripts/create-admin.ts` | ✅ DONE | Выполнено (отражено в main) |

---

## 🟠 Background follow-up (non-gating in this pass)

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 4 | Разобрать `app_settings` public reads outside `studio_contacts` | ⏳ | keep as runtime/governance follow-up |
| 5 | Разобрать empty `site_images` dataset | ⏳ | accepted as non-blocking |
| 6 | Явно зафиксировать canonical AI contour | ⏳ | live keeps `ai-run` / `ai-embeddings` alongside `gemini-proxy` |
| 7 | Полностью reconcile older repo/live migration history | ⏳ | useful hygiene, not gating |
| 8 | Regenerate `shared/types/database.types.ts` | ⏳ | do after broader baseline housekeeping |
| 9 | Reduce permissive-policy fan-out and initplan noise | ⏳ | performance advisors remain non-gating |
| 10 | Добавить e2e smoke tests | ⏳ | reduces manual release-gate work |
| 11 | Разобрать skill overlap между `.agents/.claude/.codex` и `skills/*.yaml` | ⏳ | governance hygiene |

---

## Ближайший рабочий шаг

- [x] Три HIGH-RISK security item-а закрыты в `main` (проверено 2026-07-15).
- Разобрать оставшиеся Medium-Risk items (RLS, выбор AI-контура, smoke тесты).

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo/live docs coherence | PASS after this sync (monitor for new drift) |
| Live Supabase governance | PASS at security-blocker level; INFO/WARN hygiene remains |
| Migration-sync | ACCEPTED with explicit forward reconciliation |
| Live payment surface | CANONICAL APP-TARGET; legacy trio retired in place |
| Live security advisors | NO WARN BLOCKERS; hygiene notices remain |
| Launch readiness | **PASS** with three queued security fixes before next production change |
