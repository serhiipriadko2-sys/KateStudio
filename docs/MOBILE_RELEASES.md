# Mobile Releases

> Last updated: 2026-03-29

This document describes the release path for packaging the APP workspace as
Android `APK/AAB` and iOS `IPA`.

## Source of truth

- APP workspace scripts: `k-sebe-yoga-studio-APPp/package.json`
- Capacitor config: `k-sebe-yoga-studio-APPp/capacitor.config.ts`
- CI workflow: `.github/workflows/capacitor-build.yml`

## Outputs

- Android debug artifact: `app-debug.apk`
- Android release artifact: signed `APK` or signed `AAB`
- iOS debug artifact: simulator `.app`
- iOS release artifact: signed `.ipa`

## Existing app secrets

These are already used to build the web bundle embedded into the native shell:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Android release secrets

Required for signed release builds in GitHub Actions:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### Create `ANDROID_KEYSTORE_BASE64`

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\release.keystore"))
```

macOS/Linux:

```bash
base64 -i /path/to/release.keystore
```

## iOS release secrets

Required for signed `ipa` builds in GitHub Actions:

- `IOS_BUILD_CERTIFICATE_BASE64`
- `IOS_P12_PASSWORD`
- `IOS_BUILD_PROVISION_PROFILE_BASE64`
- `IOS_KEYCHAIN_PASSWORD`
- `IOS_TEAM_ID`

### Create `IOS_BUILD_CERTIFICATE_BASE64`

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\BUILD_CERTIFICATE.p12"))
```

macOS/Linux:

```bash
base64 -i BUILD_CERTIFICATE.p12
```

### Create `IOS_BUILD_PROVISION_PROFILE_BASE64`

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\profile.mobileprovision"))
```

macOS/Linux:

```bash
base64 -i profile.mobileprovision
```

## Local Android packaging

From `k-sebe-yoga-studio-APPp`:

```bash
npm install
npm run build:mobile
cd android
./gradlew assembleDebug
```

Debug APK path:

```text
k-sebe-yoga-studio-APPp/android/app/build/outputs/apk/debug/app-debug.apk
```

## Local iOS packaging

Requires macOS, Xcode, CocoaPods, Apple signing assets, and a generated iOS
platform:

```bash
npm install
npm run build:mobile:ios
cd ios/App
pod install
```

Then open Xcode:

```bash
npm run cap:open:ios
```

Archive in Xcode and export a signed `.ipa`.

## GitHub Actions release packaging

Workflow: `Capacitor Native Build`

Inputs:

- `platform`: `android`, `ios`, or `both`
- `build_type`: `debug` or `release`
- `android_release_type`: `APK` or `AAB`
- `ios_export_method`: `app-store-connect`, `release-testing`, etc.

Release outputs:

- Android: uploaded as `android-release-apk` or `android-release-aab`
- iOS: uploaded as `ios-release-ipa`

## Notes

- Native shells `android/` and `ios/` are local/generated and ignored by git.
- iOS release signing uses a temporary keychain on the GitHub-hosted runner.
- The workflow derives the provisioning profile UUID and signing certificate
  identity from the imported Apple assets at build time.
