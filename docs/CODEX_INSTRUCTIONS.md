# Custom Instructions — KateStudio (К себе)

> **Обновлено:** 13 мая 2026
> **Статус документа:** historical operator note, not present-tense project canon.
>
> Для всех текущих статусов, live counters, release claims, auth reality, runtime symptoms и launch blockers используйте:
>
> - `CURRENT_TASKS.md`
> - `docs/SUPABASE_AUDIT_LIVE_2026_05_12.md`
>
> Этот файл оставлен как слой рабочих предпочтений для code-assistance, но больше не является источником истины по состоянию проекта.

---

## Что в этом файле больше нельзя читать как current truth

Следующие старые claims считать историческими и не использовать как present-tense истину:

- `174 теста`, `100% TypeScript`, `0 lint errors`
- `Все критические блокеры устранены`
- `ChatWidget должен работать без Gemini` как текущий operational canon
- старые приоритеты по `create-payment` как payment default
- любые статусы из февраля 2026 без fresh check против repo/live

---

## Что здесь остаётся полезным

- работать минимальными безопасными change-set'ами
- не коммитить секреты
- не использовать `SUPABASE_SERVICE_ROLE_KEY` в браузере
- не менять AI contour без явного запроса
- после substantive changes обновлять текущий operational canon
- проверять изменения через `test:run`, `lint`, `typecheck`, `build:web`, `build:app`, когда это уместно

---

## Stable repo orientation

- Monorepo на npm workspaces
- `k-sebe-yoga-studioWEB/` — WEB surface
- `k-sebe-yoga-studio-APPp/` — APP surface
- `shared/` — общая библиотека
- `supabase/` — migrations и Edge Functions

Эта структура читается из кода и остаётся стабильной ориентацией.

---

## Ссылки

- [CURRENT_TASKS.md](../CURRENT_TASKS.md) — единственный present-tense operational canon
- [SUPABASE_AUDIT_LIVE_2026_05_12.md](./SUPABASE_AUDIT_LIVE_2026_05_12.md) — live Supabase canon
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system shape
- [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md) — repo/live function drift map
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) — release gate

Если этот файл расходится с repo/live evidence, он автоматически проигрывает более свежему источнику истины.