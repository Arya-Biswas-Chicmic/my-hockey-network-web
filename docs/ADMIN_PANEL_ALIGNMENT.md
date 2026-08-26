# Admin Panel alignment reference

Last reviewed: 2026-08-26

## Purpose

The Admin Panel at `/Volumes/Data/Projects/React/MHN/AdminPanel` is a separate web-only repository.
It was reviewed to inform the User Panel's approved Next.js target. This document is a comparison,
not permission to import Admin files or start the User Panel migration.

## Verified patterns to align

| Admin Panel pattern | User Panel decision |
| --- | --- |
| Next.js App Router + React 19 + strict TypeScript | Adopt for `apps/web` after migration authorization |
| Tailwind 4 and project-owned shadcn-style primitives | Adopt while preserving User Panel tokens and component catalog |
| React Hook Form providers with Zod schemas | Adopt as the single target web form pattern |
| TanStack Query v5 with centralized defaults | Adopt for interactive client server-state, not as a second Next server cache |
| Zustand for focused global client state | Allow only after local, URL, form, and server state are ruled out |
| Vitest/RTL and 80% thresholds | Retain and strengthen with route integration and Playwright smoke coverage |
| Playwright production journeys | Adopt for smoke/e2e after migration starts |
| `@/` imports, strict lint/type checks, pre-command scan | Retain equivalent User Panel gates |
| Central environment validation and endpoint/error ownership | Retain with User Panel native-fetch and cookie/CSRF design |

## Patterns that must remain different

- Admin uses Axios. User Panel continues with its injected native-fetch client and will create
  centralized Next server/client data-access adapters rather than copying Axios services.
- Admin is a single web application. User Panel remains a monorepo with `apps/web`, `apps/mobile`,
  and platform-neutral `packages/*` workspaces.
- Admin UI and business features are admin-only. They are not copied or imported into User Panel.
- Admin currently uses npm. User Panel's approved target is one controlled pnpm-workspace cutover;
  current User Panel remains npm-only until that migration starts.
- Web shadcn/DOM presentation and mobile React Native presentation remain separate. Cross-platform
  reuse stays in contracts, domain logic, API behavior, auth use cases, validation, transformations,
  and design tokens.

## Admin documentation drift observed

Do not treat Admin Markdown as automatically authoritative. At review time:

- Admin `README.md` says Node `>=20.9.0`, while `package.json` requires `>=24.18.0`.
- Admin `README.md` describes the authenticated shell as not built, while the source tree contains
  the authenticated layout and many feature routes/components.
- Admin `CLAUDE.md` references an older `(admin)/admin` placeholder route, while the active tree uses
  the `(authenticated)` route group.

Verify Admin source, package configuration, and tests before using a pattern. If cross-project
alignment is desired later, update each repository's own documentation; do not create an implicit
runtime dependency between the projects.

## Re-review triggers

Re-run this comparison when the User Panel migration starts, the Admin Panel changes its major
Next.js/form/auth/testing architecture, or shared backend contracts change. Record decisions in the
User Panel migration plan and component/dependency policies.

