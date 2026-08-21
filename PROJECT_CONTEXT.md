# My Hockey Network frontend context

Last reviewed: 2026-08-21

## Product scope

This monorepo contains the user-facing web and mobile applications. AdminPanel is a separate,
web-only project. User web development is the initial delivery focus, while shared code must remain
usable by the Expo mobile application.

## Architecture decision

Share logic and values, not platform presentation:

- `packages/contracts`: API DTOs, envelopes, roles, and response types.
- `packages/domain`: role, permission, age, and other pure business rules.
- `packages/api-client`: injected fetch client, normalized errors, and serialized refresh.
- `packages/auth`: OTP, onboarding, current-user, guardian, and logout use cases.
- `packages/validation`: shared Zod schemas.
- `packages/design-tokens`: portable color, spacing, and radius values.
- `apps/web`: React DOM UI, BrowserRouter, CSS, cookie/CSRF adapter, Vite environment.
- `apps/mobile`: React Native UI, React Navigation, SecureStore adapter, Expo environment.

Platform UI ownership is strict: web components are web-only and mobile components are mobile-only.
Maximum reuse occurs through platform-neutral packages, not shared JSX. The repository uses npm only
with one root lockfile. API origins are supplied exclusively through ignored runtime environment
files or deployment environment variables; no application fallback URL is checked in.

Web and mobile navigation intentionally remain different. Web authentication relies on backend
httpOnly cookies and keeps CSRF in memory. Mobile credentials are stored only in Expo SecureStore.

## Web routing

`apps/web/src/components/app-router.tsx` owns the route tree. `AuthGuard`, `GuestGuard`, and
`RoleGuard` wait for the single `/auth/me` bootstrap and support refresh, direct URLs, browser
history, unknown routes, onboarding state, and parent-only supervision.

## Mobile navigation

Mobile does not use browser URL routing. `apps/mobile/src/navigation/RootNavigator.tsx` owns the
authenticated/guest native stack and waits for SecureStore/session bootstrap before choosing it.
`MainTabs.tsx` owns authenticated bottom-tab navigation. Mobile `ROUTES` and `TAB_ROUTES` values are
typed React Navigation screen names, not URLs. Do not introduce React Router or web paths into mobile.
See `docs/NAVIGATION.md` for the required implementation rules.

## Required commands

- `npm run check:obscure`: scan source and manifests for obfuscation/malicious patterns.
- `npm run docs:check`: validate required context documents and freshness.
- `npm run test:coverage`: run unit/integration tests and enforce 80% minimum coverage.
- `npm run verify`: documentation, security, types, lint, coverage, and production web build.
- `npm run components:check`: prevent raw duplicate controls outside platform primitives.
- `npm run package-manager:check`: enforce npm and the single root lockfile.
- `npm run build:mobile`: produce Android/iOS Expo exports without regenerating native projects.

Environment setup is documented in `docs/ENVIRONMENT_CONFIGURATION.md`. Component discovery and the
no-duplicate-component policy are documented in `docs/COMPONENT_CATALOG.md`.

## Documentation ownership

Every implementation update includes documentation updates without requiring separate approval.
The detailed policy is in `docs/DOCUMENTATION_POLICY.md`.
