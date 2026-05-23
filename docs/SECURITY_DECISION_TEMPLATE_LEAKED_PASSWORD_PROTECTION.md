# Security Decision Template | Leaked Password Protection

> Назначение: отдельно зафиксировать решение по live Auth setting `Leaked Password Protection Disabled`.

---

## Header

- `Date:`
- `Author:`
- `Repo ref:`
- `Live project:` `qkaycdcbstjobacmuaro`
- `Mode:` `SECURITY`

---

## Finding

Leaked password protection is disabled in live Supabase Auth.

---

## Required Sections

### Current user impact

- `Current signup/reset/sign-in behavior:`
- `User-facing impact if enabled:`

### Enablement risk

- `Compatibility risk:`
- `Support/UX risk:`
- `Release risk:`

### Decision

Choose one:
- `Decision: enable now`
- `Decision: defer explicitly`

### If enabling

- `Rollout check:`
- `User-flow verification:`
- `Rollback expectation:`

### If deferring

- `Owner:`
- `Expiry date:`
- `Blocking reason:`
- `Acceptance rationale:`

---

## PASS Rule

PASS only if one of these is true:
- feature is enabled and auth UX is verified;
- an explicit defer note exists with business acceptance, owner, and expiry.

---

## One-line Result

End with one sentence:
- `Result: leaked password protection is enabled and verified.`
or
- `Result: leaked password protection is deferred until <date> with explicit owner and rationale.`