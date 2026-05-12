# Текущие задачи

> **Обновлено:** 12 мая 2026 | **Версия:** 5.4.0
> Источник истины: GitHub `main` + live Supabase metadata/advisors/logs.
> Текущий режим: controlled production hardening. 12 мая 2026 выполнены узкий live security pass, repo-side runtime/doc sync и фиксация canonical live snapshot.

---

## Верифицированный снимок состояния

| Метрика | Значение | Основание |
| --- | --- | --- |
| Live applied migrations | **37** | Supabase MCP `list_migrations` on 2026-05-12 |
| Live Edge Functions | **9** | Supabase MCP `list_edge_functions` on 2026-05-12 |
| Live security advisors | **1 warning** | after `missing_security_deltas`, only leaked-password protection remains |
| Live performance advisors | **warnings remain** | mostly unused indexes + multiple permissive policy fan-out |
| 2026-05-12 new live migration recorded in repo | **1** | `20260512062001_missing_security_deltas.sql` committed to `main` |
| 2026-05-12 repo-side runtime fix merged | **PR #492** | `Fix/public settings site images drift` merged into `main` |
| 2026-05-12 auth UX hardening for weak/leaked passwords | **DONE in repo** | WEB/APP/reset flows now surface explicit password-policy guidance before the Supabase Auth toggle |
| 2026-05-12 doc/live reconciliation | **DONE in repo** | canonical docs now point to `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md` instead of mixed `14/30` live baselines |
| Android native build path in repo | **PARTIAL READY** | Capacitor 8 + Android release workflow already exist; target API 35 and signed store artifact still need proof |
| Fresh CI evidence on merged PR #492 | **RED** | workflow run `CI #1190` failed on `Run Tests`; lint and typecheck passed |
| Concrete failing test | **1 failed / 512 passed** | `shared/__tests__/imageStorage.test.ts` → `returns saved image url when present` |
| Web/App builds on PR #492 | **not reached** | `Build WEB` and `Build APP` were skipped because test job failed |

Главное изменение: live больше не держит warnings around GraphQL discoverability or `vector` in `public`, а docs больше не должны говорить о current live baseline как о `14` или `30` applied migrations. После 2026-05-12 pass security surface materially tightened: `pg_graphql` removed, `vector` moved to `extensions`, `profiles` hardening отражён в live migration history, и remaining security warning теперь только leaked password protection in Supabase Auth. Repo-side auth flows already surface explicit weak/leaked password guidance, so the remaining gap on this security axis is the live Supabase Auth toggle itself. Payment and runtime smoke drift, however, still remain open.

---

## ✅ Что уже закрыто

| # | Задача | Статус | Что изменилось |
| --- | --- | --- | --- |
| 1 | Убрать dangerous `profiles` public drift | DONE | live history now includes `profiles_public_policy_hotfix`, `profiles_drop_legacy_is_admin`, and `profiles_contract_alignment_user_id_primary` |
| 2 | Закрыть dead permissive AI insert policies | DONE | removed `ai_jobs_service_insert` and `api_logs_insert_service` |
| 3 | Закрыть unindexed FK findings on current AI + bookings path | DONE | added indexes for `ai_jobs`, `api_logs`, `bookings`, `prompt_requests` |
| 4 | Снизить RLS planner churn on hot self-access tables | DONE | initplan-friendly rewrites applied on the current hot path |
| 5 | Сохранить live 2026-05-11 hardening steps в repo canon | DONE | previous live hardening migrations recorded in `main` |
| 6 | Убрать GraphQL discoverability surface | DONE | `pg_graphql` removed from live and the warning set collapsed |
| 7 | Убрать `vector` extension из `public` | DONE | `vector` now lives in `extensions` |
| 8 | Сохранить 2026-05-12 security delta в repo canon | DONE | `20260512062001_missing_security_deltas.sql` committed to `main` |
| 9 | Подготовить repo-side auth UX к leaked-password enforcement | DONE | WEB/APP/reset flows now distinguish weak and compromised passwords instead of collapsing them into generic auth failures |
| 10 | Stabilize `imageStorage` test drift | DONE | test now loads `imageStorage` after the mocked `supabase` boundary instead of relying on brittle import order |
| 11 | Record Android store readiness path | DONE | repo now has a dedicated Android store checklist covering Capacitor build path, signing secrets, store artifacts, and remaining blockers |
| 12 | Fix business payment canon in docs | DONE | WEB is storefront-only, APP owns YooKassa, RuStore is publication/proof layer |
| 13 | Record app-only YooKassa cutover plan | DONE | `docs/APP_ONLY_YOOKASSA_CUTOVER_PLAN.md` now defines order, rollback, and verification gates |
| 14 | Remove mixed live baselines from operational docs | DONE | current docs no longer present `14` or `30` as the present-tense live migration count |

