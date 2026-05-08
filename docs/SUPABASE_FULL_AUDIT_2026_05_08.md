# Полный аудит Supabase — 2026-05-08

## Scope
- `supabase/migrations/**`
- `supabase/functions/**`
- `scripts/setup-supabase-mcp.sh`
- `scripts/check-migration-integrity.mjs` (через `npm run check:migrations`)

## Method
1. SoT-review по файлам Supabase и setup-скрипту.
2. Запуск репозиторных проверок, релевантных Supabase-потоку.
3. Поиск security/ops-patterns по коду функций и миграциям.

## Verification snapshot
- `npm run check:migrations` → PASS (`38 files`, `0 collision`, `1 legacy short timestamp file`).
- `npm run typecheck` → PASS.
- `npm run lint` → FAIL из-за toolchain (`TypeError: balanced is not a function` в ESLint runtime), не из-за конкретного Supabase-файла.

## Verdict
- **partial**

## Сильные стороны
1. **Migration integrity автоматизирована**: есть отдельная проверка целостности миграций и она проходит.
2. **RLS/security-ориентация в SQL присутствует**: миграции и политики явно учитывают роль `service_role` и усиление security-политик.
3. **Edge Functions в целом используют env-secrets**, без хардкода ключей в репозитории.
4. **CORS/returnUrl в платежных функциях ограничены** allowlist-моделью, а не wildcard.

---

## Findings (Architecture / Security / Ops)

### 1) MCP setup script: нет preflight-check зависимостей
- **Проблема:** `scripts/setup-supabase-mcp.sh` сразу вызывает `codex`/`npx`/`awk` без явной проверки наличия бинарей.
- **Почему важно:** при отсутствующем CLI падение позднее и менее диагностично.
- **Опции:**
  - A) Оставить как есть.
  - B) Добавить `command -v` preflight с понятной ошибкой и remediation.
- **Рекомендация:** **B** (минимальный риск, высокий DX-выигрыш).

### 2) MCP setup script: TOML merge остаётся текстовым
- **Проблема:** merge `[mcp].remote_mcp_client_enabled` реализован через `awk`.
- **Почему важно:** edge-cases TOML (необычное форматирование/многострочные конструкции) могут быть переформатированы.
- **Опции:**
  - A) Оставить awk fallback only.
  - B) Parser-first merge (например, `python tomllib` чтение + controlled write) и awk как fallback.
- **Рекомендация:** **B**.

### 3) Edge function auth pattern неоднороден
- **Проблема:** в `send-push` используется сравнение Bearer-токена с `SUPABASE_SERVICE_ROLE_KEY`; в других функциях — user JWT + admin client.
- **Почему важно:** разные auth-контракты усложняют операционную поддержку и ротацию секретов.
- **Опции:**
  - A) Оставить как есть (дешевле сейчас).
  - B) Стандартизовать internal auth (например, отдельный `INTERNAL_API_TOKEN`) для cron/internal функций.
- **Рекомендация:** **B** (уменьшает blast radius при ротации service role key).

### 4) subscribe-newsletter: single-origin fallback
- **Проблема:** CORS берёт `ALLOWED_ORIGIN` (single value) с жёстким fallback.
- **Почему важно:** масштабирование на multi-origin окружения потребует ручных правок и риск misconfig.
- **Опции:**
  - A) Оставить single-origin.
  - B) Унифицировать с allowlist-подходом (`ALLOWED_ORIGINS`) как в payment-функциях.
- **Рекомендация:** **B** для консистентности политики.

### 5) Lint pipeline сейчас не даёт валидный сигнал качества
- **Проблема:** `npm run lint` падает инфраструктурно (`balanced is not a function`).
- **Почему важно:** security/style регрессии могут проходить незамеченными.
- **Опции:**
  - A) Игнорировать локально.
  - B) Починить eslint dependency graph/lockfile и вернуть lint как gate.
- **Рекомендация:** **B** приоритетно.

---

## Security-sensitive notes
- Секреты в репозитории не обнаружены в рамках этого аудита; ключи читаются из `Deno.env`.
- `service_role` используется в Edge Functions как и ожидается для admin-операций; важно держать строгую границу “только server-side”.
- AI contour (`supabase/functions/gemini-proxy`) не изменялся и в этом аудите рассматривался только обзорно.

## Рекомендуемый next patch (минимальный, безопасный)
1. Добавить preflight checks и `--dry-run` в `scripts/setup-supabase-mcp.sh`.
2. Добавить warning, если `--install-skills` передан без `-y/--yes`.
3. Подготовить parser-first стратегию merge для `~/.codex/config.toml` с fallback на текущий awk-путь.
4. Стабилизировать lint toolchain (фикс зависимости/lockfile) и вернуть `npm run lint` в надёжный PASS/FAIL сигнал.

## PASS/FAIL
- **FAIL** как “полностью green quality-gate” (из-за сломанного lint gate).
- **PASS** как “структурный Supabase baseline с рабочими typecheck и migration integrity”.
