# Legacy Payment Retirement Plan | KateStudio | 2026-05-28

> Mode: CHANGE-PREFLIGHT
> Scope: `create-payment`, `payment-webhook`, `cancel-subscription`
> Boundary: no live mutation in this document; this is a staged retirement plan only.

---

## 1. Goal

Retire the legacy payment contour in a controlled order without breaking:

- APP YooKassa checkout via `create-yookassa-checkout`;
- APP payment completion via `yookassa-webhook`;
- any remaining live client or automation dependency that still hits the legacy pair.

Current canon: repo-side stale WEB callers are already gone; live still exposes the legacy pair and `cancel-subscription`.

---

## 2. Source-of-truth baseline

### Repo-side facts

- `supabase/functions/create-payment/index.ts` still exists in repo and implements the legacy subscription/payment flow.
- `supabase/functions/payment-webhook/index.ts` still exists in repo and finalizes the legacy subscription flow.
- `supabase/functions/cancel-subscription/index.ts` still exists in repo and updates `subscriptions` through a service-role path.
- Current canon says 0 repo-side stale WEB callers remain.

### Live-side facts

- live function inventory still reports active `create-payment`, `payment-webhook`, and `cancel-subscription`.
- live also reports active app-target pair `create-yookassa-checkout` and `yookassa-webhook`.
- current launch/security canon treats this as dual payment contour governance drift, not as a missing deployment issue.

---

## 3. Retirement principle

Retire from the least user-visible dependency outward.

Recommended order:

1. `cancel-subscription`
2. `create-payment`
3. `payment-webhook`

Why this order:

- `cancel-subscription` is the narrowest surface and should be easiest to prove unused or replace operationally.
- `create-payment` is the request-entry surface; once it is gone, new legacy payment attempts should stop.
- `payment-webhook` should be retired last so in-flight legacy payments do not lose their completion path.

---

## 4. Preconditions before any live retirement

All of the following should be collected as an evidence packet before Step A below:

1. one fresh live function inventory;
2. one fresh repo search proving no intended client callers remain for `create-payment` and `cancel-subscription`;
3. one recent runtime/log check, if available, for legacy function invocation recency;
4. one APP smoke baseline for `create-yookassa-checkout` and `yookassa-webhook`;
5. one owner decision on whether any temporary transition window is still intentionally open.

If item 3 cannot be verified, treat that as an evidence gap and use a reversible pause window instead of immediate deletion.

---

## 5. Staged plan

### Stage A - Evidence lock

Objective:

- freeze the current dependency picture before touching live.

Checks:

- verify current live function list;
- verify current repo callers;
- verify app-target checkout still works end to end in smoke scope;
- capture whether legacy functions have recent traffic.

Exit condition:

- evidence packet is complete enough to choose between `disable-first` and `delete-after-drain` posture.

### Stage B - `cancel-subscription`

Objective:

- retire the least critical legacy surface first.

Action posture:

- prefer disable/remove only after proving no active APP or WEB UX still depends on it.

Verification:

- authenticated APP profile/account flows still load normally;
- no runtime error path assumes this endpoint exists;
- no recent live usage signal contradicts retirement.

Rollback concern:

- if an account-management flow still assumes it, restore the function before touching payment creation/completion.

Exit condition:

- `cancel-subscription` dependency ruled out or explicitly replaced.

### Stage C - `create-payment`

Objective:

- stop new legacy payment creation attempts.

Action posture:

- retire only after app-target checkout smoke is green on the same current live baseline.

Verification:

- APP checkout still creates payment orders through `create-yookassa-checkout`;
- no WEB route or hidden client still attempts `create-payment`;
- live errors do not show new failed calls to the removed endpoint from an intended surface.

Rollback concern:

- if a hidden client still uses `create-payment`, restore it immediately and document the missed caller.

Exit condition:

- no new intended legacy payment creation path remains.

### Stage D - drain window for `payment-webhook`

Objective:

- allow any already-created legacy payments to finish before removing the callback surface.

Recommended posture:

- keep `payment-webhook` live for one explicit drain window after `create-payment` retirement.
- drain-window length should be chosen by the owner based on expected payment completion latency and support tolerance.

Verification during drain:

- monitor whether legacy webhook invocations still occur;
- monitor whether legacy subscriptions continue to transition state.

Exit condition:

- no evidence of active in-flight legacy payments remains, or the owner explicitly accepts cutting over with zero remaining legacy completion support.

### Stage E - retire `payment-webhook`

Objective:

- close the last legacy payment completion surface.

Verification:

- app-target webhook `yookassa-webhook` remains healthy;
- no support or runtime evidence suggests stranded legacy payments;
- release/security docs are updated so legacy contour no longer appears as intentionally live.

Rollback concern:

- if post-retirement support reveals unresolved in-flight legacy payments, restore the endpoint long enough to drain and then rerun Stage D.

---

## 6. Decision rules

Use these binary rules during execution:

- If recent live usage of a legacy function is confirmed and not explained, do not delete in the same pass.
- If app-target checkout smoke is not green, do not retire `create-payment`.
- If any in-flight legacy completion path is still plausible, do not retire `payment-webhook` yet.
- If evidence is partial, prefer a short explicit transition window over pretending the contour is already dead.

---

## 7. Minimum verification matrix

| Step | Must stay green |
| --- | --- |
| Before Stage B | APP login/profile basics, app-target payment smoke, current live function inventory |
| After Stage B | account/profile flows, no hidden cancel regression |
| After Stage C | app-target checkout creation, no intended legacy entrypoint |
| During Stage D | no evidence of unresolved legacy completion traffic |
| After Stage E | app-target payment completion, docs/runtime support posture |

---

## 8. Release impact

This plan narrows the release blocker from “dual contour exists” to a concrete staged execution path.

Launch PASS can treat dual payment contour as closed only when either:

- all three legacy functions are retired in the staged order above; or
- the owner explicitly records a bounded transition window with expiry criteria.

---

## 9. Safest next step

Collect the Stage A evidence packet: fresh live function inventory, fresh repo caller search, legacy invocation recency check if available, and one APP YooKassa smoke baseline.
