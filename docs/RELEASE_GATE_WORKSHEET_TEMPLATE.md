# Release Gate Worksheet Template

> Назначение: one-pass worksheet для финального release gate по KateStudio.

---

## Header

- `Date:`
- `Evaluator:`
- `Repo ref:`
- `Supabase project:` `qkaycdcbstjobacmuaro`
- `Mode:` `RELEASE`

---

## Section A — Migration

- [ ] `20260516182944` exact match confirmed
- [ ] `20260516202546` exact match or semantic mapping confirmed
- [ ] `20260516202845` exact match or semantic mapping confirmed
- [ ] `20260518205158` exact match or semantic mapping confirmed
- [ ] unresolved deltas explicitly documented

`A result:` `PASS` / `PARTIAL` / `FAIL`

---

## Section B — CI

- [ ] fresh green run exists on current `main` SHA
- [ ] `check:migrations` green
- [ ] `lint` green
- [ ] `typecheck` green
- [ ] `test:run` green
- [ ] `build:web` green
- [ ] `build:app` green

`B result:` `PASS` / `PARTIAL` / `FAIL`

---

## Section C — Governance

- [ ] dual payment contour decision note exists
- [ ] contour ownership is explicit
- [ ] transition or retirement criteria are explicit

`C result:` `PASS` / `PARTIAL` / `FAIL`

---

## Section D — Security

- [ ] `book_class_with_access` decision note exists
- [ ] leaked password protection decision note exists
- [ ] live warnings are either remediated or explicitly accepted

`D result:` `PASS` / `PARTIAL` / `FAIL`

---

## Section E — Final Verdict

Rules:
- `PASS` only if A+B+C+D are all `PASS`
- `PARTIAL` only if no section is `FAIL`, but at least one is `PARTIAL`
- `FAIL` if any section is `FAIL`

Required fields:
- `Overall verdict:` `PASS` / `PARTIAL` / `FAIL`
- `Top blocker:`
- `Rollback concern:`
- `One next step:`