---

## 🔴 P0 — Оставшиеся launch blockers

| # | Задача | Статус | Почему это P0 |
| --- | --- | --- | --- |
| 15 | Разрешить APP payment cutover drift | ⛔ | APP `paymentService` is wired to repo-only `create-yookassa-checkout`, while live inventory still exposes `create-payment`; live schema inventory also does not include `payment_orders` / `user_passes` |
| 16 | Починить red CI на текущем release path | ⛔ | fresh `CI #1190` on merged PR #492 failed in `Run Tests`; `shared/__tests__/imageStorage.test.ts` expects a URL but receives `null` |
| 17 | Включить leaked password protection в live Supabase Auth | ⛔ | the only remaining live security advisor warning is Supabase Auth leaked-password protection disabled; repo-side UX handling is now in place |

---

## 🟠 P1 — Smoke findings and operational follow-up

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 18 | Доказать Android publish readiness для store artifact | ⏳ | build workflow exists, but target API 35 and signed release output still need one explicit proof run |
| 19 | Разобрать remaining `app_settings` query drift | ⏳ | `studio_contacts` read now returns `200`, but live logs still show `401` on generic `select=key,value` and `406` on `key=eq.image_map` |
| 20 | Разобрать repeated `site_images` misses | ⏳ | `site_images` still has `0` live rows and logs still show repeated `406` lookups across hero/gallery/avatar keys |
| 21 | Разобрать stale client probes for absent tables | ⏳ | live API logs still show repeated `404` on `payment_orders` and `user_passes` from real browser traffic |

---

## 🟡 P2 — Техническая чистка после релизного прохода

| # | Задача | Статус | Примечание |
| --- | --- | --- | --- |
| 22 | Полностью reconcile older repo/live migration history | ⏳ | current live baseline is now 37, but older history still deserves one explicit inventory pass |
| 23 | Regenerate `shared/types/database.types.ts` after accepted baseline | ⏳ | do this only after migration truth is intentionally settled |
| 24 | Reduce duplicate permissive policies on content/admin tables | ⏳ | performance advisor still shows fan-out on `app_settings`, `articles`, `bookings`, `retreats`, `reviews`, `site_images`, `subscriptions`, `user_push_tokens`, `videos`, others |
| 25 | Revisit unused-index noise after real traffic appears | ⏳ | current unused-index findings are not launch blockers on a low-traffic dataset |

---

## Ближайший рабочий шаг

1. Re-run CI until `check:migrations`, `lint`, `typecheck`, `test:run`, `build:web`, and `build:app` are all green.
2. Enable leaked password protection in Supabase Auth.
3. Verify weak signup, compromised reset, and sign-in with an old weak password against the new UX copy.
4. Prove Android publish readiness with one signed release build and confirm target API 35 in the generated Android project.
5. Follow `docs/APP_ONLY_YOOKASSA_CUTOVER_PLAN.md`: create a non-production branch/database, apply `20260507172615_yookassa_app_payments.sql`, deploy `create-yookassa-checkout` and `yookassa-webhook`, then run one full checkout + webhook smoke test.
6. Decide canonical AI surface and whether `ai-run` / `ai-embeddings` remain intentionally live-only beside dormant `gemini-proxy`.
7. Triage the remaining public runtime probes: generic `app_settings`, missing `image_map`, empty `site_images`, and `404` probes for `payment_orders` / `user_passes`.

---

## Честный статус

| Домен | Статус |
| --- | --- |
| Repo documentation coherence | PASS on current baseline |
| Live Supabase governance | STRONG PARTIAL PASS |
| Live security advisors | **1 warning remaining** |
| Android publish path | PARTIAL READY |
| Public smoke signal | MIXED, narrower after PR #492 but still not clean |
| Release-path CI | RED until fresh green evidence exists |
| Overall launch readiness | **FAIL** |