# Accessibility

## Current Accessibility Posture

The app uses large mobile controls, visible text labels, and theme-aware palettes. A formal accessibility audit and automated accessibility test suite are not present.

Evidence: `app/new-habit.tsx:L452-L804`, `app/settings.tsx:L140-L293`, `providers/theme-provider.tsx:L8-L55`.

## Requirements For New UI

- Every tappable icon-only control should have an accessible label.
- Text must remain readable in light and dark modes.
- Selection state should not rely only on color.
- Native permission failure states should be described in text.
- Bottom sheets must include a clear close/cancel path.
- Timer controls must remain operable without relying on animation.

Evidence: `app/permissions.tsx:L253-L343`, `app/new-habit.tsx:L708-L804`, `app/habit-session.tsx:L232-L380`.

## Contrast

Use palette roles from `ThemeProvider` and validate custom habit colors in both app themes. Light-mode check buttons and switches need special attention because low-contrast accents can become invisible on pale backgrounds.

Evidence: `providers/theme-provider.tsx:L8-L55`, `constants/habits.ts:L109-L200`, `app/settings.tsx:L28-L57`.

## Motion

No centralized reduced-motion handling exists. Avoid adding large animation systems until a reduced-motion strategy is implemented.

Evidence: current motion is limited; `components/haptic-tab.tsx:L5-L17`, `app/habit-session.tsx:L74-L165`.

## Native Permissions

The permissions screen must remain the canonical place to explain notification, media library, and camera permission states.

Evidence: `app/permissions.tsx:L81-L210`, `app/permissions.tsx:L253-L343`.

## Gaps

- [TBD] Screen reader audit. How to confirm: run VoiceOver/TalkBack manual testing and document results.
- [TBD] Automated contrast checks. How to confirm: add visual or accessibility test tooling.
- [TBD] Reduced-motion implementation. How to confirm: inspect future animation utilities.
