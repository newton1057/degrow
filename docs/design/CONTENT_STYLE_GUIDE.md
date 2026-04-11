# Content Style Guide

## Languages

The app supports English and Spanish through `LanguageProvider`. English is the fallback when a translation key is missing.

Evidence: `providers/language-provider.tsx:L4-L16`, `providers/language-provider.tsx:L18-L525`, `providers/language-provider.tsx:L616-L620`.

## Voice

- Clear and direct.
- Habit-focused.
- Short labels for controls.
- Helpful helper text for permissions, reminders, and unavailable native modules.

Evidence: `providers/language-provider.tsx:L18-L525`, `app/permissions.tsx:L253-L343`.

## Labels

- Use title case for primary button labels only when existing UI does.
- Use sentence case for helper text.
- Prefer "Create Habit" over vague "Done".
- Prefer "Daily Reminder" for the setting, and show time configuration in a bottom sheet when enabled.

Evidence: `app/new-habit.tsx:L452-L804`, `app/settings.tsx:L140-L293`.

## Spanish

- Use natural Spanish copy.
- Avoid mixing English-only labels unless the feature is intentionally English-only.
- Backend templates are intentionally English-only in the current repository.

Evidence: `providers/language-provider.tsx:L273-L525`, `backend/templates/README.md:L1-L13`.

## Error And Empty States

- Explain what happened.
- Explain what the user can do next.
- Avoid exposing raw native module stack traces in UI copy.

Evidence: `services/local-notifications.ts:L104-L136`, `app/permissions.tsx:L81-L160`.

## Gaps

- [TBD] Final product marketing copy. How to confirm: review future product docs.
- [TBD] Backend email copy review. How to confirm: review future backend template wiring and mailer implementation.
