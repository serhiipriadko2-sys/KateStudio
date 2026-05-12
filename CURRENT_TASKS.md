# Текущие задачи

> **Обновлено:** 12 мая 2026 | **Версия:** 5.2.0
> Источник истины: GitHub `main` + live Supabase metadata/advisors/logs.
> Текущий режим: controlled production hardening. 12 мая 2026 был выполнен узкий live security pass и сразу записан в `main`.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **30** | Supabase MCP `list_migrations` after 2026-05-12 pass |
| Live Edge Functions | **9** | Supabase MCP `list_edge_functions` |
| Live security advisors | **1 warning** | after `missing_security_deltas`, only leaked-password protection remains |
| Live performance advisors | **warnings remain** | mostly unused indexes + multiple permissive policy fan-out |
| 2026-05-12 new live migration recorded in repo | **1** | `20260512062001_missing_security_deltas.sql` committed to `main` |
| 2026-05-12 repo-side runtime fix merged | **PR #492** | `Fix/public settings site images drift` merged into `main` |
| 2026-05-12 auth UX hardening for weak/leaked passwords | **DONE in repo** | WEB/APP/reset flows now surface explicit password-policy guidance before the Supabase Auth toggle |
| Fresh CI evidence on merged PR #492 | **RED** | workflow run `CI #1190` failed on `Run Tests`; lint and typecheck passed |
| Concrete failing test | **1 failed / 512 passed** | `shared/__tests__/imageStorage.test.ts` → `returns saved image url when present` |
| Web/App builds on PR #492 | **not reached** | `Build WEB` and `Build APP` were skipped because test job failed |

Главное изменение: live больше не держит warnings around GraphQL discoverability or `vector` in `public`. После 2026-05-12 pass security surface materially tightened: `pg_graphql` removed, `vector` moved to `extensions`, and the remaining security warning is now only leaked password protection in Supabase Auth. Отдельно, repo-side auth flows now surface explicit weak/leaked password guidance, so the remaining gap on this security axis is the live Supabase Auth toggle itself rather than mixed repo/runtime ambiguity. PR #492 сузил repo-side runtime probes for `app_settings` and `site_images`, но live API logs всё ещё показывают остаточные `401` / `406` вне уже суженного happy path. Verification gap тоже уточнился: это уже не отсутствие данных, а подтвержденный red CI on the merged PR path.

---

## ✅ Что уже закрыто

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Убрать dangerous `profiles` public drift | DONE | legacy `profiles` public policy / legacy `is_admin` drift were closed earlier and still do not resurface |
| 2 | Закрыть dead permissive AI insert policies | DONE | removed `ai_jobs_service_insert` and `api_logs_insert_service` |
| 3 | Закрыть unindexed FK findings on current AI + bookings path | DONE | added indexes for `ai_jobs`, `api_logs`, `bookings`, `prompt_requests` |
| 4 | Снизить RLS planner churn on hot self-access tables | DONE | initplan-friendly rewrites applied on the current hot path |
| 5 | Сохранить live 2026-05-11 hardening steps в repo canon | DONE | previous live hardening migrations recorded in `main` |
| 6 | Убрать GraphQL discoverability surface | DONE | `pg_graphql` removed from live and the warning set collapsed |
| 7 | Убрать `vector` extension из `public` | DONE | `vector` now lives in `extensions` |
| 8 | Сохранить 2026-05-12 security delta в repo canon | DONE | `20260512062001_missing_security_deltas.sql` committed to `main` |
| 9 | Подготовить repo-side auth UX к leaked-password enforcement | DONE | WEB/APP/reset flows now distinguish weak and compromised passwords instead of collapsing them into generic auth failures |
| 10 | Stabilize `imageStorage` test drift | DONE | test now loads `imageStorage` after the mocked `supabase` boundary instead of relying on brittle import order |

---

## 🔴 P0 — Оставшиеся launch blockers

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 11 | Разрешить payment/function canon split | ⛔ | APP `paymentService` is wired to repo-only `create-yookassa-checkout`, while live inventory exposes `create-payment`; live schema inventory also does not include `payment_orders` / `user_passes` |
| 12 | Починить red CI на текущем release path | ⛔ | fresh `CI #1190` on merged PR #492 failed in `Run Tests`; `shared/__tests__/imageStorage.test.ts` expects a URL but receives `null` |
| 13 | Включить leaked password protection в live Supabase Auth | ⛔ | the only remaining live security advisor warning is Supabase Auth leaked-password protection disabled; repo-side UX handling is now in place |

---

## 🟠 P1 — Smoke findings and operational follow-up

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 14 | Разобрать remaining `app_settings` query drift | ⏳ | `studio_contacts` read now returns `200`, but live logs still show `401` on generic `select=key,value` and `406` on `key=eq.image_map` |
| 15 | Разобрать repeated `site_images` misses | ⏳ | `site_images` still has `0` live rows and logs still show repeated `406` lookups across hero/gallery/avatar keys |
| 16 | Разобрать stale client probes for absent tables | ⏳ | live API logs still show repeated `404` on `payment_orders` and `user_passes` from real browser traffic |

---

## 🟡 P2 — Техническая чистка после релизного прохода

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 17 | Полностью reconcile older repo/live migration history | ⏳ | current live baseline is now 30, but older history still deserves one explicit inventory pass |
| 18 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this only after migration truth is intentionally settled |
| 19 | Reduce duplicate permissive policies on content/admin tables | ⏳ | performance advisor still shows fan-out on `app_settings`, `articles`, `bookings`, `retreats`, `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos`, others |
| 20 | Revisit unused-index noise after real traffic appears | ⏳ | current unused-index findings are not launch blockers on a low-traffic dataset |

---

## Ближайший рабочий шаг

1. Re-run CI until `check:migrations`, `lint`, `typecheck`, `test:run`, `build:web`, and `build:app` are all green.
2. Enable leaked password protection in Supabase Auth.
3. Verify weak signup, compromised reset, and sign-in with an old weak password against the new UX copy.
4. Decide payment canon: migrate APP from `create-yookassa-checkout` to `create-payment`, or explicitly accept YooKassa-only rollout and deploy the missing live functions/tables.
5. Decide canonical AI surface and whether `ai-run` / `ai-embeddings` remain intentionally live-only beside dormant `gemini-proxy`.
6. Triage the remaining public runtime probes: generic `app_settings`, missing `image_map`, empty `site_images`, and `404` probes for `payment_orders` / `user_passes`.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo documentation coherence | IMPROVED, closer to live truth |
| Live Supabase governance | STRONG PARTIAL PASS |
| Live security advisors | **1 warning remaining** |
| Public smoke signal | MIXED, narrower after PR #492 but still not clean |
| Release-path CI | RED until fresh green evidence exists |
| Overall launch readiness | **FAIL** |
