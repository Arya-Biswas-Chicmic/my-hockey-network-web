# Web routing and mobile navigation

Last reviewed: 2026-08-26

## Required distinction

Web routing and mobile navigation solve similar user-flow problems with different platform tools.
They must not share presentation or navigator implementations.

| Platform | Mechanism | Identifiers | Owner |
| --- | --- | --- | --- |
| Web | Next.js App Router | Browser URL paths | `apps/web/src/app` (route groups `(public)`, `(auth)`, `(authenticated)`) |
| Mobile | React Navigation native stack and bottom tabs | Typed screen names | `apps/mobile/src/navigation` |

TanStack Query is the web server-state/cache layer and has no routing responsibility. Adding or
changing queries must not replace App Router URL definitions or React Navigation screen names.

Mobile does not implement browser URL routes. Terms such as `ROUTES`, `TAB_ROUTES`, or “route name”
inside mobile refer only to React Navigation screen identifiers; they are not paths that can be
opened or refreshed in a browser.

## Web migration status

The web portal has moved from React Router to Next.js App Router; React Router has been removed
from `apps/web`. Mobile continues using React Navigation; App Router must never be introduced into
the mobile application or shared packages. Route parity and guard/auth behavior are covered by the
existing unit/integration test suite; guest route-level Playwright smoke coverage runs in CI, while
the authenticated write journey awaits a dedicated CI account (tracked in `docs/IMPLEMENTATION_STATUS.md`).

## Web rules

- Define route segments, layouts, and metadata under `apps/web/src/app` route groups.
- Keep guest, authenticated, and role authorization decisions in `GuestGuard`, `AuthenticatedGuard`,
  `ParentRoleGuard`, and `MinorPlayerGuard` (`apps/web/src/components/routing`) rather than
  conditional page markup or localStorage checks.
- Guards must wait for the single `/auth/me` bootstrap before redirecting.
- `/auth/me` is always attempted because httpOnly cookies cannot be inspected by JavaScript. Do not
  restore client-side token or cookie-existence checks.
- Guardian approval and request-sent transitions are public; protected route segments render behind
  the route guards.
- Guardian relationship direction is route-owned: `/profile/guardian-requests` is guarded for the
  authenticated minor player and uses the parent-to-child guardian-invite endpoints; the parent-only
  `/supervision` Requests tab uses the child-to-parent guardian-request endpoints. A requester never
  approves their own request, and passing another profile ID cannot grant access to the child route.
- Preserve direct URL entry, refresh, browser history, unknown-path handling, and role restrictions.
- These guards are currently client-side only. Server-side/session-aware authorization at the route
  or data boundary is not yet implemented — see `docs/FRONTEND_ARCHITECTURE.md` §5.2. Do not treat
  the current client guards as a complete security control.

## Mobile rules

- `RootNavigator` owns the root native stack and waits for the SecureStore/session bootstrap.
- Unauthenticated navigation currently contains Onboarding, Login, Signup, and ForgotPassword.
- Authenticated navigation enters `MainTabs`; the current tabs are Home and Profile.
- Add a screen name to the appropriate enum and typed parameter list before registering its screen.
- Use React Navigation APIs for transitions and parameters. Do not use App Router,
  `window.location`, browser history, or web URL paths.
- Deep/universal links are not currently configured. If required later, add an explicit typed React
  Navigation linking configuration and tests; do not assume web paths automatically work on mobile.

## Sharing boundary

Web and mobile may share the business decision that determines the next logical state, authentication
contracts, role/permission rules, and validated parameter data. They must keep routers, navigators,
screens, navigation hooks, URL parsing, tab bars, and transition behavior within their application.
