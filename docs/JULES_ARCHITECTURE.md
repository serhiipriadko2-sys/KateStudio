# Jules Platform Architecture (JaaP)

> **Concept:** Transforming Jules from a passive coding assistant into an active, self-learning engineering platform.

## 🧠 Core Philosophy
This repository implements the **Jules Protocol**, a layered architecture where:
1.  **Skills** are defined as code (YAML).
2.  **Orchestration** is handled by CI/CD (GitHub Actions).
3.  **Knowledge** is stored and evolved over time.

## 🏗 Architecture Layers

### 1. Knowledge Layer (`/skills`)
This directory contains the "brain patterns" for the agent.
-   `test_gen_react.yaml`: Logic for TDD (Test Driven Development) in React.
-   `audit_assets.yaml`: Logic for maintaining production readiness (no placeholders).
-   `registry.json`: The central database of active skills.

### 2. Orchestration Layer (`.github/workflows/jules-orchestrator.yml`)
The nervous system that triggers skills based on events:
-   **Push**: Triggers Audits.
-   **Pull Request**: Triggers Code Generation/Testing.
-   **Issue**: Triggers Planning/Refactoring.

### 3. Execution Layer (`scripts/jules-skill-runner.ts`)
A prototype runtime that parses the skill definitions and executes the corresponding actions (in a full implementation, this would be the `jules` binary).

## 🚀 How to Add a New Skill

1.  Create a `.yaml` file in `skills/`.
    ```yaml
    skill: "security_scanner"
    trigger: { event: "push" }
    actions: [ ... ]
    ```
2.  Register it in `skills/registry.json`.
3.  (Optional) Add specific triggers in the GitHub Workflow.

## 📊 Feedback Loop
The platform is designed to learn. Future implementations will write back to `registry.json` to update `success_rate` based on whether the generated code passed CI tests.
