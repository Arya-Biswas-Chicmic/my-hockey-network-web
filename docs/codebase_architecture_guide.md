# My Hockey Network frontend architecture

Last reviewed: 2026-08-26

The repository is a pnpm-workspaces monorepo. Web and mobile share contracts, business rules,
validation, authentication use cases, API behavior, and design values. Their UI, navigation,
environment access, and credential storage stay platform-specific.

Node.js runs the toolchain and pnpm is the only package manager. The root `pnpm-lock.yaml` is the
single dependency lockfile; workspace `package.json` files describe app/package-specific scripts and
dependencies without creating separate installations.

## Sharing boundary

```text
packages/
├── contracts/       API DTOs, response types, roles and enums
├── domain/          Platform-neutral role and permission rules
├── api-client/      Injected fetch client, refresh serialization and errors
├── auth/            OTP/onboarding/logout use cases
├── validation/      Shared Zod form schemas (React Hook Form + Zod is the only web form system)
├── design-tokens/   Colors, spacing and radii values
├── core/            Compatibility APIs and existing feature use cases (consolidating, see NEXTJS_MIGRATION_PLAN.md)
├── shared/          Existing convenience exports used by mobile UI (consolidating)
├── constants/       Centralized user-facing strings and typed UI enums (web + mobile)
├── types/           Shared TypeScript types consumed by `constants` and other packages (consolidating)
├── utils/           Shared utilities (consolidating)
└── design-system/   Existing presentation tokens (consolidating; superseded by design-tokens)

apps/web/src/
├── app/              Next.js App Router: route groups, layouts, error/loading/not-found, robots/sitemap
│   └── api/backend/[...path]/route.ts   Same-origin BFF proxy to the backend API
├── screens/          Web-only screen composition (was `pages/`; renamed to avoid Next.js Pages Router conflict)
├── infrastructure/   Request-scoped server environment and cookie adapters
├── components/
│   ├── routing/      AuthenticatedGuard, GuestGuard, ParentRoleGuard used inside layouts
│   ├── ui/            Project-owned shadcn-style primitives
│   └── form/fields/   Shared React Hook Form field adapters
├── platform/         Next.js environment, cookie auth adapter, configured API client
└── theme/            Providers (TanStack Query, auth context, server-down wrapper) and web CSS

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
Cross-platform reuse is intentionally below the presentation layer. `pnpm components:check`
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

The web application runs on Next.js App Router with Server Components, shadcn-style primitives,
React Hook Form + Zod, and pnpm; Vite, React Router, and Formik have been removed. Server-side
rendering strategy (SSR/SSG/ISR) has not yet been classified per route — see
`WEB_SEO_AND_RENDERING_STRATEGY.md` — and Zustand/TanStack Table remain available but are used only
where genuinely needed, not introduced speculatively. The target keeps the existing `apps/web`,
`apps/mobile`, and `packages/*` ownership model; it does not flatten User Panel into the separate
Admin repository. See `NEXTJS_MIGRATION_PLAN.md`, `WEB_SEO_AND_RENDERING_STRATEGY.md`,
`THIRD_PARTY_AND_DEPENDENCY_POLICY.md`, and `ADMIN_PANEL_ALIGNMENT.md`.

## Routing rules

- Web uses Next.js App Router route groups, with `AuthenticatedGuard`, `GuestGuard`, and
  `ParentRoleGuard` used inside layouts.
- Guards wait for the single `/auth/me` bootstrap before making redirect decisions. They currently
  run client-side only; server-side/session-aware authorization at the route or data boundary is not
  yet implemented (see `FRONTEND_ARCHITECTURE.md` §5.2).
- Direct URL entry, refresh, browser history, and unknown paths all flow through the router.
- Authenticated routes render behind their route group's guard/layout.
- Guardian approval and request-sent URLs are public transition routes; supervision remains behind
  the parent role guard.
- Mobile keeps React Navigation because native screen transitions and tab navigation differ.
- Mobile has no browser URL router; its route-name constants identify navigator screens only.
- Deep/universal linking is not configured and must be implemented explicitly if later required.
- Navigation components are platform UI and should not be moved into shared packages.

## Required checks

Run `pnpm verify` from this folder. It validates pnpm-only dependency management, documentation,
security and component boundaries, then performs web/mobile type checks, lint checks, coverage tests,
and the production web build. Git hooks run the same scanner before linting staged work and validate
conventional commit messages. `.github/workflows/ci.yml` runs the same chain on push/PR.
