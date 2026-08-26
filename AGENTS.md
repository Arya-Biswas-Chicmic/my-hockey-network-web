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

Inspect the relevant existing code before editing. Search for an existing component, hook, API
operation, contract, validation schema, state transition, token, and helper before creating one.

## Non-negotiable architecture

- This is one npm-workspaces monorepo with one root `package-lock.json` and one root installation.
- Use npm only. Do not use Yarn, pnpm, or Bun, and do not add their lockfiles.
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
- Next.js migration is approved but explicitly paused. Read `docs/NEXTJS_MIGRATION_PLAN.md`. Do not
  begin migration, install its dependencies, add App Router files, switch form libraries, change
  lockfiles/package managers, or alter build/deployment configuration until the owner explicitly
  instructs the team to start. Until then, maintain the current Vite/npm/React Router/Formik code.
- During the authorized migration, follow the route-level SEO/rendering matrix instead of making
  every route ISR. Never cache authenticated or personalized output. Use Next.js built-ins before an
  SEO dependency and follow `docs/WEB_SEO_AND_RENDERING_STRATEGY.md`.
- React Hook Form with Zod is the approved target web form system, based on the reviewed Admin Panel
  pattern. Formik remains current until migration starts and must then be replaced coherently.
- Every new dependency requires the written built-in-first and security review in
  `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md`. Candidate services listed there are not pre-approved.
- Use `@/` for imports within each application. Relative application imports are rejected.
- Do not use explicit `any`. Extend contracts or accept `unknown` and narrow it safely.
- Use Lucide for ordinary web UI icons. Custom brand/illustration SVG is allowed only in the
  approved reusable icon components enforced by `npm run components:check`.

## Routing and navigation

- Web uses `BrowserRouter` and real URL paths. Its route tree belongs in
  `apps/web/src/components/app-router.tsx`; authentication/role access belongs in route guards.
- Mobile does **not** use browser URL routing. It uses React Navigation stacks and tabs under
  `apps/mobile/src/navigation`.
- Mobile `ROUTES` and `TAB_ROUTES` are typed navigator screen names, not URLs.
- Do not reuse the web router, web paths, `window.location`, or React Router in mobile.
- Do not move React Navigation into shared packages. Logic and contracts can be shared; navigation
  containers, screens, transitions, tab bars, and navigation parameters cannot.
- Preserve authentication bootstrap behavior: web guards wait for `/auth/me`; mobile chooses the
  authenticated or guest navigator only after SecureStore/session bootstrap completes.
- TanStack Query owns web server-state fetching, cache, retry, and invalidation. It does not replace
  React Router. Do not introduce another custom query cache.

## Environment and security

- Never hard-code an API origin. Web reads `VITE_API_BASE_URL` from ignored
  `apps/web/.env.local`; mobile reads `EXPO_PUBLIC_API_BASE_URL` from ignored `apps/mobile/.env`.
- Version only `.env.example`. Never commit runtime environment files, secrets, tokens, OTPs,
  cookies, authorization headers, or private keys.
- Web authentication uses backend httpOnly cookies with CSRF held in memory. Mobile credentials use
  Expo SecureStore. Never persist bearer credentials in localStorage, AsyncStorage, or Redux.
- Shared API operations use the injected native-fetch client. Do not call `fetch()` directly or add
  Axios. The only allowlisted direct fetch is the signed object-storage upload in `mediaApi.ts`,
  which must not receive API cookies or authorization headers.
- Do not add credential-bearing logs, debug cURL output, obfuscated source, or unreviewed generated
  code. All normal npm workflows must retain the obfuscation/security prechecks.

## Tests, documentation, and completion

For every implementation change in `apps/`, `packages/`, `scripts/`, or root configuration:

1. Add or update proportionate unit/integration tests.
2. Maintain at least 80% statements, branches, functions, and lines in covered shared code.
   Test changes at the unit and integration layers and add/update Playwright production smoke tests
   for affected critical journeys. Coverage does not replace route, accessibility, or smoke checks.
3. Update the relevant Markdown context files in the same change. This maintenance is permanently
   authorized by the project owner; do not wait for separate approval.
4. Update `docs/IMPLEMENTATION_STATUS.md` and any architecture, navigation, security, testing,
   environment, or component document affected by the work.
5. Run `npm run verify` before handoff. Run `npm run build:mobile` when mobile runtime/build behavior
   changes.

Do not report work complete when required checks fail. Document known warnings or external blockers
instead of hiding them.
