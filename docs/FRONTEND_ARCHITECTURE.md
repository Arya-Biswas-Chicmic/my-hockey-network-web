# My Hockey Network frontend architecture standard

Last reviewed: 2026-08-26
Status: approved target; Next.js migration is authorized and in progress

## 1. Authority and implementation status

This is the primary frontend architecture document for the My Hockey Network User Panel. Every
contributor and AI coding agent must read it before changing the frontend.

The project owner authorized the Next.js migration and implementation is underway on branch
`changes/next-js-update`. `apps/web` now runs on Next.js App Router, pnpm workspaces, React Hook
Form + Zod, and TanStack Query; Vite, React Router, Formik, and npm have been removed from `apps/web`.
See `docs/IMPLEMENTATION_STATUS.md` for the current delivered-vs-remaining breakdown and
`docs/NEXTJS_MIGRATION_PLAN.md` for the phase-by-phase status. Continue building on this
architecture rather than reverting to the prior Vite stack:

- Do not reintroduce Vite, React Router, Formik, or npm to `apps/web`.
- Do not run two permanent routing, form, package-manager, or caching architectures in parallel.
- Follow the target structure and stack in this document for all new `apps/web` work.

## 2. Repository and application boundary

The User Panel remains one monorepo containing separate web and mobile applications:

```text
apps/
├── web/                  User-facing web application; Next.js App Router (implemented)
└── mobile/               Expo/React Native app; React Navigation remains

packages/
├── contracts/            API DTOs, response envelopes, roles, enums
├── domain/                Pure business and permission rules
├── api-client/            Platform-neutral HTTP behavior and normalized errors
├── auth/                  Shared authentication/onboarding use cases
├── validation/            Shared Zod schemas and form/domain rules
├── design-tokens/         Portable colors, spacing, radii, typography values
└── core, shared, types, constants, utils, design-system
                            Compatibility packages retained during migration; consolidate per
                            `docs/NEXTJS_MIGRATION_PLAN.md` rather than deleting outright
```

The Admin Panel remains a separate, web-only repository. It is an architectural reference, not a
runtime dependency or source of copied business components.

## 3. Maximum reuse rule

Share logic and contracts, not platform presentation.

May be shared through `packages/*`:

- API contracts and response types
- Domain, role, permission, and age rules
- Authentication and onboarding use cases
- Validation schemas
- API behavior, error normalization, and transformations
- Query-key factories where platform-neutral
- Design-token values

Must remain platform-owned:

- Web DOM, Next.js, shadcn/ui, web layouts, metadata, and web routing
- Mobile React Native controls, screens, transitions, tabs, and React Navigation
- Browser cookie/CSRF and server adapters
- Expo environment and SecureStore adapters

Never import web UI into mobile or React Native UI into web. Maximum code reuse does not mean shared
JSX; it means stable shared behavior underneath separate platform experiences.

## 4. Target technology stack (implemented)

| Concern | Target | Status |
| --- | --- | --- |
| Web framework | Next.js | Next.js 16 in `apps/web` |
| React | React 19.x | React 19.2.0 |
| Language | Strict TypeScript supported by the selected Next.js version | TypeScript ~5.9 |
| Web routing | Next.js App Router | Implemented, `(auth)`/`(authenticated)` route groups |
| Rendering | Server Components by default; SSR, SSG, ISR, or dynamic rendering per route | Route groups render; per-route SEO/ISR classification not yet applied — see `WEB_SEO_AND_RENDERING_STRATEGY.md` |
| Mobile | Expo/React Native with React Navigation | Unchanged |
| Styling | Tailwind CSS 4 | Implemented |
| Web primitives | Project-owned shadcn/ui-based components | `components/ui`, `components/form/fields` implemented |
| Forms | React Hook Form with Zod and `@hookform/resolvers` | Implemented; Formik fully removed |
| Server/API state | TanStack Query v5 for interactive client server-state | Implemented; full adoption audit still pending |
| Complex tables | TanStack Table | Not yet needed/introduced |
| Client state | Zustand only when local, URL, form, derived, or server state is insufficient | Available (`stores/shell-ui-store.ts`); use sparingly per rules in `NEXTJS_MIGRATION_PLAN.md` |
| Icons | Lucide; isolated project components for brand art and real illustrations | Implemented |
| Unit/integration tests | Vitest and React Testing Library | Implemented, 126 tests passing |
| Browser smoke/e2e | Playwright | Configured; guest smoke suite runs in CI, authenticated write flow awaits a dedicated account |
| Package manager | pnpm workspaces with one root lockfile | Implemented |

