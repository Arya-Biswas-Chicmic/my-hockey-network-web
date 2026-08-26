# My Hockey Network user applications

Next.js App Router web and Expo/React Native mobile applications in one pnpm-workspaces monorepo.
Shared contracts, domain rules, validation, authentication use cases, API behavior, and design values
live under `packages/`; UI, navigation, environment access, and credential storage remain
platform-owned.

This repository uses **pnpm only**. Node.js is the JavaScript runtime; pnpm is the package manager.
Do not add `yarn.lock`, `package-lock.json`, or Bun lockfiles.

Last reviewed: 2026-08-26

## Start here

- [Primary frontend architecture standard](docs/FRONTEND_ARCHITECTURE.md)
- [Project context](docs/PROJECT_CONTEXT.md)
- [Architecture](docs/codebase_architecture_guide.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Security register](docs/SECURITY_REGISTER.md)
- [Testing strategy](docs/TESTING_STRATEGY.md)
- [Documentation policy](docs/DOCUMENTATION_POLICY.md)
- [Environment configuration](docs/ENVIRONMENT_CONFIGURATION.md)
- [Component catalog and reuse policy](docs/COMPONENT_CATALOG.md)
- [Web routing and mobile navigation](docs/NAVIGATION.md)
- [Data fetching and cookie authentication](docs/DATA_FETCHING_AND_AUTH.md)
- [Frontend development guidelines](docs/FRONTEND_DEVELOPMENT_GUIDELINES.md)
- [Next.js migration plan — in progress](docs/NEXTJS_MIGRATION_PLAN.md)
- [Web SEO, rendering, and ISR strategy](docs/WEB_SEO_AND_RENDERING_STRATEGY.md)
- [Third-party and dependency policy](docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md)
- [Admin Panel alignment reference](docs/ADMIN_PANEL_ALIGNMENT.md)
- [Mobile application setup](docs/MOBILE_SETUP.md)

## Prerequisites

- Node.js 24.18.0 or newer.
- pnpm 11.19.0 or newer (enable via `corepack enable && corepack prepare pnpm@11.19.0 --activate`
  if `pnpm` is not already on your PATH).
- For native mobile: Xcode and CocoaPods for iOS, or Android Studio/SDK for Android.

## First-time setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Replace the example URL in both ignored runtime files with the API URL supplied by backend/DevOps.
Never commit `.env`, `.env.local`, credentials, or tokens.

## Run and build web

```bash
# Development server (Next.js prints the local URL, default http://localhost:3000)
pnpm dev:web

# Type-check and create the apps/web/.next production build
pnpm build:web

# Build, then start the production server
pnpm preview:web
```

Web talks to the backend through a same-origin BFF proxy (`apps/web/src/app/api/backend/[...path]
/route.ts`), so the browser never calls the backend origin directly. Set `API_BASE_URL` (server-only,
never `NEXT_PUBLIC_`-prefixed) in the deployment environment before the build; see
[Environment configuration](docs/ENVIRONMENT_CONFIGURATION.md) and
[Data fetching and cookie authentication](docs/DATA_FETCHING_AND_AUTH.md) for the full flow.

## Run and build mobile

```bash
# Start Expo and choose a target interactively
pnpm start:mobile

# Start directly for a local emulator/simulator
pnpm android:mobile
pnpm ios:mobile

# Create Android and iOS Expo production exports in apps/mobile/dist
pnpm build:mobile

# Generate native ios/android projects only when native project files are needed
pnpm native:generate:mobile
```

`build:mobile` verifies that the Expo application can produce Android and iOS production bundles.
The Next.js app owns web, so the Expo build intentionally does not target web. Store binaries
still require project-specific EAS or native signing configuration, which is not committed here.

## Quality commands

```bash
pnpm check:obscure
pnpm security:check
pnpm components:check
pnpm test:coverage
pnpm verify
```

`pnpm verify` is the completion gate: documentation freshness, security baseline, type checks,
lint, tests with minimum 80% shared-code coverage, and the production web build. It also rejects
non-pnpm lockfiles and cross-platform UI imports. `.github/workflows/ci.yml` runs the same chain on
every push/PR.

## Authentication and navigation

- Web uses httpOnly backend cookies via a same-origin Next.js API proxy, in-memory CSRF, App Router,
  and client-side auth/role guards (`apps/web/src/components/routing`). Server-side/session-aware
  route authorization is not yet implemented — see `docs/FRONTEND_ARCHITECTURE.md` §5.2.
- Web uses TanStack Query for server state and the shared native-fetch client for HTTP. TanStack
  Query does not replace App Router.
- Mobile uses SecureStore credentials and React Navigation stacks/tabs; it does not use browser URL
  routing. Mobile route-name constants are navigator screen identifiers, not web paths.
- Both applications use the same OTP, onboarding, current-user, and logout contracts/use cases.
- Web common components are web-only; mobile common components are mobile-only.
- Reuse between platforms occurs in `packages/`, which contains no DOM or React Native UI.
- Tokens must never be placed in localStorage, AsyncStorage-backed Redux state, logs, or UI props.
