# Security

## Current Security Posture

DeGrow is currently a local-first prototype. It does not implement production authentication, server-side authorization, or encrypted persistence in the repository.

Evidence: `providers/auth-provider.tsx:L23-L51`, `providers/auth-provider.tsx:L106-L120`, `providers/habits-provider.tsx:L41-L58`.

## Authentication

`signIn` and `signUp` create local user state after an artificial delay. Password inputs exist in the auth screens, but the provider does not validate credentials against a backend.

Evidence: `app/(auth)/login.tsx:L22-L33`, `app/(auth)/register.tsx:L22-L34`, `providers/auth-provider.tsx:L106-L120`.

Risk: do not ship this as real authentication.

Required future work: integrate backend auth, token storage strategy, password reset, email verification, session expiry, and server-side authorization.

## Local Storage

User and habit data are stored in local files through Expo FileSystem. The code does not encrypt these files.

Evidence: `providers/auth-provider.tsx:L23-L51`, `providers/habits-provider.tsx:L41-L58`.

Risk: local device compromise can expose app data.

## Permissions

The app requests notification, camera, and media library permissions only for features that need them. The permissions page surfaces current status and can open system settings.

Evidence: `app/permissions.tsx:L81-L210`, `app/permissions.tsx:L253-L343`, `app.json:L45-L51`.

## Notifications

Local notification payloads include habit identifiers and titles for routing and display. Avoid adding sensitive data to notification content until a privacy policy is defined.

Evidence: `services/local-notifications.ts:L230-L317`, `services/local-notifications.ts:L319-L360`, `providers/notifications-provider.tsx:L35-L53`.

## Backend Templates

Templates are English HTML files for future backend workflows. They should be reviewed for token handling, expiration copy, and anti-phishing consistency when wired to a backend.

Evidence: `backend/templates/README.md:L1-L13`.

## Security Gaps

- [TBD] Production auth implementation. How to confirm: inspect future backend/auth provider integration.
- [TBD] Secure token storage. How to confirm: inspect future use of secure storage or platform keychain APIs.
- [TBD] Privacy policy and data retention rules. How to confirm: inspect future legal/product docs.
- [TBD] Rate limiting and abuse controls. How to confirm: inspect future backend middleware.
