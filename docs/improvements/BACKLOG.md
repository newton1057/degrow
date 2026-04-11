# Improvement Backlog

| Improvement | Impact | Effort | Notes |
| --- | --- | --- | --- |
| Add provider unit tests | High | Medium | Cover auth persistence, habit weekly reset, reminder scheduling input generation |
| Add E2E smoke test | High | Medium | Validate auth, habit creation, timer, settings, and profile |
| Add EAS build profiles | High | Low/Medium | Needed for repeatable native builds and store prep |
| Add CI workflow | High | Low | Run `npm run lint` and `npx tsc --noEmit` on PRs |
| Add backend API | High | High | Required before real auth/database sync |
| Add database schema | High | High | Required next week when backend integration starts |
| Add centralized design tokens | Medium | Medium | Reduce repeated per-screen styles |
| Add accessibility audit | Medium | Medium | VoiceOver/TalkBack plus contrast checks |
| Add screenshots to README/docs | Medium | Low | Use current stable UI states |
| Add structured logging/crash reporting | Medium | Medium | Needed before production release |

Evidence: `package.json:L5-L12`, `providers/habits-provider.tsx:L41-L58`, `services/local-notifications.ts:L230-L317`, `providers/theme-provider.tsx:L8-L55`.
