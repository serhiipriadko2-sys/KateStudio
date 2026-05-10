# Testing Architecture | KateStudio

> **Обновлено:** 10 мая 2026
> Этот документ разделяет две вещи: test architecture и last known verification snapshot.

---

## 1. What is confirmed

### Architecture-level facts

- test runner: Vitest
- React component tests: Testing Library
- HTTP mocking: MSW
- DOM environment: jsdom
- shared runner covers all workspaces from root config

These facts are stable and remain consistent with repo configuration references in existing docs.

### Latest documented verification snapshot

The freshest verified counts available in the repo canon are from `CURRENT_TASKS.md` dated 2026-05-02:

| Metric | Last documented value |
| --- | --- |
| Passed tests | 489 |
| Test files / suites | 64 |
| TypeScript errors | 0 |
| Lint | PASS |

Older `docs/TESTING.md` values (`473 / 60`) are outdated.

---

## 2. What is not claimed here

This audit did **not** re-run the test suite locally, because the repository was inspected remotely through GitHub and Supabase tooling rather than through a full local checkout with dependencies installed.

So this document does **not** claim a new execution result for 2026-05-10. It records the latest trustworthy repo-stated snapshot and flags the gap.

---

## 3. Working rule

Use the following phrasing in project docs until tests are re-run:

- `last verified in repo snapshot: 489 tests / 64 files as of 2026-05-02`
- not `currently verified today`

This keeps documentation honest.

---

## 4. Next step

After a full local checkout is available, rerun:

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build:web
npm run build:app
```

Then replace all "last documented" language with fresh run evidence.
