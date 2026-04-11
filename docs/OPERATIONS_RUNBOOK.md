# Operations Runbook

## Scope

This runbook covers local development and pre-backend operation. There is no production service or API to operate yet.

Evidence: `backend/templates/README.md:L1-L13`, `package.json:L5-L12`.

## Health Checks

1. Install dependencies: `npm install`.
2. Type-check: `npx tsc --noEmit`.
3. Lint: `npm run lint`.
4. Native run: `npm run ios` or `npm run android`.
5. Manually verify login, home, profile, settings, permissions, new habit, and focus session.

Evidence: `package.json:L5-L12`, `app/_layout.tsx:L55-L67`.

## Local Notifications Unavailable

Symptom: warning says local notifications are disabled because `expo-notifications` is not available in the native build.

Cause: JavaScript was reloaded without rebuilding the dev client after adding or changing native modules.

Action:

```bash
npx expo run:ios --device
# or
npm run android
```

Evidence: `services/local-notifications.ts:L104-L136`, `app.json:L35-L44`.

## Image Picker Unavailable

Symptom: image picker permission functions are undefined or native module is missing.

Cause: `expo-image-picker` native module is not included in the current build.

Action: rebuild the native dev client and verify `expo-image-picker` plugin permission strings.

Evidence: `app.json:L45-L51`, `app/(tabs)/profile.tsx:L39-L77`, `app/permissions.tsx:L130-L160`.

## User Cannot Access Main App

Check whether auth state is null. Root layout redirects unauthenticated users to `/(auth)/login`.

Evidence: `app/_layout.tsx:L31-L41`, `providers/auth-provider.tsx:L59-L94`.

## Habit State Looks Stale

Habits are week-bound. On load, data from a previous week is reset by regenerating current week days.

Evidence: `constants/habits.ts:L57-L87`, `providers/habits-provider.tsx:L61-L116`.

## Reset Project Warning

Do not run `npm run reset-project` as a routine maintenance command. It is an Expo starter reset script that can move/delete project folders.

Evidence: `package.json:L7-L8`, `scripts/reset-project.js:L1-L112`.

## Observability Gaps

- [TBD] Crash reporting. How to confirm: inspect future monitoring SDK config.
- [TBD] Structured logging. How to confirm: inspect future logging service integration.
- [TBD] Notification delivery analytics. How to confirm: inspect future backend/native analytics integration.
