# Migration Plan | Additive Reconstruction | `20260518205158_create_dataset_runs_and_artifacts`

> Назначение: дать исполнимый planning-layer artifact для live-only migration delta `20260518205158` без schema writes, без deploy и без переписывания historical migration history.

---

## Verdict

`PLANNING ARTIFACT READY: additive reconstruction path is now execution-shaped at the repo-planning layer`

[FACT] Live Supabase history includes migration version `20260518205158` with name `create_dataset_runs_and_artifacts`.

[FACT] Exact Git-tracked origin for this live delta is not confirmed.

[FACT] Honest semantic mapping to another repo migration is not confirmed either.

[FACT] Project canon already selected `additive reconstruction path` as the correct strategy for this delta.

[INTERP] This artifact does not close the delta at the database layer. It closes the planning gap: the team now has a bounded, reviewable path for how to reconcile the delta without pretending that origin evidence exists.

---

## Scope

This plan covers only:
- repo-side planning for the unresolved live delta `20260518205158`;
- minimal reconstruction framing needed for honest reproducibility;
- approval boundaries before any actual schema write.

This plan does **not** cover:
- live SQL execution;
- retroactive renaming of historical migrations;
- unrelated schema cleanup;
- release-gate uplift by itself.

---

## Source-backed baseline

[FACT] Live migration tail currently narrows to one unresolved delta: `20260518205158_create_dataset_runs_and_artifacts`.

[FACT] Earlier tail entries are already narrowed:
- `20260516182944` exact match confirmed;
- `20260516202546` semantically mapped;
- `20260516202845` semantically mapped.

[FACT] Current release gate is still blocked by:
- this unresolved delta;
- missing same-ref green CI on current `main`;
- unresolved dual payment contour governance;
- live security warnings.

---

## Working reconstruction intent

[FACT] The only directly verified naming signal for this delta is the migration name itself: `create_dataset_runs_and_artifacts`.

[HYP] The most likely schema intent is creation or introduction of one or both logical objects:
- `dataset_runs`
- `dataset_artifacts`

[HYP] The most likely minimal reconstruction surface would include:
- table definitions or equivalent schema objects for dataset execution tracking;
- relational linkage between a run and one or more artifacts;
- indexes, policies, or helper objects only if they are proven to be part of the live shape.

Rule:
- treat all object-level assumptions as hypotheses until confirmed by live schema inspection or another stronger source.

---

## Reconstruction rules

1. Do not fabricate a historical origin.
2. Do not create a fake backdated migration file with timestamp `20260518205158` just to cosmetically match live.
3. Do not claim exact reproducibility from `main` until the reconstruction path is either approved as the canonical explanation or converted into an accepted Git-tracked schema artifact.
4. Keep reconstruction additive:
   - explain what live appears to contain;
   - explain what repo lacks;
   - define what evidence or approval is needed before any schema write.
5. Keep this delta isolated from payment, auth, AI contour, and unrelated RLS work.

---

## Required inputs before any schema write

At least one of the following must be obtained before any actual migration or SQL proposal is treated as implementation-ready:
- live schema inspection for the relevant dataset objects;
- direct SQL or DDL shape from a trusted project artifact;
- explicit owner approval to reconstruct from live state rather than historical Git origin.

If none of these exists, stay at planning level.

---

## Proposed repo-side artifact chain

### Artifact A — this plan

Purpose:
- define the bounded reconstruction strategy and decision rules.

### Artifact B — schema-intent note

Should describe, once evidence is available:
- confirmed live objects involved in the delta;
- confirmed columns or relationships if known;
- what remains inferred vs proven.

### Artifact C — implementation candidate

Only after approval and stronger evidence:
- a proposed Git-tracked migration or reconciliation artifact;
- explicit note whether it is a documentation reconciliation, a forward migration, or another approved form.

---

## Planning-layer PASS / FAIL criteria

### PASS

This planning artifact is considered sufficient at the planning layer only if all of the following are true:
- the strategy is explicitly `additive reconstruction`;
- the artifact states what is known vs unknown;
- the artifact names likely affected objects without overstating certainty;
- the artifact defines approval gates before any schema write;
- the artifact defines what additional evidence would be needed to move from planning to implementation.

### FAIL

This planning artifact fails if any of the following is true:
- it pretends the live delta is already reproducible from `main`;
- it claims exact schema intent without stronger evidence;
- it skips approval boundaries for future schema work;
- it mixes this delta with unrelated cleanup or release decisions.

---

## Implementation-entry criteria

A later implementation proposal may begin only when all of the following are true:
- a human owner accepts additive reconstruction as the execution path;
- live schema evidence for the dataset objects is collected or another trusted source appears;
- the proposal clearly states whether it is doc-only reconciliation or a real forward schema artifact;
- release stakeholders accept that this step does not by itself resolve CI, governance, or security blockers.

---

## Release implication

[INTERP] This artifact removes one planning blocker, not the release blocker itself.

What changes now:
- the project no longer lacks an execution-shaped artifact for `20260518205158`;
- the next migration-related question is narrower: gather live schema evidence or prepare the next approved reconstruction artifact.

What does not change yet:
- release gate remains `FAIL`;
- current `main` still lacks same-ref green CI proof;
- governance and security blockers remain open.

---

## One next step

Collect live schema evidence for the objects implied by `create_dataset_runs_and_artifacts` and attach that evidence to a follow-up schema-intent note.

PASS:
- at least one trusted source confirms the actual live objects touched by this delta.

FAIL:
- the team moves toward implementation while object shape is still only inferred from the migration name.

---

## Closure sentence

Result: `20260518205158_create_dataset_runs_and_artifacts` now has a Git-tracked additive reconstruction plan with explicit planning-layer PASS / FAIL criteria, approval boundaries, and a safe bridge to the next evidence step.