# Frontend technical architecture and development guidelines

Last reviewed: 2026-08-28

This document is mandatory for new frontend work. The owner has authorized the Next.js migration and
implementation is underway in `apps/web`. Vite, React Router, Formik, and npm have been removed from
`apps/web`; do not reintroduce them. Mobile is unaffected and remains Expo/React Native.

## 1. Current technology stack (implemented)

| Concern | Current implementation |
| --- | --- |
| Web framework/build | Next.js 16 App Router, React 19 |
| Mobile framework | Expo SDK 54 with React Native |
| Language | Strict TypeScript (~5.9) |
| Web routing | Next.js App Router route groups (`(auth)`, `(authenticated)`) |
| Mobile navigation | React Navigation native stack and bottom tabs |
| Web rendering | Server Components by default; Client Components at interactive boundaries |
| Styling | Tailwind CSS 4 plus the existing reusable project classes/design tokens |
| Theming | `next-themes` with `attribute="class"`; see section 9 before touching dark mode |
| Web UI primitives | `apps/web/src/components/ui`, `components/form/fields`, and existing `components/common` |
| Mobile UI primitives | Existing `apps/mobile/src/components` components |
| Server/API state | TanStack Query v5 on web through the existing query layer |
| Forms | React Hook Form with Zod (`@hookform/resolvers`); Formik fully removed |
| Tables | Existing components; evaluate TanStack Table when a real data-table requirement appears |
| Client state | Local React state/context first; Zustand only when genuinely needed; existing mobile Redux unchanged |
| HTTP | Injected native-fetch client on the shared boundary; web browser requests go through the same-origin BFF proxy (`apps/web/src/app/api/backend/[...path]/route.ts`); no Axios and no direct feature-level fetch |
| Testing | Vitest and React Testing Library |
| Package manager | pnpm workspaces with one root `pnpm-lock.yaml` |

Do not add a library when the existing stack already provides the required functionality.

## 2. Remaining migration work

The stack above is implemented and builds/tests/typechecks cleanly (see
`docs/IMPLEMENTATION_STATUS.md`). What is not yet complete:

- Server-side/session-aware route authorization (current guards are client-side only).
- Per-route SEO/rendering classification (SSR/SSG/ISR) per `WEB_SEO_AND_RENDERING_STRATEGY.md`.
- A CI-owned account for the authenticated Playwright write journey; guest smoke coverage is configured and runs in CI.
- Package consolidation of `core`/`shared`/`types`/`constants`/`utils`/`design-system` per
  `NEXTJS_MIGRATION_PLAN.md`.
- Continued responsibility-based decomposition of oversized screens (`profile-page.tsx`,
  `supervision-page.tsx`). Production UI must render real API data or an honest empty/error state;
  fabricated profile, feed, event, notification, or messaging records are prohibited.

Introduce further target-stack pieces (TanStack Table, additional Zustand stores, etc.) only when a
genuine requirement appears, not speculatively.

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

Use Next.js Server Components by default. Add `"use client"` only to the smallest component
boundary requiring state, event handlers, browser APIs, subscriptions, or interactive forms.

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

`pnpm components:check` enforces key parts of this agreement, including primitive reuse,
platform boundaries, aliases, React Hook Form usage, explicit typing, and the Lucide/custom-icon
boundary.

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
domain functions or hooks. Form state belongs to React Hook Form and validation belongs to shared
Zod schemas. TanStack Query owns interactive web server state; Next.js App Router owns web URLs.

The authenticated dark palette is defined once through semantic tokens in `index.css` and resolved
by `components/core/theme-provider.tsx`. Do not add feature-local hex palettes for themeable UI.
See section 9 for the class-based dark-mode rules.

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

Per-route SEO/rendering classification has not yet been applied; treat routes as dynamic/no-store
until each is explicitly classified per `WEB_SEO_AND_RENDERING_STRATEGY.md`.

## 8. Completion requirements

Every implementation change must update relevant documentation, add proportionate tests, preserve
greater-than-80% enforced coverage, and pass `pnpm verify`. Mobile runtime changes must also pass
`pnpm build:mobile`.

## 9. Theming and dark mode (web)

Dark mode is **class-based**. `next-themes` writes `class="dark"` (or `"light"`) onto `<html>`;
nothing writes a `data-theme` attribute any more. Get this wrong and dark mode silently breaks:
selectors still parse, they just never match.

Rules:

1. **`core/theme-provider` is the only theme owner.** Import `useTheme` from
   `@/components/core/theme-provider`, never from `next-themes` directly. It is configured with
   `attribute="class"`, `defaultTheme="dark"`, `enableSystem`, and `disableTransitionOnChange`.
2. **`resolvedTheme` can be `undefined`** before hydration (`next-themes` types it as
   `string | undefined`). Guard every use: `resolvedTheme ?? 'dark'` when passing it to a prop typed
   `string`, or compare directly (`resolvedTheme === 'dark'`) where a boolean is wanted.
3. **Write new dark styling as Tailwind `dark:` variants** (`className="bg-white dark:bg-slate-900"`)
   rather than adding another `.dark .mhn-*` block to `index.css`. These work because
   `index.css` declares `@custom-variant dark (&:where(.dark, .dark *));` — Tailwind 4 otherwise
   defaults `dark:` to `prefers-color-scheme`, which would ignore the class entirely.
4. **Legacy dark rules use `:root.dark …`** in `index.css` (converted from the previous
   `:root[data-theme='dark']`). If you add to that legacy block, match that selector shape. Never
   reintroduce `[data-theme=...]`.
5. **`index.css` header lines are load-bearing.** `@import "tailwindcss"`, `@import "tw-animate-css"`
   (supplies `animate-in` / `fade-out-0` / `zoom-in-95`, used by `.cn-dialog-*`), the
   `@custom-variant dark` line, and the `@theme` token block must all stay at the top of the file.
   Removing any one of them breaks the build or silently drops styling.
6. **New color values belong in the `@theme` block** as `--color-*` tokens, which auto-generate the
   matching utilities. Do not hardcode hex values in components, and do not copy raw color values in
   from the Admin Panel — port the *pattern*, keep our tokens. `index.css` now defines 103 tokens
   covering backgrounds, foregrounds, borders, the slate ramp, and the destructive/success/accent/info
   families, each with a `:root.dark` override — check for an existing one before adding another.
   Every token needs a dark value: a token defined only in `@theme` silently keeps its light colour
   in dark mode, which is exactly how `--color-destructive` shipped a light-mode red onto the dark
   shell.
7. **Verify both themes in a browser**, not just a typecheck. A missing dark rule typechecks fine.
   Toggle light/dark and confirm text, surfaces, and borders all move together.

Known gap: `common/Button`'s `secondary`, `outline`, `danger`, `icon`, and `link` variants reference
`.mhn-ui-button--*` classes that do not exist in `index.css` and render unstyled. Use `primary`,
`solid`, `solid-outline`, or `solid-destructive` until that is fixed.
