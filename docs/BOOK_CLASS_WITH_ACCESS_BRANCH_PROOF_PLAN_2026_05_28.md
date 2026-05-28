# Branch/Staging Proof Plan | book_class_with_access | 2026-05-28

> Mode: CHANGE-PREFLIGHT
> Scope: `public.book_class_with_access`
> Boundary: no APP contract change; no live mutation in this document.

---

## 1. Goal

Produce branch/staging proof for remediating the live security warning on
`book_class_with_access` without changing the current APP client contract.

Current APP contract to preserve:

- the APP keeps calling `public.book_class_with_access` as its booking entrypoint;
- response semantics remain compatible with current result shape:
  `ok`, `code`, `booking_id`, `pass_id`, `visits_remaining`.

---

## 2. Current baseline

### Confirmed facts

- live security advisors still flag `authenticated_security_definer_function_executable` for `public.book_class_with_access`.
- repo migration `20260516211000_book_class_with_access.sql` defines the RPC as `SECURITY DEFINER`.
- current logic both creates `bookings` and decrements `user_passes` inside one server-side transaction path.
- current function body already guards unauthenticated access via `auth.uid()` and returns explicit business codes such as `auth_required`, `class_not_found`, `duplicate`, `pass_expired`, `no_visits_left`, `no_access`, `class_full`, `success`.
- direct blind switch to `SECURITY INVOKER` is unsafe because the function currently performs writes that ordinary authenticated callers may not be allowed to do under existing RLS/write posture.

### Constraint

- no APP contract change in this proof plan.
- therefore the proof target must preserve the external RPC call shape even if the internal implementation changes.

---

## 3. Candidate remediation shape

Preferred design to prove on branch/staging:

1. keep public APP call surface stable at `book_class_with_access`;
2. move privileged write orchestration behind a private helper or Edge Function-owned server path;
3. reduce or remove direct public `SECURITY DEFINER` exposure that Supabase advisors currently flag;
4. preserve exact business result codes expected by the APP.

Practical variants allowed for proof:

- Variant A: wrapper RPC with stable signature delegating to a private helper not directly executable by `authenticated`.
- Variant B: authenticated Edge Function wrapper that preserves request/response semantics while the DB-side helper becomes private.
- Variant C: wrapper RPC remains public but internal privileged logic moves to a helper with narrower grants and clearer execution boundary.

Non-goal for this proof pass:

- redesigning booking UX or changing APP API semantics.

---

## 4. Branch/staging setup plan

### Stage A - branch creation readiness

Collect before branch creation:

1. branch cost confirmation;
2. exact repo HEAD / migration baseline to use;
3. current live advisor snapshot for the warning;
4. current canonical test matrix for booking behavior.

Exit condition:

- branch/staging environment is approved and created from the accepted baseline.

### Stage B - baseline replay check

Before trying any remediation code:

- confirm branch migrations replay cleanly enough for the booking/payment surface;
- verify `book_class_with_access`, `user_passes`, `payment_orders`, `bookings`, and `classes` exist in expected form;
- verify the branch reproduces the current warning before the candidate fix.

Exit condition:

- branch matches the relevant live booking surface closely enough to make the proof meaningful.

---

## 5. Proof scenarios

The proof must cover all of these cases on branch/staging.

### Functional scenarios

1. valid active pass -> booking created and one visit decremented;
2. no pass -> expected failure code;
3. expired pass -> expected failure code `pass_expired`;
4. no visits left -> expected failure code `no_visits_left`;
5. duplicate booking -> expected failure code `duplicate`;
6. class full -> expected failure code `class_full`;
7. unauthenticated call -> expected failure code `auth_required` or equivalent contract-safe rejection.

### Contract scenarios

1. RPC name remains `book_class_with_access` from the APP point of view;
2. argument list stays compatible with current APP caller;
3. returned columns stay compatible with current APP parser;
4. no APP-side fallback or hidden second endpoint is required.

### Security scenarios

1. security advisor warning disappears, or at minimum changes to a narrower acceptable shape with explicit rationale;
2. unauthenticated and anon access remain blocked;
3. authenticated callers cannot use the path to mutate unrelated user data;
4. helper paths not meant for direct client use are not publicly executable.

---

## 6. Evidence packet to capture on branch/staging

Minimum proof artifacts:

1. branch identifier and baseline ref;
2. relevant migration or function diff used for the candidate implementation;
3. branch advisor output before the fix;
4. branch advisor output after the fix;
5. booking test results for the six functional cases;
6. one short contract note confirming APP caller compatibility;
7. rollback note describing how to revert the branch proof if the candidate fails.

If any one of items 3-6 is missing, the proof should be treated as partial, not release-ready.

---

## 7. Rollback and failure rules

- If the candidate removes the warning but breaks booking semantics, reject it.
- If the candidate keeps booking semantics but still leaves the same advisor warning with no narrowing, reject it as insufficient.
- If the candidate requires APP client changes, stop and reclassify it as a broader change set instead of this proof plan.
- If branch replay itself is unreliable, fix the branch baseline problem before concluding anything about the remediation design.

---

## 8. Success definition

This proof plan is successful only if all three are true:

1. booking behavior remains contract-compatible for the APP;
2. privileged write path is demonstrably safer than the current live `authenticated + SECURITY DEFINER` exposure;
3. branch/staging evidence is strong enough to support a later live remediation pass.

---

## 9. Safest next step

Create a branch/staging environment from the accepted baseline, reproduce the current advisor warning there, and run one candidate wrapper/private-helper implementation through the full booking scenario matrix above.
