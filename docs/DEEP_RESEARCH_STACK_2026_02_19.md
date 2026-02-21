# Deep Research: KateStudio Ecosystem (InsideFlow)

_Дата: 2026-02-19 (rev2)_

## A) Intake

Цель: доработать deep research до уровня операционного SoT для запуска проекта.

Контекст запроса:

- Security-first (P0 до product-решений).
- Truth Ladder: только проверяемые факты из файлов репозитория.
- Формат: A→F + verified/частично/unknown/false + confidence + ∆DΩΛ.

## B) SIFT

### 1) SECURITY (сначала)

**Verified**

- Серверный Gemini-прокси использует явный allowlist origin.
- Входящие payload валидируются через Zod-схему.
- Основные quality gates существуют как корневые npm scripts.

**Evidence (цитаты ≤20 слов)**

1. `const allowedOrigins = [` — `supabase/functions/gemini-proxy/index.ts`.
2. `import { z } from 'npm:zod@3.24.1';` — `supabase/functions/gemini-proxy/index.ts`.
3. `"test:run": "vitest run"` — `package.json`.
4. `"typecheck": "tsc -b"` — `package.json`.
5. `"lint": "eslint ."` — `package.json`.

### 2) Stop (пауза перед выводом)

Первое впечатление «всё уже почти готово» некорректно без сверки с каноном
non-AI launch и реальным APP кодом.

### 3) Investigate (источник / репутация / актуальность)

Приоритет источников:

1. Код и миграции (наивысшая достоверность).
2. Инструкции агента (`CLAUDE.md`, `docs/CODEX_INSTRUCTIONS.md`).
3. План-файлы (`CURRENT_TASKS.md`, `docs/LAUNCH_CHECKLIST.md`).

### 4) Find (альтернативы / первоисточники)

Сравнение двух траекторий:

- **A:** держать APP на клиентском Gemini (быстрее, но выше security/ops риск).
- **B:** перевести APP ассистент в deterministic KB mode (соответствует канону).

Вывод: для запуска выбирается траектория **B**.

### 5) Trace (цепочка искажений)

1. Канон: «ChatWidget без Gemini, по локальной KB».  
2. WEB: уже deterministic assistant flow.  
3. APP: остаётся импорт `@google/genai` и `process.env.API_KEY`.  
4. Искажение: продуктовый канон частично расходится с runtime APP.

### 6) METRICS (рефлексия)

- Security signal: ↑ (серверный прокси и валидация есть).
- Reliability signal: ↓ (test-run нестабилен).
- Product-canon signal: ↔/↓ (WEB соответствует, APP частично нет).

## C) Frame

### Что подтвердилось (verified)

- Monorepo workspaces: `shared`, `WEB`, `APP`.
- Toolchain: Vitest + ESLint + TypeScript build mode.
- В Edge Function есть Zod-валидация и CORS allowlist.

### Что подтверждено частично (частично)

- Канон non-AI launch: WEB соответствует, APP — нет полностью.

### Что не верифицируется локально (unknown)

- Фактические GitHub Secrets/production env values.

## D) Step (≤15 минут)

### Выполненные шаги

1. Повторно проверены первоисточники: `package.json`, `gemini-proxy`, APP ChatWidget.
2. Пересобран Truth Ladder (verified/частично/unknown).
3. Добавлены Evidence-цитаты и Trace-цепочка.
4. Усилен operational output: RC+QC+2PC + ledger/manifest.

### Приоритетный стек доработки (execution stack)

#### P0 (до запуска)

1. Убрать client-AI хвост из APP ChatWidget (`@google/genai`, `process.env.API_KEY`).
2. Стабилизировать Vitest окружение (`__vite_ssr_exportName__`).
3. Закрыть env/secrets чеклист деплоя (операционно, без коммита секретов).

#### P1

1. Полный production-flow YooKassa в `create-payment`.
2. Убрать placeholder-контент/видео в APP.
3. Добавить наблюдаемость (ошибки, алерты, бюджеты).

#### P2

1. Поднять покрытие тестами до целевого уровня.
2. Продолжить декомпозицию крупных компонентов.
3. Оптимизировать ассеты (WebP/вес бандла).

## E) Verify

### Truth Ladder verdict

- **Verified:** стек, scripts, CORS/Zod в proxy, наличие client-AI следов в APP.
- **Частично:** соответствие канону non-AI launch (по подсистемам расходится).
- **Unknown:** внешние runtime-secrets/production settings.
- **False:** утверждение «launch-ready без доработок».

### QC / RC / 2PC (Anti-Empty)

- **RC (Run Check):** документ создан/обновлён и подключён в docs-map.
- **QC (Quality Check):** структура A→F + Evidence + Truth Ladder + ∆DΩΛ.
- **2PC-1 (Prepare):** артефакт сформирован и готов к фиксации.
- **2PC-2 (Commit):** артефакт зафиксирован git-коммитом и включён в PR.

## F) Close

### Синтез

База проекта зрелая: security-контур и build/tooling в целом на месте. Главный
launch-разрыв — APP client-AI слой и нестабильный test-run.

### Вердикт

- Статус: **частично verified**
- Confidence: **92%**

### ledger_entry

- id: `ledger/deep-research-2026-02-19-rev2`
- delta: усилен deep-research (Evidence, Trace, Truth Ladder, RC/QC/2PC).
- do: повторная верификация первоисточников + пересборка операционного отчёта.
- omega: 0.92
- lambda: следующий PR — `fix/app-chatwidget-kb-mode` + `fix/vitest-ssr-config`.

### manifest (view)

- artifact: `docs/DEEP_RESEARCH_STACK_2026_02_19.md`
- type: `research-report`
- version: `rev2`
- scope: `repo-wide`
- owner: `codex`

∆DΩΛ
