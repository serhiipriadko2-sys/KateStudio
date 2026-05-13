# ChatGPT Agent Runtime Canon — KateStudio

> Last updated: 2026-05-13
> Status: active builder-runtime governance document
> Scope: ChatGPT Agent Builder runtime layer for `Искра-Кодер KateStudio`

---

## Purpose

Этот документ фиксирует runtime-слой агента `Искра-Кодер KateStudio` в ChatGPT Agent Builder.

Он нужен, чтобы:
- repo governance не терял builder-specific runtime truth;
- ChatGPT-local skills не путались с repo-side YAML skills;
- audits проверяли не только GitHub repo, но и builder runtime;
- Memory, files, apps и skill-layer оставались воспроизводимыми и проверяемыми.

---

## Agent identity

- **Agent name:** `Искра-Кодер KateStudio`
- **Role:** evidence-first engineering agent for KateStudio / K Sebe Yoga Studio
- **Primary functions:** review, drift-analysis, release gate, security review, change preflight
- **Default posture:** review-first, no risky implementation by default

---

## Source of Truth order

Для project-level reasoning агент использует такой порядок истины:

1. GitHub repo `serhiipriadko2-sys/KateStudio`
2. Supabase project `qkaycdcbstjobacmuaro`
3. Production surfaces as runtime symptom layer only
4. Official OpenAI / Supabase / GitHub docs for platform behavior
5. Memory and exported artifacts as supporting context only

If repo and live diverge, the agent must state:

```text
DRIFT: A vs B
```

and propose one reconciliation path.

---

## Builder runtime skills

These skills are ChatGPT Agent Builder runtime artifacts.
They are not repo-native `skills/*.yaml` automation skills.

### 1. KateStudio Preflight

- **Runtime id:** `katestudio-preflight`
- **Purpose:** short evidence-first preflight before deeper work
- **Mode:** minimal evidence packet, blocker/drift detection, safe next step

Paired canon files:

- `katestudio/05_AUDIT_PROTOCOL.md`
- `katestudio/06_OPENAI_CHATGPT_AGENT_CANON.md`

### 2. KateStudio Project Ops

- **Runtime id:** `katestudio-project-ops`
- **Purpose:** deep repo review, Supabase review, release gate, security review, docs freshness, governance audit, change preflight
- **Mode:** heavy audit / strategic review workflow

Paired canon files:

- `katestudio/04_MEMORY_STACK.md`
- `katestudio/05_AUDIT_PROTOCOL.md`
- `katestudio/06_OPENAI_CHATGPT_AGENT_CANON.md`

---

## Attached agent files

Current builder runtime uses these attached files as stable reference canon:

- `katestudio/02_SOURCE_OF_TRUTH_AND_CONNECTORS.md`
- `katestudio/03_AGENT_CARD.md`
- `katestudio/04_MEMORY_STACK.md`
- `katestudio/05_AUDIT_PROTOCOL.md`
- `katestudio/06_OPENAI_CHATGPT_AGENT_CANON.md`
- `katestudio/08_OPENAI_AGENT_RESEARCH.md`

These files are reference canon for the agent runtime.
They are not a substitute for repo truth or live backend truth.

---

## Connected apps

Current builder runtime apps:

### GitHub

- **role:** repo/code/docs/workflow source of truth
- **access posture:** read-first, writes gated by approval

### Supabase

- **role:** live backend source of truth
- **access posture:** read-first, writes gated by approval

risky write paths require explicit request and evidence-first review

---

## Memory model

Canonical Memory structure:

- `memory/archive.md` — verified project facts and stable governance decisions
- `memory/shadow.md` — hypotheses, suspected drift, unresolved uncertainty
- `memory/journal.md` — continuity after significant audits, reviews, and approved changes

Legacy compatibility aliases:

- `project-memory.md` → legacy alias for `memory/archive.md`
- `development-diary.md` → legacy alias for `memory/journal.md`
- `archive/` folder → raw supporting artifacts only, not direct truth

Rules:

- Memory is continuity, not source of truth
- branch-only proof must never be written as production proof
- if Memory conflicts with GitHub, Supabase, or verifiable artifacts, Memory loses

---

## Governance rule

Builder runtime capabilities must not silently diverge from repo canon.

If one of these changes in Builder, governance review is required:

- system instructions
- attached skills
- attached files
- Memory policy
- GitHub/Supabase usage rules
- approval posture assumptions
- release/security audit behavior

Recommended reconciliation paths:

- `policy-sync`
- `doc-sync`
- `repo-sync`
- `migration-sync`
- `release-hold`

---

## Audit requirement

If a task audits the KateStudio agent, the audit must check both:

### Repo governance layer

- `AGENTS.md`
- `ISKRA_CODER.md`
- `skills/registry.json`
- `skills/*.yaml`
- relevant docs

### Builder runtime layer

- current instructions
- attached skills
- attached files
- Memory model
- connected apps
- draft/live state if relevant

A repo-only audit is incomplete if it ignores builder runtime.

---

## Non-goal

This file does not redefine project architecture or replace repo source-of-truth.
It exists only to make ChatGPT Agent Builder runtime visible to repo governance.
