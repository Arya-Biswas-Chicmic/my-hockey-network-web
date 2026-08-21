# Mandatory coding-agent working agreement

These instructions apply to every AI coding agent and contributor working anywhere below this
folder. Follow them strictly. Do not replace established architecture with a parallel approach.

## Read before changing code

Read these files before implementation:

1. `PROJECT_CONTEXT.md`
2. `docs/codebase_architecture_guide.md`
3. `docs/NAVIGATION.md`
4. `docs/COMPONENT_CATALOG.md`
5. `docs/ENVIRONMENT_CONFIGURATION.md`
6. `docs/SECURITY_REGISTER.md`
7. `docs/TESTING_STRATEGY.md`
8. `docs/DOCUMENTATION_POLICY.md`
9. `docs/IMPLEMENTATION_STATUS.md`

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

## Environment and security

- Never hard-code an API origin. Web reads `VITE_API_BASE_URL` from ignored
  `apps/web/.env.local`; mobile reads `EXPO_PUBLIC_API_BASE_URL` from ignored `apps/mobile/.env`.
- Version only `.env.example`. Never commit runtime environment files, secrets, tokens, OTPs,
  cookies, authorization headers, or private keys.
- Web authentication uses backend httpOnly cookies with CSRF held in memory. Mobile credentials use
  Expo SecureStore. Never persist bearer credentials in localStorage, AsyncStorage, or Redux.
- Do not add credential-bearing logs, debug cURL output, obfuscated source, or unreviewed generated
  code. All normal npm workflows must retain the obfuscation/security prechecks.

## Tests, documentation, and completion

For every implementation change in `apps/`, `packages/`, `scripts/`, or root configuration:

1. Add or update proportionate unit/integration tests.
2. Maintain at least 80% statements, branches, functions, and lines in covered shared code.
3. Update the relevant Markdown context files in the same change. This maintenance is permanently
   authorized by the project owner; do not wait for separate approval.
4. Update `docs/IMPLEMENTATION_STATUS.md` and any architecture, navigation, security, testing,
   environment, or component document affected by the work.
5. Run `npm run verify` before handoff. Run `npm run build:mobile` when mobile runtime/build behavior
   changes.

Do not report work complete when required checks fail. Document known warnings or external blockers
instead of hiding them.
