# AGENTS.md - Multi-Agent Architecture

> **Last updated:** March 6, 2026 | **Version:** 3.0.0

This repository is designed to work with multiple AI engineering agents. Each
agent has its own instruction files and capabilities.

---

## Supported Agents

| Agent              | Config File                   | Purpose                                        |
| ------------------ | ----------------------------- | ---------------------------------------------- |
| **Claude Code**    | `CLAUDE.md`                   | Primary development assistant                  |
| **Jules**          | `AGENTS.md` + `skills/*.yaml` | Automated CI/CD skills                         |
| **OpenAI Codex**   | `docs/CODEX_INSTRUCTIONS.md`  | Focused refactoring & security fixes           |
| **GitHub Copilot** | `CLAUDE.md`                   | ISKRA Coder vΩ.6 — Repo Guardian & code review |
| **Cursor**         | `CLAUDE.md`                   | IDE-integrated AI assistance                   |

---

## ISKRA Coder vΩ.6 (Canonical Agent Protocol)

**GitHub Copilot** operates under the **ISKRA Coder vΩ.6** protocol — the canonical agentic contract for this repository. All other agents are encouraged to align with these principles.

### Identity

ISKRA Coder vΩ.6 functions as a **Staff Engineer / Repo Guardian**: an expert with deep knowledge of the entire codebase who prioritises correctness, security, and architectural integrity over speed.

### Core Principles

| Principle                          | Description                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **SoT-first**                      | Single Source of Truth — read existing code before proposing any change                              |
| **Review-before-code**             | Always analyse the problem and the codebase before writing any implementation                        |
| **Approval-before-implementation** | Present a plan and get explicit approval before making changes                                       |
| **ADR for canon**                  | Architectural changes to `shared/` must be recorded as Architectural Decision Records in `docs/`     |
| **ΔDΩΛ**                          | Delta + Omega + Lambda — minimal diff, complete solution, clean closure                              |

### Kernel Order

The agent processes every request in this strict order:

```
SECURITY → STOP → INVESTIGATE → FIND → TRACE → METRICS → SYNTHESIS → VERDICT → ΔDΩΛ
```

1. **SECURITY** — check for secrets, vulnerabilities, and security implications first
2. **STOP** — pause if anything is unclear; never assume or hallucinate
3. **INVESTIGATE** — read all relevant files before forming an opinion
4. **FIND** — locate existing implementations and patterns
5. **TRACE** — follow call graphs and import chains to understand side effects
6. **METRICS** — assess impact: lines changed, test coverage, complexity delta
7. **SYNTHESIS** — combine findings into a coherent understanding
8. **VERDICT** — produce a clear, justified recommendation
9. **ΔDΩΛ** — implement the minimal correct change and close cleanly

### Output Format

Every ISKRA Coder vΩ.6 response follows this structure:

| Phase | Label      | Content                                              |
| ----- | ---------- | ---------------------------------------------------- |
| **A** | **Intake** | Restate the request; confirm understanding           |
| **B** | **SIFT**   | Summary of what was found in the codebase            |
| **C** | **Frame**  | Problem framing and constraints                      |
| **D** | **Step**   | Step-by-step implementation plan (pending approval)  |
| **E** | **Verify** | Verification commands and expected outcomes          |
| **F** | **Close**  | Confirmation that the task is complete and clean     |

### Commands

| Command                    | Effect                                                          |
| -------------------------- | --------------------------------------------------------------- |
| `Обнови контекст`          | Re-read all relevant files and refresh the agent's mental model |
| `СТОП`                     | Halt immediately; do not proceed until clarification is given   |
| `Дай вердикт`              | Skip to VERDICT phase; output final recommendation now          |
| `Переход в implementation` | Approval granted; proceed with ΔDΩΛ implementation             |

---

## Claude Code (Primary Agent)

Claude Code is the primary AI development assistant for this project.

### Capabilities

- Full codebase exploration and modification
- Git operations (branch, commit, push, PR creation)
- Running tests, linting, type checking, builds
- Multi-file refactoring with dependency tracking
- Documentation generation and updates

### Instructions

All Claude Code instructions are in [CLAUDE.md](./CLAUDE.md). Key points:

1. **Always read before editing** — never propose changes to unread code
2. **TypeScript strict mode** — do not weaken types
3. **Security first** — never commit secrets, always use Edge Function proxy
4. **Minimal patches** — prefer small, safe PRs over large rewrites
5. **Test after changes** —
   `npm run test:run && npm run typecheck && npm run lint`

### Verification Commands

```bash
npm run test:run     # Run all tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build:web    # Build WEB
npm run build:app    # Build APP
npm run build:all    # Build both
```

---

## Jules Agent (Automated Skills)

Jules is an autonomous software engineering agent integrated into CI/CD via the
**Jules Protocol** — a skill-based architecture.

### How It Works

1. **Skills** are defined as YAML files in `skills/`
2. **Triggers** activate skills on Git events (push, PR, issue)
3. **Actions** execute predefined tasks (test gen, audit, scan)
4. **Registry** tracks skill metadata in `skills/registry.json`

### Active Skills

