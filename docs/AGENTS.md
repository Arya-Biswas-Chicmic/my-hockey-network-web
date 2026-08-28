# Mandatory coding-agent working agreement

These instructions apply to every AI coding agent and contributor working anywhere below this
folder. Follow them strictly. Do not replace established architecture with a parallel approach.

## Read before changing code

Read these files before implementation:

1. `docs/FRONTEND_ARCHITECTURE.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/codebase_architecture_guide.md`
4. `docs/NAVIGATION.md`
5. `docs/COMPONENT_CATALOG.md`
6. `docs/ENVIRONMENT_CONFIGURATION.md`
7. `docs/SECURITY_REGISTER.md`
8. `docs/TESTING_STRATEGY.md`
9. `docs/DOCUMENTATION_POLICY.md`
10. `docs/IMPLEMENTATION_STATUS.md`
11. `docs/FRONTEND_DEVELOPMENT_GUIDELINES.md`
12. `docs/NEXTJS_MIGRATION_PLAN.md`
13. `docs/WEB_SEO_AND_RENDERING_STRATEGY.md`
14. `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md`
15. `docs/ADMIN_PANEL_ALIGNMENT.md`
16. `docs/MOBILE_SETUP.md` when mobile setup, navigation, runtime, or build behavior is relevant
17. `docs/DEMO_DATA_POLICY.md` when a design requires temporary display fixtures or an API is missing

Inspect the relevant existing code before editing. Search for an existing component, hook, API
operation, contract, validation schema, state transition, token, and helper before creating one.

## Non-negotiable architecture

- This is one pnpm-workspaces monorepo with one root `pnpm-lock.yaml` and one root installation.
- Use pnpm only. Do not use Yarn, npm, or Bun, and do not add their lockfiles.
- Multiple workspace `package.json` files are intentional and declare workspace-specific boundaries.
- Share platform-neutral code through `packages/`: contracts, domain rules, API behavior, auth use
  cases, validation, transformations, and design tokens.
- Keep presentation platform-owned. Web React DOM components stay in `apps/web`; React Native
  components stay in `apps/mobile`. Never import one platform's UI into the other.
- Shared packages must not contain JSX/platform UI or read browser, React Native, Expo, storage, or
  build-environment globals. Inject platform behavior through adapters.
- Reuse an existing platform component and add typed variants before creating another component.
  A new component is allowed only for genuinely distinct semantics or reusable feature composition.
- Follow the responsibility and file-size review rules in `docs/FRONTEND_DEVELOPMENT_GUIDELINES.md`.
  Prefer 100–200 focused lines and review files over 300 lines for meaningful decomposition; never
  split mechanically merely to satisfy a count.
- Next.js migration is authorized and in progress. Read `docs/NEXTJS_MIGRATION_PLAN.md` and
  `docs/IMPLEMENTATION_STATUS.md` for what is delivered and what remains. Do not reintroduce Vite,
  React Router, Formik, or npm to `apps/web`. Do not run two permanent routing/form/package-manager
  architectures in parallel.
- Follow the route-level SEO/rendering matrix instead of making every route ISR. Never cache
  authenticated or personalized output. Use Next.js built-ins before an SEO dependency and follow
  `docs/WEB_SEO_AND_RENDERING_STRATEGY.md`. Per-route classification is not yet complete — see the
  migration plan's gap list.
- React Hook Form with Zod is the web form system, based on the reviewed Admin Panel pattern. Formik
  has been fully removed; do not reintroduce it.
- Every new dependency requires the written built-in-first and security review in
  `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md`. Candidate services listed there are not pre-approved.
- Use `@/` for imports within each application. Relative application imports are rejected.
- Do not use explicit `any`. Extend contracts or accept `unknown` and narrow it safely.
- Use Lucide for ordinary web UI icons. Custom brand/illustration SVG is allowed only in the
  approved reusable icon components enforced by `pnpm components:check`.

## Routing and navigation

