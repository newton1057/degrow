# Quickstart

## Prerequisites

- Node/npm compatible with the installed Expo dependency tree.
- Xcode and iOS tooling for `npm run ios`.
- Android Studio tooling for `npm run android`.
- A rebuilt native dev client when testing native modules such as local notifications and image picker.

Evidence: `package.json:L5-L48`, `app.json:L35-L65`, `services/local-notifications.ts:L90-L136`.

## Install

```bash
npm install
```

Evidence: npm lockfile exists at `package-lock.json`; dependencies are declared in `package.json:L13-L48`.

## Run

```bash
npm start
npm run ios
npm run android
npm run web
```

Evidence: `package.json:L5-L12`.

## Validate

```bash
npm run lint
npx tsc --noEmit
```

Evidence: `package.json:L11-L12`, `tsconfig.json:L1-L17`, `eslint.config.js:L1-L10`.

## Native Build Notes

Local notifications and image picker are native modules. If Metro logs say a native module is unavailable, rebuild the native app instead of only reloading JavaScript.

```bash
npx expo run:ios --device
npx expo run:android
```

Evidence: `services/local-notifications.ts:L104-L136`, `app.json:L35-L65`, `app/permissions.tsx:L81-L160`.

## Demo Auth Behavior

Login and registration are local demo flows. The app creates a local user object and persists it to device storage; it does not call a backend.

Evidence: `providers/auth-provider.tsx:L23-L51`, `providers/auth-provider.tsx:L106-L120`, `app/(auth)/login.tsx:L22-L33`, `app/(auth)/register.tsx:L22-L34`.

## Data Reset

There is no built-in safe reset command for user/habit storage. Storage is written into Expo FileSystem document files. Do not use `npm run reset-project` for data cleanup; that script is a starter-project code reset.

Evidence: `providers/auth-provider.tsx:L23-L51`, `providers/habits-provider.tsx:L41-L58`, `providers/language-provider.tsx:L14-L16`, `providers/theme-provider.tsx:L66-L68`, `scripts/reset-project.js:L1-L112`.
