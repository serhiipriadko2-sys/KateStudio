# K Sebe Yoga Studio APP

Мобильное PWA-приложение экосистемы студии «К себе».

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Configure environment variables in `.env` (see [../.env.example](../.env.example))
3. Run the app: `npm run dev`

## Mobile build (Capacitor wrapper)

Capacitor добавляет нативную оболочку над текущим React/Vite APP,
чтобы собирать Android/iOS приложение без полного переписывания.

### One-time setup

1. Install dependencies: `npm install`
2. Generate Android project (if missing): `npm run cap:add:android`
3. (macOS) Generate iOS project (if missing): `npm run cap:add:ios`

### Daily workflow

- Build + sync Android (auto-add platform if missing): `npm run build:mobile`
- Build + sync iOS (auto-add platform if missing): `npm run build:mobile:ios`
- Resync both platforms (if already generated): `npm run cap:sync`
- Resync Android only: `npm run cap:sync:android`
- Resync iOS only (requires CocoaPods): `npm run cap:sync:ios`
- Open Android Studio project: `npm run cap:open:android`
- Open Xcode project: `npm run cap:open:ios`

### Notes

- Native проекты (`android/`, `ios/`) генерируются локально и не коммитятся.
- Это снижает PR-шум и исключает проблемы с бинарными файлами в review tooling.
- Runtime secrets остаются на backend (Supabase Edge Functions).
- Для iOS требуется CocoaPods (`pod install`), обычно на macOS/Xcode.
