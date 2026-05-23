# Migration Sync Reconciliation | 2026-05-23

> Цель: зафиксировать воспроизводимый reconciliation path между live Supabase history и GitHub `main` без production mutation.

---

## Verdict

`DRIFT: live migration versions vs repo migration versions`

Это не полный repo/live разрыв, а смешанный случай:
- одна live migration уже имеет точное Git-tracked подтверждение;
- две live migrations подтверждаются семантически, но расходятся по version/timestamp с repo файлами;
- одна live migration всё ещё не подтверждена текущим GitHub evidence packet.

---

## Confirmed mapping table

| Live migration version | Live name | Repo status | Repo mapping | Verdict |
| --- | --- | --- | --- | --- |
| `20260516182944` | `yookassa_app_payments_live_cutover` | exact match | `supabase/migrations/20260516182944_yookassa_app_payments_live_cutover.sql` | PASS |
| `20260516202546` | `book_class_with_access` | semantic match, version mismatch | `supabase/migrations/20260516211000_book_class_with_access.sql` | DRIFT |
| `20260516202845` | `book_class_with_access_revoke_public_execute` | semantic match, version mismatch | `supabase/migrations/20260516214500_book_class_with_access_revoke_public_execute.sql` | DRIFT |
| `20260518205158` | `create_dataset_runs_and_artifacts` | unresolved | no direct repo file confirmed in current evidence packet | FAIL |

---

## What is now proven

[FACT] `book_class_with_access` exists in GitHub `main`, but under repo file version `20260516211000`, not live version `20260516202546`.

[FACT] `book_class_with_access_revoke_public_execute` exists in GitHub `main`, but under repo file version `20260516214500`, not live version `20260516202845`.

[FACT] `create_dataset_runs_and_artifacts` is still present in live history and still lacks direct GitHub file confirmation in the current evidence packet.

---

## Safe reconciliation rule

1. Do not rename old repo migration files to match live history retroactively.
2. Do not rewrite live migration history.
3. Treat the current state as historical version drift until one explicit reconciliation note exists in Git.
4. Keep future release decisions gated on the unresolved `20260518205158` gap plus current-main CI proof.

---

## Minimal Git-tracked reconciliation path

### Path A — documentation-first reconciliation

Accept the historical version drift explicitly in repo documentation:
- live `20260516202546` maps to repo `20260516211000_book_class_with_access.sql`
- live `20260516202845` maps to repo `20260516214500_book_class_with_access_revoke_public_execute.sql`
- live `20260518205158` remains unresolved until its repo file or intentional omission is evidenced

### Path B — code/repo reconciliation, only if later approved

If the team wants stronger reproducibility than documentation mapping alone:
- identify the missing Git-tracked artifact for `20260518205158`
- if the change exists outside `main`, bring it into `main` in additive form
- if the live change was intentional but repo-missing, create a Git-tracked reconciliation artifact describing the live schema delta and why it was not originally captured

---

## Release implication

Current release gate cannot move above `FAIL` from migration evidence alone because:
- one live migration remains unresolved in repo evidence;
- two other live migrations are only semantically mapped, not version-matched;
- current-main same-ref green CI proof remains unverified.

---

## One next step

Find or reconstruct the Git-tracked source for live migration `20260518205158_create_dataset_runs_and_artifacts`; if it cannot be found, create an explicit repo reconciliation artifact describing the live-only delta and keep `release-hold` in place.