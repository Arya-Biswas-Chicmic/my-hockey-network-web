# Web routing and mobile navigation

Last reviewed: 2026-08-26

## Required distinction

Web routing and mobile navigation solve similar user-flow problems with different platform tools.
They must not share presentation or navigator implementations.

| Platform | Mechanism | Identifiers | Owner |
| --- | --- | --- | --- |
| Web | React Router `BrowserRouter` | Browser URL paths | `apps/web/src/components/app-router.tsx` |
| Mobile | React Navigation native stack and bottom tabs | Typed screen names | `apps/mobile/src/navigation` |

TanStack Query is the web server-state/cache layer and has no routing responsibility. Adding or
changing queries must not replace React Router URL definitions or React Navigation screen names.

Mobile does not implement browser URL routes. Terms such as `ROUTES`, `TAB_ROUTES`, or “route name”
inside mobile refer only to React Navigation screen identifiers; they are not paths that can be
opened or refreshed in a browser.

## Approved web migration

The web portal will move from React Router to Next.js App Router in a future coordinated migration.
Implementation is paused until owner authorization. Until cutover, React Router remains the working
router and must be maintained. Mobile will continue using React Navigation; App Router must never be
introduced into the mobile application or shared packages. Route parity and guard/auth behavior must
be tested during migration before React Router is removed.

## Web rules

- Define URL metadata in the existing web route configuration and render it through `AppRouter`.
- Keep guest, authenticated, and role authorization decisions in `GuestGuard`, `AuthGuard`, and
  `RoleGuard` rather than conditional page markup or localStorage checks.
- Guards must wait for the single `/auth/me` bootstrap before redirecting.
- `/auth/me` is always attempted because httpOnly cookies cannot be inspected by JavaScript. Do not
  restore client-side token or cookie-existence checks.
- Guardian approval and request-sent transitions are public; protected page modules are lazy loaded
  behind the route guards.
- Preserve direct URL entry, refresh, browser history, unknown-path handling, and role restrictions.

## Mobile rules

- `RootNavigator` owns the root native stack and waits for the SecureStore/session bootstrap.
- Unauthenticated navigation currently contains Onboarding, Login, Signup, and ForgotPassword.
- Authenticated navigation enters `MainTabs`; the current tabs are Home and Profile.
- Add a screen name to the appropriate enum and typed parameter list before registering its screen.
- Use React Navigation APIs for transitions and parameters. Do not use React Router,
  `window.location`, browser history, or web URL paths.
- Deep/universal links are not currently configured. If required later, add an explicit typed React
  Navigation linking configuration and tests; do not assume web paths automatically work on mobile.

## Sharing boundary

Web and mobile may share the business decision that determines the next logical state, authentication
contracts, role/permission rules, and validated parameter data. They must keep routers, navigators,
screens, navigation hooks, URL parsing, tab bars, and transition behavior within their application.
