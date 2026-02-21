# Toolchain Upgrade Playbook

## Цель

Сохранять стабильность `vitest`, `vite` и сборок WEB/APP при обновлениях зависимостей.

## Guardrail

Перед merge любого обновления toolchain обязательно:

1. `npm install`
2. `npm run verify:toolchain`
3. `npm run test:run`
4. `npm run typecheck`
5. `npm run lint`
6. `npm run build:all`

## Текущий baseline

- `vite`: `6.0.5` (через root `overrides`)
- `vitest`: `2.1.9`

## Правила обновления

- Обновлять `vite` и `vitest` только в одном PR с полным прогоном пайплайна.
- Если появляется ошибка уровня `__vite_ssr_exportName__`, откатывать `vite` к последнему стабильному baseline и фиксировать это в PR.
- Не смешивать в одном PR: toolchain upgrade и продуктовые изменения.

## Checklist для PR

- [ ] Обновлён lockfile
- [ ] Приложены результаты всех команд из Guardrail
- [ ] Описан rollback plan
- [ ] Обновлён baseline в этом документе
