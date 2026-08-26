# Frontend technical architecture and development guidelines

Last reviewed: 2026-08-26

This document is mandatory for new frontend work. The owner has approved a future Next.js migration,
but implementation is paused until the owner explicitly instructs the team to begin. Until that
instruction, agents must maintain the current runtime and must not install, scaffold, rename, move,
or convert application code for the target architecture.

## 1. Current technology stack

| Concern | Current required implementation |
| --- | --- |
| Web framework/build | React 19 with Vite 8 |
| Mobile framework | Expo SDK 54 with React Native |
| Language | Strict TypeScript (currently TypeScript 6; do not downgrade solely to match a guideline) |
| Web routing | React Router `BrowserRouter` |
| Mobile navigation | React Navigation native stack and bottom tabs |
| Web rendering | Client-rendered SPA with route-level lazy loading |
| Styling | Tailwind CSS 4 plus the existing reusable project classes/design tokens |
| Web UI primitives | Existing `apps/web/src/components/common` components |
| Mobile UI primitives | Existing `apps/mobile/src/components` components |
| Server/API state | TanStack Query v5 on web through the existing query layer |
| Forms | Formik with centralized Zod/shared validation |
| Tables | Existing components; evaluate TanStack Table when a real data-table requirement appears |
| Client state | Local React state/context first; existing mobile Redux only where already required |
| HTTP | Injected native-fetch client; no Axios and no direct feature-level fetch |
| Testing | Vitest and React Testing Library |
| Package manager | npm workspaces with one root `package-lock.json` |

Do not add a library when the existing stack already provides the required functionality.

## 2. Approved target stack — implementation paused

| Concern | Approved target |
| --- | --- |
| Web framework | Latest stable Next.js compatible with the project |
| React | React 19.x |
| Language | TypeScript 5.x or the Next.js-compatible supported version selected at migration time |
| Web routing | Next.js App Router |
| Rendering | Server Components by default; SSR, SSG, and ISR according to page requirements |
| Styling | Tailwind CSS 4.x |
| Web UI components | shadcn/ui, extended through project-owned reusable components |
| Server/API state | TanStack Query v5 for interactive client-side server state |
| Forms | React Hook Form with Zod; replace Formik coherently during migration |
| Validation | Zod |
| Tables | TanStack Table |
| Client state | Zustand only where local/URL/server state is insufficient |
| Testing | Vitest and React Testing Library |
| Target package manager | pnpm workspaces with one lockfile |

The target applies to the web portal. Mobile remains an Expo/React Native application using React
Navigation and platform-owned UI. Shared platform-neutral packages remain the reuse boundary.

The approved target must be introduced as a coordinated migration, not through isolated dependency
additions. Until kickoff, npm, Vite, React Router, Formik, and the existing files remain operationally
authoritative. Do not add `next`, `pnpm-lock.yaml`, shadcn, Zustand, a second form library, or App
Router files before the owner authorizes migration work.

## 3. Architecture principles

New and refactored code must follow:

- Feature-based organization and clear separation of concerns.
- Single Responsibility Principle.
- Existing-code-first reuse.
- Strong TypeScript contracts with no explicit `any`.
- Clear boundaries between presentation, business/domain logic, API/data access, and platform
  infrastructure.
- Consistent centralized error handling, loading states, and empty states.
- Testable components, hooks, transformations, services, and domain rules.
- Platform-neutral logic in `packages/`; web DOM UI in `apps/web`; React Native UI in `apps/mobile`.

During migration, use Next.js Server Components by default. Add `"use client"` only to the smallest
component boundary requiring state, event handlers, browser APIs, subscriptions, or interactive
forms. Until migration begins, the Vite SPA has no Server Components, SSR, SSG, or ISR and must not
receive `"use client"` directives.

## 4. Existing-code-first rule

Before creating a component, utility, hook, API operation, service, schema, type, or helper:

1. Search the complete repository for equivalent or similar behavior.
2. Check shared primitives, feature components, hooks, utilities, API modules, contracts, schemas,
   query keys, and domain functions.
3. Reuse the existing implementation when semantics match.
4. Extend it with typed variants when the new requirement is closely related.
5. Refactor an overly specific implementation into a reusable abstraction when appropriate.
6. Do not create duplicate files with slightly different names.

For example, before adding `UserProfileCard.tsx`, search for `ProfileSummaryCard`, `UserCard`,
`MemberCard`, `PlayerCard`, and related feature cards. Generalize an existing component when doing
so preserves clear semantics and platform ownership.

`npm run components:check` enforces key parts of this agreement, including primitive reuse,
platform boundaries, aliases, Formik forms, explicit typing, and the Lucide/custom-icon boundary.

## 5. File size and responsibility

- Preferred file size: 100–200 lines.
- Review target: files exceeding 300 lines.
- A file over 300 lines must be assessed for multiple responsibilities, repeated logic, complex
  independent sections, or independently testable behavior.
- Do not split files mechanically or create trivial one-line components only to reduce line count.

Split when appropriate into feature containers, presentational components, custom hooks, domain
services, API/data-access operations, schemas, contracts, and utilities.

Existing oversized legacy files may be refactored incrementally when touched, without changing
behavior or introducing duplicate primitives. `profile-page.tsx`, `supervision-page.tsx`, and
`EditProfileModal.tsx` remain the highest-priority decomposition candidates.

## 6. Component responsibility

Prefer this composition:

```text
Page
└── Feature/container
    ├── Feature components
    └── Existing shared platform UI primitives
```

A component should not simultaneously fetch multiple unrelated APIs, transform unrelated response
models, contain complex business rules, own form validation, manage global state, and render a
large page. Extract responsibilities only when the resulting boundary is meaningful and reusable.

API response normalization belongs in typed API/data-access modules. Business decisions belong in
domain functions or hooks. Form state belongs to Formik and validation belongs to centralized
schemas/validators. TanStack Query owns web server state; React Router owns web URLs.

## 7. Next.js rendering strategy

During migration, use Server Components by default for public pages, initial data fetching, static
content, SEO content, and server-side data access. Use Client Components only for focused interactive
boundaries. Do not mark an entire page as a Client Component because one subsection is interactive.

Use ISR for public content that can tolerate controlled staleness, including suitable events, clubs,
venues, players, leagues, news, and public profiles. Select SSR for request-specific or immediately
fresh public content, SSG for build-time stable content, and client-side TanStack Query for
interactive/revalidating views. Authentication and privacy requirements override caching.

The mandatory route classification, invalidation, metadata, sitemap, robots, canonical, structured
data, and SEO verification requirements are defined in `WEB_SEO_AND_RENDERING_STRATEGY.md`. External
packages and services must pass `THIRD_PARTY_AND_DEPENDENCY_POLICY.md`; framework capabilities are
preferred to SEO wrappers and overlapping libraries.

Before migration begins, these strategies are plans only. Current development must continue through
React Router, TanStack Query, the shared API client, and route-level lazy loading.

## 8. Completion requirements

Every implementation change must update relevant documentation, add proportionate tests, preserve
greater-than-80% enforced coverage, and pass `npm run verify`. Mobile runtime changes must also pass
`npm run build:mobile`.
