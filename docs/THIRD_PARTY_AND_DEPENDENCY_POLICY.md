# Third-party and dependency policy

Last reviewed: 2026-08-28

## Purpose and status

This document records the dependency policy for the Next.js migration, which is authorized and in
progress. The baseline below reflects what `apps/web` now runs; npm/Vite/Formik have been removed.
New dependencies still require the written built-in-first and security review below before adding
them.

The Admin Panel was reviewed as an architectural reference. Its proven patterns inform this policy,
but the User Panel must not copy admin-specific Axios code, admin business components, or its
single-app folder layout. Admin and User Panel remain separate projects.

## Approved target baseline

| Need | Preferred target | Rule |
| --- | --- | --- |
| Framework/routing/rendering | Next.js App Router | Use built-in routing, metadata, image, font, script, cache, and revalidation APIs first |
| Styling and primitives | Tailwind CSS 4 + project-owned shadcn/ui components | Generate/adapt once in the web primitive layer; features consume them |
| Forms | React Hook Form + Zod through `@hookform/resolvers` | Align with the Admin Panel; replace Formik coherently during migration, never mix indefinitely |
| Interactive server state | TanStack Query v5 | Client mutations, cache, retries, and hydration only; do not duplicate Next server-cache ownership |
| Complex tables | TanStack Table | Use for sorting/filtering/pagination/selection, not layout-only tables |
| Client state | Zustand | Add only when local, URL, form, server, or derived state is insufficient |
| Icons | Lucide React | Brand artwork and genuine illustrations remain isolated project assets/components |
| Theme switching | `next-themes` | Class-based (`attribute="class"`); wrapped by `core/theme-provider`, which is the only module features import `useTheme` from |
| Dialog/drawer primitives | `@base-ui/react` | Backs `ui/dialog.tsx` and `ui/drawer.tsx`, ported from the Admin Panel; do not add a second dialog library |
| Date parsing/arithmetic | `date-fns` | The single date library. Already used by `apps/web` and the Admin Panel at the same version; also a dependency of `packages/validation`, whose `src/date.ts` owns all date-of-birth parsing and age calculation. Do not add dayjs, moment, or Luxon alongside it |
| Enter/exit animation utilities | `tw-animate-css` | Required by the `.cn-dialog-*` / `.cn-drawer-*` classes; imported at the top of `apps/web/src/index.css` |
| Unit/integration tests | Vitest + React Testing Library + user-event | Test behavior and contracts rather than implementation details |
| Browser smoke/e2e | Playwright | Production-mode critical journeys and route/SEO verification |

React Hook Form is the approved target form system because it is already established in the Admin
Panel and integrates with the shared Zod validation approach. Mobile presentation remains separate;
shared validation schemas can be reused without importing web form components into React Native.

## Built-in-first rule

Do not add an SEO package for metadata, sitemap, robots, canonical URLs, images, fonts, scripts, or
ISR when supported Next.js APIs meet the requirement. Do not add a second router, query cache, form
library, validation library, table engine, icon library, date library, toast system, or state store.

Before requesting a dependency, document:

1. The concrete requirement and why existing code/platform APIs cannot satisfy it.
2. Existing repository alternatives that were searched.
3. Browser/server/mobile compatibility and impact on Server/Client Component boundaries.
4. Bundle/runtime cost, tree-shaking, accessibility, TypeScript quality, and maintenance health.
5. License, security/advisory status, data collection, cookies, subprocesses, and supply-chain risk.
6. Test strategy, fallback/removal plan, owning feature, and approval decision.

Use exact versions through the single target lockfile and automated update review. Never execute
unreviewed package scripts, paste obfuscated vendor source into the repository, or expose secrets to
browser-prefixed environment variables.

## Conditional services and tools

These are candidates, not pre-approved installations or vendor selections:

- Error monitoring: evaluate Sentry against hosting-native telemetry and privacy/data-region needs.
- Product analytics: select one of PostHog, GA4, or an approved equivalent only after event taxonomy,
  consent, retention, and personally identifiable information rules are defined.
- Accessibility: evaluate `axe-core`/Playwright integration for automated checks; manual keyboard and
  screen-reader review remains required.
- Performance: evaluate Lighthouse CI for representative public routes and regression budgets.
- Localization: reuse an existing project solution or evaluate one Next-compatible i18n approach
  only when locale routing and translated SEO requirements are approved.
- Dates: **decided — `date-fns`** (see the baseline table above). Use platform `Intl` for
  formatting/display; use `packages/validation`'s `src/date.ts` helpers for date-of-birth parsing and
  age calculation rather than hand-rolling either. A second date library is out of scope.
- Media/CDN, maps, payments, email, search, CMS, feature flags, and consent management require a
  separate data-flow, security, privacy, cost, availability, and vendor-lock-in decision.

Third-party browser scripts must be exceptional. Load them through the framework strategy, defer
non-critical scripts, prevent duplicates, honor consent, and include them in performance and smoke
testing.

## Reuse and duplication gate

Before any new component, hook, schema, helper, service, endpoint, query key, or type:

1. Search `apps/web`, `apps/mobile`, and every `packages/*` workspace by semantics and behavior.
2. Check `docs/COMPONENT_CATALOG.md` and the web primitive layer.
3. Reuse or extend an existing typed abstraction when semantics match.
4. Keep DOM/shadcn UI in web and React Native UI in mobile; share only platform-neutral contracts,
   domain rules, API behavior, auth use cases, validation, transformations, and design tokens.
5. Record a genuinely new reusable primitive in the component catalog and add interaction tests.

Admin components may inspire a pattern, but must not be imported across repositories or copied
without reconciling User Panel design tokens, accessibility, API contracts, and platform boundaries.

## Primary references

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [TanStack Query with Server Components and Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [React Hook Form documentation](https://react-hook-form.com/get-started)
- [Zod documentation](https://zod.dev/)
- [Playwright test documentation](https://playwright.dev/docs/writing-tests)

