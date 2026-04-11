# Contributing

## Workflow

1. Read `docs/_inventory/REPO_MAP.md` to find the correct file.
2. Make the smallest safe change that solves the problem.
3. Preserve provider order and route names unless intentionally changing navigation behavior.
4. Run `npm run lint` and `npx tsc --noEmit`.
5. Update documentation when code behavior, screens, flows, configuration, or design rules change.

Evidence: `app/_layout.tsx:L71-L89`, `package.json:L11-L12`, `tsconfig.json:L1-L17`.

## Safe Edit Rules

- Do not run `npm run reset-project` unless intentionally resetting starter code.
- Do not bypass native-module guards in notifications or image picker flows.
- Do not add backend claims until runtime backend files exist.
- Do not treat demo local auth as production auth.
- Keep light/dark theme values in `providers/theme-provider.tsx` and UI rules in `docs/design/UI_UX_RULES.md` aligned.

Evidence: `scripts/reset-project.js:L1-L112`, `services/local-notifications.ts:L90-L136`, `providers/auth-provider.tsx:L106-L120`, `providers/theme-provider.tsx:L8-L55`.

## Coding Conventions

- Use TypeScript strict mode.
- Prefer Expo Router route files for screen entrypoints.
- Use providers for app-wide state rather than prop-drilling through route trees.
- Use existing translation keys through `useI18n()` for user-visible strings.
- Use theme palette values from `useTheme()` for surfaces, borders, and text.

Evidence: `tsconfig.json:L1-L17`, `app/_layout.tsx:L55-L89`, `providers/language-provider.tsx:L616-L633`, `providers/theme-provider.tsx:L125-L146`.

## Documentation Conventions

- Every critical behavior claim should include `Evidence: path:Lx-Ly`.
- If a behavior is not implemented, mark it as TBD and explain how to confirm later.
- Preserve existing doc headings in update passes unless there is a strong reason to rename.
