# My Hockey Network user applications

React/Vite web and Expo/React Native mobile applications in one npm-workspaces monorepo. Shared
contracts, domain rules, validation, authentication use cases, API behavior, and design values live
under `packages/`; UI, navigation, environment access, and credential storage remain platform-owned.

This repository uses **npm only**. Node.js is the JavaScript runtime; npm is the package manager.
Do not add `yarn.lock`, `pnpm-lock.yaml`, or Bun lockfiles.

Last reviewed: 2026-08-26

## Start here

- [Project context](PROJECT_CONTEXT.md)
- [Architecture](docs/codebase_architecture_guide.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Security register](docs/SECURITY_REGISTER.md)
- [Testing strategy](docs/TESTING_STRATEGY.md)
- [Documentation policy](docs/DOCUMENTATION_POLICY.md)
- [Environment configuration](docs/ENVIRONMENT_CONFIGURATION.md)
- [Component catalog and reuse policy](docs/COMPONENT_CATALOG.md)
- [Web routing and mobile navigation](docs/NAVIGATION.md)
- [Data fetching and cookie authentication](docs/DATA_FETCHING_AND_AUTH.md)

## Prerequisites

- Node.js 20.19.4 or newer.
- npm 10 or newer (the repository currently pins npm 11.16.0).
- For native mobile: Xcode and CocoaPods for iOS, or Android Studio/SDK for Android.

## First-time setup

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Replace the example URL in both ignored runtime files with the API URL supplied by backend/DevOps.
Never commit `.env`, `.env.local`, credentials, or tokens.

## Run and build web

```bash
# Development server (Vite prints the selected local URL)
npm run dev:web

# Type-check and create apps/web/dist
npm run build:web

# Build, then preview production output on Vite's selected preview port
npm run preview:web
```

For hosted web environments, set `VITE_API_BASE_URL` in the provider configuration before the
build. The API must allow requests from the deployed web origin and support credentialed CORS.

## Run and build mobile

```bash
# Start Expo and choose a target interactively
npm run start:mobile

# Start directly for a local emulator/simulator
npm run android:mobile
npm run ios:mobile

# Create Android and iOS Expo production exports in apps/mobile/dist
npm run build:mobile

# Generate native ios/android projects only when native project files are needed
npm run native:generate:mobile
```

`build:mobile` verifies that the Expo application can produce Android and iOS production bundles.
The separate Vite app owns web, so the Expo build intentionally does not target web. Store binaries
still require project-specific EAS or native signing configuration, which is not committed here.

## Quality commands

```bash
npm run check:obscure
npm run security:check
npm run components:check
npm run test:coverage
npm run verify
```

`npm run verify` is the completion gate: documentation freshness, security baseline, type checks,
lint, tests with minimum 80% shared-code coverage, and the production web build. It also rejects
non-npm lockfiles and cross-platform UI imports.

## Authentication and navigation

- Web uses httpOnly backend cookies, in-memory CSRF, BrowserRouter, and hydrated auth/role guards.
- Web uses TanStack Query for server state and the shared native-fetch client for HTTP. TanStack
  Query does not replace React Router.
- Mobile uses SecureStore credentials and React Navigation stacks/tabs; it does not use browser URL
  routing. Mobile route-name constants are navigator screen identifiers, not web paths.
- Both applications use the same OTP, onboarding, current-user, and logout contracts/use cases.
- Web common components are web-only; mobile common components are mobile-only.
- Reuse between platforms occurs in `packages/`, which contains no DOM or React Native UI.
- Tokens must never be placed in localStorage, AsyncStorage-backed Redux state, logs, or UI props.
