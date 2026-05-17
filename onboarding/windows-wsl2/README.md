# KateStudio WSL-First Onboarding Pack

Сверхкороткий путь для Windows-разработчика:

`чистая машина -> WSL2 -> VS Code -> code . -> npm install -> npx supabase start`

Если нужен полный контекст, смотри:

- `docs/WINDOWS_WSL2_QUICKSTART.md`
- `README.md`

Если нужен быстрый путь без лишнего чтения, иди по шагам ниже.

## 0. Что ты получишь в конце

- проект открыт из WSL в VS Code;
- локальная среда проверена;
- базовые зависимости установлены;
- можно запускать `npx supabase start`;
- можно переходить к `npm run dev:web` и `npm run dev:app`.

## 1. Установи WSL2

Открой PowerShell от администратора:

```powershell
wsl --install
```

Перезагрузи компьютер.

## 2. Первый запуск Ubuntu

После перезагрузки открой Ubuntu и заверши первичную настройку пользователя.

## 3. Установи VS Code

Установи VS Code Stable.

Внутри VS Code поставь расширения:

- Remote - WSL
- Dev Containers
- GitHub Copilot
- ESLint
- Prettier
- Playwright

## 4. Перейди в рабочую папку WSL

В Ubuntu:

```bash
mkdir -p ~/work
cd ~/work
```

Важно: работай в Linux-файловой системе WSL, а не из `/mnt/c/...`.

## 5. Открой проект

Если текущая рабочая копия уже лежит здесь:

```bash
cd /path/to/KateStudio
code .
```

Если открываешь workspace-файл:

```bash
code KateStudio.code-workspace
```

## 6. Установи зависимости

```bash
npm install
```

## 7. Проверь среду

```bash
node --version
npm --version
docker --version
npx supabase --version
```

Ожидаемо до полной локальной настройки:

- `.env` может отсутствовать;
- `docker` может быть недоступен, пока не включена WSL integration;
- Supabase CLI может установиться через `npx`, если он ещё не установлен глобально.

## 8. Подними Supabase local

```bash
npx supabase start
```

## 9. Следом можно идти в dev servers

```bash
npm run dev:web
npm run dev:app
```
