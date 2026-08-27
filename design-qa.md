# Dark workspace design QA

Date: 2026-08-27

Reference: `Screenshot 2026-08-27 at 9.33.21 AM.png` (1440 × 960), covering Home For You,
Home Network, Home Groups, and Messaging in the authenticated dark desktop shell.

Prototype: local Next.js application at the same 1440 × 960 viewport.

## Comparison status

- The public sign-in screen renders correctly at 1440 × 960 and the failed `/auth/me` bootstrap no
  longer replaces it with the full-screen server-down state.
- Source-level inspection confirms the authenticated shell uses the reference layout characteristics:
  persistent 184px left navigation, dark navy canvas/cards, blue active navigation, two-column Home
  content, fixed outer columns, and center-only feed scrolling.
- A same-state screenshot comparison of Home/Network/Groups/Messaging could not be captured. Direct
  entry correctly redirects to `/onboarding?returnTo=/home` because this browser has no authenticated
  session, and the known backend contract currently does not issue the required web HttpOnly session
  cookie. No test credentials were supplied, and bypassing the guard would not validate production
  behavior.

## Remaining visual gate

Once the backend issues the documented web session cookie (or a dedicated non-production visual-QA
account is provided), capture each authenticated route at 1440 × 960, compare it beside the supplied
reference, and resolve any P0/P1/P2 spacing, typography, crop, border, or responsive differences.

Final result: blocked
