# Next.js web migration plan

Last reviewed: 2026-08-26

## Status

Approved and in progress. The owner authorized implementation and the migration is underway on
branch `changes/next-js-update`. `apps/web` now runs on Next.js App Router (see
`docs/IMPLEMENTATION_STATUS.md` for the current delivered-vs-remaining breakdown); Vite, React
Router, and Formik have been removed from `apps/web`. Continue the migration through the remaining
phases below rather than reverting to the prior Vite stack. Do not run two permanent routing, form,
package-manager, or caching architectures in parallel.

## Scope

Migrate the user-facing web portal from Vite and React Router to Next.js App Router while preserving
the Expo/React Native mobile application and maximizing reuse through platform-neutral packages.
The admin panel remains a separate web-only project and is not included unless explicitly added.

## Target architecture

```text
apps/
├── web/                       Next.js App Router web portal
│   └── src/
│       ├── app/                    Route groups, layouts, loading/error/not-found/robots/sitemap
│       │   └── api/backend/[...path]/route.ts   Same-origin BFF proxy to the backend API
│       ├── screens/                Migrated page-level presentation (was apps/web/src/pages)
│       ├── components/
│       │   ├── ui/                 Project-owned shadcn-style primitives (Button, Form, ...)
│       │   ├── form/fields/        Shared React Hook Form field adapters
│       │   └── routing/            Client-side auth/guest/role guards used inside layouts
│       ├── infrastructure/
│       │   └── server/             Request-scoped server environment and cookie adapters
│       ├── hooks/, contexts/, query/, config/, utils/   Existing feature-neutral web utilities
│       └── theme/                  Providers (TanStack Query, auth context, server-down wrapper)
└── mobile/                    Existing Expo/React Native app; React Navigation remains

packages/
├── contracts/                 API DTOs, enums and response contracts
├── domain/                    Pure business rules
├── api-client/                Platform-neutral HTTP behavior
├── auth/                      Shared auth use cases/state transitions
├── validation/                Shared Zod schemas (React Hook Form + Zod is now the only web form system)
├── design-tokens/             Portable design values
└── core, shared, types, constants, utils, design-system   Compatibility packages retained during
                                                             migration; see the consolidation note below
```

`apps/web/src/screens` intentionally is not named `pages` — Next.js reserves that name for the
legacy Pages Router, and a folder literally named `apps/web/src/pages` conflicts with App Router
route discovery during `next build`.

### Package consolidation (in progress, not yet complete)

`core`, `shared`, `types`, `constants`, `utils`, and `design-system` remain as compatibility
packages while the migration is underway. Do not delete them yet. Consolidate incrementally as their
exports migrate to a clear owner, and only after each package's import inventory and tests are
verified:

- `types` → `contracts`
- validation-related utilities → `validation`
- business utilities → `domain`
- visual/design values → `design-tokens`
- API operations → `api-client` or feature-specific data-access modules
- `shared` barrel exports → remove once nothing imports them
- `design-system` facade → remove once every consumer uses `design-tokens` directly
- `core` → remove only after every export has a clear owner in one of the packages above

No permanent "compatibility catch-all" package should remain after migration completes.

## Migration constraints

- Preserve web/mobile UI separation. Do not share Next.js or React Native presentation.
- Preserve API contracts, domain rules, validation, authentication use cases, and design tokens.
- Replace React Router guards with App Router layouts, middleware only where justified, and
  server-side/session-aware authorization without weakening HttpOnly-cookie security.
- Keep TanStack Query v5 for interactive client-side server state; do not use it where a Server
  Component fetch and Next.js cache/revalidation is the correct owner.
- Use Server Components by default and keep Client Components narrowly scoped.
- Use React Hook Form with Zod as the target form system, aligned with the reviewed Admin Panel.
  Migrate Formik coherently; do not run multiple form architectures indefinitely.
- Introduce shadcn/ui through project-owned reusable primitives rather than copying duplicate
  components per feature.
