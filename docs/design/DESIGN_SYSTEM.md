# Design System

## Foundations

The current design system is implemented directly in React Native styles and provider palettes. It is not yet extracted into a separate token package.

Evidence: `providers/theme-provider.tsx:L8-L55`, `app/(tabs)/index.tsx:L283-L330`, `app/new-habit.tsx:L809-L1280`.

## Color System

App-level palette values are defined in `ThemeProvider` for light and dark modes. Habit-level colors live in each `HabitTheme` and selected card color.

Evidence: `providers/theme-provider.tsx:L8-L55`, `constants/habits.ts:L18-L39`, `constants/habits.ts:L109-L200`.

Use colors by role, not by arbitrary hex in screens:

- Background: `palette.background`.
- Surface: `palette.surface`.
- Muted surface: `palette.surfaceMuted`.
- Text: `palette.text`.
- Secondary text: `palette.textSecondary`.
- Accent: `palette.accent` or habit theme accent.
- Borders: `palette.border`.

Evidence: `providers/theme-provider.tsx:L8-L55`, `app/settings.tsx:L140-L293`.

## Layout

Screens use a centered column with a maximum width around 360 on mobile-like layouts. Cards use large radii and generous vertical spacing.

Evidence: `app/(tabs)/index.tsx:L294-L330`, `app/new-habit.tsx:L820-L825`, `app/habit-session.tsx:L395-L400`.

## Components

### Habit Cards

Habit cards combine an icon, title, week-day row, and completion control. Card colors should come from the habit theme, and completion states must remain legible in both themes.

Evidence: `app/(tabs)/index.tsx:L52-L164`, `constants/habits.ts:L109-L200`.

### New Habit Form

The new habit flow contains preview, identity basics, icon grid, color grid, session length, repeat pattern, reminder controls, and fixed bottom actions.

Evidence: `app/new-habit.tsx:L452-L804`.

### Native Bottom Tabs

The bottom navigation uses native tabs and a custom underlay to maintain a blurred/liquid visual style. It currently exposes List View and Profile.

Evidence: `app/(tabs)/_layout.tsx:L48-L82`, `components/tab-bar-blur-underlay.tsx:L10-L32`.

### Bottom Sheets

Bottom sheets are used for choosing reminder time and profile photo source. They should remain focused, with explicit actions and safe cancel behavior.

Evidence: `app/new-habit.tsx:L708-L804`, `app/(tabs)/profile.tsx:L334-L380`.

## Motion

The current codebase uses interaction feedback such as haptics and timer state changes, but does not define a centralized motion system.

Evidence: `components/haptic-tab.tsx:L5-L17`, `app/habit-session.tsx:L74-L165`.

## Accessibility

The app has large touch targets and visible text labels, but a formal accessibility audit is not present. Add labels/roles when extending controls.

Evidence: `app/new-habit.tsx:L452-L804`, `app/settings.tsx:L140-L293`, `docs/design/ACCESSIBILITY.md`.

## Design Gaps

- [TBD] Centralized design tokens. How to confirm: inspect future token files or theme refactor.
- [TBD] Automated contrast checks. How to confirm: inspect future test tooling.
- [TBD] Motion/reduced-motion policy in code. How to confirm: inspect future animation utilities.
