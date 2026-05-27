# Forward Schema Artifact Proposal | `20260518205158_create_dataset_runs_and_artifacts`

> Mode: SCHEMA-GOVERNANCE
> Repo ref: `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`
> Live project: `qkaycdcbstjobacmuaro`
> Boundary: proposal only; no live SQL mutation in this pass.

---

## Verdict

`PROPOSAL READY: repo-side path to make dataset tables intentional is defined`

[FACT] Live Supabase history includes `20260518205158_create_dataset_runs_and_artifacts`.

[FACT] The current repo has no exact migration file for version `20260518205158`.

[FACT] Live schema evidence already confirms:

- `public.dataset_runs`
- `public.dataset_artifacts`
- FK: `dataset_artifacts.run_id -> dataset_runs.id`
- RLS enabled on both tables

[FACT] Repo comparison found no product-code consumer or generated DB type
contract for these tables.

[INTERP] The repo now understands the drift, but does not yet treat the dataset
tables as accepted intended schema state.

---

## Decision

The next correct artifact is a hybrid reconciliation package:

1. a repo-side forward schema proposal that records the accepted live shape;
2. a later type-regeneration step after owner acceptance;
3. no retroactive timestamp rewrite and no direct live mutation from this pass.

This is not a request to apply SQL to production. Live already contains the
objects. The goal is to make `main` honest about the intended schema.

---

## Proposed Accepted Shape

### `public.dataset_runs`

Confirmed live columns:

- `id uuid default gen_random_uuid()`
- `created_at timestamptz default now()`
- `wallet text default '7BNaxx6KdUYrjACNQZ9He26NBFoFxujQMAfNLnArLGH5'`
- `label text`
- `source text default 'pipeline'`
- `status text default 'completed'`
- `stats jsonb default '{}'::jsonb`
- `notes text`

Confirmed live constraints:

- primary key: `id`

### `public.dataset_artifacts`

Confirmed live columns:

- `id uuid default gen_random_uuid()`
- `run_id uuid`
- `artifact_type text`
- `file_name text`
- `content_format text default 'csv'`
- `row_count int4 default 0`
- `sha256 text`
- `content_text text`
- `metadata jsonb default '{}'::jsonb`
- `created_at timestamptz default now()`

Confirmed live constraints:

- primary key: `id`
- foreign key: `run_id -> public.dataset_runs.id`

---

## Open Evidence Gaps

[HYP] Exact original DDL text remains unknown.

[HYP] Indexes beyond PK/FK are not yet confirmed in the repo evidence chain.

[HYP] Policy details are not yet accepted as repo canon beyond "RLS enabled".

[HYP] Product ownership of these tables is not yet defined.

---

## Implementation Candidate Shape

Only after owner acceptance, prepare one of these:

### Option A — Documentation + Types

Use if these tables are historical or diagnostic live state and no product code
should write to them yet.

Artifacts:

- architecture/schema note that classifies the dataset domain;
- regenerated `shared/types/database.types.ts`;
- release gate note that this is an accepted live-only historical delta.

### Option B — Forward Migration Candidate

Use if a fresh environment created from `main` must contain equivalent dataset
tables.

Artifacts:

- new forward migration created with `supabase migration new`;
- SQL that creates the tables only if absent or otherwise handles existing live
  objects safely in a branch/staging environment;
- explicit RLS policies and grants;
- type regeneration.

### Option C — Rejection / Cleanup Track

Use if owner decides the dataset tables are accidental and should not be part of
KateStudio.

Artifacts:

- cleanup decision note;
- rollback/data-retention decision;
- separate production cleanup plan with backup requirements.

---

## Recommendation

Recommended path: Option A first, then Option B only if reproducible fresh
environment creation becomes a hard requirement.

Reason:

- Live already contains the objects.
- No active product code consumer is confirmed.
- A production SQL change would not reduce current release risk without a clear
  owner and usage model.
- Types/docs can make the repo honest without mutating live.

---

## PASS / FAIL Criteria

PASS for this proposal:

- accepted live shape is recorded;
- exact known vs unknown boundaries are explicit;
- future implementation options are separated;
- no live schema mutation is implied.

FAIL for this proposal:

- it pretends the original migration file exists;
- it rewrites history;
- it treats inferred policies/indexes as confirmed;
- it pushes production SQL without owner approval.

---

## One-line Result

Result: `dataset_runs` / `dataset_artifacts` enter a forward schema artifact
track, with documentation/types first and any migration candidate gated by owner
approval and stronger policy/index evidence.