Do not introduce another library when the framework or approved stack already solves the need.

## 5. Target web structure

Migration must preserve `apps/web` and the shared package boundary:

```text
apps/web/
├── app/                  Route groups, layouts, pages, loading/error/not-found, metadata files
├── components/
│   ├── ui/               Project-owned shadcn primitives
│   └── shared/           Reusable web-only compositions
├── features/             Feature UI, containers, hooks, forms, and client interactions
├── infrastructure/       Environment, auth, server/client API adapters, observability
├── lib/                  Focused framework utilities
└── styles/               Tailwind/global web styles
```

Recommended composition:

```text
Route page/layout
└── Feature/container
    ├── Focused feature components
    └── Existing shared web primitives
```

Server Components are the default. Add `"use client"` only to the smallest boundary needing event
handlers, browser APIs, React client state, subscriptions, or interactive forms.

### 5.1 Layer ownership and dependency direction

```text
App Router pages/layouts
        ↓
Feature containers and use cases
        ↓
Domain rules and shared contracts
        ↓
Data-access interfaces
        ↓
Server/client infrastructure adapters
        ↓
Backend API and approved external services
```

- `app/` owns route composition, layouts, metadata, rendering policy, and route-level boundaries. It
  must remain thin and must not contain unrelated business logic.
- `features/` owns feature orchestration, interactive UI, feature hooks, form composition, and
  transformations that are not broadly shared.
- `components/ui` owns low-level web primitives; `components/shared` owns reusable web compositions.
- `packages/domain`, `packages/auth`, and `packages/validation` own platform-neutral decisions and
  must not depend on Next.js, DOM, React Native, storage, or environment globals.
- Data-access modules own endpoints, request/response mapping, query options/keys, cache ownership,
  and normalized errors. Components must not construct endpoint URLs.
- Infrastructure owns environment parsing, cookie/CSRF adapters, server/client transport,
  observability, and framework integration.

Dependencies flow downward through these boundaries. Domain/shared packages must never import app,
feature, UI, or infrastructure code. Use dependency injection/adapters where platform behavior is
required.

### 5.2 Routing and authorization contract

Use App Router route groups and nested layouts to make access boundaries explicit. The exact names
are finalized during route inventory, but the intended separation is:

```text
app/
├── (public)/             Indexable or intentionally public routes
├── (auth)/               Login, OTP, reset, invite and onboarding transitions
└── (authenticated)/      Signed-in routes with nested role/permission boundaries
```

- Public, guest-only, authenticated, onboarding-state, and role/permission requirements must be
  recorded for every route.
- Enforce authentication and authorization on the server/data boundary. Client redirects and hidden
  controls improve UX but are not security controls.
- Use middleware only for coarse, safe request gating or redirects when justified. Do not place
  primary database/business authorization solely in middleware.
- Preserve direct URL entry, refresh, back/forward navigation, deep links, query parameters, unknown
  paths, and post-login return URLs.
- Route-specific `loading.tsx`, `error.tsx`, and `not-found.tsx` boundaries must be placed at the
  smallest useful segment. Provide a root fallback for failures outside nested boundaries.
- Mobile continues to use typed React Navigation stacks/tabs. Next.js route groups, URLs, layouts,
  middleware, and redirects must never be imported into mobile or shared packages.

**Current status:** `(auth)` and `(authenticated)` route groups exist with `AuthenticatedGuard`,
`GuestGuard`, `ParentRoleGuard`, and `MinorPlayerGuard` (`apps/web/src/components/routing`). These guards currently run
client-side only, matching the pre-migration behavior. This is a known gap against the rule above:
add server-side/session-aware authorization at the route or data-access boundary before treating any
authenticated route as fully migrated, so client redirects remain a UX affordance rather than the
only access control.

