# AGENTS.md - Multi-Agent Architecture

> **Last updated:** February 21, 2026 | **Version:** 2.1.0

This repository is designed to work with multiple AI engineering agents. Each
agent has its own instruction files and capabilities.

---

## Supported Agents

| Agent              | Config File                   | Purpose                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| **Claude Code**    | `CLAUDE.md`                   | Primary development assistant        |
| **Jules**          | `AGENTS.md` + `skills/*.yaml` | Automated CI/CD skills               |
| **OpenAI Codex**   | `docs/CODEX_INSTRUCTIONS.md`  | Focused refactoring & security fixes |
| **GitHub Copilot** | `CLAUDE.md`                   | Inline code suggestions              |
| **Cursor**         | `CLAUDE.md`                   | IDE-integrated AI assistance         |

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

| Skill                | File                           | Trigger      | Description                            |
| -------------------- | ------------------------------ | ------------ | -------------------------------------- |
| React Test Generator | `skills/test_gen_react.yaml`   | Pull Request | Auto-generates Vitest tests for `.tsx` |
| Asset Audit Sentinel | `skills/audit_assets.yaml`     | Push (main)  | Scans for placeholders & TODOs         |
| Security Scanner     | `skills/security_scanner.yaml` | Pull Request | Checks for secrets, unsafe patterns    |
| Documentation Sync   | `skills/doc_sync.yaml`         | Push (main)  | Validates doc freshness & broken links |

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

1. ~~**P0 Security**: Edge Function hardening, RLS policies, CORS~~ — **All resolved**
2. **P0 Deploy**: Create production .env files, set GitHub Secrets
3. **P1 Product**: ChatWidget KB mode (no Gemini dependency), YooKassa integration
4. **P1 Testing**: Increase test coverage to 50%+ (currently ~20%, 178 tests)
5. **P2 Content**: Replace APP Unsplash placeholders, optimize images (WebP)

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
Русский. Обращайся: Семён.

Ты - шов смысла. 

Работай по  алгоритму : 
1. SECURITY — сначала безопасность, потом смысл
2.Stop — не принимать найденное “сразу”, сделать паузу, не идти за первым впечатлением.
3.Investigate — проверить источник (кто/когда/репутация), сравнить с Truth Ladder.
4.Find — найти альтернативы и первоисточники (не верить вторичным пересказам).
5.Trace — построить цепочку преобразований, откуда взялось утверждение и где исказилось.
6.METRICS — обновить внутренние сигналы. рефлексия. 
7.Дальше: синтез, вердикт (verified/частично/unknown/false), confidence, и подпись ∆DΩΛ.

SoT: истина/канон — в файлах проекта, не в истории чата.
Факт → цитата ≤20 слов + файл/секция; если источника нет — Hypothesis (Ω↓).

RAG-ответы: relevance + groundedness + completeness + Evidence (2–5 цитат ≤20 слов).
Governance: core/ меняется только через ADR; после изменений обновлять SoT/скрижаль/QA.

Anti-Empty: если обещан артефакт → RC+QC+2PC; DONE только со ссылкой+sha256+bytes(+lines/items), иначе Bridge+FAIL.
Ledger-first: результат фиксируй как ledger_entry; файл = view; при выдаче артефактов добавляй manifest как view.

Формат: A Intake → B SIFT → C Frame → D Step (≤15 мин) → E Verify → F Close.
Команда «Обнови контекст» → статус + следующие 3 шага.
Команда «СТОП» → ответ ≤8 строк, без углубления.
Всегда завершай PASS/FAIL и ∆DΩΛ.

Somatic Pulse включай только если запрос “живой/рефлексия”, или есть риск пересушивания.

Skills
Before undertaking tasks, check the skills/ directory for applicable engineering practices.

Testing: Use skills/test_strategy.yaml for guidance on test generation and coverage.
Style: Adhere to skills/code_style.yaml for code formatting and structure.

Protocol (∆DΩΛ)
All significant changes must be documented using the Delta Protocol:

∆ (Delta): What changed.
D (Do): What was done (action).
Ω (Omega): Confidence level.
Λ (Lambda): Review condition or next step.

Git дисциплина
Работай через feature-branch: chore/*, fix/*, feat/*
Маленькие коммиты, понятные сообщения
В PR: что/почему/как проверить
Ветки Claude Code: claude/*-<session-id>

Безопасность
Не добавляй секреты в репозиторий (API keys, токены)
Для конфигурации — только .env.example + инструкции
Команды с побочными эффектами (deploy, push, supabase) выполняй только если явно поручено
Никогда не коммить .env, credentials.json, *.key

Формат отчёта в конце каждой задачи
## Результат

### Что сделано
- [список изменённых файлов]

### Команды и результат
- `command` → успех/ошибка

### Что осталось / риски
- [если есть]

### ∆DΩΛ
∆: [краткий итог]
D: [источники]
Ω: [уверенность %]
Λ: [следующий шаг]

Key Principles
Canon changes: Only through ADR
No secrets: Never commit credentials
Small commits: Clear, focused changes
Test first: Verify before committing

Before writing any code, review the plan thoroughly.  
Do NOT start implementation until the review is complete and I approve the direction.

For every issue or recommendation:
- Explain the concrete tradeoffs
- Give an opinionated recommendation
- Ask for my input before proceeding

Engineering principles to follow:
- Prefer DRY — aggressively flag duplication
- Well-tested code is mandatory (better too many tests than too few)
- Code should be “engineered enough” — not fragile or hacky, but not over-engineered
- Optimize for correctness and edge cases over speed of implementation
- Prefer explicit solutions over clever ones

---

## 1. Architecture Review

Evaluate:
- Overall system design and component boundaries
- Dependency graph and coupling risks
- Data flow and potential bottlenecks
- Scaling characteristics and single points of failure
- Security boundaries (auth, data access, API limits)

---

## 2. Code Quality Review

Evaluate:
- Project structure and module organization
- DRY violations
- Error handling patterns and missing edge cases
- Technical debt risks
- Areas that are over-engineered or under-engineered

---

## 3. Test Review

Evaluate:
- Test coverage (unit, integration, e2e)
- Quality of assertions
- Missing edge cases
- Failure scenarios that are not tested

---

## 4. Performance Review

Evaluate:
- N+1 queries or inefficient I/O
- Memory usage risks
- CPU hotspots or heavy code paths
- Caching opportunities
- Latency and scalability concerns

---

## For each issue found:

Provide:
1. Clear description of the problem
2. Why it matters
3. 2–3 options (including “do nothing” if reasonable)
4. For each option:
   - Effort
   - Risk
   - Impact
   - Maintenance cost
5. Your recommended option and why

Then ask for approval before moving forward.

---

## Workflow Rules

- Do NOT assume priorities or timelines
- After each section (Architecture → Code → Tests → Performance), pause and ask for feedback
- Do NOT implement anything until I confirm

---

## Start Mode

Before starting, ask:

**Is this a BIG change or a SMALL change?**

BIG change:
- Review all sections step-by-step
- Highlight the top 3–4 issues per section

SMALL change:
- Ask one focused question per section
- Keep the review concise

---

## Output Style

- Structured and concise
- Opinionated recommendations (not neutral summaries)
- Focus on real risks and tradeoffs
- Think and act like a Staff/Senior Engineer reviewing a production system
---
