# Data fetching and authentication

Last reviewed: 2026-08-26

## Technology ownership

- Web URL routing: React Router `BrowserRouter`.
- Mobile screen navigation: React Navigation native stack and bottom tabs.
- Web server state: TanStack Query (`@tanstack/react-query`).
- HTTP transport: the injected native-fetch client in `packages/api-client`.
- Axios is not used and must not be added without an explicit architecture decision.

TanStack Query manages requests, deduplication, stale time, retries, cache reads, and invalidation.
It is not a router and must not own URL navigation. New web API reads should use the existing query
facade/hooks and structured query keys. Mutations must invalidate the affected keys.

Direct `fetch()` calls in features/apps are prohibited. `npm run security:check` enforces this. The
only exception is the signed object-storage PUT in `packages/core/src/api/mediaApi.ts`; that request
targets a pre-authorized storage URL and must not receive application credentials.

## Why web login can work when JavaScript cannot see a cookie

The web app uses backend-managed HttpOnly cookies. HttpOnly cookies are intentionally invisible to
`document.cookie`, localStorage, and application JavaScript. Login success is established by calling
`/auth/me`, not by checking for a client-readable token. Every API request and refresh request uses
`credentials: 'include'`, so the browser sends an eligible cookie automatically.

To verify the session, inspect all three places in browser developer tools:

1. The OTP verification response includes a valid `Set-Cookie` header.
2. Application/Storage shows the cookie for the API origin (it may be HttpOnly).
3. The following `/auth/me` request includes the cookie and returns the authenticated user.

For cross-origin web development, the backend must return an exact allowed origin (not `*`),
`Access-Control-Allow-Credentials: true`, and a production-compatible cookie configuration. A truly
cross-site cookie normally requires `SameSite=None; Secure`; local HTTP development may require a
same-site setup or backend-specific development cookie policy. These cookie flags and CORS response
headers are backend/DevOps responsibilities and cannot be repaired by frontend JavaScript.

Web stores only the non-secret CSRF value in memory. Mobile does not use browser cookies; it stores
access, refresh, and CSRF credentials in Expo SecureStore.
