# ADR-2026-05-27 | Leaked Password Protection — Pending Live Config

- Context date: 2026-05-27
- Author: Iskra vΩ.7 / release-gate pass
- Status: PENDING (live action required, expires 2026-06-03)
- Live project: `qkaycdcbstjobacmuaro`

---

## Context

Live Supabase security advisor reports `auth_leaked_password_protection`:
password leaked-breach checking (HaveIBeenPwned.org integration) is currently
disabled in Supabase Auth settings.

The organization is confirmed on Pro Plan — plan eligibility is not the blocker.

Existing decision note: `docs/SECURITY_DECISION_LEAKED_PASSWORD_PROTECTION_2026_05_27.md`

---

## Decision

**Enable leaked password protection via Supabase Dashboard or Management API
as soon as live Auth config access is available, then verify auth flows.**

This ADR records the decision, not the execution. Live change requires:

1. Dashboard access: Authentication → Sign In / Providers → Email → Password security
   → Enable "Leaked password protection".
2. OR Management API: `PATCH /v1/projects/qkaycdcbstjobacmuaro/config/auth`
   with `{"password_hibp_enabled": true}` and a scoped access token.
3. Verification smoke: signup, login, reset-password flows tested after enable.
4. Re-run security advisors and confirm `auth_leaked_password_protection` is gone.

---

## Alternatives Considered

1. **Accept permanently disabled** — lower security for users. Not acceptable
   given Pro Plan eligibility.
2. **Wait for agent tooling** — acceptable only as short delay, not indefinite deferral.
3. **Enable without smoke test** — risky; rejected because auth UX regression
   cannot be caught after the fact without user reports.

---

## Consequences / Price

- Live `auth_leaked_password_protection` warning remains until executed.
- Enabling adds HaveIBeenPwned.org check on signup/reset. Users with
  previously-compromised passwords will need to choose a new one.
- No code changes required — pure live config.

---

## Verification

PASS condition:
- `auth_leaked_password_protection` no longer appears in security advisors.
- Signup with a non-compromised password succeeds.
- Login with an existing account succeeds.
- Reset-password flow works without unexpected auth error.

FAIL condition:
- Auth advisor warning remains.
- Auth UI breaks or user cannot recover from a rejected-password state.

---

## Rollback / Reversal Trigger

- If auth UX breaks: disable the setting in Dashboard immediately, diagnose
  error handling, and re-enable only after UX path is confirmed safe.
- Expiry 2026-06-03: re-evaluate or escalate if not resolved by then.

---

## ∆DΩΛ

- ∆ ADR written; live warning still present.
- D Evidence: security advisor confirmed via Supabase MCP on 2026-05-27;
  Pro Plan confirmed by owner; enablement path documented.
- Ω 0.9 — high confidence the fix is a single live-config change; risk is
  only in UI-side error handling of rejected passwords.
- Λ Resolution on dashboard action + smoke test, or escalation by 2026-06-03.