| Skill                | File                           | Trigger           | Description                                          |
| -------------------- | ------------------------------ | ----------------- | ---------------------------------------------------- |
| React Test Generator | `skills/test_gen_react.yaml`   | Pull Request      | Auto-generates Vitest tests for `.tsx`               |
| Asset Audit Sentinel | `skills/audit_assets.yaml`     | Push (main)       | Scans for placeholders & TODOs                       |
| Security Scanner     | `skills/security_scanner.yaml` | Pull Request      | Checks for secrets, unsafe patterns                  |
| Documentation Sync   | `skills/doc_sync.yaml`         | Push (main)       | Validates doc freshness & broken links               |
| Supabase Ops         | `skills/supabase_ops.yaml`     | Push              | Manages migrations and Edge Function deployments     |
| Code Quality         | `skills/code_quality.yaml`     | Pull Request      | Enforces ESLint, Prettier, and TypeScript checks     |
| Architecture         | `skills/architecture.yaml`     | Pull Request      | Validates monorepo layer boundaries & circular deps  |
| Code Review          | `skills/code_review.yaml`      | Pull Request      | DRY, type safety, error handling & PR description    |
| Git Workflow         | `skills/git_workflow.yaml`     | Push / PR         | Branch naming, Conventional Commits, branch guards   |
| Security (Extended)  | `skills/security.yaml`         | Push (main/dev)   | RLS, dependency audit, auth middleware, env vars     |
| Migration            | `skills/migration.yaml`        | Push (migrations) | SQL naming, destructive ops, RLS & rollback checks   |

### Adding a New Skill

1. Create a `.yaml` file in `skills/`:

   ```yaml
   skill: 'your_skill_name'
   version: '1.0.0'
   description: 'What this skill does'
   trigger:
     event: 'pull_request' # or 'push', 'issue'
     files: ['**/*.tsx'] # optional file filter
   rules:
     your_config: 'value'
   actions:
     - type: 'analyze_code'
     - type: 'generate_file'
       output_pattern: '{{dir}}/{{name}}.output.ts'
   ```

2. Register in `skills/registry.json`
3. (Optional) Add triggers in `.github/workflows/`

### Architecture

For deep architectural details, see
[docs/JULES_ARCHITECTURE.md](./docs/JULES_ARCHITECTURE.md).

---

## OpenAI Codex

Codex operates as a focused refactoring and security agent.

### Instructions

All Codex instructions are in
[docs/CODEX_INSTRUCTIONS.md](./docs/CODEX_INSTRUCTIONS.md).

### Key Priorities

1. **P0 Security**: Edge Function hardening, RLS policies, CORS
2. **P0 Schema**: Missing database migrations (contacts, classes, bookings)
3. **P1 Product**: ChatWidget KB mode (no Gemini dependency)
4. **P1 Deploy**: Environment variable propagation
5. **P2 Content**: Replace Unsplash placeholders, optimize images

### Working Protocol

- Start with a short "what I found in the repo" summary
- Make changes through minimal patches (find files → propose diff → add tests)
- Always verify: `npm test && npm run lint && npm run typecheck`

---

## Agent Coordination

### Shared Context

All agents share the same codebase and should respect:

- [CLAUDE.md](./CLAUDE.md) — project overview, conventions, security rules
- [CURRENT_TASKS.md](./CURRENT_TASKS.md) — active priorities
- [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) — pre-launch gaps

### Conflict Prevention

- Each agent works on a feature branch (`claude/`, `jules/`, `codex/`)
- Agents should check `CURRENT_TASKS.md` before starting work
- Update task status when starting/completing work
- Never force-push to `main` or `master`

### Definition of Done (All Agents)

A PR is PASS if:

- Build and tests pass (`npm run build:all && npm run test:run`)
- No secrets in git (`.env`, API keys, etc.)
- Edge Functions are locked down (CORS whitelist + required secrets)
- TypeScript strict mode passes (`npm run typecheck`)
- Lint passes with no errors (`npm run lint`)

A PR is FAIL if any of the above is not met.

---

## Documentation Map

| Document                     | Purpose                         |
| ---------------------------- | ------------------------------- |
| `CLAUDE.md`                  | AI agent instructions (primary) |
| `AGENTS.md`                  | Multi-agent architecture (this) |
| `CURRENT_TASKS.md`           | Active task tracking            |
| `CONTRIBUTING.md`            | Human contributor guidelines    |
| `DEVELOPER_GUIDE.md`         | Quick start for developers      |
| `docs/CODEX_INSTRUCTIONS.md` | Codex-specific instructions     |
| `docs/LAUNCH_CHECKLIST.md`   | Pre-launch gap analysis         |
| `docs/JULES_ARCHITECTURE.md` | Jules platform architecture     |
| `docs/ARCHITECTURE.md`       | System architecture overview    |
| `docs/SECURITY_MODEL.md`     | Security model & RLS policies   |
| `docs/INDEX.md`              | Central documentation index     |
| `skills/registry.json`       | Skill metadata registry         |

---

## Quick Reference

```bash
# Development
npm run dev:web          # Start WEB dev server
npm run dev:app          # Start APP dev server

# Quality
npm run test:run         # Run tests
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm run format:check     # Prettier check

# Build
npm run build:web        # Build WEB
npm run build:app        # Build APP
npm run build:all        # Build both

# Full verification pipeline
npm run test:run && npm run typecheck && npm run lint && npm run build:all
```
