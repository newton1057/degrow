# API Reference

## Runtime API Status

There are no HTTP API endpoints, route handlers, controllers, or backend server files implemented in the current repository. The app uses local providers and local file persistence. The `backend/templates/` directory contains static English HTML templates for future backend workflows only.

Evidence: repository inventory found `backend/templates/` but no server entrypoint; `backend/templates/README.md:L1-L13`, `providers/auth-provider.tsx:L106-L120`.

## Endpoint Reference

No runtime endpoints exist.

| Method | Path | Auth | Status | Evidence |
| --- | --- | --- | --- | --- |
| [TBD] | [TBD] | [TBD] | Not implemented | Confirm by adding backend route files in a future pass |

## Local Provider Interfaces

### AuthProvider

- `signIn(email, password)`: creates a demo local user after an artificial delay.
- `signUp(name, email, password)`: creates a demo local user after an artificial delay.
- `signOut()`: clears local user state.
- `updateProfile(updates)`: updates local profile fields.

Evidence: `providers/auth-provider.tsx:L12-L19`, `providers/auth-provider.tsx:L106-L129`.

### HabitsProvider

- `addHabit(input)`: creates and prepends a new local habit.
- `toggleDay(habitId, dayKey)`: toggles a specific day.
- `toggleToday(habitId)`: toggles today.
- `completeToday(habitId)`: marks today complete.

Evidence: `providers/habits-provider.tsx:L17-L34`, `providers/habits-provider.tsx:L133-L208`.

### Notification Service

- `configureLocalNotifications()`
- `requestLocalNotificationPermissions()`
- `syncHabitReminders(habits, language)`
- `cancelHabitReminderNotifications(habitId)`
- `scheduleTimerCompletionNotification(...)`
- `cancelTimerCompletionNotification(habitId)`
- `addLocalNotificationListeners(...)`

Evidence: `services/local-notifications.ts:L138-L403`.

## Future Backend Template Inventory

| Template | Intended process | Evidence |
| --- | --- | --- |
| `login.html` | Login-related email/page template | `backend/templates/login.html` |
| `signup.html` | Signup-related email/page template | `backend/templates/signup.html` |
| `verify-email.html` | Email verification | `backend/templates/verify-email.html` |
| `forgot-password.html` | Password reset request | `backend/templates/forgot-password.html` |
| `reset-password.html` | Password reset completion/action | `backend/templates/reset-password.html` |
| `change-password.html` | Change password notification/action | `backend/templates/change-password.html` |
| `welcome.html` | Welcome onboarding | `backend/templates/welcome.html` |
| `daily-reminder.html` | Habit reminder communication | `backend/templates/daily-reminder.html` |
| `timer-complete.html` | Timer completion communication | `backend/templates/timer-complete.html` |
| `weekly-review.html` | Weekly habit review | `backend/templates/weekly-review.html` |

Evidence: `backend/templates/README.md:L1-L13`.

## Common Recipes

- Local sign in: call `useAuth().signIn(email, password)` from the login screen.
  Evidence: `app/(auth)/login.tsx:L22-L33`, `providers/auth-provider.tsx:L106-L113`.
- Create a habit: collect form state in `app/new-habit.tsx`, then call `addHabit`.
  Evidence: `app/new-habit.tsx:L407-L450`.
- Start a session: navigate to `/habit-session` with `habitId`.
  Evidence: `app/(tabs)/index.tsx:L216-L219`, `app/habit-session.tsx:L27-L49`.

## API Gaps

- [TBD] Auth endpoints, request/response schemas, error codes, idempotency, pagination, and rate limits. How to confirm: inspect future backend implementation.
- [TBD] Habit CRUD endpoints and database-backed synchronization. How to confirm: inspect future backend implementation.