Guardian relationship routes additionally enforce request direction: the minor-player-only
`/profile/guardian-requests` route consumes guardian invites created by a parent, while parent-only
Supervision consumes guardian requests created by a child. Shared cards remain presentation-only.

## 6. Existing-code-first and component reuse

Before creating any component, hook, schema, helper, service, endpoint, query key, or type:

1. Search all applications and packages by semantics and behavior, not only by the proposed name.
2. Check the component catalog, web primitives, feature components, schemas, hooks, utilities, API
   operations, and domain rules.
3. Reuse an existing implementation when semantics match.
4. Add a typed variant when behavior is closely related.
5. Refactor an overly specific implementation when a reusable boundary is genuinely useful.
6. Create a new abstraction only for distinct semantics or reusable feature composition.
7. Add the new reusable component to the catalog and test meaningful variants/interactions.

Feature folders must not generate private copies of buttons, inputs, dialogs, cards, tables, loading
states, empty states, error states, or form adapters already present in the web primitive layer.

## 7. File and code-quality rules

- Preferred file size: 100–200 focused lines.
- Review files exceeding 300 lines for multiple responsibilities or independently testable logic.
- Do not split a focused file mechanically or create trivial wrappers to satisfy a line count.
- Use `@/` aliases inside each application.
- Do not use explicit `any`; use contracts or `unknown` with safe narrowing.
- Do not mutate state objects; use immutable updates.
- Avoid inline style objects in web feature code; use Tailwind classes and established variants.
- Use centralized, typed environment, endpoint, API, error, and validation ownership.
- Do not add direct feature-level HTTP calls or a second HTTP architecture.
- Do not duplicate routers, query caches, form systems, state stores, icon libraries, or validation
  libraries.
- Preserve security/obfuscation scanning before normal development, build, lint, test, and start
  workflows.

During migration, quality checks must reject duplicate primitives, cross-platform presentation
imports, explicit `any`, relative application imports, unapproved inline styles/SVG, direct feature
HTTP, multiple lockfiles, and committed runtime environment files. File-size reporting must allow a
small documented exception list and must not encourage meaningless decomposition.

## 8. Authentication and HTTP

- Web authentication uses backend HttpOnly cookies. Cookies are sent by the browser and must not be
  copied into custom request headers or JavaScript-readable storage.
- Keep CSRF material only in memory unless the approved backend protocol changes.
- Mobile credentials remain in Expo SecureStore, never localStorage, AsyncStorage-backed Redux, logs,
  or UI props.
- Preserve the platform-neutral native-fetch API behavior. Next.js server/client adapters may use
  framework-aware fetch centrally, but feature components must not call arbitrary endpoints directly.
- API origins come only from ignored environment files or deployment environment configuration.
- Never commit secrets, tokens, OTPs, cookies, private keys, or real runtime `.env` files.

### 8.1 Centralized error-handling pipeline

All server and client data access must pass through the approved centralized transport and error
normalization layer. Do not add Axios interceptors or feature-specific response interceptors.

Normalize failures into one typed application error contract containing, where available:

- stable category/code
- safe user-facing message key or fallback
- HTTP status
- field errors or validated details
- correlation/request identifier
- retryability and optional retry-after information
- original cause for internal diagnostics only

Never expose stack traces, raw backend bodies, secrets, cookies, tokens, internal URLs, or sensitive
personal data to the browser UI or telemetry.

Required handling behavior:

| Failure | Required ownership and behavior |
| --- | --- |
| 400 / malformed request | Normalize centrally; show actionable safe feedback |
| 401 / expired session | Run one shared single-flight refresh/session bootstrap, replay at most once, then sign out/redirect without loops |
| 403 / forbidden | Render an access-denied state; do not disguise authorization failure as missing UI |
| 404 / missing entity | Use the route/entity not-found boundary where appropriate |
| 409 / conflict | Preserve user input and explain the recoverable conflict |
| 422 / validation | Map typed field errors into React Hook Form; keep non-field errors at form level |
| 429 / rate limit | Respect validated retry-after data; avoid automatic retry storms |
| 5xx / unavailable | Show reusable recovery UI, retain safe stale data where allowed, and report a sanitized correlation ID |
| Network / timeout / offline | Distinguish connectivity from server rejection; retry only idempotent operations under bounded policy |
| Abort / navigation cancellation | Treat expected cancellation silently; do not show false error toasts |
| Unexpected application error | Capture through the nearest error boundary and observability adapter with sanitized context |