- Use TanStack Table for real data-table behavior, not simple layout grids.
- Add Zustand only for genuinely shared client state that is not URL, form, server, or local state.
- Move from npm to pnpm as one controlled workspace/lockfile migration. Never retain both lockfiles.
- Authenticate through a same-origin Next.js API boundary: browser → `apps/web/src/app/api/backend/
  [...path]/route.ts` → backend API. Mobile continues to call the backend directly. Server API
  clients must be request-scoped; never reuse a globally configured client as a server singleton,
  since request cookies must never leak between users.
- Preserve greater-than-80% enforced coverage and add routing/rendering/auth regression tests.
- Follow `WEB_SEO_AND_RENDERING_STRATEGY.md`: classify every route before implementation, use ISR
  only for suitable public content, and keep authenticated/personalized output dynamic and no-store.
- Follow `THIRD_PARTY_AND_DEPENDENCY_POLICY.md`; Next.js built-ins are preferred and candidate
  external services require a separate security/privacy/ownership decision.
- Retain component/file guards: search before creation, typed variants before duplicates, `@/` app
  imports, no explicit `any`, no feature-level inline styles/raw controls, and meaningful review of
  files exceeding 300 lines.

## Phases and current status

1. **Migration audit and decisions** — done. Next.js 16, React 19, Node 24.18.0, pnpm 11.19.0.
   Same-origin BFF chosen for cookie handling (see Authentication above).
2. **Workspace/tooling conversion** — done. pnpm workspace with one root `pnpm-lock.yaml`, Next.js
   application shell in `apps/web`, Tailwind 4, Vitest, ESLint, environment validation, and
   `next dev`/`next build`/`next start` commands are all in place.
3. **Infrastructure** — done. Same-origin BFF proxy route, request-scoped server environment
   adapter (`apps/web/src/infrastructure/server`), TanStack Query provider, root/route
   `error.tsx`/`global-error.tsx`/`loading.tsx`/`not-found.tsx` boundaries.
4. **Route migration** — done for the existing route set. `(auth)` and `(authenticated)` route
   groups exist with client-side `AuthenticatedGuard`/`GuestGuard`/`ParentRoleGuard`/
   `MinorPlayerGuard`. Directional guardian relationship routes are implemented. **Gap:** these
   guards are still client-side only; server-side/session-aware authorization at the route or data
   boundary (the actual security control per `FRONTEND_ARCHITECTURE.md` §5.2) is not yet implemented.
5. **Feature migration** — in progress. All existing screens render under the App Router and all
   semantic web forms use React Hook Form + Zod (Formik is fully removed). **Remaining:** full
   TanStack Query adoption audit, decomposition of oversized screens (`profile-page.tsx`,
   `supervision-page.tsx`, both ~1,800 lines), removal of fabricated/mock data still present in some
   feature screens, and the package consolidation above.
6. **Rendering and SEO** — partially done. `robots.ts`, `sitemap.ts`, and a root metadata baseline
   exist; the root layout currently sets `robots: { index: false, follow: false }` globally as a
   safe default. **Remaining:** per-route metadata/canonical/Open Graph data and the full
   SSR/SSG/ISR classification matrix from `WEB_SEO_AND_RENDERING_STRATEGY.md` have not been applied
   route-by-route.
7. **Cutover** — not started. Vite, React Router, Formik, and npm artifacts are already removed from
   `apps/web`. Playwright coverage is partly implemented (guest smoke runs in CI; authenticated
   writes require a dedicated account), while full regression, accessibility, performance, and
   security review remain
   outstanding before this can be called complete. See `docs/IMPLEMENTATION_STATUS.md` for the
   authoritative, itemized gap list.

## Planned migration quality gates

The migration must define equivalent pnpm commands before feature cutover for formatting, strict
lint, TypeScript, unit tests, integration tests, Playwright smoke/e2e, four-metric coverage, security
and obfuscation scanning, production build/start smoke, and documentation freshness.

Repository checks must continue to reject duplicate raw primitives, cross-platform presentation
imports, explicit `any`, relative application imports, unapproved inline styles/SVG, direct feature-
level HTTP, multiple lockfiles, and accidental runtime environment files. A file-size report must
flag source files above 300 lines for responsibility review with a small documented exception list;
line count alone must never fail a well-focused file or encourage meaningless splitting.
