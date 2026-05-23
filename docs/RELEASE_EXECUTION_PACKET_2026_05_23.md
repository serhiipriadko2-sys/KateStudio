# Release Execution Packet | 2026-05-23

> Назначение: один операционный пакет для закрытия текущих release blockers KateStudio без лишней импровизации.
> Режим: read-first, no deploy by default, no live mutation without explicit approval.

---

## 0. Порядок исполнения

Идти строго в таком порядке:

1. `Migration Path`
2. `CI Path`
3. `Governance Path`
4. `Security Path`
5. `Release Path`

Правило:
- не переходить к новому release gate, пока не закрыты шаги 1 и 2;
- не обсуждать `PARTIAL` или `PASS`, пока не зафиксированы решения по шагам 3 и 4.

---

## 1. Checklist для расследования `20260518205158_create_dataset_runs_and_artifacts`

### Цель

Подтвердить одно из двух:
- migration already exists in Git-tracked form and просто не была найдена прежним evidence packet;
- migration действительно live-only и требует explicit reconciliation artifact.

### Read-only evidence checklist

- [ ] Проверить GitHub `main` на прямой file path `supabase/migrations/*20260518205158*`
- [ ] Проверить commit history по ключам `dataset_runs`, `dataset_artifacts`, `create_dataset_runs_and_artifacts`
- [ ] Проверить PR history по тем же ключам
- [ ] Проверить docs / audit artifacts, где этот delta мог быть описан без прямого file reference
- [ ] Проверить, нет ли change-set в repo под другим timestamp, но с тем же schema intent
- [ ] Сверить live table intent с любым найденным repo artifact

### PASS criteria

PASS, если найден один из вариантов:
- exact repo migration file для `20260518205158`; или
- semantically matching repo migration file с другим timestamp, который можно честно связать с live delta.

### FAIL criteria

FAIL, если после evidence pass нет:
- ни exact file,
- ни honest semantic repo mapping.

### If FAIL

Тогда создать или обновить Git-tracked reconciliation artifact с такой структурой:
- live version
- live purpose
- repo evidence searched
- why exact origin is unresolved
- impact on reproducibility
- explicit release implication: `release-hold`

### Anti-patterns

- не переименовывать старые migration files задним числом;
- не переписывать historical timestamps ради косметического совпадения;
- не выдавать schema similarity за exact reproducibility без пометки `semantic mapping`.

---

## 2. Template решения по dual payment contour

Сделать один decision note. Ниже шаблон.

### Decision title

`Payment Contour Decision | KateStudio | <date>`

### Context

[FACT] Live currently exposes both:
- legacy pair: `create-payment` / `payment-webhook`
- app-target pair: `create-yookassa-checkout` / `yookassa-webhook`

[FACT] Repo and docs treat APP payment as canonical business direction.

### Decision options

#### Option A — Transitional dual contour

Use when:
- legacy flow still serves a real runtime/client dependency;
- retirement is not yet safe.

Must define:
- owner of legacy path
- owner of app-target path
- end-of-transition condition
- explicit expiry review date
- rollback meaning if app-target contour misbehaves

Required fields:
- `Decision:` transitional dual contour
- `Primary contour:` app-target or legacy
- `Secondary contour:` legacy or app-target
- `Expiry criteria:`
- `Review date:`
- `Retirement trigger:`
- `Rollback rule:`

#### Option B — Legacy retirement path

Use when:
- legacy path is no longer needed by any real release surface.

Must define:
- what is being retired
- what remains canonical
- what proof is required before retirement
- what rollback path exists if retirement fails

Required fields:
- `Decision:` legacy retirement
- `Canonical contour:`
- `Retiring contour:`
- `Pre-retirement proof:`
- `Rollback path:`
- `Removal order:`

### Output rule

Decision note must end with one sentence only:
- `Result: dual contour is intentionally transitional until <condition>.`
or
- `Result: legacy contour enters retirement path after <proof>.`

---

## 3. Template security decision note

Нужно два отдельных mini-notes, не один общий.

### A. `book_class_with_access` warning