Mutations must not be automatically replayed unless explicitly idempotent. TanStack Query retry
rules must be centralized and must not retry authentication, permission, validation, conflict, or
most mutation failures by default.

### 8.2 Error boundary and UI ownership

- Root/global boundary: unrecoverable application-shell and root rendering failures.
- Route-segment boundary: failures limited to a route or major nested section, with retry when safe.
- Feature boundary/state: recoverable feature API failures that should not replace the whole page.
- Form state: field/server validation and submission errors while preserving entered values.
- Feedback primitives: one reusable pattern for inline errors, error panels, toasts, empty states,
  offline states, skeleton/loading states, and server-unavailable recovery.

Errors must be handled once at the correct owner. Do not both throw and show duplicate toasts at
several layers. Loading, empty, forbidden, not-found, offline, and server-error states are distinct
and must not be represented by one ambiguous fallback.

Observability must capture environment, release, route pattern, error category, and correlation ID
without recording credentials or sensitive payloads. User-facing messages must remain stable and
localizable while technical diagnostics stay internal.

## 9. Rendering, SEO, and ISR

Every route must be inventoried and assigned one explicit rendering and indexing policy before it is
migrated.

| Route class | Rendering | Indexing |
| --- | --- | --- |
| Durable public content | SSG or long-lived ISR | index; include canonical URL in sitemap |
| Changing public entities/content | ISR with controlled invalidation | index only canonical complete pages |
| Request-sensitive public content | SSR/dynamic | decide per route and canonicalize stable URLs |
| Authenticated/role-protected content | dynamic and no-store | `noindex`; exclude from sitemap |
| Login, OTP, reset, invite transitions | dynamic | `noindex, nofollow`; exclude from sitemap |
| Draft, preview, private, empty restricted content | dynamic and no-store | never index or cache publicly |

Suitable ISR candidates may include approved public events, clubs, teams, leagues, venues, news,
players, and public profiles. ISR is not a default for every page.

ISR requirements:

- Document acceptable staleness, data owner, invalidation event, and failure behavior per route.
- Prefer trusted on-demand tag/path invalidation after mutations or backend webhooks.
- Never cache personalized, permission-controlled, session-derived, or private output.
- Test invalidation and keep the last valid public result available if regeneration fails.
- Avoid request waterfalls and fetch independent server data concurrently.
- Hydrate TanStack Query only when an interactive Client Component needs the same data.

SEO requirements:

- Unique title, description, canonical URL, Open Graph, and social metadata.
- Native Next.js `robots` and `sitemap` metadata files.
- Valid, sanitized JSON-LD for supported public entities only.
- Real status codes, 404s, and canonical redirects; no soft 404 pages.
- Semantic headings/landmarks, useful link text, image alt text, keyboard access, and visible focus.
- Use `next/image`, `next/font`, and `next/script` where appropriate.
- Establish canonical host, HTTPS, locale, trailing-slash, and redirect policies before release.

Crawler directives are not authorization. Server-side access control is always required.

## 10. Third-party dependency policy

Use Next.js built-ins for routing, metadata, sitemap, robots, images, fonts, scripts, caching, and
revalidation before considering a third-party wrapper.

Before adding a dependency, document:

1. The unmet requirement and existing alternatives searched.
2. Server, browser, and mobile compatibility.
3. Server/Client Component and bundle/runtime impact.
4. TypeScript, accessibility, maintenance, and tree-shaking quality.
5. License, security, package-script, data collection, cookie, and supply-chain risks.
6. Testing, fallback/removal plan, owning feature, and approval.

Conditional candidates—not pre-approved selections:

- Sentry or hosting-native tooling for error monitoring
- One of PostHog, GA4, or an approved equivalent for consent-aware analytics
- axe-core with Playwright for automated accessibility checks
- Lighthouse CI for representative public-route performance budgets
- One Next-compatible localization solution when locale routing is approved
- Media/CDN, maps, payments, search, CMS, email, flags, and consent vendors only after dedicated
  security, privacy, availability, cost, and lock-in review

