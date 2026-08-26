# Mobile application setup

Last reviewed: 2026-08-26

The mobile application lives in `apps/mobile` and uses Expo/React Native with React Navigation. It
shares platform-neutral contracts, domain rules, authentication use cases, validation, API behavior,
and design tokens with web. Its React Native components, screens, navigation, environment access,
and SecureStore credential adapter remain mobile-owned.

## Current package manager

Run all commands from the repository root using npm. Do not run Yarn, pnpm, or a separate install
inside `apps/mobile`. The current repository has one root `package-lock.json` and one root
`node_modules` installation.

## Environment

Create the ignored mobile runtime file from its versioned example:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Set the backend/DevOps-provided API URL:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://development-api.example.com/v1
```

Never commit the runtime `.env`, credentials, tokens, cookies, or private keys. Mobile credentials
belong only in Expo SecureStore.

## Run mobile

```bash
npm install
npm run start:mobile

# Direct simulator/emulator targets
npm run ios:mobile
npm run android:mobile
```

## Verify mobile

```bash
npm run verify
npm run build:mobile
```

`build:mobile` produces Android and iOS Expo production exports. Generate native projects only when
the task explicitly requires native project files:

```bash
npm run native:generate:mobile
```

Store binaries still require approved EAS/native signing configuration, which must not be committed.

## Navigation and reuse

- Mobile uses React Navigation stack/tab screen names, not browser URLs or Next.js routes.
- Do not import React Router, Next App Router, DOM components, shadcn/ui, or web layouts into mobile.
- Reuse existing mobile `Button`, `Input`, `Header`, and `ScreenWrapper` before creating another
  native primitive.
- Share Zod schemas and platform-neutral behavior through `packages/*`, never web JSX.
- The future Next.js migration changes `apps/web`; it does not replace the mobile application.

See `NAVIGATION.md`, `COMPONENT_CATALOG.md`, `ENVIRONMENT_CONFIGURATION.md`, and
`FRONTEND_ARCHITECTURE.md` for mandatory rules.
