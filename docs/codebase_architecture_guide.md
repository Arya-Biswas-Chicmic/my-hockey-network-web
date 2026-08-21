# My Hockey Network frontend architecture

Last reviewed: 2026-08-21

The repository is an npm-workspaces monorepo. Web and mobile share contracts, business rules,
validation, authentication use cases, API behavior, and design values. Their UI, navigation,
environment access, and credential storage stay platform-specific.

Node.js runs the toolchain and npm is the only package manager. The root `package-lock.json` is the
single dependency lockfile; workspace `package.json` files describe app/package-specific scripts and
dependencies without creating separate installations.

## Sharing boundary

```text
packages/
├── contracts/       API DTOs, response types, roles and enums
├── domain/          Platform-neutral role and permission rules
├── api-client/      Injected fetch client, refresh serialization and errors
├── auth/            OTP/onboarding/logout use cases
├── validation/      Shared Zod form schemas
├── design-tokens/   Colors, spacing and radii values
├── core/            Compatibility APIs and existing feature use cases
├── shared/          Existing convenience exports used by mobile UI
└── design-system/   Existing presentation tokens

apps/web/src/
├── platform/        Vite environment, cookie auth adapter, configured API client
├── components/      React DOM UI and BrowserRouter route tree
├── guards/          Hydrated auth, guest and role guards
├── pages/           Web-only screen composition
└── theme/           Web CSS and theme provider

apps/mobile/src/
├── platform/        Expo environment, SecureStore auth adapter, configured API client
├── navigation/      React Navigation stacks and tabs
├── screens/         React Native presentation
├── components/      Native UI components
└── redux/           Mobile application/presentation state (no persisted tokens)
```

## Dependency direction

```text
contracts <- domain
contracts <- api-client <- auth
                      ^
                      |
             platform adapters
                /           \
          apps/web       apps/mobile
```

Shared packages must not read `window`, `document`, `localStorage`, `import.meta.env`, or Expo
globals. Each app configures the shared client in its entry point. Web relies on backend httpOnly
session cookies and keeps CSRF only in memory. Mobile stores access, refresh, and CSRF credentials
in Expo SecureStore; Redux contains authenticated user state, never bearer tokens.

Web common components remain under `apps/web`; mobile common components remain under `apps/mobile`.
Cross-platform reuse is intentionally below the presentation layer. `npm run components:check`
rejects web/native cross-imports and JSX in shared packages.

API origins are required platform environment variables. No shared package, checked-in deployment
file, or application module supplies a default server URL.

## Routing rules

- Web uses `BrowserRouter`, nested `AuthGuard`, `GuestGuard`, and `RoleGuard` routes.
- Guards wait for the single `/auth/me` bootstrap before making redirect decisions.
- Direct URL entry, refresh, browser history, and unknown paths all flow through the router.
- Mobile keeps React Navigation because native screen transitions and tab navigation differ.
- Mobile has no browser URL router; its route-name constants identify navigator screens only.
- Deep/universal linking is not configured and must be implemented explicitly if later required.
- Navigation components are platform UI and should not be moved into shared packages.

## Required checks

Run `npm run verify` from this folder. It validates npm-only dependency management, documentation,
security and component boundaries, then performs web/mobile type checks, lint checks, coverage tests,
and the production web build. Git hooks run the same scanner before linting staged work and validate
conventional commit messages.
