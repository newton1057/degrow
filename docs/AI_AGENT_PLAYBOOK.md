# AI Agent Playbook

## Mission

Help maintain DeGrow without inventing behavior. Inspect code first, cite evidence, and make the smallest safe change.

Evidence: this docs baseline was created from `app/`, `providers/`, `services/`, `constants/`, `app.json`, and `package.json`.

## Fast Orientation

1. Read `docs/_inventory/REPO_MAP.md`.
2. Read `app/_layout.tsx` for provider order and route registration.
3. Read the target screen in `app/`.
4. Read the relevant provider in `providers/`.
5. Read `docs/design/UI_UX_RULES.md` before UI changes.

Evidence: `app/_layout.tsx:L55-L89`, `providers/habits-provider.tsx:L17-L34`, `docs/design/UI_UX_RULES.md`.

## Safe Change Rules

- Do not remove native module guards unless the native build strategy changes.
  Evidence: `services/local-notifications.ts:L90-L136`, `app/(tabs)/profile.tsx:L39-L77`.
- Do not run `npm run reset-project` during normal maintenance.
  Evidence: `scripts/reset-project.js:L1-L112`.
- Do not document backend endpoints as real until route handlers exist.
  Evidence: `backend/templates/README.md:L1-L13`.
- Do not bypass `LanguageProvider` or `ThemeProvider`; user-facing strings and colors should flow through these systems.
  Evidence: `providers/language-provider.tsx:L616-L633`, `providers/theme-provider.tsx:L125-L146`.
- Do not change persisted data shapes without adding migration handling.
  Evidence: `providers/habits-provider.tsx:L47-L58`, `providers/habits-provider.tsx:L73-L116`.

## Common Tasks

- Add a screen: create a route under `app/`, register stack options if it is a top-level detail route, add translations, and update docs.
- Add a habit field: update `constants/habits.ts`, `providers/habits-provider.tsx` sanitization/persistence, relevant screens, and `docs/DATA_MODEL.md`.
- Add backend integration: create runtime backend code, then update `docs/API_REFERENCE.md`, `docs/SECURITY.md`, and `docs/CONFIGURATION.md`.
- Change UI styling: update screen styles and reflect reusable rules in `docs/design/UI_UX_RULES.md`.

Evidence: `app/_layout.tsx:L55-L67`, `constants/habits.ts:L21-L39`, `providers/habits-provider.tsx:L47-L58`, `providers/language-provider.tsx:L18-L525`.

## Required Validation

Run:

```bash
npm run lint
npx tsc --noEmit
```

Evidence: `package.json:L11-L12`, `tsconfig.json:L1-L17`.
