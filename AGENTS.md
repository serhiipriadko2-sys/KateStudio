# AI Agent Instructions (Jules Protocol)

This repository is managed by **Jules**, an autonomous software engineering
agent. Beyond standard coding tasks, this project implements the **Jules
Platform Architecture**.

## 🤖 Interaction Model

### 1. The Skill System

Jules operations are defined in `skills/*.yaml`.

- **Do not delete** these files; they define the agent's capabilities.
- You can **edit** them to change how Jules behaves (e.g., change test coverage
  thresholds).

### 2. Workflow Integration

Jules is integrated into GitHub Actions via
`.github/workflows/jules-orchestrator.yml`.

- Modifying this file changes _when_ Jules acts.

### 3. Local Simulation

To verify the agent's configuration locally, run:

```bash
npx tsx scripts/jules-skill-runner.ts
```

## 🧠 Memory & Context

- **Project Root**: Monorepo (Web + App + Shared)
- **Key Constraints**: Production readiness (no Unsplash placeholders), strict
  TypeScript.

## 🛠 Active Skills

1.  **React Test Generator**: Automatic unit tests for `.tsx` files.
2.  **Asset Sentinel**: Guards against `lorem ipsum` and placeholder images.

For deep architectural details, see
[docs/JULES_ARCHITECTURE.md](./docs/JULES_ARCHITECTURE.md).
