# Repo Comparison Note | Live Delta `20260518205158_create_dataset_runs_and_artifacts`

> Назначение: сравнить подтвержденную live schema shape `dataset_runs` / `dataset_artifacts` с GitHub `main` code и docs, чтобы честно решить: достаточно ли `doc-only schema reconciliation`, или нужен будущий `forward schema artifact proposal`.

---

## Verdict

`PASS: repo-side comparison completed`

Decision:
`doc-only schema reconciliation is NOT sufficient; a future forward schema artifact proposal is needed`

[FACT] Live Supabase now confirms real objects `public.dataset_runs` and `public.dataset_artifacts` with concrete columns, PK/FK shape, and RLS enabled.

[FACT] Repo-side comparison on GitHub `main` did not confirm any Git-tracked migration file for `20260518205158`.

[FACT] Repo-side comparison also did not confirm any code consumer, type contract, or architecture canon that already treats `dataset_runs` / `dataset_artifacts` as understood stable repo state.

[INTERP] That means the repo does not currently understand these tables as part of intended reproducible schema, except through reconciliation paperwork added during this investigation.

---

## Live side used for comparison

Trusted live shape source:
- `docs/MIGRATION_SCHEMA_INTENT_20260518205158.md`
- backed by verbose Supabase live metadata from project `qkaycdcbstjobacmuaro`

Confirmed live objects:
- `public.dataset_runs`
- `public.dataset_artifacts`

Confirmed live relationship:
- `dataset_artifacts.run_id -> dataset_runs.id`

---

## Repo-side evidence checked

### 1. Migration-path evidence

Checked:
- repo search for `20260518205158`
- repo search for `create_dataset_runs_and_artifacts`
- repo search for `dataset_runs`
- repo search for `dataset_artifacts`

[FACT] No exact Git-tracked migration file was confirmed in `supabase/migrations/` for this delta.

[FACT] No semantic migration mapping was confirmed from repo code or migration history for this delta.

### 2. Code-consumer evidence

Checked:
- repo search for `dataset_runs`
- repo search for `dataset_artifacts`
- repo search for live-specific field names such as `artifact_type`, `content_format`, `row_count`, `sha256`, `wallet`, `stats`

[FACT] No repo code consumer was confirmed for these objects in `main`.

[FACT] Search results only surfaced reconciliation and release docs created during this investigation, not product code.

### 3. Type-contract evidence

Checked:
- `shared/types/database.types.ts`

[FACT] `shared/types/database.types.ts` is still a hand-crafted file and the inspected repo-side evidence does not show `dataset_runs` or `dataset_artifacts` represented there.

[INTERP] This means repo-side typed schema understanding is incomplete relative to live.

### 4. Architecture/docs evidence

Checked:
- `docs/ARCHITECTURE.md`
- general repo search across docs

[FACT] `docs/ARCHITECTURE.md` does not list `dataset_runs` / `dataset_artifacts` among stable or newly confirmed active surfaces.

[FACT] Repo docs that currently mention these objects are reconciliation docs produced in response to this drift investigation, not pre-existing intended-state docs.

[INTERP] That is evidence of `docs drift`, not evidence that the repo already understands the live dataset domain.

---

## Comparison outcome

### What the repo clearly understands

[FACT] The repo now understands that an unresolved live delta exists.
[FACT] The repo now understands the chosen strategy: additive reconstruction.
[FACT] The repo now has a planning artifact and a schema-intent note.

### What the repo does NOT yet understand as intended state

[FACT] No original migration file is confirmed.
[FACT] No semantic migration substitute is confirmed.
[FACT] No shared type contract is confirmed.
[FACT] No product-code consumer is confirmed.
[FACT] No architecture-level domain surface entry is confirmed outside reconciliation notes.

[INTERP] This is the key dividing line: the repo understands the problem, but not yet the schema as accepted intended state.

---

## Why doc-only is not enough

`Doc-only schema reconciliation` would be sufficient only if the repo already had one of these:
- a trustworthy migration artifact;
- a trustworthy typed schema contract;
- a trustworthy architecture/domain statement that already included these objects as accepted state.

[FACT] Current evidence confirms none of those three.

[INTERP] Therefore doc-only sync would only describe the gap, not reconcile the schema understanding of `main`.

---

## Why a forward schema artifact proposal is needed

[INTERP] A future forward schema artifact proposal is the minimal honest next form because it can:
- name the accepted live objects explicitly;
- state whether the goal is schema parity, documentation parity, or a real forward migration candidate;
- bridge the gap between reconciliation docs and intended repo state;
- remain review-first without touching live.

Important nuance:
- this does **not** mean a live SQL write should happen now;
- it means the repo needs a future artifact proposal that treats the dataset tables as an accepted schema concern, not just a noted anomaly.

---

## PASS / FAIL for this comparison step

### PASS

This comparison step passes if all of the following are true:
- live shape is compared against repo code and docs;
- the repo-side evidence is explicit, not hand-wavy;
- the result states whether the repo already understands these tables;
- a clear decision is made between `doc-only` and `forward artifact`.

### FAIL

This comparison step fails if any of the following is true:
- the team keeps speaking only from the migration name;
- repo-side code/types/docs are not actually checked;
- the conclusion avoids choosing between `doc-only` and `forward artifact`.

---

## Best next step

Prepare a `forward schema artifact proposal` for `dataset_runs` / `dataset_artifacts` that stays repo-side and review-first.

That proposal should explicitly answer:
- is the next artifact doc-only plus type regeneration guidance;
- or a future migration candidate proposal;
- or a hybrid reconciliation package.

PASS:
- the proposal states exactly what repo-side artifact would make `main` understand these tables as intended state.

FAIL:
- the team keeps the tables only inside drift notes without proposing how they become accepted repo knowledge.

---

## Closure sentence

Result: GitHub `main` currently understands `dataset_runs` / `dataset_artifacts` only as a tracked live drift topic, not as accepted intended schema state, so `doc-only schema reconciliation` is insufficient and a future `forward schema artifact proposal` is required.