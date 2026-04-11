# Testing

## Current Test State

No automated unit, integration, or end-to-end test script exists in the baseline. The available checks are linting and TypeScript type-checking.

Evidence: `package.json:L5-L12`, repository inventory found no test files in the scanned app/provider/service folders.

## Required Checks For Changes

```bash
npm run lint
npx tsc --noEmit
```

Evidence: `package.json:L11-L12`, `tsconfig.json:L1-L17`, `eslint.config.js:L1-L10`.

## Manual Smoke Test

1. Launch app with `npm run ios` or `npm run android`.
2. Register or log in.
3. Verify the home list renders seeded or persisted habits.
4. Toggle a habit day and verify completion state changes.
5. Open new habit, choose icon/color/session length/days/reminder, and create.
6. Start a focus session, pause/resume/reset, finish, and verify today's habit completion.
7. Open profile, update profile image through the bottom sheet if native image picker is available.
8. Open settings, switch theme/language, and verify translations/theme updates.
9. Open permissions and verify notification/media/camera status rows.

Evidence: `app/(auth)/login.tsx:L22-L125`, `app/(tabs)/index.tsx:L221-L280`, `app/new-habit.tsx:L452-L804`, `app/habit-session.tsx:L232-L380`, `app/(tabs)/profile.tsx:L225-L380`, `app/settings.tsx:L140-L293`, `app/permissions.tsx:L253-L343`.

## Native Module Test Notes

Notification and image picker flows must be tested in a native dev build or production build, not only Expo Go or a stale dev client.

Evidence: `services/local-notifications.ts:L90-L136`, `app/(tabs)/profile.tsx:L39-L77`.

## Testing Gaps

- [TBD] Unit tests for providers and notification scheduling. How to confirm: inspect future test files.
- [TBD] E2E tests for auth, habit creation, and focus session. How to confirm: inspect future Detox/Maestro/Playwright configs.
- [TBD] Visual regression checks for light/dark UI. How to confirm: inspect future screenshot testing setup.
