# Next.js migration session summary

Last reviewed: 2026-08-26

Record of one working session that picked up the Next.js migration on
`changes/next-js-update` mid-way, verified it end to end, and extended it.
Written so a future contributor or agent doesn't have to re-derive this from
git history. All work below is uncommitted on that branch unless noted.

## 1. Starting state found

The migration itself (Next.js 16 App Router, pnpm, React Hook Form + Zod,
TanStack Query) was substantially built but had never been verified: every
quality gate was silently broken, and every governance doc still said
"approved but paused" despite the code already existing. See
`docs/IMPLEMENTATION_STATUS.md` for the full itemized list; the short
version:

- `pnpm typecheck`: 45 errors (two workspace packages used but never
  declared as dependencies — pnpm doesn't hoist like npm).
- `pnpm lint:check`: crashed outright (`eslint.config.js` was never
  migrated off Vite; also an ESLint 10 vs. `eslint-config-next`
  incompatibility).
- `pnpm test:run`: 3 failing tests (a stale enum literal, a schema
  message-ordering bug, a missing `QueryClientProvider` in one test).
- `pnpm security:check`: false-positive failures (`.next/` build output
  wasn't excluded from the scanner).
- No CI pipeline existed.
- Every architecture doc described the migration as not yet started.

## 2. Fixed to get `pnpm verify` green

- Added `@my-hockey-network/validation`/`constants` to `apps/web/package.json`
  and `@my-hockey-network/domain` to `apps/mobile/package.json`.
- Added missing `js-cookie` dependency; removed a dead `react-native-svg`
  import from a web-only component (platform-boundary violation).
- Fixed the 3 failing tests; fixed a real duplicate-error-rendering bug in
  `GuardianApprovalForm` found along the way (added `hideMessage` to
  `FormInput`).
- Added `apps/web/src/app/global-error.tsx` (was missing entirely).
- Rewrote `apps/web/eslint.config.js` to extend `eslint-config-next`
  (matching the reviewed Admin Panel); pinned `eslint@^9.30.1` to match
  Admin's known-working version. Fixed the resulting real lint findings
  (16 unescaped-entity errors, missing `alt` text, one anonymous export).
- Excluded `.next/` in `scripts/check-security-baseline.mjs`.
- Added `.github/workflows/ci.yml` running the full verify chain.
- Rewrote all 18 docs (every "paused"/Vite/npm/React Router/Formik
  reference) to match the actual authorized, in-progress state.

## 3. Image/media migration

Reviewed Admin Panel's actual code first (`next/image` everywhere, raw
`<img>` reserved for local blob-preview-before-upload with a documented
`eslint-disable` exception) and matched that pattern:

- Migrated all 84 raw `<img>` elements across 31 files to `next/image`.
- Added `apps/web/src/components/ui/fallback-image.tsx`
  (`FallbackImage`) — replaces the old per-call-site
  `onError={(e) => e.target.src = '...'}` DOM mutation with a declarative
  `fallbackSrc`/`hideOnError` prop.
- Added `images.remotePatterns` to `next.config.ts`; added
  `position: relative` to 16 avatar/media wrapper CSS classes for `fill`
  mode.
- Kept 3 documented raw-`<img>` exceptions (post-image preview, avatar
  preview, the crop dialog's own live preview) — same category as Admin's.
- Tightened `--max-warnings` back to `0` once the backlog was cleared.

## 4. Image crop-on-upload (new feature)

- `apps/web/src/components/ui/image-crop-modal.tsx` (`ImageCropModal`) —
  pan/zoom crop dialog, Canvas/pointer-based, no external dependency.
  Dynamic geometry applied via ref-based DOM style mutation (not a JSX
  `style` prop — the repo's component-reuse check rejects inline style
  objects outright, and this is also better for drag performance).
- `apps/web/src/hooks/use-image-crop.tsx` (`useImageCrop`) — promise-based
  wrapper; drops into an existing file-select handler with one `await`.
- `apps/web/src/components/ui/slider.tsx` (`Slider`) — new range-input
  primitive backing the crop dialog's zoom control.
- Wired into avatar upload (circular) and cover upload (3:1 rect) in both
  `EditProfileModal.tsx` and `screens/profile-page.tsx`. **Not** wired into
  `CreatePostModal.tsx`'s post-image attachment — the crop viewport always
  fills its frame, so forcing it there would crop content out of every
  post photo whose aspect ratio doesn't match, a real behavior change from
  today's full-image posts. Flagged, not silently applied either way.

## 5. SEO: real public routes, ISR, metadata

No route in the app previously had `revalidate`, and there was no
`(public)` route group at all — `robots.ts` blocked everything,
`sitemap.ts` was empty, and only the root layout had metadata. Verified
this rather than guessed.

- Moved the authenticated home feed from `/` to `/home`
  (`constants/paths.ts` is the single source of truth every nav call
  already derived from — a one-line change plus a file move).
- Added `app/(public)/page.tsx` — real marketing landing page,
  `revalidate: 3600`, `robots: index/follow` explicitly overriding the
  root layout's default noindex.
- Added `app/(public)/players/[id]/page.tsx` — public profile page,
  `revalidate: 300`, per-profile `generateMetadata`/OG tags, backed by a
  new `infrastructure/server/public-profile.ts` (anonymous,
  credential-free server fetch — deliberately does not forward cookies).
- Updated `robots.ts`/`sitemap.ts` to match.
- Split all 13 route `page.tsx` files (each was a Client Component calling
  hooks directly, so `export const metadata` wasn't legal there) into a
  thin Server Component `page.tsx` (exports `metadata`, e.g. a real
  browser-tab title) plus a sibling `route-client.tsx` carrying the
  unchanged client logic. Every route now has real metadata; only the two
  public routes are indexable — authenticated routes correctly remain
  dynamic/no-store per the existing "never cache personalized content"
  rule.
- Added a core shadcn-style `@theme` token set to `index.css` (Tailwind 4
  CSS-first, no JS config) scoped to this app's existing brand colors.
  This incidentally fixed a real pre-existing bug: `error.tsx`,
  `global-error.tsx`, and `not-found.tsx` referenced `bg-background`/
  `text-foreground`/etc. classes that resolved to nothing because no
  token set had ever been defined.
- Fixed a real defect the above surfaced: the app-wide "server down"
  overlay (triggered by any `/auth/me` 5xx) was blocking the new public
  pages too. Scoped it to skip `/` and `/players/*` in
  `apps/web/src/theme/providers.tsx` — a crawler or first-time visitor
  must see the marketing page regardless of an unrelated auth-check
  failure.
- **Events**: confirmed `screens/events-page.tsx` is 100% hardcoded sample
  data with no backend endpoint (`API_ENDPOINTS` has no `EVENTS` entry).
  Did not build a public/ISR events page around it — that would be SEO on
  fabricated content. Needs the events feature connected to a real
  backend first.

## 6. OTP dev-prefill (no email service wired up yet)

`OtpRequestResponse` already declared `devCode`/`code` fields for this
exact situation. Wired the backend-issued code into the OTP field on
login, signup, and resend (`OnboardingModal.tsx` + `VerifyEmailForm.tsx`)
so testers only need to press Confirm — never auto-submits without that
press. Self-removes once the backend stops returning that field for real
email delivery.

## 7. Verified state

Every claim above was confirmed by actually running the command, not
assumed:

- `pnpm verify` (package-manager, docs, security, component-reuse,
  typecheck for both `apps/web` and `apps/mobile`, lint at
  `--max-warnings=0`, coverage, production build) — exit 0.
- `pnpm test:coverage` — 93/93 tests, 92.4%/85.77%/97.22%/93.18%
  statements/branches/functions/lines.
- Production build route table shows real ISR (`Revalidate: 1h` on `/`)
  and correct dynamic classification on every authenticated route.
- Spot-checked in a real browser against a local production build: images
  render correctly (`/_next/image` returning 200s), the guardian
  illustration panel's `fill`-mode image renders pixel-correct.

## 8. Open, documented backlog (not attempted this session)

See `docs/IMPLEMENTATION_STATUS.md` "Maintainability backlog" for the full
list. Highlights:

- Server-side/session-aware route authorization (guards are client-side
  only today).
- Playwright config/specs (dependency installed, unused).
- Package consolidation (`core`/`shared`/`types`/`constants`/`utils`/
  `design-system`).
- `profile-page.tsx`/`supervision-page.tsx` decomposition (~1,800 lines
  each).
- A public sitemap for `/players/[id]` URLs once the backend exposes a
  way to enumerate public profile IDs.
- Connecting the Events feature to a real backend, then building a public
  events page the same way `/players/[id]` was built.
