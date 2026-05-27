# Security Decision | Leaked Password Protection | 2026-05-27

> Mode: SECURITY
> Repo ref: `5a2393539bc664e40fd4f966bc0d7af6aa85dd86`
> Live project: `qkaycdcbstjobacmuaro`
> Boundary: repo-side decision only; no Supabase Auth setting mutation in this pass.

---

## Finding

[FACT] Live Supabase security advisor still reports
`auth_leaked_password_protection`.

[FACT] The advisor describes the live state as leaked password protection being
disabled in Supabase Auth.

---

## Current User Impact

[INTERP] Current signup and password reset flows can still accept passwords that
Supabase would otherwise reject as compromised if leaked password protection were
enabled.

[INTERP] Enabling the setting may make some weak or previously leaked passwords
fail during signup or reset, which is usually desirable for security but can
create short-term support friction.

---

## Enablement Risk

Compatibility risk:

- Password-based auth is present in the product history and should be smoke
  tested after changing Auth settings.
- The setting is live-config, not a Git migration, so it needs an explicit
  dashboard or management action with a verification receipt.

Support / UX risk:

- Some users may need to choose a new password if their password appears in a
  breach corpus.
- The UI should surface the Supabase auth error clearly enough for users to
  recover.

Release risk:

- Leaving the setting disabled preserves a live security advisor warning.
- Enabling it without smoke testing signup, login, and reset risks auth UX
  regression.

---

## Remediation Update

Update 2026-05-27:

[FACT] Owner supplied billing evidence showing the Supabase organization is on
Pro Plan.

[FACT] Supabase documentation states leaked password protection is available on
Pro Plan and above.

[INTERP] Plan level is no longer the blocker. The remaining blocker is live Auth
configuration access and verification.

---

## Decision

Decision: remediate live as soon as Auth config can be changed through
Dashboard or a scoped Management API token, then verify user flows.

Owner: project owner / release owner.

Expiry date: 2026-06-03.

Blocking reason:

- This pass does not have a working Supabase MCP/Management API write channel.
- The change must be paired with auth-flow verification and a rollback note.

Acceptance rationale:

- The risk is understood and tracked as a live security warning.
- The safer next move is a small live-config change with immediate auth smoke,
  not an unverified claim in repo docs.

---

## Enablement Path

Rollout check:

1. Enable leaked password protection in Supabase Auth settings.
2. Verify password signup.
3. Verify password login for an existing test account.
4. Verify reset-password flow.
5. Re-run `npx supabase db advisors --linked --type security --level warn`.

PASS:

- advisor warning disappears;
- signup/login/reset work with expected UX;
- any rejected-password error is understandable to the user.

FAIL:

- advisor warning remains;
- auth UX breaks;
- user cannot recover from rejected password state.

Rollback expectation:

- If auth UX breaks unexpectedly, disable the setting temporarily and reopen the
  error-handling task before trying again.

---

## PASS Rule

This decision closes the release governance gap only as an explicit remediation
plan.
It does not remove the live warning.

Result: leaked password protection is plan-eligible and pending live Auth
configuration access plus verification.
