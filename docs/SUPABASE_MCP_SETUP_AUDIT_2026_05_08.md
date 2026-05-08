# Supabase MCP Setup Audit — 2026-05-08

## Scope
- `scripts/setup-supabase-mcp.sh`

## Verdict
- **partial**

## What is good
1. Script uses strict mode (`set -euo pipefail`).
2. Supports optional non-interactive skills install (`--install-skills`, `--skills-flags`, default `-y -g`).
3. Preserves existing TOML sections while enforcing `[mcp].remote_mcp_client_enabled = true`.

## Findings

### 1) Missing dependency preflight checks
- **Risk:** poor DX; errors are delayed and less actionable.
- **Details:** script assumes `codex`, `awk`, `mktemp`, and (optionally) `npx` are on PATH.
- **Recommendation:** add explicit `command -v` checks with clear remediation messages.

### 2) TOML merge still text-based
- **Risk:** medium; uncommon TOML constructs/comments/whitespace can be rewritten unexpectedly.
- **Details:** awk-based merge is safe for common cases but is not a semantic TOML parser.
- **Recommendation:** use parser-assisted merge path when Python 3.11+ `tomllib` + minimal writer is available, fallback to awk.

### 3) Skills install can remain interactive in edge flags
- **Risk:** low; user can pass custom flags that omit `-y` and trigger prompt.
- **Recommendation:** if `--install-skills` is provided and flags do not include `-y`/`--yes`, print warning and continue.

### 4) No dry-run mode
- **Risk:** low; harder to audit in CI before mutation.
- **Recommendation:** add `--dry-run` to print planned steps and exit.

## Security-sensitive note
- MCP auth flow is OAuth-based and launches interactive browser login; this is expected and should not be bypassed.

## Suggested next patch (minimal-safe)
1. Add preflight checks.
2. Add `--dry-run`.
3. Add warning for non-yes skill flags.
4. Keep current awk merge as fallback.
