# Configuration

## App Configuration

Expo metadata defines the app name `DeGrow`, slug `degrow`, scheme `degrow`, app icons, splash settings, and native plugin list.

Evidence: `app.json:L2-L10`, `app.json:L11-L33`, `app.json:L35-L69`.

## Native Plugins

Configured Expo plugins include:

- `expo-router`
- `expo-notifications` with notification icon/color/default channel
- `expo-image-picker` with photo library and camera permission strings
- `expo-splash-screen`

Evidence: `app.json:L35-L65`.

## Scripts

| Script | Command | Purpose | Evidence |
| --- | --- | --- | --- |
| `start` | `expo start` | Start Metro/Expo dev server | `package.json:L5-L7` |
| `reset-project` | `node ./scripts/reset-project.js` | Destructive Expo starter reset helper | `package.json:L7-L8`, `scripts/reset-project.js:L1-L112` |
| `android` | `expo run:android` | Build/run Android native app | `package.json:L8-L9` |
| `ios` | `expo run:ios` | Build/run iOS native app | `package.json:L9-L10` |
| `web` | `expo start --web` | Start web target | `package.json:L10-L11` |
| `lint` | `expo lint` | Run Expo ESLint | `package.json:L11-L12` |

## Environment Variables

The app does not define business environment variables in the baseline. Two components use Expo-provided `process.env.EXPO_OS` to branch platform behavior.

| ENV var | Purpose | Default | Required | Where used |
| --- | --- | --- | --- | --- |
| `EXPO_OS` | Expo-provided platform indicator used for native/web branches | Provided by Expo tooling | No manual setup | `components/haptic-tab.tsx:L10-L13`, `components/external-link.tsx:L14-L20` |

## TypeScript And Linting

TypeScript extends Expo's base config, runs in strict mode, and uses the `@/*` path alias. ESLint uses Expo's flat config and ignores `dist`.

Evidence: `tsconfig.json:L1-L17`, `eslint.config.js:L1-L10`.

## App Assets

The configured app icon points to `./assets/icons/icon.png`. The iOS icon also points to `./assets/icons/icon.png`; Android uses adaptive icon foreground/background/monochrome assets under `assets/images/`.

Evidence: `app.json:L6-L29`.

## Configuration Gaps

- [TBD] Production API base URL and auth configuration. How to confirm: inspect future backend/environment integration.
- [TBD] EAS build profile configuration. How to confirm: inspect future `eas.json`.
- [TBD] CI environment settings. How to confirm: inspect future `.github/` or CI provider config.
