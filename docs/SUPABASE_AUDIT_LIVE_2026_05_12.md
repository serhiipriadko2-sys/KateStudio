# Supabase Live Audit | KateStudio | qkaycdcbstjobacmuaro

> **Исходный snapshot:** 12 мая 2026
> **Обновлено:** 16 мая 2026
> **Метод:** GitHub repo inspection + Supabase metadata, SQL, advisors, function inventory и recent logs
> **Граница:** без production mutation
> **Вердикт:** **FAIL for launch-ready**
> **Назначение:** bridge canon until a dedicated 2026-05-16 live audit file replaces this path

---

## 0. Executive verdict

[FACT] Live Supabase advanced again beyond the 2026-05-12 snapshot.

- live applied migrations are now **38**
- live functions are now **11**
- live includes `payment_orders` and `user_passes`
- live includes `create-yookassa-checkout` and `yookassa-webhook`
- recent logs show real live traffic through the app-target payment contour
- security advisors still collapse to **1 remaining warning**: leaked password protection disabled

[INTERP] The highest-value correction is no longer “docs should stop saying 14 or 30”. That work was already needed on 12 May. The current correction is stricter: docs must stop describing the APP payment schema/function surface as still pre-live.

[INTERP] The active risk has changed shape. It is now **dual payment contour + unverified fresh CI**, not the older repo/live gap where the new APP payment surface had not yet reached production.

---

## 1. Live snapshot on 2026-05-16

| Domain | Current fact |
| --- | --- |
| Project | `kate` |
| Project ref | `qkaycdcbstjobacmuaro` |
| Region | `eu-central-1` |
| Status | `ACTIVE_HEALTHY` |
| Postgres | `17.6.1.054` |
| Live applied migrations | **38** |
| Live functions | **11** |
| Live security advisors | **1 warning** |
| Live performance advisors | **warnings remain** |
| `payment_orders` | **present**, `1` row at audit time |
| `user_passes` | **present**, `1` row at audit time |
| `site_images` | **present**, `0` rows at audit time |
| `app_settings` | **present**, keys = `opening_hours`, `studio_contacts`, `studio_profile` |

### Live applied migration tail

The current live history now includes these late-stage versions, including the payment cutover delta:

- `20260511183542 public_surface_hardening_for_settings_pricing_and_videos`
- `20260511183639 public_surface_hardening_followup_without_security_definer_views`
- `20260511190000 public_surface_hardening`
- `20260512062001 missing_security_deltas`
- `20260516182944 yookassa_app_payments_live_cutover`

### Live function inventory

- `ai-run`
- `ai-embeddings`
- `create-payment`
- `payment-webhook`
- `cancel-subscription`
- `cron-maintenance`
- `send-push`
- `subscribe-newsletter`
- `gemini-proxy`
- `create-yookassa-checkout`
- `yookassa-webhook`

### Live runtime signals relevant to current docs

- recent edge logs show `POST 200` on `create-yookassa-checkout`
- recent API logs show `POST 201` to `payment_orders`
- recent API logs show `PATCH 204` to `payment_orders`
- recent API logs show `POST 201` to `user_passes`
- recent API logs still show `401` on `app_settings?key=image_map` and `app_settings?key=theme`
- recent `site_images` reads return `200`, but table content remains empty at the audit moment

---

## 2. Repo snapshot relevant to Supabase

| Domain | Current fact |
| --- | --- |
| Repo functions | **9** |
| Repo payment pairs | legacy pair + app-target pair both tracked |
| Repo live-cutover migration | `20260516182944_yookassa_app_payments_live_cutover.sql` is present |
| Repo APP caller | `paymentService` targets `create-yookassa-checkout` and reads `payment_orders` / `user_passes` |

[INTERP] Repo/live function drift remains real, but not on the old payment-gap axis. Payment drift is now about coexistence and ownership, while the inventory mismatch overall is driven by live-only AI functions.

---

## 3. Stale narratives that this file now rejects

The following narratives are now stale and should not appear in present-tense operational docs:

- the older **37-migration** live baseline
- the older **9-function** live baseline
- any present-tense wording that treats the APP payment tables as still undeployed in live
- any present-tense wording that treats the app-target YooKassa pair as still repo-only
- any launch blocker framing that depends only on the absence of the new live payment surface

---

## 4. What remains genuinely open

### 4.1 Security tail risk

[FACT] The only current live security advisor warning is leaked password protection disabled.

### 4.2 Payment governance risk

[FACT] Live exposes both legacy payment endpoints and app-target payment endpoints.

[FACT] Live schema already supports the APP payment ledger.

[INTERP] The payment risk is now dual-contour governance drift. The team still needs a canonical statement of which pair is primary, how long both may coexist, and what retirement criteria apply.

### 4.3 CI proof gap

[FACT] This audit did not obtain fresh green CI proof for the current release path.

[INTERP] That means launch readiness cannot be upgraded even though the live payment surface is more complete than the 12 May canon suggested.

### 4.4 Runtime/public follow-up

[FACT] Some public runtime symptoms remain narrower but not closed: `app_settings` non-`studio_contacts` reads still fail and `site_images` content is still empty.

---

## 5. Safe documentation rule after this update

1. Treat this file as a bridge canon updated through 2026-05-16 until a renamed live audit file exists.
2. Do not use it to describe the APP payment surface as still pre-live.
3. Use `CURRENT_TASKS.md`, `docs/LAUNCH_CHECKLIST.md`, and `docs/EDGE_FUNCTIONS.md` together with this file so they all reflect the same 38/11/payment-present baseline.
4. Keep the payment risk framed as dual contour + unverified fresh CI.

---

## 6. Bottom line

[FACT] Live state is stronger than the 2026-05-12 operational canon implied.

[INTERP] The highest-value doc-sync work is now to eliminate stale payment-gap claims and replace them with the current truth: live has the new APP payment surface, but launch still fails because dual contour governance and fresh CI proof are unresolved.