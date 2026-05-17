# First 10 Minutes

## Команды подряд

```powershell
wsl --install
```

После перезагрузки:

```bash
mkdir -p ~/work
cd ~/work
cd /path/to/KateStudio
code .
```

В терминале VS Code:

```bash
npm install
node --version
npm --version
docker --version
npx supabase start
```

## Если `code` не работает

Открой проект из VS Code через:

1. Remote Explorer
2. Open Folder in WSL
3. выбрать папку KateStudio

## Если Docker не виден из WSL

Проверь:

1. Docker Desktop запущен
2. в Docker Desktop включена WSL integration для Ubuntu

Потом снова:

```bash
docker --version
```
