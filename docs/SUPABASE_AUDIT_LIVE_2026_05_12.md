# Supabase Live Audit | KateStudio | qkaycdcbstjobacmuaro

> **Исходный snapshot:** 12 мая 2026
> **Bridge update:** 23 мая 2026
> **Метод:** GitHub repo inspection + Supabase metadata, advisors, function inventory и verified CI evidence
> **Граница:** без production mutation
> **Вердикт:** **FAIL for launch-ready**
> **Назначение:** historical bridge canon; do not use this file alone as current present-tense truth without the 2026-05-23 drift note below

---

## 0. Critical drift note for 2026-05-23

[FACT] Live Supabase advanced again beyond the 2026-05-16 bridge baseline.

- live applied migrations are now **41**, not `38`
- live functions remain **11**
- live payment tables remain present
- one fresh verified green CI signal now exists, but only on PR `#498` / workflow `CI #1246`
- current-main same-ref release proof is still unverified
- live security advisor state is now **2 warnings**, not `1`

[INTERP] This file remains useful as historical bridge canon, but it is no longer safe to quote any present-tense line here as the latest live snapshot without adding the 2026-05-23 drift correction.

---

## 1. Historical bridge verdict from 2026-05-16

[FACT] Live Supabase advanced beyond the original 2026-05-12 snapshot.

- live applied migrations were **38** at that bridge moment
- live functions were **11**
- live included `payment_orders` and `user_passes`
- live included `create-yookassa-checkout` and `yookassa-webhook`
- recent logs showed real live traffic through the app-target payment contour
- security advisors had collapsed to **1 remaining warning** at that bridge moment

[INTERP] That 2026-05-16 bridge correctly killed the older narrative that the APP payment surface was still repo-only. It is still historically useful for that purpose.

---

## 2. Current 2026-05-23 correction

### Live snapshot now known to be fresher

| Domain | Current fact on 2026-05-23 |
| --- | --- |
| Live applied migrations | **41** |
| Live functions | **11** |
| Live security advisors | **2 warnings** |
| Current-main fresh green proof | **UNVERIFIED** |
| Latest verified green CI signal | PR `#498` / workflow `CI #1246` |
| Repo-confirmed live-tail migrations | **PARTIAL** |

### Live migration tail now known to extend at least through

- `20260516182944 yookassa_app_payments_live_cutover`
- `20260516202546 book_class_with_access`
- `20260516202845 book_class_with_access_revoke_public_execute`
- `20260518205158 create_dataset_runs_and_artifacts`

[FACT] In the current evidence packet, only `20260516182944` is directly confirmed in GitHub `main`.

[INTERP] That means the active risk is no longer only dual payment contour + CI gap. It is now also explicit `migration-sync` risk on the live tail.

---

## 3. What remains genuinely open

### 3.1 Migration reproducibility risk

[FACT] live history is ahead of the repo-confirmed tail.

[INTERP] Until the remaining live tail versions are directly confirmed in Git-tracked paths, reproducibility remains partial.

### 3.2 Security tail risk

[FACT] current live security warnings are:
- `book_class_with_access` callable as `SECURITY DEFINER` by `authenticated`
- leaked password protection disabled

### 3.3 Payment governance risk

[FACT] Live still exposes both legacy payment endpoints and app-target payment endpoints.

[INTERP] The active payment risk remains dual-contour governance drift.

### 3.4 CI proof gap

[FACT] One fresh green CI run exists, but not on the same current `main` ref.

[INTERP] Launch readiness still cannot be upgraded from this alone.

---

## 4. Safe documentation rule after this update

1. Treat this file as a historical bridge, not as the freshest operational snapshot.
2. Use `CURRENT_TASKS.md` and `docs/LAUNCH_CHECKLIST.md` for the current operational baseline.
3. Do not cite `38 migrations` here as current live truth.
4. Keep the active launch risk framed as `migration-sync + current-main CI proof + dual contour + security warnings`.

---

## 5. Bottom line

[FACT] Live state is stronger and newer than the 2026-05-16 bridge implied.

[INTERP] The highest-value correction is no longer only doc-sync around the payment contour. The current high-value correction is to stop treating the bridge baseline as current truth and to close the live-tail `migration-sync` gap.