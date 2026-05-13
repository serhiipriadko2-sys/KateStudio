# Testing Architecture | KateStudio

> **Обновлено:** 13 мая 2026
> Этот документ разделяет две вещи: stable test architecture и current evidence discipline.
>
> Для present-tense release status используйте:
>
> - `CURRENT_TASKS.md`
> - `docs/LAUNCH_CHECKLIST.md`
>
> Этот файл не должен сам по себе объявлять release path green.

---

## 1. What is confirmed

### Architecture-level facts

- test runner: Vitest
- React component tests: Testing Library
- HTTP mocking: MSW
- DOM environment: jsdom
- shared runner covers all workspaces from root config

These facts are stable and remain consistent with repo configuration references in code and workflow files.

---

## 2. Current evidence discipline

### What the repo canon can currently support

The current repo canon supports these statements:

- the release path includes `npm run test:run`, `npm run typecheck`, `npm run lint`, `npm run build:web`, and `npm run build:app`
- `CURRENT_TASKS.md` and `docs/LAUNCH_CHECKLIST.md` are the present-tense status documents
- a red release-path snapshot was explicitly recorded on 12 May 2026 for `CI #1190`
- a narrow test-only fix for `shared/__tests__/imageStorage.test.ts` was merged later the same day in PR `#494`

### What this document must not claim

This document must not claim:

- a current test count as if it were freshly re-run today
- a green release path without fresh GitHub Actions or local execution evidence
- old snapshots such as `489 / 64` as if they were still the current repo state

---

## 3. Working rule for test claims

Use one of these two phrasings only:

- `present-tense status: see CURRENT_TASKS.md and docs/LAUNCH_CHECKLIST.md`
- `historical snapshot: explicitly date the evidence and avoid present-tense wording`

This keeps testing docs honest when the repo is being inspected remotely rather than through a fresh local execution pass.

---

## 4. Next verification step

After a full local checkout or fresh Actions run is available, verify:

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build:web
npm run build:app
```

Then update `CURRENT_TASKS.md` and `docs/LAUNCH_CHECKLIST.md` first, and only after that refresh any derived testing narrative.
