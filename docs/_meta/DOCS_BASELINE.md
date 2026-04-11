# Documentation Baseline

## Mode

BOOTSTRAP mode.

- `docs/` did not exist before this documentation pass.
- The repository had a default Expo starter `README.md`, not project-specific documentation.
- This pass creates the first structured documentation baseline.

Evidence: initial repository inspection in this documentation pass found no `docs/` directory; after this pass the created documentation set is listed in `docs/INDEX.md` and `docs/_inventory/REPO_MAP.md`.

## Baseline Identifier

- Git commit SHA: `1fdb4ffe45e4702ba50f206f1b284803b00d00bd`
- Baseline captured at: `2026-04-11 01:34:50 CST`
- Repository path: `/Users/newton1057/Desktop/degrow`

## Detected Stacks

- Mobile/frontend: Expo Router, React Native, React 19, Expo 54, TypeScript.
- Navigation: Expo Router with stack routes and React Navigation native bottom tabs.
- Native modules: Expo Notifications, Expo Image Picker, Expo FileSystem, Expo Haptics, Expo Linear Gradient, Expo Symbols.
- Styling: React Native StyleSheet objects with app-specific light/dark palettes.
- Persistence: local JSON/text files through Expo FileSystem.
- Backend: no runtime server/API implementation; static HTML templates exist under `backend/templates/`.
- Tooling: npm scripts, Expo CLI, TypeScript strict mode, Expo ESLint flat config.

Evidence: `package.json:L2-L48`, `app.json:L35-L69`, `providers/theme-provider.tsx:L8-L68`, `providers/habits-provider.tsx:L41-L58`, `backend/templates/README.md:L1-L13`, `tsconfig.json:L1-L17`, `eslint.config.js:L1-L10`.

## Docs Coverage Checklist

- README: created and project-specific.
- Docs index: created.
- Quickstart: created.
- Architecture and system design: created.
- Domain and data model: created.
- API reference: created with current "no runtime API" status.
- Configuration and deployment: created.
- Operations, security, testing, troubleshooting, contributing: created.
- Design system, UI/UX rules, accessibility, content style guide: created.
- Repo inventory: created.
- Improvements backlog/proposals/implemented logs: created.

## Known Gaps

- [TBD] Production backend architecture, API endpoints, authentication, and database schema are not implemented in this repo. How to confirm: search for server route handlers outside `backend/templates/`; current scan found only static templates.
- [TBD] Production deployment targets and release process are not defined. How to confirm: inspect future EAS/GitHub Actions config when added; no `.github/` workflows are present in this baseline.
- [TBD] Automated unit/integration tests are not present. How to confirm: inspect `package.json` scripts and test file patterns; current scripts only include `lint` plus Expo run scripts.
- [TBD] App screenshots and design tokens are not exported as assets. How to confirm: check `assets/` and design docs after the next UI pass.
