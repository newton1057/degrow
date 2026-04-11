# Risky Proposals Not Implemented

## Production Backend And Database

Proposal: implement a backend with real authentication, habit CRUD, reminder synchronization metadata, session history, and user profile storage.

Why not now: the current request is documentation-focused and the user previously stated database integration will happen next week.

Evidence: current runtime backend is absent; `backend/templates/README.md:L1-L13`, `providers/auth-provider.tsx:L106-L120`, `providers/habits-provider.tsx:L41-L58`.

## Replace Local Demo Auth

Proposal: replace demo `signIn`/`signUp` with production auth.

Why not now: requires backend decisions, token storage, password reset, validation, and migration path.

Evidence: `providers/auth-provider.tsx:L106-L120`.

## Refactor Design Tokens Into A Dedicated Package

Proposal: extract app palette, spacing, radii, and component variants into a centralized token module.

Why not now: safe but larger than documentation scope; should be paired with regression testing because many screens use local StyleSheet definitions.

Evidence: `providers/theme-provider.tsx:L8-L55`, `app/(tabs)/index.tsx:L283-L330`, `app/new-habit.tsx:L809-L1280`, `app/habit-session.tsx:L384-L682`.

## Remove Or Rename `reset-project`

Proposal: remove the Expo starter reset script or rename it to make the destructive behavior obvious.

Why not now: changing scripts can surprise existing local workflows. Documented as a warning instead.

Evidence: `package.json:L7-L8`, `scripts/reset-project.js:L1-L112`.
