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
# Server-only backend origin used by the Next.js same-origin BFF proxy. Never expose this with a
# NEXT_PUBLIC_ prefix — the browser must not learn the real backend origin.
API_BASE_URL=https://development-api.example.com/v1

# Public canonical web origin used for metadata (Open Graph, canonical URLs). Contains no secret.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The browser itself never reads an API origin variable: `apps/web/src/platform/environment.ts` hard
codes the client-side base URL to the same-origin path `/api/backend`, which the proxy route
(`apps/web/src/app/api/backend/[...path]/route.ts`) forwards to `API_BASE_URL` on the server. This is
a deliberate architecture change from the prior Vite setup, not an oversight — see
`docs/DATA_FETCHING_AND_AUTH.md`.

Mobile uses `apps/mobile/.env` (unchanged by the web migration):

```text
EXPO_PUBLIC_API_BASE_URL=https://development-api.example.com/v1
```

Deployment providers must define `API_BASE_URL` (and `NEXT_PUBLIC_SITE_URL` for web, and
`EXPO_PUBLIC_API_BASE_URL` for mobile) in their environment settings. Do not commit real runtime
`.env` files, tokens, passwords, or private keys.

## Setup

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Include the API prefix (currently `/v1`) and omit a trailing slash in `API_BASE_URL`.

## Resolution paths

- Web client-side resolution: `apps/web/src/platform/environment.ts` (hard-coded same-origin
  `/api/backend` path; no environment variable needed here).
- Web server-side resolution: `apps/web/src/infrastructure/server/environment.ts` reads
  `API_BASE_URL` and throws fast if it is missing.
- Mobile primary resolution: `apps/mobile/src/platform/environment.ts`.
- Mobile legacy RTK consumers receive the same value through `apps/mobile/src/utils/constants.ts`.
- Node API diagnostic scripts resolve `API_BASE_URL`, then the platform variables/runtime files.
- Shared packages contain endpoint paths only; they do not read environment variables.

Because the browser only ever talks to the web app's own same-origin `/api/backend` path, there is no
cross-origin CORS/cookie configuration to manage for local web development — the backend only needs
to accept requests from the Next.js server, not from arbitrary browser origins. See
`docs/DATA_FETCHING_AND_AUTH.md` for the full same-origin BFF flow. A cookie not being visible through
`document.cookie` is expected and is not evidence that login failed.

## Git safety

The root `.gitignore` ignores `.env` and `.env.*` while explicitly allowing `.env.example`.
`pnpm security:check` verifies that local runtime files remain ignored. Before committing, use
`git status --ignored` if you need to confirm their status; never force-add them.
