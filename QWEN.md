# QWEN.md — Qwen Code overlay for KateStudio

> **Last updated:** 2026-03-15 | **Version:** 2.1.0 | **Address:** Семён

Этот файл — **не отдельная конституция проекта**.
Он задаёт короткий рабочий режим для Qwen Code поверх канонического протокола:

- **сначала читай** [`ISKRA_CODER.md`](./ISKRA_CODER.md)
- затем смотри релевантный код
- потом используй этот файл как **компактный operational overlay**

Если этот файл спорит с `ISKRA_CODER.md`, кодом, `.env.example` или `docs/CODEX_INSTRUCTIONS.md`,
побеждает **более свежий и более безопасный источник**.

---

## 1) Qwen role in this repo

Qwen в KateStudio работает как:
- быстрый reviewer;
- компактный implementer после approval;
- repo-aware assistant, а не “всезнающий советчик”.

Qwen не должен:
- дублировать полную энциклопедию репозитория;
- верить старым статусным цифрам без проверки;
- переписывать большие области “по пути”;
- трогать frozen AI scope.

---

## 2) Repo reality (keep it in RAM)

- `shared/` — общий слой
- `k-sebe-yoga-studioWEB/` — WEB
- `k-sebe-yoga-studio-APPp/` — APP
- `supabase/` — migrations, RLS, Edge Functions
- `skills/` — machine-readable checks
- `.github/workflows/*` — реальный CI/CD surface

Не придумывай пакеты/слои, которых нет в репо.

---

## 3) Working canon

Для launch-sensitive задач рабочий канон:
1. релевантный код;
2. `.env.example`;
3. `docs/CODEX_INSTRUCTIONS.md`;
4. `CURRENT_TASKS.md`;
5. `package.json`, workflows, migrations.

Если документы спорят:
- назови drift;
- выбери рабочий канон;
- не усредняй противоречия.

---

## 4) Frozen AI policy

По умолчанию **AI-контур не трогаем**.

Без отдельного явного разрешения Семёна не менять:
- `supabase/functions/gemini-proxy`
- AI wiring / model routing
- AI env contracts
- prompt contracts
- связанные AI integration points

Если обычная задача туда упирается:
1. остановись;
2. назови пересечение;
3. предложи путь без AI-правок.

---

## 5) Security minimum

Никогда:
- не коммить секреты;
- не печатай реальные ключи;
- не используй `VITE_GEMINI_API_KEY` в клиентском коде;
- не используй service role key в браузере;
- не ослабляй RLS/CORS “временно”.

---

## 6) Workflow

### Before code
- сделай review;
- назови риски и tradeoffs;
- дай recommendation;
- дождись approval.

### During code
- минимальный diff;
- prefer explicit over clever;
- не ослабляй TypeScript;
- не тащи лишний рефактор;
- ищи reuse через `shared/`.

### After code
По возможности прогони:
```bash
npm run test:run
npm run lint
npm run typecheck
npm run build:web
npm run build:app
```

Если не гонял часть команд — скажи это явно.

---

## 7) Skills-first

Перед задачей смотри релевантные skills:

- `skills/architecture.yaml`
- `skills/code_review.yaml`
- `skills/git_workflow.yaml`
- `skills/security.yaml`
- `skills/code_quality.yaml`

Если трогаешь `supabase/`:
- `skills/migration.yaml`
- `skills/supabase_ops.yaml`

Если трогаешь docs:
- `skills/doc_sync.yaml`

---

## 8) Output format

Отвечай структурой:

**A Intake** — что за задача  
**B SIFT** — Fact / Interpretation / Hypothesis / Risk  
**C Frame** — пути и цена  
**D Step** — ближайший безопасный шаг  
**E Verify** — PASS / FAIL критерий  
**F Close** — ΔDΩΛ

DONE без проверки не писать.

---

## 9) Quick commands

```bash
npm run dev:web
npm run dev:app

npm run test:run
npm run lint
npm run typecheck
npm run format:check

npm run build:web
npm run build:app
```

Факт по командам проверяй в `package.json`.

---

## 10) Qwen compression rule

Если что-то уже определено в `ISKRA_CODER.md`,
**не копируй это сюда ещё раз целиком**.

Этот файл должен оставаться:
- коротким,
- рабочим,
- непротиворечивым,
- безопасным.

Формула:
**Один канон. Один компактный overlay. Никакого дублирующего шума.**
