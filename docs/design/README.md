# Design Documentation

This folder defines how DeGrow should look, feel, read, and behave across light/dark modes and English/Spanish content.

Evidence: `providers/theme-provider.tsx:L8-L55`, `providers/language-provider.tsx:L18-L525`, `app/(tabs)/index.tsx:L283-L330`, `app/new-habit.tsx:L809-L1280`.

## Read Order

1. [`UI_UX_RULES.md`](UI_UX_RULES.md): fast rules for daily design decisions.
2. [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md): deeper design system reference.
3. [`ACCESSIBILITY.md`](ACCESSIBILITY.md): accessibility requirements and gaps.
4. [`CONTENT_STYLE_GUIDE.md`](CONTENT_STYLE_GUIDE.md): English/Spanish copy rules.

## Current Design Direction

DeGrow uses rounded, dark-first but light-mode-aware mobile cards, color-coded habits, native iOS-style bottom navigation, large tactile touch targets, and local-first habit flows.

Evidence: `app/(tabs)/index.tsx:L52-L164`, `app/(tabs)/_layout.tsx:L14-L82`, `components/tab-bar-blur-underlay.tsx:L1-L32`, `app/new-habit.tsx:L452-L804`.
