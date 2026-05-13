# AGENTS.md — Multi-Agent Contract for KateStudio

> **Last updated:** 2026-03-15 | **Version:** 3.1.0

Этот файл описывает **мульти-агентную архитектуру** репозитория.
Он не заменяет код, не заменяет `ISKRA_CODER.md` и не заменяет launch-sensitive документы.
Его задача — объяснить, **какой агент за что отвечает и какой источник истины сильнее**.

---

## 1) Canonical instruction stack

Приоритет источников для AI-агентов:

1. релевантный код и конфигурация (`package.json`, `.env.example`, `.github/workflows/*`, migrations, tests)
2. `ISKRA_CODER.md`
3. agent-specific overlay (`CLAUDE.md` / `QWEN.md`)
4. `docs/CODEX_INSTRUCTIONS.md` для launch-sensitive задач
5. `CURRENT_TASKS.md`
6. прочие docs / audits / summaries

Если источники спорят:
- побеждает **более свежий и более безопасный**;
- конфликт помечается как **drift**;
- при необходимости создаётся отдельная задача **doc-sync**.

---

## 2) Shared guardrails for all agents

Все агенты обязаны соблюдать:

- **SoT-first** — истина в репозитории, не в памяти чата
- **Review-before-code**
- **Approval-before-implementation**
- **Minimal safe diff**
- **No secrets**
- **Tests/verification before DONE**
- **Doc drift must be named, not hidden**
- **AI contour is frozen by default**

### Frozen AI policy
Без отдельного явного разрешения Семёна не менять:
- `supabase/functions/gemini-proxy`
- AI wiring / model routing
- prompt contracts
- AI env variables
- связанные AI client/server integration points

Если задача в них упирается — агент должен остановиться и вынести это отдельным решением.

---

## 3) Supported agents

| Agent | Main file(s) | Role |
| --- | --- | --- |
| **ISKRA Coder protocol** | `ISKRA_CODER.md` | Canonical engineering behavior contract |
| **Claude Code / Claude / Cursor** | `CLAUDE.md` + `ISKRA_CODER.md` | Primary repo-aware development assistant |
| **Qwen Code** | `QWEN.md` + `ISKRA_CODER.md` | Compact implementation/review assistant |
| **OpenAI Codex** | `docs/CODEX_INSTRUCTIONS.md` | Launch-sensitive/refactoring/security assistant |
| **Copilot-style IDE agent** | `ISKRA_CODER.md` | Lightweight code/review overlay |
| **Jules / skill-based automation** | `skills/*.yaml`, `skills/registry.json` | Automated checks, scans, doc sync, migration checks |

---

## Builder runtime vs repo automation

KateStudio now has two distinct skill layers:

### 1. Repo-side automation skills

These are the machine-readable repo skills in:
- `skills/registry.json`
- `skills/*.yaml`

They describe repo-native automation, checks, policy, CI-facing or tooling-facing behavior.

### 2. Builder runtime skills

These are ChatGPT Agent Builder runtime artifacts used by the active KateStudio agent.

They are documented in:
- `docs/CHATGPT_AGENT_RUNTIME.md`

They are **not** the same thing as repo-native YAML skills and must not be inferred from `skills/*.yaml` alone.

### Governance rule

If an audit, review, or drift-analysis touches the KateStudio agent itself, it must inspect both layers:

1. repo governance layer
2. builder runtime layer

A repo-only review is incomplete if it ignores builder runtime instructions, attached skills, attached files, Memory policy, and connected app behavior.

---

## 4) File roles

### `ISKRA_CODER.md`
Канонический инженерный протокол.
Определяет:
- поведение агента;
- режим review/implementation;
- SoT;
- repo boundaries;
- governance;
- output format.

### `CLAUDE.md`
Claude-specific overlay.
Не должен превращаться в энциклопедию проекта и не должен дублировать весь `ISKRA_CODER.md`.

### `QWEN.md`
Qwen-specific compact overlay.
Должен быть коротким, практическим и не должен тащить внутрь себя полную копию канонического протокола.

### `docs/CODEX_INSTRUCTIONS.md`
Launch-sensitive protocol.
Особенно важен там, где вопрос касается запуска, env, security boundaries и AI scope.

### `skills/*.yaml`
Machine-readable skill surface.
Если relevant skill не учтён — review считается неполным.

---

## 5) Coordination rules

### Before work
Агент должен:
1. прочитать релевантные файлы;
2. проверить `CURRENT_TASKS.md`, если задача пересекается с активными приоритетами;
3. назвать возможный drift, если документы спорят;
4. выбрать рабочий канон.

### During work
- не переписывать большие области “заодно”;
- не выдумывать несуществующие команды, пайплайны или пакеты;
- не трогать AI-контур по касательной;
- не прятать гипотезу под вид факта.

### After work
Нужно явно сообщить:
- что изменено;
- что проверено;
- что не проверено;
- PASS или FAIL;
- какие риски остались.

---

## 6) Definition of Done for agent work

Результат считается **PASS**, если:
- изменённые файлы названы явно;
- verification path указан;
- нет секретов;
- границы репозитория не сломаны;
- изменение не задело AI-контур без разрешения;
- нет притворства, будто всё проверено, если это не так.

Результат считается **FAIL**, если:
- агент пишет DONE без проверки;
- скрывает drift;
- ломает SoT/границы;
- тянет секреты или unsafe changes;
- затрагивает frozen AI scope без разрешения.

---

## 7) Recommended verification commands

```bash
npm run test:run
npm run lint
npm run typecheck
npm run format:check
npm run build:web
npm run build:app
```

Фактический источник истины по командам — `package.json`.

---

## 8) Practical note for maintainers

Если инструкции начинают расходиться:
- сначала синхронизируй `ISKRA_CODER.md`;
- затем обнови `CLAUDE.md` / `QWEN.md`;
- затем поправь `AGENTS.md`;
- затем, если нужно, зафиксируй doc-sync в `CURRENT_TASKS.md` или `CHANGELOG.md`.

Формула:
**Один канон. Несколько overlays. Никакой конкурирующей истины.**
