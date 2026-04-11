# DeGrow

DeGrow is an Expo Router React Native habit tracker focused on reading, daily habit consistency, local reminders, profile personalization, and focus sessions. The current app is local-first: user, theme, language, and habit state are persisted on the device, while backend integration is intentionally not connected yet.

Evidence: `app.json:L2-L10`, `app/_layout.tsx:L71-L89`, `providers/auth-provider.tsx:L23-L51`, `providers/habits-provider.tsx:L41-L58`, `services/local-notifications.ts:L230-L317`.

## Quickstart

```bash
npm install
npm run ios
```

Use `npm start` for Metro, `npm run android` for Android, `npm run web` for web, and `npm run lint` for lint validation.

Evidence: `package.json:L5-L12`.

## Documentation

Start with [`docs/INDEX.md`](docs/INDEX.md). The most useful paths are:

- New engineer: [`docs/QUICKSTART.md`](docs/QUICKSTART.md), [`docs/_inventory/REPO_MAP.md`](docs/_inventory/REPO_MAP.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- Designer: [`docs/design/UI_UX_RULES.md`](docs/design/UI_UX_RULES.md), [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md), [`docs/design/ACCESSIBILITY.md`](docs/design/ACCESSIBILITY.md).
- AI agent: [`docs/AI_AGENT_PLAYBOOK.md`](docs/AI_AGENT_PLAYBOOK.md), [`docs/_inventory/REPO_MAP.md`](docs/_inventory/REPO_MAP.md), [`docs/improvements/PROPOSALS.md`](docs/improvements/PROPOSALS.md).

## Current Status

- Frontend: Expo Router app with auth, tabs, profile, settings, permissions, new habit creation, and focus session screens.
- Backend: no runtime API/server is present. `backend/templates/` contains English HTML email templates for future backend workflows.
- Data: local JSON files via Expo FileSystem, not a remote database.
- Notifications: local notification scheduling is implemented behind native-module availability guards and requires a rebuilt development client or production native build.

Evidence: `app/(auth)/login.tsx:L22-L125`, `app/(tabs)/index.tsx:L221-L280`, `app/settings.tsx:L140-L293`, `app/permissions.tsx:L253-L343`, `backend/templates/README.md:L1-L13`, `services/local-notifications.ts:L90-L136`.

## Screenshots

[TBD] Add current screenshots for dark mode, light mode, settings, new habit, profile, and focus session after the next stable UI pass.

How to confirm: capture simulator/device screenshots after running `npm run ios`; app routes are listed in `app/`.