Third-party browser scripts require a business owner, consent review, deferred loading strategy,
performance budget, and smoke coverage.

## 11. Testing and completion gates

Every behavior change requires proportionate testing:

- Unit: domain rules, validation, transformations, metadata/canonical builders, permissions, query
  keys, cache-tag mapping, and error normalization.
- API/integration: every normalized HTTP/network category, concurrent 401 single-flight refresh,
  one-time replay, refresh failure/sign-out, field-error mapping, bounded retries, cancellations, and
  sanitized correlation reporting.
- Component integration: React Hook Form/Zod behavior, accessible primitives, interactions,
  loading/empty/error states, and TanStack Query mutations/invalidation.
- Route integration: layouts, Server/Client boundaries, cookies, auth/roles, redirects, status codes,
  rendering policy, metadata, and no-store privacy.
- Playwright smoke/e2e: production startup, public SEO route, login/session bootstrap, protected
  redirect, direct navigation/refresh, critical authenticated route, and 404 behavior.
- Non-functional: accessibility, representative performance budgets, dependency/security audit,
  obfuscation scan, type/lint/format, secrets/environment validation, and production build/start.

Maintain greater than or equal to 80% statements, branches, functions, and lines for the enforced
coverage boundary. Coverage does not replace meaningful assertions, integration tests, smoke tests,
accessibility checks, or security tests.

Planned target commands must separate unit, integration, smoke, e2e, and coverage suites and provide
one aggregate `verify` command. They must not be added before migration authorization.

## 12. Migration sequence

1. Re-audit current User Panel and Admin reference; choose compatible Next.js, Node, and TypeScript.
2. Inventory routes, rendering/indexing decisions, authentication behavior, and reusable components.
3. Confirm hosting, cookie origin/CORS strategy, environment ownership, ISR invalidation, and vendor
   decisions.
4. Convert npm to pnpm once, retaining exactly one root lockfile.
5. Establish the Next.js shell, Tailwind, reusable shadcn primitives, environment validation, tests,
   security checks, and production build/start smoke.
6. Implement centralized server/client API, HttpOnly-cookie auth, CSRF, error/loading/not-found,
   TanStack Query hydration, and observability boundaries.
7. Migrate public, guest, authenticated, and role-protected routes with parity tests.
8. Migrate one complete vertical feature at a time, reusing packages and existing UI patterns.
9. Implement SEO/metadata/ISR only from the approved route matrix.
10. Complete accessibility, performance, security, coverage, smoke/e2e, deployment, and rollback
    verification before removing Vite, React Router, Formik, npm, and obsolete compatibility code.

Do not run two permanent routing, form, package-manager, or caching architectures in parallel.

## 13. Admin Panel alignment

Adopt from the verified Admin architecture:

- App Router, React 19, strict TypeScript
- Tailwind 4 and project-owned shadcn primitives
- React Hook Form with Zod
- TanStack Query and focused Zustand
- Vitest/RTL, Playwright, aliases, coverage, and pre-command scans
- Central environment, endpoint, and error ownership

Do not copy:

- Axios—the User Panel retains native-fetch ownership
- Admin business UI or routes
- Admin's single-app layout—the User Panel remains web/mobile/shared packages
- Admin documentation without source verification; known Node/shell/route descriptions have drifted

## 14. Required supporting documents

- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `NEXTJS_MIGRATION_PLAN.md`
- `WEB_SEO_AND_RENDERING_STRATEGY.md`
- `THIRD_PARTY_AND_DEPENDENCY_POLICY.md`
- `ADMIN_PANEL_ALIGNMENT.md`
- `COMPONENT_CATALOG.md`
- `TESTING_STRATEGY.md`
- `ENVIRONMENT_CONFIGURATION.md`
- `NAVIGATION.md`
- `SECURITY_REGISTER.md`
- `IMPLEMENTATION_STATUS.md`

## 15. Primary technical references

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [TanStack Query advanced server rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Zod](https://zod.dev/)
- [Playwright](https://playwright.dev/docs/writing-tests)
