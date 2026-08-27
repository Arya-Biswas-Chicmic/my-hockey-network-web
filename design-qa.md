# Dark workspace design QA

Date: 2026-08-27 (updated later the same day)

Reference: `Screenshot 2026-08-27 at 9.33.21 AM.png` (1440 × 960), covering Home For You,
Home Network, Home Groups, and Messaging in the authenticated dark desktop shell.

Prototype: local Next.js application.

## Blocker resolved

The backend web session cookie contract is fixed and live-verified — see
`docs/IMPLEMENTATION_STATUS.md`'s Completed section for the full writeup. Two bugs stood between
"the backend fix landed" and an actual working login: this app's own BFF proxy
(`apps/web/src/app/api/backend/[...path]/route.ts`) was silently dropping the `X-Client-Type` header
on every proxied request (fixed), and the signed-in test account's stale `http://localhost:3000/...`
avatar URL crashed the entire authenticated shell via `next/image`'s host-allowlist validation (fixed,
with defense-in-depth hardening in `utils/mediaUtils.ts` and `components/ui/fallback-image.tsx` so no
future bad URL can do the same). A real browser login now works end to end.

## What's been checked so far (not the full gate below)

A quick pass at the Browser pane's default viewport (800×450, **not** the reference's 1440×960)
confirmed `/home`, `/network`, `/messaging`, and `/notifications` all render without crashing or
console errors, using the `saksham.garg@chicmicstudios.in` test account. This is a smoke check, not
the pixel comparison this document exists to do — treat the gate below as still fully open.

One real, visible gap already found this way: the `/notifications` card renders with a light
background against the rest of the shell's dark theme — a genuine dark-mode inconsistency, not a
rendering failure. Logged in `docs/IMPLEMENTATION_STATUS.md`'s Maintainability backlog.

## Remaining visual gate

Capture each authenticated route (Home For You / Home Network / Home Groups / Messaging, plus
Profile/Supervision/Settings while at it) at the reference's actual 1440 × 960 viewport, compare it
beside the supplied reference image, and resolve any P0/P1/P2 spacing, typography, crop, border, or
responsive differences. The account above is a real, working non-production test login — no further
blocker to starting this.

Final result: unblocked, not yet done
