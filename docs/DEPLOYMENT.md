# Deployment

## Current Deployment State

No production deployment pipeline is defined in the repository. The available deployment-adjacent flow is native local build/run through Expo CLI scripts.

Evidence: `package.json:L5-L12`, repository inventory found no `.github/` workflows and no `eas.json`.

## Development Build

Use native builds when testing native modules:

```bash
npm run ios
npm run android
```

For a physical iOS device, Expo CLI can be run with `--device`:

```bash
npx expo run:ios --device
```

Evidence: `package.json:L8-L10`, `app.json:L35-L65`, `services/local-notifications.ts:L104-L136`.

## Native Capabilities To Verify Before Release

- Notification module availability and permission request flow.
- Image picker camera and media library permissions.
- App icon and splash assets.
- Deep-link scheme `degrow`.
- iOS bundle identifier `com.anonymous.degrow`.
- Android adaptive icon assets and notification permissions.

Evidence: `app.json:L6-L29`, `app.json:L35-L65`, `app/permissions.tsx:L81-L160`.

## Web

The web target can be started with `npm run web`, but the primary app behavior targets native mobile. Some native modules may be unavailable or guarded on web.

Evidence: `package.json:L10-L11`, `components/external-link.tsx:L14-L20`, `services/local-notifications.ts:L90-L136`.

## Production Release Gaps

- [TBD] EAS build profiles and submit configuration. How to confirm: add/inspect `eas.json`.
- [TBD] Apple/Google store metadata. How to confirm: inspect future release docs or store configuration.
- [TBD] CI build verification. How to confirm: inspect future CI workflow files.
- [TBD] Backend deployment. How to confirm: inspect future backend runtime implementation.
