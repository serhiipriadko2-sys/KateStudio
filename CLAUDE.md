# CLAUDE.md — KateStudio AI Agent Instructions

> **Last updated:** 2026-03-15 | **Version:** 3.3.0
> **Audience:** Claude Code / Claude / Cursor / Copilot-style IDE agents
> **Address:** Семён

Этот файл — **Claude-specific overlay** для работы с KateStudio.
Канонический инженерный протокол находится в **[ISKRA_CODER.md](./ISKRA_CODER.md)**.

Если этот файл спорит с `ISKRA_CODER.md`, `docs/CODEX_INSTRUCTIONS.md`, `.env.example` или актуальным кодом,
**побеждает более свежий и более безопасный источник**.

---

## 1) Что это за репозиторий

KateStudio — npm workspaces репозиторий проекта K Sebe Yoga Studio:

- `shared/` — общий слой (`@ksebe/shared`)
- `k-sebe-yoga-studioWEB/` — WEB
- `k-sebe-yoga-studio-APPp/` — APP
- `supabase/` — migrations, RLS, Edge Functions
- `skills/` — machine-readable rules / checks
- `docs/` — документационный слой проекта

Claude должен мыслить **repo-first**, а не prompt-first.

---

## 2) Роль этого файла

`CLAUDE.md` не дублирует весь канон.
Его задача — дать Claude-подобному агенту **быстрый рабочий контур**:

1. где искать истину;
2. как не сломать репозиторий;
3. как работать при конфликтующих документах;
4. что не трогать без отдельного разрешения;
5. как завершать задачу с проверкой.

Полный поведенческий контракт:
- [`ISKRA_CODER.md`](./ISKRA_CODER.md) — canonical repo guardian protocol
- [`AGENTS.md`](./AGENTS.md) — multi-agent routing and precedence
- [`docs/CODEX_INSTRUCTIONS.md`](./docs/CODEX_INSTRUCTIONS.md) — launch-sensitive working canon
- [`CURRENT_TASKS.md`](./CURRENT_TASKS.md) — active priorities
- [`skills/registry.json`](./skills/registry.json) — active skill surface

---

## 3) Working canon and drift handling

### 3.1 SoT order

При любом нетривиальном вопросе смотри по убыванию доверия:

1. релевантный код;
2. `.env.example`, `package.json`, `.github/workflows/*`;
3. `ISKRA_CODER.md`;
4. `docs/CODEX_INSTRUCTIONS.md`;
5. `CURRENT_TASKS.md`;
6. `AGENTS.md`, `QWEN.md`, прочие guide-файлы;
7. старые audit/status документы.

### 3.2 Не доверяй status-claims без перепроверки

Не считай фактом без подтверждения:
- количество тестов;
- coverage;
- lint/typecheck/build status;
- readiness score;
- количество миграций;
- формулировки вида “production-ready”, “fully green”, “done”.

Если документ утверждает число — проверь кодом, свежим файлом или явной командой.

### 3.3 Что делать при конфликте документов

Если `README`, `CURRENT_TASKS`, audits, `CLAUDE.md`, `AGENTS.md` и `docs/*` спорят:
- **назови конфликт**
- выбери **рабочий канон для этой задачи**
- пометь остальное как **drift**
- предложи **doc-sync** как отдельную задачу, если конфликт мешает решению

Не усредняй противоречия.

---

## 4) Repo boundaries

### Shared
- общий слой, который предпочитаем переиспользовать вместо копирования логики в WEB/APP;
- изменения публичных контрактов shared = повышенный governance risk.

### WEB
- маркетинг, landing, admin projection;
- не запихивай сюда серверную или чувствительную бизнес-логику.

### APP
- mobile-first PWA + Capacitor wrapper;
- прямые импорты `@capacitor/*` в компонентах запрещены;
- native integration идёт через `k-sebe-yoga-studio-APPp/native/`.

### Supabase
- schema, RLS, Edge Functions;
- auth/security/data boundaries живут здесь.

### Skills / Workflows
- не выдумывай pipeline, если `.github/workflows/*` и `skills/*.yaml` уже описывают рабочий контур.

---

## 5) Frozen AI policy

Для обычной работы по репозиторию действует правило:

**AI-контур frozen по умолчанию.**

Это значит:
- не менять `supabase/functions/gemini-proxy`;
- не менять AI service wiring;
- не менять model routing;
- не менять prompt contracts;
- не менять AI env-переменные;
- не менять client/server integration points, которые завязаны на AI.

Если обычная задача косвенно упирается в AI-контур:
1. остановись;
2. назови пересечение;
3. предложи путь без затрагивания AI;
4. только при отдельном явном разрешении переходи к review этой зоны.

---

## 6) Security rules

Никогда:
- не коммить секреты;
- не печатай реальные ключи;
- не используй `VITE_GEMINI_API_KEY` в клиентском коде;
- не используй service role key в браузере;
- не ослабляй CORS/RLS “временно”;
- не запускай destructive / deploy / prod-команды без явного поручения.

Разрешено:
- опираться на `.env.example`;
- описывать missing vars;
- давать безопасные локальные команды;
- предлагать doc-sync / governance fixes до кода.

---

## 7) Workflow for Claude

### Before code
- сначала review;
- потом tradeoffs;
- потом recommendation;
- потом approval;
- потом implementation.

### During work
- делай минимальный diff;
- не тащи рефактор “по пути”;
- не ослабляй типы;
- prefer named exports;
- сохраняй existing path aliases;
- отделяй факт от гипотезы.

### After code
Прогони по возможности:
```bash
npm run test:run
npm run lint
npm run typecheck
npm run build:web
npm run build:app
```

Если гонял не всё — скажи честно, что именно не проверял.

---

## 8) Skills-first

Перед review / implementation смотри:
- `skills/architecture.yaml`
- `skills/code_review.yaml`
- `skills/git_workflow.yaml`
- `skills/security.yaml`
- `skills/code_quality.yaml`

Если трогаешь `supabase/`:
- `skills/migration.yaml`
- `skills/supabase_ops.yaml`
- при необходимости `skills/security_scanner.yaml`

Если трогаешь docs / governance:
- `skills/doc_sync.yaml`

---

## 9) Output contract

Claude по умолчанию отвечает структурой:

**A Intake** — что за задача на самом деле  
**B SIFT** — Fact / Interpretation / Hypothesis / Risk  
**C Frame** — 1–3 пути + цена  
**D Step** — ближайший безопасный шаг  
**E Verify** — PASS / FAIL критерий  
**F Close** — ΔDΩΛ

Финал по задаче:
- изменённые файлы;
- команды проверки;
- PASS/FAIL;
- незакрытые риски;
- следующий шаг, если нужен.

DONE без проверки не писать.

---

## 10) Practical command set

```bash
npm run dev:web
npm run dev:app

npm run test:run
npm run lint
npm run typecheck
npm run format:check

npm run build:web
npm run build:app
npm run build:all
```

Смотри `package.json` как текущий источник команд.
Не копируй команды из старых документов, если они расходятся с реальным script surface.

---

## 11) What Claude should optimize for

Приоритеты по умолчанию:
1. truth over fluency
2. repo integrity over speed
3. launch safety over architectural vanity
4. minimal safe diff over sprawling refactor
5. explicit verification over confident prose

Формула:
**Сначала правда. Потом границы. Потом код. Потом проверка.**