- Web uses Next.js App Router and real URL paths. Its route tree lives in `apps/web/src/app`
  (route groups `(auth)`, `(authenticated)`, and `(public)` for credential-free public-profile
  routes — see `docs/WEB_SEO_AND_RENDERING_STRATEGY.md`). `/` redirects directly to `/onboarding`;
  do not recreate a marketing landing page unless the owner explicitly approves it;
  authentication/role access belongs in `apps/web/src/components/routing` guards
  (`AuthenticatedGuard`/`GuestGuard`/`ParentRoleGuard`/`MinorPlayerGuard`, covered by
  `apps/web/src/components/routing/__tests__/guards.test.tsx`), used inside layouts, plus
  `apps/web/src/proxy.ts` (Next.js 16's Middleware replacement) as a server-side optimistic
  pre-filter on `(authenticated)` routes. The proxy only checks cookie *presence*, not validity —
  Next.js's own guidance warns against a real backend call there since it runs on every navigation
  including prefetches — so `AuthenticatedGuard`'s client-side `/auth/me` call remains the
  authoritative check; do not treat either one alone as a complete security control. See
  `docs/DATA_FETCHING_AND_AUTH.md` for the full picture, including a live-verified backend contract
  gap currently blocking any real web session from completing at all.
- Mobile does **not** use browser URL routing. It uses React Navigation stacks and tabs under
  `apps/mobile/src/navigation`.
- Mobile `ROUTES` and `TAB_ROUTES` are typed navigator screen names, not URLs.
- Do not reuse the web router, web paths, `window.location`, or React Router in mobile.
- Do not move React Navigation into shared packages. Logic and contracts can be shared; navigation
  containers, screens, transitions, tab bars, and navigation parameters cannot.
- Preserve authentication bootstrap behavior: web guards wait for `/auth/me`; mobile chooses the
  authenticated or guest navigator only after SecureStore/session bootstrap completes.
- Preserve guardian direction: minor players approve parent-to-child invites only at
  `/profile/guardian-requests`; parents approve child-to-parent requests only under `/supervision`.
  Do not select these APIs from conditional markup inside a shared request card.
- TanStack Query owns web server-state fetching, cache, retry, and invalidation. It does not replace
  App Router. Do not introduce another custom query cache.

## Environment and security

- Never hard-code an API origin. Web reads `API_BASE_URL` (server-only, no `NEXT_PUBLIC_` prefix)
  from ignored `apps/web/.env.local` — see `apps/web/.env.example`; mobile reads
  `EXPO_PUBLIC_API_BASE_URL` from ignored `apps/mobile/.env`.
- Version only `.env.example`. Never commit runtime environment files, secrets, tokens, OTPs,
  cookies, authorization headers, or private keys.
- Web authentication uses backend httpOnly cookies with CSRF held in memory. Mobile credentials use
  Expo SecureStore. Never persist bearer credentials in localStorage, AsyncStorage, or Redux.
- Shared API operations use the injected native-fetch client. Do not call `fetch()` directly or add
  Axios. `scripts/check-security-baseline.mjs` allowlists exactly three direct-fetch call sites, each
  for a specific reason documented at its `allowedNativeFetchFiles` entry: the signed object-storage
  upload in `packages/core/src/api/mediaApi.ts`; the same-origin BFF proxy route
  (`apps/web/src/app/api/backend/[...path]/route.ts`); and the server-only, credential-free public
  profile read (`apps/web/src/infrastructure/server/public-profile.ts`). None of these may receive
  browser-facing API cookies or authorization headers outside what the proxy explicitly forwards.
- Do not add credential-bearing logs, debug cURL output, obfuscated source, or unreviewed generated
  code. All normal npm workflows must retain the obfuscation/security prechecks.
- Keep temporary display fixtures in the centralized typed `apps/web/src/demo-data/<feature>`
  structure and follow `docs/DEMO_DATA_POLICY.md`; never scatter dummy arrays through components.

## Tests, documentation, and completion

For every implementation change in `apps/`, `packages/`, `scripts/`, or root configuration:

1. Add or update proportionate unit/integration tests.
2. Maintain at least 80% statements, branches, functions, and lines in covered shared code.
   Test changes at the unit and integration layers and add/update Playwright smoke tests
   (`apps/web/e2e/`, see `apps/web/e2e/README.md`) for affected critical journeys. Coverage does not
   replace route, accessibility, or smoke checks.
3. Update the relevant Markdown context files in the same change. This maintenance is permanently
   authorized by the project owner; do not wait for separate approval.
4. Update `docs/IMPLEMENTATION_STATUS.md` and any architecture, navigation, security, testing,
   environment, or component document affected by the work.
5. Run `pnpm verify` before handoff. Run `pnpm build:mobile` when mobile runtime/build behavior
   changes.

Do not report work complete when required checks fail. Document known warnings or external blockers
instead of hiding them.
