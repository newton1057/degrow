# Glossary

- DeGrow: the app name configured in Expo metadata.
  Evidence: `app.json:L2-L5`.
- Habit: a tracked activity with title, icon, theme, days, target, timer length, and reminder data.
  Evidence: `constants/habits.ts:L21-L39`.
- Day item: a single week-day record with label, date number, and completion state.
  Evidence: `constants/habits.ts:L11-L16`.
- Current week: the computed week window starting on Saturday.
  Evidence: `constants/habits.ts:L57-L87`.
- Focus session: a timed habit session screen that can complete today's habit.
  Evidence: `app/habit-session.tsx:L18-L49`, `app/habit-session.tsx:L57-L183`.
- Reminder: local notification schedule configured per habit.
  Evidence: `services/local-notifications.ts:L230-L317`.
- Liquid Glass tab bar: the native bottom tab appearance plus the app's blur/gradient underlay.
  Evidence: `app/(tabs)/_layout.tsx:L14-L82`, `components/tab-bar-blur-underlay.tsx:L10-L32`.
- Demo auth: local-only auth that creates persisted user state without a backend.
  Evidence: `providers/auth-provider.tsx:L106-L120`.
- Theme preference: `system`, `light`, or `dark` persisted locally.
  Evidence: `providers/theme-provider.tsx:L5-L6`, `providers/theme-provider.tsx:L66-L123`.
- Language preference: `en` or `es` persisted locally.
  Evidence: `providers/language-provider.tsx:L4-L16`, `providers/language-provider.tsx:L565-L614`.
