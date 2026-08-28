# Profile design QA

Last reviewed: 2026-08-28

Reference: Figma Profile > Posts (`1642:9236`) at 1440×960. Implementation: authenticated
`/profile` in the current Chrome session, dark theme.

## Result

Passed for the scoped Profile content and discovery rail. No P0, P1, or P2 visual defects remain.

## Verified

- Profile photo, API-first identity/count/role values, field-level JSON fallbacks, six detail cells,
  Edit/Share actions, and Posts/Media/Stats/Events/Career tabs are visible in the hero.
- Shared desktop composition matches the reference tracks: 470px Profile column, 48px gutter,
  300px Search/Who-to-follow rail. The hero is non-shrinking and remains 399px tall.
- At 1024px and 768px, the shared discovery rail collapses and the Profile page has zero horizontal
  document overflow.
- The Profile rail reuses `RightSidebar`, `SearchWidget`, and `WhoToFollowWidget` from Home. The five
  Figma people and their local image paths come from centralized Profile JSON, not component data.
- Profile Posts reuse `FeedPostCard`; external demo authors retain their own role and Follow state,
  while API profile posts remain self-authored. Media is full-width within the shared card.
- Media, Stats, Events, and Career tabs render populated centralized fixtures when their backend
  contracts are unavailable. Edit Profile opens with API-backed values and the existing React Hook
  Form + Zod save path.
- `pnpm verify` passes: security/reuse/documentation gates, TypeScript, ESLint, 286 tests, coverage,
  and the optimized Next.js production build. Coverage is 95.32% statements, 89.08% branches,
  98.14% functions, and 95.48% lines.

## Intentional data differences

The signed-in user's API identity remains authoritative, so the live preview shows Vinod/Parent and
real follower counts rather than replacing them with Alexander Ovechkin. Only fields absent from the
API are filled from `apps/web/src/demo-data/profile/`, as required by the demo-data policy.
