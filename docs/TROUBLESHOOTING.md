# Troubleshooting

## Local Notifications Are Disabled

Message: `Local notifications are disabled because expo-notifications is not available in this native build`.

Fix: rebuild the native dev client. Reloading JavaScript is not enough after adding native modules.

Evidence: `services/local-notifications.ts:L104-L136`, `app.json:L35-L44`.

## Image Picker Functions Are Undefined

Fix: rebuild the native app and verify `expo-image-picker` is included in `app.json`.

Evidence: `app.json:L45-L51`, `app/(tabs)/profile.tsx:L39-L77`.

## Auth Redirects To Login

Cause: `user` is null in `AuthProvider`. The root layout redirects protected routes to login when unauthenticated.

Evidence: `app/_layout.tsx:L31-L41`, `providers/auth-provider.tsx:L59-L94`.

## Habit Data Resets

Cause: stored week id differs from the current computed week id. The provider resets day completion state for the current week.

Evidence: `providers/habits-provider.tsx:L61-L116`, `constants/habits.ts:L57-L87`.

## iOS Device Not Found By Expo CLI

Likely causes include missing trusted device state, Xcode device support, CLI `devicectl` issues, or using a simulator-only command path. Use `npx expo run:ios --device` after confirming the device appears in Xcode Devices and Simulators.

Evidence: deployment path depends on `package.json:L8-L10`; device-specific troubleshooting is outside repo code and should be confirmed in local Xcode tooling.

## App Icon Does Not Update

The configured icon is `assets/icons/icon.png`. Native icon changes require rebuilding the native app; the OS may also cache icons.

Evidence: `app.json:L6-L15`.

## Native Tab Bar Visual Artifacts

The tab bar uses native tab APIs plus a custom blur/gradient underlay. If visual artifacts appear in light mode, inspect both the native tab appearance and `TabBarBlurUnderlay`.

Evidence: `app/(tabs)/_layout.tsx:L14-L82`, `components/tab-bar-blur-underlay.tsx:L1-L32`.
