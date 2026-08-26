# My Hockey Network frontend architecture

Last reviewed: 2026-08-26

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

Web server state uses TanStack Query. The compatibility hook in `apps/web/src/query` delegates to
TanStack Query and must not become a second cache implementation. HTTP operations use the injected
native-fetch client; feature code must not call fetch directly or introduce Axios. Application-local
imports use `@/`. Explicit `any` is rejected. Ordinary UI icons use Lucide, while custom branded or
data-visual SVG markup stays isolated in approved reusable icon components.

Feature composition should flow from page to feature/container to focused feature components and
existing platform primitives. Prefer 100–200-line files and review files above 300 lines for
meaningful responsibility-based decomposition. This is a maintainability target, not permission to
create trivial components. See `FRONTEND_DEVELOPMENT_GUIDELINES.md`.

The web application is currently a Vite SPA. A coordinated migration to Next.js App Router,
Server Components, SSR/SSG/ISR, shadcn/ui, a single replacement form system, optional Zustand,
TanStack Table, and pnpm is approved but paused. Do not introduce target-stack pieces incrementally
until the owner starts the migration. The target keeps the existing `apps/web`, `apps/mobile`, and
`packages/*` ownership model; it does not flatten User Panel into the separate Admin repository.
See `NEXTJS_MIGRATION_PLAN.md`, `WEB_SEO_AND_RENDERING_STRATEGY.md`,
`THIRD_PARTY_AND_DEPENDENCY_POLICY.md`, and `ADMIN_PANEL_ALIGNMENT.md`.

## Routing rules

- Web uses `BrowserRouter`, nested `AuthGuard`, `GuestGuard`, and `RoleGuard` routes.
- Guards wait for the single `/auth/me` bootstrap before making redirect decisions.
- Direct URL entry, refresh, browser history, and unknown paths all flow through the router.
- Authenticated page modules are route-level lazy chunks behind a shared loading boundary.
- Guardian approval and request-sent URLs are public transition routes; supervision remains behind
  the parent role guard.
- Mobile keeps React Navigation because native screen transitions and tab navigation differ.
- Mobile has no browser URL router; its route-name constants identify navigator screens only.
- Deep/universal linking is not configured and must be implemented explicitly if later required.
- Navigation components are platform UI and should not be moved into shared packages.

## Required checks

Run `npm run verify` from this folder. It validates npm-only dependency management, documentation,
security and component boundaries, then performs web/mobile type checks, lint checks, coverage tests,
and the production web build. Git hooks run the same scanner before linting staged work and validate
conventional commit messages.
