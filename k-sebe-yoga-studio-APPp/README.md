<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio:
https://ai.studio/apps/drive/12aRTDeMFYVlFE3vx3mr7P4lcirm082NF

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `VITE_GEMINI_API_KEY` (recommended) in your `.env` (see
   [../.env.example](../.env.example))
3. Run the app: `npm run dev`

## Mobile build (Capacitor wrapper)

Capacitor добавляет нативную оболочку над текущим React/Vite APP, чтобы собирать
Android/iOS приложение без полного переписывания.

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
