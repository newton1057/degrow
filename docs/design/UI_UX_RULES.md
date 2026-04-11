# UI/UX Rules

This is the fast reference. Read this before making any UI change.

Evidence: `providers/theme-provider.tsx:L8-L55`, `app/(tabs)/index.tsx:L283-L330`, `app/new-habit.tsx:L809-L1280`, `app/habit-session.tsx:L384-L682`.

## Layout Rules

- Use a centered mobile content column with `maxWidth: 360` where existing screens do.
- Keep horizontal padding near 18 to 24 on primary screens.
- Use large rounded cards, usually 28 to 36 radius, and avoid sharp rectangular panels.
- Keep bottom actions above the native tab/safe-area region.
- When laying out options, prefer evenly distributed rows that fill available width, as used by color/day/session controls.

Evidence: `app/(tabs)/index.tsx:L294-L330`, `app/new-habit.tsx:L820-L825`, `app/new-habit.tsx:L1017-L1035`, `app/new-habit.tsx:L1200-L1254`.

## Typography Rules

- Screen titles should be bold and highly legible.
- Section eyebrow labels should be uppercase and muted.
- Body/helper copy should use secondary text, never pure low-contrast gray on tinted cards.
- Avoid adding new font families until a type strategy is intentionally selected.

Evidence: `app/new-habit.tsx:L956-L999`, `app/settings.tsx:L140-L293`, `providers/theme-provider.tsx:L8-L55`.

## Color Rules

- Use theme palette roles from `ThemeProvider` for app surfaces and text.
- Use habit theme accents only for habit-specific cards, icons, repeat buttons, session chips, and primary create action.
- Do not use selection blue by default unless the selected color is actually blue.
- In light mode, check buttons and switches must keep enough contrast against white/cream surfaces.
- White color swatches must not look selected by default; selected state should be represented by an external ring or outline, not by making white appear active.

Evidence: `providers/theme-provider.tsx:L8-L55`, `constants/habits.ts:L109-L200`, `app/new-habit.tsx:L1200-L1231`, `app/settings.tsx:L28-L57`.

## Component Rules

- Buttons: primary actions use the active accent and strong text contrast; secondary actions use border/surface styling.
- Inputs: use rounded containers, high contrast text, and clear labels.
- Modals/bottom sheets: use one focused task, title, helper text, and explicit close/cancel affordance.
- Cards: keep one primary action per card; completion controls should be visually distinct from decorative marks.
- Switches: on state must be visibly active with accent track/fill; off state must be muted.
- Color/icon/session pickers: selections use a clear external ring and the selected item color, not a generic blue.

Evidence: `app/new-habit.tsx:L452-L804`, `app/new-habit.tsx:L1094-L1254`, `app/settings.tsx:L28-L57`, `app/(tabs)/index.tsx:L52-L164`.

## Interaction Rules

- Provide immediate visual feedback for taps.
- Use haptics on high-value native interactions where already established.
- Empty or unavailable native module states should explain the fix without crashing.
- Reminder time editing belongs in a bottom sheet, not inline clutter.
- Timer sessions must support start/pause, reset, and finish.

Evidence: `components/haptic-tab.tsx:L5-L17`, `services/local-notifications.ts:L90-L136`, `app/new-habit.tsx:L708-L804`, `app/habit-session.tsx:L74-L183`.

## Accessibility Checklist

- Text contrast must pass for light and dark themes.
- Touch targets should remain large enough for thumb use.
- Do not rely on color alone for critical state; pair color with labels/icons where possible.
- Respect system theme unless user selected a specific preference.
- Avoid long animations until a reduced-motion path exists.

Evidence: `providers/theme-provider.tsx:L72-L146`, `app/settings.tsx:L140-L293`.

## Responsiveness Rules

- Design mobile-first.
- Keep core content readable at narrow iPhone widths.
- Use max-width centered columns rather than stretching mobile UI across wide web screens.
- Avoid hardcoded widths that cause day/session chips to wrap unexpectedly.

Evidence: `app/(tabs)/index.tsx:L294-L330`, `app/new-habit.tsx:L1017-L1035`, `app/new-habit.tsx:L1232-L1254`.

## Motion Rules

- Keep motion purposeful: tab feedback, bottom sheet transitions, timer progress.
- Prefer short durations around 150 to 250 ms for UI state changes when animations are added.
- Do not add decorative continuous motion to habit cards.
- Add reduced-motion handling before adding large screen transitions.

Evidence: current explicit motion system is not centralized; interaction feedback exists in `components/haptic-tab.tsx:L5-L17` and timer state in `app/habit-session.tsx:L74-L165`.

## Copywriting Micro-Rules

- Use action labels that describe the result: "Create Habit", "Start", "Pause", "Finish".
- Use sentence case for helper text.
- Keep settings labels noun-based and short.
- Spanish translations should be natural Spanish, not literal word-by-word English.

Evidence: `providers/language-provider.tsx:L18-L525`.

## Do / Don't

- Do: reuse `useTheme()` palette roles.
- Don't: hardcode random grays that break light mode.
- Do: cite evidence when changing docs.
- Don't: claim backend behavior before code exists.
- Do: keep new picker grids balanced and predictable.
- Don't: let controls wrap into uneven rows unless the content truly requires it.
