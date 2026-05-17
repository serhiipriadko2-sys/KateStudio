# KateStudio on Windows + WSL2

Это локальный путь для разработки KateStudio на Windows с минимальным трением в VS Code.

## Цель

Не бороться с Windows-спецификой вручную, а перенести рабочую инженерную среду в Linux-контур через WSL2, сохранив удобство VS Code.

## Рекомендуемая схема

1. Установить WSL2 и Ubuntu.
2. Установить VS Code Stable.
3. Установить расширения:
   - Remote - WSL
   - Dev Containers
   - GitHub Copilot
   - Playwright
   - ESLint
   - Prettier
4. Открывать проект из WSL, а не с диска C:.
5. Выполнять bootstrap уже внутри Ubuntu, если соответствующий скрипт есть в checkout.

## Правильный порядок

### 1. Установка WSL2

Открыть PowerShell от администратора:

```powershell
wsl --install
```

После перезагрузки закончить настройку Ubuntu.

### 2. Открытие проекта

Открыть Ubuntu и перейти в рабочую папку, например:

```bash
mkdir -p ~/work
cd ~/work
```

Если рабочая копия уже лежит в WSL:

```bash
code .
```

Важно: для KateStudio лучше не вести активную разработку из `/mnt/c/...`, чтобы не ловить лишний file-watcher drift и замедление `node_modules`.

### 3. Проверка зависимостей

```bash
node --version
npm --version
docker --version
npx supabase --version
```

### 4. Установка зависимостей

```bash
npm install
```

### 5. Подъём сервисов

```bash
npx supabase start
npm run dev:web
npm run dev:app
```

## Когда использовать Dev Container поверх WSL

Используй Reopen in Container, если:

- нужна максимально воспроизводимая среда;
- у нового участника ещё нет локально собранного toolchain;
- нужно быстро сверить поведение без machine drift.

## Минимальный путь без контейнера

Если нужен самый быстрый inner loop:

1. проект в WSL;
2. Node 22 в Ubuntu;
3. Docker Desktop c интеграцией в WSL;
4. VS Code через Remote - WSL.

Это обычно даёт меньше трения, чем чистый Windows path.
