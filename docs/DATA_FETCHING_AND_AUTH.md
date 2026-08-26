# Data fetching and authentication

Last reviewed: 2026-08-26

## Technology ownership

- Web URL routing: Next.js App Router.
- Mobile screen navigation: React Navigation native stack and bottom tabs.
- Web server state: TanStack Query (`@tanstack/react-query`).
- HTTP transport: the injected native-fetch client in `packages/api-client`.
- Axios is not used and must not be added without an explicit architecture decision.

TanStack Query manages requests, deduplication, stale time, retries, cache reads, and invalidation.
It is not a router and must not own URL navigation. New web API reads should use the existing query
facade/hooks and structured query keys. Mutations must invalidate the affected keys.

Direct `fetch()` calls in features/apps are prohibited. `pnpm security:check` enforces this. The
allowlisted exceptions are the signed object-storage PUT in `packages/core/src/api/mediaApi.ts`
(targets a pre-authorized storage URL and must not receive application credentials) and the
same-origin BFF proxy itself, `apps/web/src/app/api/backend/[...path]/route.ts` — it is the transport
boundary other web code calls through, so it necessarily makes the real request to the backend.

Guardian relationship server state follows the same hierarchy: relationship endpoints and service
functions in `packages/contracts`/`packages/core`, direction-specific TanStack hooks in
`apps/web/src/hooks/use-guardian-relationships.ts`, then route-owned components. Parent-to-child
invites and child-to-parent requests use separate query keys and must not be combined ambiguously.

## Same-origin BFF proxy (current architecture)

The browser never talks to the backend origin directly. Every web API call goes to
`apps/web/src/app/api/backend/[...path]/route.ts` on the Next.js server, which forwards the request
to the real backend (`API_BASE_URL`, a server-only environment variable — never exposed with a
`NEXT_PUBLIC_` prefix) and rewrites any `Set-Cookie` header for the same-origin browser via
`apps/web/src/infrastructure/server/proxy-cookie.ts`. This removes the cross-origin CORS/cookie
problem entirely: from the browser's perspective, the API is same-origin, so standard
`SameSite=Lax`-compatible cookies work without special cross-site cookie configuration.

The proxy is request-scoped: it reads only the incoming request's cookies/headers and never holds
server-side state across requests. Do not introduce a globally configured API client as a Next.js
server singleton — that would risk leaking one user's session into another user's request.

## Why web login can work when JavaScript cannot see a cookie

The web app uses backend-managed HttpOnly cookies. HttpOnly cookies are intentionally invisible to
`document.cookie`, localStorage, and application JavaScript. Login success is established by calling
`/auth/me` (through the same-origin proxy), not by checking for a client-readable token. Every API
request and refresh request uses `credentials: 'include'`, so the browser sends an eligible cookie
automatically.

`AuthProvider` owns one stable initial `/auth/me` bootstrap. Its callback reads refs instead of
depending on `user`/`hasBootstrapped`, preventing effect-driven repeat calls. OTP verification forces
one fresh `/auth/me` call even when the initial guest bootstrap already completed; logout and 401
handling clear React auth state and the corresponding refs/query cache.

To verify the session, inspect all three places in browser developer tools:

1. The OTP verification response includes a valid `Set-Cookie` header (rewritten by the proxy for
   the same-origin browser URL).
2. Application/Storage shows the cookie for the web app's own origin (it may be HttpOnly).
3. The following `/auth/me` request includes the cookie and returns the authenticated user.

Mobile calls the backend directly (no proxy) and does not use browser cookies; it stores access,
refresh, and CSRF credentials in Expo SecureStore. Web stores only the non-secret CSRF value in
memory.

**Server-side pre-filter:** `apps/web/src/proxy.ts` (Next.js 16 renamed Middleware to Proxy — see
`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`) now redirects `(authenticated)`
routes to `/onboarding` server-side, before any client code runs, when the request carries no cookie
header at all. This is deliberately an *optimistic* presence check, not a full session validation:
Next.js's own guide explicitly warns against a real backend/database call in Proxy, since it runs on
every navigation including prefetches (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`,
"Optimistic checks with Proxy"). Their recommended pattern — decrypt a local session cookie — needs a
self-contained token this backend doesn't issue; its httpOnly cookie is opaque, so `/auth/me` remains
the only way to validate it, and that stays client-side in `AuthenticatedGuard`
(`apps/web/src/components/routing/authenticated-guard.tsx`), which is still the authoritative check.
Verified directly with `curl` (no browser, no cookie) that an unauthenticated request to `/home`
receives an immediate `307` to `/onboarding?returnTo=%2Fhome`, and that a request carrying any cookie
passes through unredirected as designed.

**Blocked from further verification by a live backend contract gap, not a frontend defect:** a real
OTP sign-in was completed live against the deployed backend
(`https://my-hockey-network.onrender.com/v1`) to verify the authenticated pass-through path. The
`otp/verify` call returns `200 OK` with `tokenDelivery: "mobile"` and bearer `accessToken`/
`refreshToken` in the JSON body — reproduced identically via `curl` with the exact
`X-Client-Type: web` header the shared API client always sends — with **no `Set-Cookie` header and
no `csrfToken` field** in either case. The documented web contract (httpOnly session cookie +
in-memory CSRF token, see above) is not what this backend deployment currently returns for a web
client; it answers with the mobile bearer-token contract regardless of client type. Concretely, this
means `/auth/me` correctly returns 401 immediately after a "successful" login right now, and no web
user can complete a real session against this backend deployment — independent of anything in this
frontend codebase. This needs a backend-side fix or confirmation of the correct request shape; it is
not something `apps/web` can work around by design (storing the bearer tokens client-side, the way
mobile does, is exactly the pattern this architecture's httpOnly-cookie/CSRF-in-memory security model
exists to avoid). Treat the authenticated pass-through path as implemented and passing the tests that
mock it, but not live-verified end to end, until this backend gap is resolved.
