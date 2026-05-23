# Security Decision Template | book_class_with_access

> Назначение: отдельно зафиксировать решение по warning `authenticated_security_definer_function_executable`.

---

## Header

- `Date:`
- `Author:`
- `Repo ref:`
- `Live project:` `qkaycdcbstjobacmuaro`
- `Mode:` `SECURITY`

---

## Finding

`authenticated` users can execute `public.book_class_with_access(...)` as a `SECURITY DEFINER` function.

---

## Required Sections

### Current behavior

- `Current runtime use:`
- `Why this function exists:`
- `Who calls it:`

### Why this may be intentional

- `Intentionality evidence:`
- `Business reason:`

### Why this may be risky

- `Privilege boundary risk:`
- `Abuse or overexposure risk:`
- `Operational risk:`

### Decision

Choose one:
- `Decision: accept temporarily`
- `Decision: remediate now`

### If accepted temporarily

- `Owner:`
- `Expiry date:`
- `Monitoring signal:`
- `Acceptance rationale:`

### If remediated now

- `Target technical change:`
- `Verification rule:`
- `Rollback expectation:`

---

## PASS Rule

PASS only if one of these is true:
- the warning is removed in live and booking behavior still works;
- an explicit temporary acceptance note exists with owner, expiry, and rationale.

---

## One-line Result

End with one sentence:
- `Result: warning accepted temporarily until <date> with named owner.`
or
- `Result: warning enters remediation path with explicit verification and rollback rule.`