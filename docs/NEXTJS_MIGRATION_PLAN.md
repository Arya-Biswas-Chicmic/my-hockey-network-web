# Next.js web migration plan

Last reviewed: 2026-08-26

## Status

Approved direction; implementation paused. Do not change dependencies, lockfiles, source layout,
build commands, routing, deployment configuration, or application code until the owner explicitly
instructs the team to begin the migration.

## Scope

Migrate the user-facing web portal from Vite and React Router to Next.js App Router while preserving
the Expo/React Native mobile application and maximizing reuse through platform-neutral packages.
The admin panel remains a separate web-only project and is not included unless explicitly added.

## Target architecture

```text
apps/
├── web/                       Next.js App Router web portal
│   ├── app/                   Route segments, layouts, loading/error/not-found boundaries
│   ├── components/            Web-only shadcn/project UI and feature presentation
│   ├── features/              Feature containers, hooks, transformations and client interactions
│   └── infrastructure/        Next environment, server/client API adapters and auth integration
└── mobile/                    Existing Expo/React Native app; React Navigation remains

packages/
├── contracts/                 API DTOs, enums and response contracts
├── domain/                    Pure business rules
├── api-client/                Platform-neutral HTTP behavior
├── auth/                      Shared auth use cases/state transitions
├── validation/                Shared Zod schemas
└── design-tokens/             Portable design values
```

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
- Preserve greater-than-80% enforced coverage and add routing/rendering/auth regression tests.
- Follow `WEB_SEO_AND_RENDERING_STRATEGY.md`: classify every route before implementation, use ISR
  only for suitable public content, and keep authenticated/personalized output dynamic and no-store.
- Follow `THIRD_PARTY_AND_DEPENDENCY_POLICY.md`; Next.js built-ins are preferred and candidate
  external services require a separate security/privacy/ownership decision.
- Retain component/file guards: search before creation, typed variants before duplicates, `@/` app
  imports, no explicit `any`, no feature-level inline styles/raw controls, and meaningful review of
  files exceeding 300 lines.

## Proposed phases

1. Migration audit and decisions: Next.js version, Node/TypeScript compatibility, hosting target,
   cookie origin strategy, route/rendering/SEO inventory, and package-manager cutover.
2. Workspace/tooling conversion: pnpm workspace, one lockfile, Next.js application shell, Tailwind,
   tests, lint, environment validation, and build commands.
3. Infrastructure: server/client API boundaries, HttpOnly-cookie auth, CSRF, TanStack Query provider,
   error/loading/not-found boundaries, and observability hooks.
4. Route migration: public/authenticated/role-protected layouts and route parity tests.
5. Feature migration: move one complete vertical feature at a time, reusing existing contracts,
   domain logic, schemas, tokens, and UI patterns.
6. Rendering and SEO: implement route metadata, sitemap/robots/canonicals/structured data, then
   assign SSR, SSG, ISR, or client revalidation based on privacy, freshness, SEO, and personalization.
7. Cutover: full regression, accessibility, performance, security, web production build/deploy,
   removal of Vite/React Router/Formik/npm artifacts, and documentation finalization.

## Decisions required at kickoff

- Hosting/deployment platform and supported Next.js features.
- Same-origin versus cross-origin backend strategy for secure cookies.
- Public route caching/revalidation periods.
- Whether TypeScript remains on the current supported version or changes for Next compatibility.
- Exact pnpm and Node versions.

## Planned migration quality gates

The migration must define equivalent pnpm commands before feature cutover for formatting, strict
lint, TypeScript, unit tests, integration tests, Playwright smoke/e2e, four-metric coverage, security
and obfuscation scanning, production build/start smoke, and documentation freshness.

Repository checks must continue to reject duplicate raw primitives, cross-platform presentation
imports, explicit `any`, relative application imports, unapproved inline styles/SVG, direct feature-
level HTTP, multiple lockfiles, and accidental runtime environment files. A file-size report must
flag source files above 300 lines for responsibility review with a small documented exception list;
line count alone must never fail a well-focused file or encourage meaningless splitting.
