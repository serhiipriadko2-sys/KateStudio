# Schema Intent Note | Live Delta `20260518205158_create_dataset_runs_and_artifacts`

> Назначение: зафиксировать подтвержденную live schema form для dataset-объектов, скрывающихся за migration name `create_dataset_runs_and_artifacts`, без schema writes и без ложного claims об exact Git origin.

---

## Verdict

`PASS: at least one trusted live source now confirms the real object shape behind the delta`

[FACT] Trusted live source used: Supabase `list_tables` for schema `public` with verbose column and constraint metadata.

[FACT] That trusted live source confirms both objects exist in live:
- `public.dataset_runs`
- `public.dataset_artifacts`

[INTERP] This closes the narrow evidence gap that remained after the additive reconstruction plan. We are no longer inferring object existence only from the migration name.

---

## Trusted source snapshot

Source:
- live Supabase project `qkaycdcbstjobacmuaro`
- schema listing with verbose metadata
- date of evidence pass: 2026-05-26 UTC

Evidence quality:
- object existence: confirmed
- column names and data types: confirmed
- PK/FK shape: confirmed
- RLS state: confirmed
- index set beyond PK/FK: not independently verified in this note
- trigger/function coupling: not independently verified in this note

---

## Confirmed object A — `public.dataset_runs`

[FACT] Table exists in live with RLS enabled.

Confirmed columns:
- `id uuid` default `gen_random_uuid()`
- `created_at timestamptz` default `now()`
- `wallet text` default `'7BNaxx6KdUYrjACNQZ9He26NBFoFxujQMAfNLnArLGH5'`
- `label text` nullable
- `source text` nullable default `'pipeline'`
- `status text` nullable default `'completed'`
- `stats jsonb` nullable default `'{}'::jsonb`
- `notes text` nullable

Confirmed keys and relations:
- primary key: `id`
- referenced by `public.dataset_artifacts.run_id -> public.dataset_runs.id`

[INTERP] Live intent looks like a run-level ledger for dataset generation or ingestion events, with lightweight status, source, and summary metadata.

---

## Confirmed object B — `public.dataset_artifacts`

[FACT] Table exists in live with RLS enabled.

Confirmed columns:
- `id uuid` default `gen_random_uuid()`
- `run_id uuid`
- `artifact_type text`
- `file_name text` nullable
- `content_format text` nullable default `'csv'`
- `row_count int4` nullable default `0`
- `sha256 text` nullable
- `content_text text` nullable
- `metadata jsonb` nullable default `'{}'::jsonb`
- `created_at timestamptz` default `now()`

Confirmed keys and relations:
- primary key: `id`
- foreign key: `run_id -> public.dataset_runs.id`

[INTERP] Live intent looks like artifact-level storage or tracking for outputs attached to a dataset run, with room for both file-style and inline-text payload descriptions.

---

## Confirmed relational shape

[FACT] The live schema confirms a one-to-many model:
- one `dataset_run`
- many `dataset_artifacts`

[FACT] The relationship is enforced by FK:
- `public.dataset_artifacts.run_id` references `public.dataset_runs.id`

[INTERP] This is strong enough to say the migration intent was not just “two unrelated tables”. It introduced a linked dataset run / artifact model.

---

## What is now known vs still unknown

### Now known

[FACT] `dataset_runs` exists in live.
[FACT] `dataset_artifacts` exists in live.
[FACT] Both are in schema `public`.
[FACT] Both have RLS enabled.
[FACT] Both use UUID PKs.
[FACT] `dataset_artifacts` depends on `dataset_runs` through a real FK.
[FACT] Both objects contain operational metadata fields consistent with pipeline outputs.

### Still unknown

[HYP] Exact original DDL text of migration `20260518205158` is still unknown.
[HYP] Exact original index set, if any beyond PK/FK, is not yet established here.
[HYP] Trigger, policy-detail, or grants detail specifically introduced by that migration is not established by this note alone.
[HYP] Whether any code path in repo already expects these tables is not established by this note alone.

---

## Reconciliation implication

[INTERP] The project can now move from name-based inference to schema-based reconstruction.

What this note supports:
- a more honest additive reconstruction path;
- a future repo-side artifact that names real live objects rather than guessed ones;
- narrower review of whether a doc-only reconciliation is enough or whether a forward schema artifact would be needed.

What this note does not support yet:
- claiming exact historical reproducibility from GitHub `main`;
- writing a final migration candidate without checking policy/index/usage context;
- lifting the release gate by itself.

---

## Planning-layer PASS / FAIL for this note

### PASS

This note passes if all of the following are true:
- at least one trusted live source confirms the actual objects;
- the confirmed object shape is written down clearly;
- known facts are separated from remaining unknowns;
- the note narrows the next reconstruction step.

### FAIL

This note fails if any of the following is true:
- it still relies only on the migration name;
- it claims exact historical migration text is known;
- it skips unresolved areas such as policy/index/usage context.

---

## Best next step

Compare this confirmed live shape against GitHub `main` code and docs to determine whether the next reconciliation artifact should be:
- doc-only schema reconciliation; or
- a future forward schema artifact proposal.

PASS:
- the next artifact explicitly states whether repo already understands these tables.

FAIL:
- the team moves toward implementation without checking repo-side consumers, docs, or schema expectations.

---

## Closure sentence

Result: live Supabase now provides a trusted schema-form source for `dataset_runs` and `dataset_artifacts`, so the `20260518205158` delta is no longer being reconstructed from the migration name alone.