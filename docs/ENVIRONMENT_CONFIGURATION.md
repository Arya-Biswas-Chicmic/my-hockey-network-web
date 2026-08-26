# Environment configuration

Last reviewed: 2026-08-26

## Runtime files

Local runtime files exist for developer convenience and are ignored by Git. Only `.env.example`
files are versioned. Obtain the official development/staging/production API origins from backend or
DevOps and replace the example URL. Both applications fail fast when their required API variable is
missing; there is no checked-in fallback origin or relative API proxy.

## Required variables

Web uses `apps/web/.env.local`:

```text
VITE_API_BASE_URL=https://development-api.example.com/v1
```

Mobile uses `apps/mobile/.env`:

```text
EXPO_PUBLIC_API_BASE_URL=https://development-api.example.com/v1
```

Deployment providers must define the equivalent variable in their environment settings. Do not
commit real runtime `.env` files, tokens, passwords, or private keys.

## Setup

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Use the same backend origin for both applications unless backend/DevOps explicitly provides
platform-specific endpoints. Include the API prefix (currently `/v1`) and omit a trailing slash.

## Resolution paths

- Web primary resolution: `apps/web/src/platform/environment.ts`.
- Mobile primary resolution: `apps/mobile/src/platform/environment.ts`.
- Mobile legacy RTK consumers receive the same value through `apps/mobile/src/utils/constants.ts`.
- Node API diagnostic scripts resolve `API_BASE_URL`, then the platform variables/runtime files.
- Shared packages contain endpoint paths only; they do not read environment variables.

Vite, Netlify, and the SPA redirect file no longer contain backend proxy URLs. Hosted deployments
must configure `VITE_API_BASE_URL`; Expo embeds `EXPO_PUBLIC_API_BASE_URL` in the client bundle.
Neither variable is a place for secrets.

When web and API origins differ, the backend must explicitly allow the web origin with credentialed
CORS and issue an eligible HttpOnly cookie. See `docs/DATA_FETCHING_AND_AUTH.md`. A cookie not being
visible through `document.cookie` is expected and is not evidence that login failed.

Development and preview ports are selected by Vite and are not part of API configuration. If local
tooling requires a particular port, pass Vite's CLI option for that invocation instead of committing
a machine-specific port.

## Git safety

The root `.gitignore` ignores `.env` and `.env.*` while explicitly allowing `.env.example`.
`npm run security:check` verifies that local runtime files remain ignored. Before committing, use
`git status --ignored` if you need to confirm their status; never force-add them.