#### Title
`Security Decision | book_class_with_access | <date>`

#### Required structure

- `Finding:` authenticated users can execute a `SECURITY DEFINER` function
- `Current behavior:`
- `Why this may be intentional:`
- `Why this may be risky:`
- `Decision:` accept temporarily / remediate now
- `If accepted:` expiry date, owner, monitoring signal
- `If remediated:` target technical change and verification rule

#### PASS for closure

PASS only if one of these is true:
- the warning is removed in live and behavior still works; or
- there is an explicit temporary acceptance note with owner, expiry, and rationale.

### B. leaked password protection

#### Title
`Security Decision | Leaked Password Protection | <date>`

#### Required structure

- `Finding:` leaked password protection disabled in live Auth
- `Current user impact:`
- `Enablement risk:`
- `Decision:` enable now / defer with explicit rationale
- `If enabling:` rollout check, user-flow verification, rollback expectation
- `If deferring:` owner, expiry date, blocking reason

#### PASS for closure

PASS only if one of these is true:
- feature enabled and auth UX verified; or
- defer note exists with explicit business acceptance.

---

## 4. Финальный release-gate worksheet на один проход

Использовать как one-pass sheet. Не пропускать поля.

### Header

- `Date:`
- `Evaluator:`
- `Repo ref:`
- `Supabase project:` `qkaycdcbstjobacmuaro`
- `Mode:` `RELEASE`

### Section A — Migration

- [ ] `20260516182944` exact match confirmed
- [ ] `20260516202546` exact match or semantic mapping confirmed
- [ ] `20260516202845` exact match or semantic mapping confirmed
- [ ] `20260518205158` exact match or semantic mapping confirmed
- [ ] unresolved deltas explicitly documented

A result:
- `PASS`
- `PARTIAL`
- `FAIL`

### Section B — CI

- [ ] fresh green run exists on current `main` SHA
- [ ] `check:migrations` green
- [ ] `lint` green
- [ ] `typecheck` green
- [ ] `test:run` green
- [ ] `build:web` green
- [ ] `build:app` green

B result:
- `PASS`
- `PARTIAL`
- `FAIL`

### Section C — Governance

- [ ] dual payment contour decision note exists
- [ ] contour ownership is explicit
- [ ] transition or retirement criteria are explicit

C result:
- `PASS`
- `PARTIAL`
- `FAIL`

### Section D — Security

- [ ] `book_class_with_access` decision note exists
- [ ] leaked password protection decision note exists
- [ ] live warnings are either remediated or explicitly accepted

D result:
- `PASS`
- `PARTIAL`
- `FAIL`

### Section E — Release verdict

Rules:
- `PASS` only if A+B+C+D are all `PASS`
- `PARTIAL` only if no section is `FAIL`, but at least one is `PARTIAL`
- `FAIL` if any section is `FAIL`

Final fields:
- `Overall verdict:` `PASS` / `PARTIAL` / `FAIL`
- `Top blocker:`
- `Rollback concern:`
- `One next step:`

---

## 5. Ready-to-use short prompts

### Prompt: investigate unresolved migration

`Проверь Git-tracked origin для live migration 20260518205158_create_dataset_runs_and_artifacts в KateStudio main. Не меняй live. Найди exact file, semantic mapping или оформи explicit reconciliation artifact.`

### Prompt: decide payment contour

`Подготовь decision note по dual payment contour в KateStudio: transitional dual contour или legacy retirement path. Основание — current live functions, repo canon и release risk.`

### Prompt: security note

`Подготовь два отдельных security decision note для KateStudio: 1) book_class_with_access warning, 2) leaked password protection. Не смешивай решения.`

### Prompt: release gate

`Проведи один финальный release gate по KateStudio на current main ref и live Supabase после migration, CI, governance и security решений. Верни PASS, PARTIAL или FAIL.`

---

## 6. Bottom line

Этот packet считается готовым к использованию, если команда может:
- взять unresolved migration delta;
- получить same-ref current-main CI proof;
- принять governance/security decisions;
- провести один финальный release gate без повторного пересбора контекста.