# Web routing and mobile navigation

Last reviewed: 2026-08-21

## Required distinction

Web routing and mobile navigation solve similar user-flow problems with different platform tools.
They must not share presentation or navigator implementations.

| Platform | Mechanism | Identifiers | Owner |
| --- | --- | --- | --- |
| Web | React Router `BrowserRouter` | Browser URL paths | `apps/web/src/components/app-router.tsx` |
| Mobile | React Navigation native stack and bottom tabs | Typed screen names | `apps/mobile/src/navigation` |

Mobile does not implement browser URL routes. Terms such as `ROUTES`, `TAB_ROUTES`, or “route name”
inside mobile refer only to React Navigation screen identifiers; they are not paths that can be
opened or refreshed in a browser.

## Web rules

- Define URL metadata in the existing web route configuration and render it through `AppRouter`.
- Keep guest, authenticated, and role authorization decisions in `GuestGuard`, `AuthGuard`, and
  `RoleGuard` rather than conditional page markup or localStorage checks.
- Guards must wait for the single `/auth/me` bootstrap before redirecting.
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
