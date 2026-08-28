# Implementation status

Last reviewed: 2026-08-28

## Completed

- Fixed the sidebar profile dropdown and the logout confirmation modal both rendering **behind**
  the feed content, plus dropdown width and logout-row alignment (feedback 2026-08-28). Root cause
  for the stacking bug: `.mhn-sidebar { position: sticky; top: 0; }` had no explicit `z-index` —
  per the CSS spec, a `position: sticky` element still establishes its own local stacking context
  even at `z-index: auto`, which traps all descendants (including `HeaderProfileDropdown`'s
  `position: absolute` dropdown and `LogoutModal`'s `position: fixed; z-index: 9999` overlay,
  neither rendered via a portal) at only "auto" priority against sibling `.mhn-app-content`. One
  fix resolves both: added `z-index: 20;` to `.mhn-sidebar`. Also fixed
  `.mhn-sidebar-footer .mhn-profile-dropdown` to `width: 240px; left: -16px;` so its outer edges
  align exactly with the sidebar's own 240px width (the `-16px` compensates for the parent
  `.mhn-sidebar-footer`'s inset inside the sidebar's 16px padding) — reverting an earlier pass's
  literal-Figma 300px value per explicit feedback to match the sidebar's actual rendered width
  instead. Fixed `.mhn-dropdown-logout-btn`'s own flex container (`gap: 12px; padding: 10px 12px;`
  → `gap: 8px; padding: 9px 12px;`), which an earlier turn's alignment fix to
  `.mhn-dropdown-item-left`/`.mhn-dropdown-item` had missed since the logout button uses a separate
  container, not those classes. Verified live via `getBoundingClientRect`/`getComputedStyle` at
  1440px width: dropdown rect `x:0, width:240` exactly matches sidebar `x:0, width:240`; dropdown
  `z-index:1000` vs sidebar `z-index:20` now renders above `.mhn-app-content`; logout button rect
  (`x:11, width:218`) now pixel-identical to the other menu items; logout modal confirmed rendering
  above the feed via screenshot.
- Fixed the Home page's 3-column layout spacing (left sidebar / feed / right column) to match
  Figma exactly (feedback 2026-08-28: "exactly match the spacing between 3 components"). Figma
  (`1398:3904`, "Home-For You") gives sidebar 300 + gap 48 + feed 470 + gap 48 + right column 300 =
  1166, the exact width of its 3-column wrapper — both gaps are 48px. `.mhn-home-main-layout` had
  `padding: 0 24px; gap: 32px;`, tuned by eye rather than measured. Changed to
  `padding: 0 24px 0 38px; gap: 48px;` (the extra left padding accounts for this component's own
  10px auto-centering margin inside `.mhn-app-content` at the 1440px desktop breakpoint). Verified
  live at 1440px width: sidebar right edge (240) → feed left edge (288) = 48px; feed right edge
  (1018) → right column left edge (1066) = 48px — both exact.
- Found and fixed the actual onboarding-modal spacing bug after two earlier passes checking
  card-internal spacing (title/subtitle/card-list/button gaps) came back pixel-perfect and missed
  it: the gap **between** the illustration panel and the form panel itself was never checked.
  Figma (e.g. `2203:32344`) has the illustration ending at x=716 and the form content starting at
  x=853 in its 1440px reference frame — a 137px gap — but `.onboarding-modal`'s `gap:
  clamp(28px, 5vw, 72px)` capped out at roughly half that on desktop. Changed to
  `clamp(28px, 9.5vw, 137px)`; verified live at 1920px width — 136px measured (1px off from
  clamp/vw rounding, imperceptible).
- Added the missing "Back" button on the parent/guardian sub-flow's "How would you like to add
  them?" step (`AddPlayerChoiceStep.tsx` / `ParentOnboardingStep.CHOOSE_METHOD`). Traced from
  Figma (`2203:43222`) to confirm the button belongs there; every other step in that sub-flow
  already had working `onBack` navigation (`CreatePlayerDetailsStep`, `CreatePlayerProtectStep`,
  `LinkExistingPlayerStep`) using the already-correct `.mhn-parent-btn-secondary` style (confirmed
  matching Figma's `#439cf7` border/text, 18px/28px exactly) — only this one step was missing the
  prop entirely. Added `onBack` to its props, wired `ParentOnboardingModal.tsx` to route it to
  `WHO_MANAGE`, updated the test that constructs the component. Verified live end-to-end: full
  signup flow → Parent/Guardian role → Create Account → OTP (dev-prefilled) → "Who do you
  manage?" → "Add a Player" → confirmed the Back button renders and correctly returns to "Who do
  you manage?".
- Started re-sourcing the app's icons from Figma properly, per feedback that the current icon set
  is ad hoc raster files rather than traced design assets — **this is a large task, not finished
  this pass**. Investigated the first target node (`1418:8806`) and found it isn't an icon sheet as
  described — it's a 118-screen section covering the entire app ("Feedback Final"), confirmed via
  `get_metadata`. Confirmed with the user this is genuinely the intended scope. Started with the
  bounded, well-understood Login/onboarding section (`2203:29491`) instead: extracted the icon set
  via `download_assets` (a single screen alone exceeded the 20-asset-per-call cap, confirming the
  scale), built `apps/web/src/components/icons/LoginIcons.tsx` with `LoginCalendarIcon`,
  `LoginShieldIcon`, `LoginEyeIcon`, `LoginChevronDownIcon` — traced from the real exported SVG path
  data, using `currentColor` rather than Figma's per-instance hex so one component works in both
  themes (see `docs/COMPONENT_CATALOG.md` → "Theme-variant icons" for why file-per-theme duplication
  was rejected for these). Wired `LoginCalendarIcon` into `DatePickerButton.tsx`, replacing
  lucide-react's generic `CalendarDays` with the exact traced glyph. Added `LoginIcons.tsx` to
  `allowedCustomSvgFiles` in `scripts/check-component-reuse.mjs`. Verified via typecheck, lint,
  component-reuse, all 212 tests, and a clean production build; live verification of the DOB
  calendar icon specifically was blocked by this environment's auth/seed-data gaps (same
  `/auth/me` 403s noted elsewhere in this doc), not by the component itself.
  **Remaining, explicitly not done**: the light-theme counterpart screens for the Login flow;
  `LoginShieldIcon`/`LoginEyeIcon`/`LoginChevronDownIcon` don't have confirmed current call sites
  yet (extracted correctly, not wired in); the full 118-screen inventory and the old-icon removal
  the user asked for. Continue screen-by-screen, verifying after each batch — do not attempt to
  mass-convert the rest unverified in one pass.
- Upgraded `dark/logo.webp` from a Figma source (file `cqlBXHZtqPkKcLRmR6a1B8`, node `1399:7885`,
  the sidebar logo in the "Home-For You" frame). Investigated this node expecting it to be the
  light-theme logo variant flagged as missing in the previous pass — it wasn't: pulling the actual
  layer content (not the rendered thumbnail) showed identical art to what's already in
  `dark/logo.webp`, just at much higher native resolution (1536×1024 vs the existing 483×129),
  confirmed via matching transparent corners on both. The Figma source also included a faint
  starfield/sparkle texture around the wordmark not present in the current asset, and needed
  cropping to its true content bounds (the raw layer has a lot of surrounding canvas). Re-exported:
  auto-cropped to content bounds (alpha-threshold bounding box, discarding the sparkle-only
  margins), downsampled to a sane 4x retina resolution (644×172 — the source's native 1249×329
  produced a 500KB lossless file for a small navbar asset, wasteful for something `next/image`
  re-optimizes on delivery regardless), and re-encoded (initial lossy attempts at q90–95 showed
  visible block artifacting on the fine text gradients even after downsampling to reasonable size;
  settled on `-q 95 -sharp_yuv` after downsampling, which came out clean — 77 KB, verified
  pixel-clean via decode-and-inspect, not just file size). No code changes needed — same filename,
  same four call sites. Still waiting on an actual light-theme logo asset; this only improved the
  existing dark one.
- Fixed a duplicate created in the theme-image work below: `dark/onboarding-welcome.webp` and
  `dark/onboarding-otp.webp` were byte-identical (confirmed via checksum). Collapsed to one file,
  `dark/onboarding.webp`, and updated `getIllustrationSource` to reference it directly rather than
  duplicating it under two step-specific names. Then audited every icon/logo reference in the web
  app for real light/dark contrast problems (not assumed ones) — see
  `docs/COMPONENT_CATALOG.md` → "Theme-variant images" for the full writeup. Found exactly one
  genuine case: `logo.webp` is white-wordmark art for a dark surface, but `LeftSidebar.tsx` and
  `Sidebar.tsx` render it inside `.mhn-sidebar`, whose background switches to light via
  `var(--color-background)`. Moved the file to `apps/web/public/dark/logo.webp` (its correct
  semantic home) and updated all four call sites (`Header.tsx`, `MobileNavigation.tsx`,
  `LeftSidebar.tsx`, `Sidebar.tsx`) to the new path — `Header.tsx` is safe as-is since
  `.mhn-header`'s background is a hardcoded dark gradient that never changes, but the other three
  are flagged with a comment to swap to `themedImageSrc('logo', resolvedTheme)` once a light-theme
  logo variant is supplied (pending — no such asset exists yet, so no functional change was made
  to avoid a 404 in light theme). Checked ~15 other raster icons (`back`, `arrowBottom`, `edit2`,
  `edit3`, `location2`, `notifications`, `home`, `groups`, `events`, `myNetwork`, `secure`,
  `manage`, `CheckCircle`, etc.) individually against the actual CSS background of every surface
  they render on, in both themes — none had a genuine problem: most carry their own colored badge
  background (theme-agnostic by construction), and the rest sit on screens/components that are
  hardcoded light-only and don't participate in dark theme at all yet (`event-detail-page.tsx`,
  the `Dropdown` component, `ProfileHeroCard`) — a separate, larger gap than icon theming, not
  fixed here. Verified via typecheck, lint, and all 212 tests.
- Introduced a `light/`/`dark/` subfolder convention for genuinely theme-variant images (see
  `docs/COMPONENT_CATALOG.md` → "Theme-variant images"), scoped to the only real case in the
  codebase today: the onboarding illustration. Moved `Welcome.webp`/`OTPbg.webp` to
  `apps/web/public/light/onboarding-{welcome,otp}.webp` and `IceHockeyDark.webp` to
  `apps/web/public/dark/onboarding-{welcome,otp}.webp` (duplicated — dark mode has one shared
  illustration across all steps, not per-step variants, so both dark filenames point at the same
  art until a real per-step dark illustration exists). Added `themedImageSrc()` in
  `apps/web/src/utils/themedImage.ts` so `OnboardingModal.tsx`'s `getIllustrationSource` resolves
  the pair by theme instead of a hand-written ternary; fixed a stale `/Welcome.webp` default prop
  in `OnboardingIllustration.tsx` left over from the move. Confirmed no other image in the web app
  is theme-conditional (only this one call site), and that mobile's `IMAGES`/`DARK_IMAGES` object
  scaffolding in `utils/images.tsx` isn't yet populated with any real theme-differentiated asset —
  left mobile as-is rather than creating empty placeholder folders. Verified via typecheck, lint,
  component-reuse, all 212 tests, a clean production build, and live browser checks confirming
  both `/dark/onboarding-welcome.webp` and `/light/onboarding-welcome.webp` load and render
  correctly when the theme is switched.
- Consolidated static image assets to one location per app and standardized format (see
  `docs/COMPONENT_CATALOG.md` → "Static asset location and format" for the policy). Web:
  `apps/web/public/` is the sole location (83 PNGs converted to WebP q≈85, 13.6 MB → 1.7 MB;
  every `next/image`/`FallbackImage`/CSS `url()` reference updated to the new `.webp` filenames;
  verified via typecheck, lint, component-reuse, all 212 tests, a clean production build, and live
  network checks confirming both `/_next/image` and direct static `.webp` requests return 200).
  Mobile: `apps/mobile/assets/images/` similarly converted (10 files), with the 3 referencing
  `require(...)` call sites updated (Metro requires a static string) and the 4
  icon/splash/adaptive-icon PNGs at `apps/mobile/assets/` left untouched since Expo's
  `app.config.ts` pipeline expects PNG there; verified via mobile typecheck and lint. Removed the
  unused `apps/web/src/assets/` directory (pre-Next.js Vite leftovers — confirmed zero imports).
  Considered and rejected moving images into `src/assets/` on either app (see the doc section for
  why). A handful of assets had zero code references before this pass (24 web, 1 mobile,
  including `Social Icons.png` and `GurdianApprovalRequest.png`) — converted for consistency but
  left in place rather than deleted, since removal wasn't requested; flagged as prune candidates.
- Unified the signup parent-onboarding "Add Player" step and the Supervision "+ Add Player" flow
  onto one shared `PlayerDetailsFormFields` component (`apps/web/src/components/features/parent/`)
  built on the common `FormInput`/`FormDateInput`/`FormSelect` fields, replacing each flow's separate
  hand-rolled `Input`/`Dropdown`/`FormField` wiring. Both flows now validate with the single
  `parentOnboardingPlayerDetailsFormSchema` (including its 5–100 year DOB age check, which
  Supervision's form did not previously enforce) and submit through the same `createManagedChild`
  API call.
- Recovered a missing onboarding asset and finished an in-progress branch merge on
  `feature/home-screen-redesign`: `apps/web/public/IceHockeyDark.png` was committed on
  `changes/next-js-update` (`408379c`) but never carried onto this branch, so the
  `/IceHockeyDark.png` reference in `OnboardingModal.tsx` was pointing at a 404 — restored the file
  from that commit. Separately, a `git pull` had left `HomeTabs.tsx` as an unmerged path (already
  hand-resolved on disk, no conflict markers, just not staged) — staged it to unblock the merge
  commit.
- Implemented the Figma auth/onboarding section (`2203:29491`) as a responsive Next.js flow for
  sign-in, account creation, OTP verification, role selection, and the parent/guardian player setup
  journey. The shared shell uses the exact 1440×960 reference geometry (40px frame inset, 676×880
  illustration, 450px form column), semantic light/dark theme tokens, and responsive single-column
  behavior without horizontal overflow at 375×812 or centered overflow at 1512×982. Parent and
  Supervision linking now reuse the same `LinkExistingPlayerStep`; role, choice, visibility, and
  toggle interactions use the existing accessible `Button` primitive. Added focused integration
  coverage for role selection, add-player branching, immutable protection settings, and the created
  player profile action.
- Aligned Home Screen implementation & component architecture with the primary 3-column layout (Sidebar, Center Feed with For You/Network/Groups tabs, Right Sidebar with Search, Who to Follow, Upcoming Events, Invite & Grow), modular component hierarchy, and dynamic TanStack Query API data flow.
- Added authorization, x-acting-for, and x-client-type headers to Next.js server proxy allowlist so authenticated requests send Bearer tokens to backend.

- Completed the ordered 2026-08-27 stabilization pass: credential-free auth/onboarding routes no
  longer receive the authenticated full-screen outage overlay when `/auth/me` is unavailable;
  mutation failures remain local to their feature error UI.
- Made the shared atomic form controls event-safe and accessible. Sanitized values flow through
  `onValueChange`; no code mutates `event.target.value` or constructs synthetic change events.
  File selection uses an associated label/native input rather than `ref.current.click()`.
- Removed remaining confirmed fabricated Home/Profile/Career/Events/Messaging/Notifications values.
  Screens without a backend list endpoint now render centralized honest empty states, while real
  API-backed Groups/Feed data continues through TanStack Query and shared service layers.
- Added the approved dark authenticated workspace: semantic app-wide navy tokens, persisted
  light/dark/system resolution, reusable Header theme toggle, persistent desktop left navigation,
  and Home/Messaging/Network/Groups dark surfaces. Home retains center-only scrolling.
- Fixed Groups navigation to pass the real selected backend group ID into Group Detail instead of
  ignoring the click and retaining a fabricated `g1` value.
- Extracted feed response mapping into `mapFeedPosts`, removed the duplicate onboarding interface,
  removed static profile identity props and nested position ternaries, and added focused unit tests.
- Verification on 2026-08-27: obfuscation scan, TypeScript, ESLint, 196 Vitest tests, production
  Next.js build, and the four-metric coverage gate pass. Coverage is 93.96% statements, 88.28%
  branches, 98.07% functions, and 94.46% lines.

- Imported home screen components and home-page from refactor/imports-and-styles branch.
- Fixed CORS preflight header rejection by sending only server-allowlisted headers in API client.

- Established npm workspaces for reusable web/mobile code.
- Added contracts, domain, API client, auth, validation, and design-token packages.
- Added web and mobile platform adapters for environment and credential storage.
- Replaced static user-panel path/token checks with BrowserRouter and hydrated guards.
- Aligned mobile sign-in/sign-up with the shared OTP flow.
- Removed hard-coded mobile authentication and bearer-token Redux persistence.
- Removed credential-bearing cURL logging and duplicate legacy API clients.
- Added AutoBid-style pre-command obfuscation scanning and Husky checks.
- Added documentation freshness enforcement and an 80% shared-code coverage gate.
- Added unit and integration coverage for API refresh/error behavior, OTP onboarding, role rules,
  validation schemas, and signup age/guardian rules.
- Migrated all web buttons/form controls through shared web primitives and migrated mobile Signup to
  the existing native Button, Input, and ScreenWrapper.
- Added component-reuse enforcement and consolidated design-system compatibility onto design-tokens.
- Validated npm workspace manifests, declared internal package dependencies, and retained one npm lockfile.
- Standardized the repository on npm, with install-time and verification checks rejecting other lockfiles.
- Moved web/mobile API origins into ignored runtime environment files and removed all checked-in URL fallbacks.
- Added verified Android and iOS Expo export commands without adding Expo web presentation.
- Added mandatory coding-agent instructions and explicit web-routing/mobile-navigation documentation.
- Extended automated boundary checks to reject React Navigation in web and browser routing in mobile.
- Updated shared API client options to support sessionStorage adapter alias and added unit test coverage.
- Centralized API endpoint URLs into @my-hockey-network/contracts/urls.ts and updated auth/api-client services to reference API_ENDPOINTS catalog.
- Updated Vite development server HMR configuration and local runtime environment configuration for seamless local dev startup.
- Implemented production-ready Centralized Feed-Access Permission System in @my-hockey-network/domain based on /v1/auth/me response (evaluating profile completion and guardian approval across Web & Mobile).
- Replaced free-form Position text input with a Select dropdown constrained strictly to backend-validated options (Center, Left Wing, Right Wing, Defense, Goaltender) preventing 400 validation errors on profile updates.
- Standardized cover image resolution in mediaUtils and components across Home, My Network, and Profile cards to default to high-res professional banner /cover.png whenever user coverUrl is null or missing.
- Updated HomePage feed layout to conditionally hide Search and Sort controls when feed contains no data and no active search query.
- Connected Career Teams form on Profile page to updateAuthProfile API (PATCH /v1/auth/profile) with loading spinner and session re-fetch.
- Replaced static sample post fallbacks on Profile page Posts tab with NoDataFound empty state component when GET /v1/posts returns empty items array.
- Updated Gender input to Select dropdown with valid enum options (Male, Female, Non-Binary), eliminated browser alert() popups in favor of Toast notifications, and conditionally hid player-specific fields (Position, Jersey Number, Career) for non-player roles.
- Aligned right-side icon padding for DOB and Gender inputs, restricted Gender options strictly to Male and Female, and removed Public Reference ID and Account Status read-only fields from Personal Details.
- Routed Create Post actions on Profile Page through requirePermission() to ensure permission restriction toasts display with interactive CTA button when profile is incomplete or guardian approval is pending.
- Implemented complete Parent role onboarding and player management wizard (ParentOnboardingModal) matching Figma designs with real API calls (POST /v1/supervision/children and POST /v1/relationships/guardian-invites) and Family Hub refetch integrations.
- Integrated child-specific gated approval requests (GET/POST /v1/approvals) and activity logs (GET /v1/supervision/:minorId/logs) in SupervisionPage, added unit tests in packages/core for approvals and supervision logs, and added a dedicated Guardian Requests tab (GET /v1/relationships/guardian-requests/pending) on ProfilePage for Parent role users.
- Updated default initial authentication mode in OnboardingModal and OnboardingPage to default to Sign In (login) instead of Sign Up, ensuring both first-time visits and post-logout redirects default to Sign In.
- Fixed right-alignment padding and positioning for Date of Birth calendar picker icon and replaced native select arrows with crisp custom SVG chevron dropdown arrows across ProfilePage and EditProfileModal.
- Created PermissionSkeletonLoader and SidebarWardSkeleton with gradient shimmer wave animation matching the My Network theme, replacing static gray loading boxes and request skeleton fallbacks on the Supervision Permissions page.
- Connected Family Hub dropdown member clicks to navigate directly to the selected child's Supervision page, preserved the in-page add player card workflow (`viewMode === 'choice'`), and added simultaneous shimmer wave loading during player creation/invitation API calls.
- Created `apps/web/src/utils/guardianUtils.ts` containing standardized `GUARDIAN_RELATION_OPTIONS` (`MOTHER`, `FATHER`, `LEGAL_GUARDIAN`, `GRANDPARENT`, `OTHER`), `formatDobToIso` helper, and `formatDobInput` live typing auto-formatter. Connected live typing formatting (`DD/MM/YYYY`) and native datepicker synchronization to the Supervision page DOB field, matching Sign Up.
- Updated Header Family dropdown to display the first 3 members with a "Show More" option navigating to Supervision page, and updated the post-player-creation "Go to Profile" button to navigate directly to the newly created player's profile view.
- Implemented production-ready live supervision permissions evaluation based on `GET /v1/supervision/me/permissions`. Updated `@my-hockey-network/domain` (`evaluateFeedPermissions`, `canCreatePost`, `canLikePost`, `canComment`, `canSharePost`, `canFollowOthers`, `canSendMessages`, `canCreateGroupChats`), normalized API response in `@my-hockey-network/core`, and integrated control checks in `useFeedPermissions` and UI components.
- Implemented Profile Career / Teams history feature matching backend specification. Added `PROFILES` catalog to `@my-hockey-network/contracts`, created `careerApi.ts` (`getProfile`, `createCareerEntry`, `updateCareerEntry`, `deleteCareerEntry`), added unit test coverage in `career.test.ts` (5 tests), and connected real API CRUD state, privacy handling, and verified badges to ProfilePage About tab.
- Created `DeleteCareerModal` component styled identically to `LogoutModal` (modal backdrop, pop-in animation, team name prompt, red danger delete action with loading state) for confirmation before deleting career team entries.
- Implemented dynamic backend error handling in `@my-hockey-network/api-client` (parsing ngrok `ERR_NGROK_3200` offline pages, 502/503 HTML gateway errors, network failures, and backend JSON error envelopes) and centralized all web toast messages into a single utility file `apps/web/src/utils/toast.ts`.
- Standardized TypeScript enums into dedicated files in `packages/contracts/src/enums/` (`headers.enum.ts`, `roles.enum.ts`, `permissions.enum.ts`, `auth.enum.ts`, `toast.enum.ts`), exported from `@my-hockey-network/contracts`, and refactored API client, domain permissions, and web toast modules to consume typed enums.
- Implemented 59-second countdown timer (`00:59`) on OTP verification screen (`VerifyEmailForm`), turning text color red during the last 10 seconds (`<= 10s`) and revealing the active `Resend OTP` button at `00:00`.
- Standardized cover image resolution in mediaUtils and components across Home, My Network, and Profile cards to default to high-res professional banner /cover.png whenever user coverUrl is null or missing.
- Centralized all hardcoded user-facing strings, toasts, validation alerts, error fallbacks, and helper texts across web/mobile applications and shared packages into structured constants (`ERROR_MESSAGES`, `SUCCESS_MESSAGES`, `VALIDATION_MESSAGES`, `HELPER_MESSAGES`, `TOAST_MESSAGES`) in `@my-hockey-network/constants`.
- Centralized all hardcoded UI navigation tabs, page main tabs, subtabs, view modes, sections, and auth modes into strongly-typed TypeScript enums (`NavTabEnum`, `SupervisionMainTabEnum`, `SupervisionViewModeEnum`, `ProfileTabEnum`, `ProfileAboutSectionEnum`, `SettingsSubTabEnum`, `NetworkViewModeEnum`, `AuthModeEnum`, `FeedSortEnum`) in `@my-hockey-network/contracts/enums/ui.enum.ts` and refactored state and conditionals across web pages.
- Implemented global application-level `ServerStatusWrapper` at root level (`apps/web/src/theme/providers.tsx`) catching HTTP 502/503/504 and network disconnects from `@my-hockey-network/api-client`, blocking the entire viewport (`100vw` x `100vh`, `zIndex: 99999`), disabling all user interaction, and providing an active ping-check reconnect retry mechanism that automatically restores app state upon server recovery.
- Expanded `SupervisionControlKeyEnum` in `packages/contracts/src/enums/permissions.enum.ts` and refactored `fetchControlsForWard` in `supervision-page.tsx` to eliminate hardcoded supervision control key strings.
- Enforced strict numeric digit (`0-9`) input restrictions across all OTP verification fields (`VerifyEmailForm`, `ApprovalCodeModal`) via regex sanitization on paste/type, `e.preventDefault()` on non-digit keystrokes, and `inputMode="numeric"` / `pattern="[0-9]*"` HTML5 attributes.
- Implemented search input debouncing via `useDebounce` hook across all search inputs in the web application (`home-page.tsx`, `my-network-page.tsx`, `events-page.tsx`, `supervision-page.tsx`, `settings-page.tsx`, `ChatSidebar.tsx`, `ConnectionsView.tsx`, `GroupsView.tsx`, `GroupDetailView.tsx`), delaying feed API requests (`/v1/feed?query=...`) and expensive list filters until 800ms after typing pauses.
- Resolved 400 Bad Request post creation privacy validation errors (`POST /v1/posts`) by translating `Custom` privacy settings to `audienceEnum = 'PRIVATE'` (matching backend schema `"PUBLIC" | "HOCKEY_NETWORK" | "CONNECTIONS" | "GROUP" | "PRIVATE"`), adding real-time field validation for custom `shareWithEmails` / `dontShareWithEmails` textareas in `CreatePostModal.tsx`, and filtering out invalid email strings using `isEmailValid` from `@my-hockey-network/validation`.
- Created `PostAudienceEnum` in `@my-hockey-network/contracts/enums/posts.enum.ts` (`PUBLIC`, `HOCKEY_NETWORK`, `CONNECTIONS`, `GROUP`, `PRIVATE`) and updated `CreatePostDTO` (`@my-hockey-network/core`) and web handlers (`home-page.tsx`, `profile-page.tsx`) to consume the centralized backend enum.
- Created dedicated `/help` page (`HelpPage` in `apps/web/src/pages/help-page.tsx`) featuring real-time debounced topic search, category pills (Account & Profile, Players & Teams, Messaging, Notifications, Privacy & Safety, Technical Support), expandable FAQ accordions, ticket submission form with file upload preview, and direct support contact cards. Integrated route into `ROUTE_MAP`, `AppRouter`, `NavTabEnum.HELP`, and Header user dropdown menu.
- Created `HeaderSkeleton` component (`apps/web/src/components/common/HeaderSkeleton.tsx`) with dark navy gradient background (`#051020` -> `#0a1b36`) and `.mhn-header-shimmer-box` animation to display a professional topbar shimmer matching the real header layout (Left Logo, 5 Center Nav item placeholders, Right Avatar/Name pill) across application loading states.
- Integrated full Post, Comment & Reaction Guardian Approval flow (`/v1/posts`, `/v1/approvals`). Minor/player actions held for guardian approval (`pendingGuardianApproval: true`, `isDraft: true`) display centralized pending notification (`HELPER_MESSAGES.GUARDIAN_APPROVAL_SUBMITTED: "Your post has been submitted and is waiting for parent/guardian approval."`) without adding drafts to active feed. Parent supervision queue (`supervision-page.tsx`) renders action badges (`Post Approval`, `Comment Approval`, `Reaction Approval`), post subject body previews, and executes `approveRequest` (`mode: 'SINGLE_USE'`) to publish posts (`POST_PUBLISHED`) or `declineRequest` to leave posts in draft state.
- Created separate standalone GitHub repository `https://github.com/Arya-Biswas-Chicmic/my-hockey-network-web` under permitted account, pushed complete codebase (`main` and `feature/fixes-stable`), configured root `vercel.json` SPA build rules (`buildCommand: "npm run build:web"`, `outputDirectory: "apps/web/dist"`), connected to Vercel (`chicmic/my-hockey-network`), and deployed production application to `https://my-hockey-network.vercel.app`.
- Refactored web component presentation code, replaced all static inline JS style objects across web pages (`home-page.tsx`, `settings-page.tsx`, `profile-page.tsx`, `supervision-page.tsx`) with modular, reusable CSS utility and component classes in `index.css`, and passed repository verification checks (`npm run verify`).
- Removed credential-bearing cURL output and all web bearer-token persistence, restored unconditional
  cookie-based `/auth/me` bootstrap, and expanded the security baseline to detect renamed loggers,
  browser token keys, and temporary origins in deployment configuration.
- Removed checked-in ngrok/Vite proxy origins, tunnel headers, and fixed development/preview ports.
  Web and mobile now fail fast on their platform-specific ignored environment variable.
- Corrected public guardian/request-sent routes, moved role-guard notifications out of render, made
  onboarding completion depend on the backend completion timestamp, and added route-level lazy loading.
- Added Formik and centralized web form validators for authentication and support reporting; added
  jsdom form and route-guard integration tests.
- Consolidated Dropdown into the existing FormControls primitive, removed inline-style escape hatches,
  added label associations, removed the last web inline style, and used Tailwind utilities for the
  desktop Home center-only scrolling shell.
- Removed fake ticket submission success and browser alert placeholders, repaired stale feed updates,
  removed dead Home session state, and made fallback feed keys deterministic.
- Replaced production connection/group/group-detail sample records with real relationship, group,
  member, group-post, join/leave, and group-post creation API flows; removed unused mock-data modules.
- Applied non-breaking npm advisory remediations. Expo/Metro's remaining advisories require a separately
  tested Expo SDK 57 migration and are recorded in the security register instead of being force-installed.
- Migrated every semantic web `<form>` to Formik, including profile editing, post creation, comments,
  authentication, guardian approval, OTP verification, and support. Added shared OTP and form-control
  primitives plus integration coverage for auth and feed-content submission behavior.
- Added real relationship/group/group-post data flows and removed production mock records. Connections,
  groups, group membership, and group posts now use the shared configured API client.
- Completed shared response interception for network failures, HTML/plain-text failures, JSON 5xx
  envelopes, unauthorized refresh/retry, and successful empty 204 responses. Web JSON 5xx failures now
  consistently activate the global server-down recovery screen.
- Confirmed and tested BrowserRouter web routing with hydrated guest/auth/parent role guards, and
  React Navigation native-stack/bottom-tab ownership on mobile.
- Replaced the custom web query cache with TanStack Query while retaining React Router for URLs.
  Query tests cover caching, request deduplication, retry behavior, and prefix invalidation.
- Standardized all app-local imports on `@/` aliases in Vite, TypeScript, Babel, and Vitest.
- Removed production and test explicit `any`; ESLint and repository checks now reject regressions.
- Replaced ordinary inline web SVG markup with Lucide icons. Brand, onboarding illustration, and
  hockey analytics SVGs are isolated in approved reusable components.
- Confirmed the shared HTTP transport remains native fetch (not Axios), added enforcement against
  direct feature fetch calls, and retained only the credential-free signed media upload exception.
- Verified web cookie authentication uses `credentials: 'include'` and `/auth/me`; documented why
  HttpOnly cookies are invisible to JavaScript and the required backend credentialed-CORS flags.
- Added mandatory frontend development guidelines covering existing-code-first reuse, feature-based
  boundaries, single responsibility, focused file-size targets, component composition, and explicit
  separation between the active Vite/npm/Formik architecture and the approved, paused Next.js stack.
- Recorded Next.js App Router as the approved target for the web portal and added a phased migration
  plan. Implementation remains paused until explicit owner instruction; no application dependencies,
  source, lockfiles, routing, or build configuration have been changed for the migration.
- Reviewed the separate Admin Panel as a Next.js architectural reference and documented which
  patterns should align (RHF/Zod, shadcn primitives, TanStack Query, focused Zustand, Vitest/RTL,
  Playwright, aliases and coverage) and which must not be copied (Axios, admin business UI and its
  single-app structure).
- Added the paused web SEO/rendering/ISR policy and the built-in-first third-party dependency policy.
  No migration dependency, application file, cache behavior, or deployment configuration changed.
- Normalized feed API responses in `@my-hockey-network/core` via `normalizeFeedResponse`, unwrapping
  `{ post, reason }` feed items, propagating `feedReason` (including `SELF`) to Home feed mapping,
  and requiring real post IDs instead of synthetic fallback keys.
- Added `normalizePostId` validation before post mutations to reject missing or placeholder IDs and
  prevent invalid PATCH/DELETE/comment/reaction requests.
- Stopped swallowing user-post and comment fetch failures as empty arrays; errors now propagate to
  callers for accurate error UI.
- Scoped global server-down recovery to read/navigation requests only; mutation 5xx failures stay
  local to feature toasts instead of blocking the entire viewport.
- Synced `FeedPostCard` local state when feed props refresh and wired optimistic post-update callbacks
  on Home and Profile after edit/delete actions.
- Fixed `showErrorToast` to accept a feature-safe fallback message as the second argument instead of
  misusing the action-label slot.
- Executed the Next.js migration on branch `changes/next-js-update`: `apps/web` now runs on Next.js
  16 App Router, React 19, pnpm workspaces (one root `pnpm-lock.yaml`), Tailwind 4, and project-owned
  shadcn-style primitives (`components/ui`, `components/form/fields`). Vite, React Router, Formik,
  and npm are fully removed from `apps/web`. Route groups `(auth)`/`(authenticated)` exist with
  client-side `AuthenticatedGuard`/`GuestGuard`/`ParentRoleGuard`. Web authentication now runs through
  a same-origin BFF proxy (`apps/web/src/app/api/backend/[...path]/route.ts`) that forwards to
  `API_BASE_URL` and rewrites `Set-Cookie` for the browser's own origin, replacing the prior
  cross-origin cookie/CORS model. `apps/web/src/pages` was renamed to `apps/web/src/screens` because
  Next.js reserves `pages/` for the legacy Pages Router and the name conflicted with App Router
  route discovery during `next build`. This work had not previously been recorded here; the
  `NEXTJS_MIGRATION_PLAN.md`/`FRONTEND_ARCHITECTURE.md`/`PROJECT_CONTEXT.md`/`AGENTS.md`/
  `FRONTEND_DEVELOPMENT_GUIDELINES.md`/`NAVIGATION.md`/`codebase_architecture_guide.md`/
  `COMPONENT_CATALOG.md`/`DATA_FETCHING_AND_AUTH.md`/`ENVIRONMENT_CONFIGURATION.md`/`README.md`
  "paused"/Vite/npm/React Router/Formik framing has been corrected to match.
- Fixed the migration's build-blocking gaps found on review: `apps/web/package.json` was missing
  `@my-hockey-network/validation` and `@my-hockey-network/constants` as declared workspace
  dependencies (pnpm only symlinks declared deps, unlike npm's hoisting), which was the root cause of
  ~45 cascading `tsc` errors including apparently-unrelated ones (e.g. `EditProfileFormData` losing
  all its fields). Also added the missing `js-cookie`/`@types/js-cookie` dependency used by
  `utils/storage.ts`, and removed a dead `import Svg, { Path } from 'react-native-svg'` from a
  web-only icon component (`RequestSentIcons.tsx`) — the file already used plain `<svg>`/`<path>`
  markup; the import was unused and violated the web/mobile presentation boundary. `pnpm typecheck`
  and `pnpm build:web` now pass cleanly.
- Fixed 3 failing tests surfaced by the above: a stale `'EVERYONE'` literal in
  `validation.test.ts` that should have been `CreatePostAudienceEnum.EVERYONE` (`'Everyone'`); a
  required-email-schema check-ordering bug in `packages/validation/src/forms.ts` where
  `emailSchema.min(1, msg)` reported the generic "Enter a valid email address." message instead of
  the field's required message on empty input (rewritten as a `requiredEmailSchema()` helper using
  `superRefine`, matching the existing pattern used elsewhere in the file); and a `PostCommentSection`
  integration test missing a `QueryClientProvider` wrapper after the component adopted
  `useQueryClient`.
- Found and fixed a real duplicate-error-rendering bug (not just a test issue) in
  `GuardianApprovalForm`: it hand-rolled its own error tooltip while also rendering the shared
  `FormMessage` (via `FormInput`), so the same validation message appeared twice in the DOM —
  an accessibility issue and a direct violation of the "one reusable error pattern" rule in
  `FRONTEND_ARCHITECTURE.md` §8.2. Added an opt-in `hideMessage` prop to `FormInput` (default
  `false`, so all other existing call sites are unaffected) and set it on `GuardianApprovalForm`'s
  field so its custom tooltip is the sole error owner.
- Added the previously-missing `apps/web/src/app/global-error.tsx` root error boundary (Next.js only
  invokes route-level `error.tsx` for failures inside the root layout; a separate `global-error.tsx`
  is required to catch failures in the root layout itself), built from the shared `Button` and
  Tailwind classes rather than inline styles/a raw `<button>`, and importing global CSS directly
  since this boundary replaces the root layout and does not inherit its providers.
- Fixed `scripts/check-security-baseline.mjs` to exclude the `.next/` build output directory from the
  obfuscation/fetch scan (it already excluded `dist`/`build`, an oversight from the prior Vite setup
  which used `dist`); it was flagging compiled bundles and the BFF proxy's own necessary `fetch` call
  as violations even though the proxy route was already correctly allowlisted in source. Also removed
  a stale `apps/web/src/validation/forms.ts` entry from `vitest.config.mts`'s coverage `include` list
  (the file was deleted during the migration; its coverage is already tracked via
  `packages/validation/src/index.ts`, which remained in the list).
- Verified (did not need to change) that minor-account supervision permissions fail closed: `useAuth`
  returns `false` for `hasSupervisionControl` while permissions are loading or unavailable
  (`auth-context.tsx`), rather than defaulting to allowed.
- Added `.github/workflows/ci.yml` running the full `pnpm verify` chain (package-manager, docs,
  security, component-reuse, typecheck, lint, coverage, build) on push/PR — there was previously no
  CI pipeline.
- Found and fixed that `apps/web/eslint.config.js` was never migrated off Vite: it still imported
  `eslint-plugin-react-refresh` (a Vite-only plugin) and `eslint-plugin-react-hooks` directly (an
  undeclared dependency, so lint crashed with `Cannot find package 'eslint-plugin-react-hooks'`), and
  never extended `eslint-config-next` even though it was already a declared dependency. Rewrote it to
  extend `eslint-config-next/core-web-vitals` (matching the reviewed Admin Panel pattern) while
  preserving the project's existing rule overrides (`no-explicit-any: error`, the `react-hooks/
  exhaustive-deps`/`immutability`/`set-state-in-effect` allowances). This also surfaced a real ESLint
  10 vs. `eslint-config-next@16.2.11` incompatibility (`scopeManager.addGlobals is not a function`);
  pinned `eslint` to `^9.30.1` in `apps/web/package.json` to match the Admin Panel's known-working
  version, and removed the now-unused `@eslint/js`, `globals`, and `typescript-eslint` devDependencies
  that only the old Vite config needed.
- With lint actually running for the first time since migration began, fixed the real issues it
  surfaced: 16 `react/no-unescaped-entities` errors (raw `'`/`"` characters in JSX text across 8
  files — escaped to `&apos;`/`&quot;`), missing `alt` attributes on `<img>` elements, one anonymous
  default export in `postcss.config.mjs`, and a false-positive `jsx-a11y/alt-text` on a Lucide
  `Image` icon component being misidentified as an `<img>`/`next/image` element (renamed the import
  to `ImageIcon` to remove the name collision).
- Migrated every remaining raw `<img>` element (84, across 31 files under `apps/web/src/components`
  and `apps/web/src/screens`) to `next/image`, following the reviewed Admin Panel's own pattern
  (`next/image` everywhere; raw `<img>` reserved for local/object-URL upload previews). Added
  `apps/web/src/components/ui/fallback-image.tsx` (`FallbackImage`) — a shared component that
  replaces the old per-call-site `onError={(e) => (e.target as HTMLImageElement).src = '...'}`
  DOM-mutation pattern with a declarative `fallbackSrc` (swap to a placeholder) or `hideOnError`
  (render nothing) prop. Added `images.remotePatterns: [{ protocol: 'https', hostname: '**' }]` to
  `next.config.ts` (uploaded media resolves to a variable, backend-controlled signed-storage host,
  matching Admin's identical wide-open pattern for the same reason) and `position: relative` to 16
  avatar/media wrapper CSS classes in `index.css` that needed it for `next/image`'s `fill` mode.
  Preserved the two genuinely local-preview cases (`CreatePostModal.tsx`'s `data:` URI post-image
  preview, `EditProfileModal.tsx`'s `URL.createObjectURL` avatar preview) as raw `<img>` with an
  `eslint-disable-next-line @next/next/no-img-element` comment explaining why, matching Admin's own
  documented exception in `form-image-upload.tsx`. Fixed two latent bugs found while migrating: two
  `alt="Connections"` copy-paste duplicates on the Groups/Events sidebar icons in
  `ManageNetworkCard.tsx`, and an `alt="location"` duplicate on the calendar icon in
  `event-detail-page.tsx`. `pnpm lint:check` now runs at `--max-warnings=0` (tightened back down from
  the temporary 84 used mid-migration) — matching Admin Panel's own strict threshold — with zero
  warnings. Verified with a real network capture against a local production build
  (`next start`) that `next/image` correctly serves both a `fill`-mode hero illustration and a
  fixed-size icon (`/_next/image?url=...` → `200 OK`) and renders pixel-correct with no console
  errors. See `docs/COMPONENT_CATALOG.md` for the resulting media-component conventions.
- Found and fixed the same undeclared-workspace-dependency class of bug on mobile:
  `apps/mobile/src/hooks/use-feed-permissions.ts` imports `@my-hockey-network/domain`, which was
  never declared in `apps/mobile/package.json`, so `pnpm typecheck` failed for the mobile app the
  same way `apps/web` did before its earlier fix in this same session.
- Confirmed the full quality chain is green end-to-end for the first time since migration work
  started: `pnpm verify` (package-manager, docs, security, component-reuse, typecheck for both
  `apps/web` and `apps/mobile`, lint, coverage, and production build) passes with exit code 0.
  `pnpm test:coverage`: 93/93 tests passing, 92.4%/85.77%/97.22%/93.18%
  statements/branches/functions/lines.








- Verified, on explicit request: (1) the only raw inline SVG in `apps/web` lives in the two
  allowlisted brand/illustration icon files (`GuardianIcons.tsx`, `RequestSentIcons.tsx`), not
  scattered in feature/page code — compliant, not a defect. (2) Zero relative (`../`/`./`) imports
  exist anywhere in `apps/web/src`; every import already uses the `@/` alias. (3) Zero inline
  `style={{...}}` objects exist in `apps/web/src` outside the new crop dialog's ref-based DOM
  mutation (documented above, not a JSX style prop). (4) No route currently uses ISR — only
  `force-dynamic` on the `(authenticated)` layout; no `revalidate` export exists anywhere. The app
  currently has no genuinely public content route (team/event/venue listing, etc.) that would
  benefit from it — only the auth-transition screens (`onboarding`, `guardian`, `sent`), which are
  already correctly statically optimized without needing an explicit `revalidate`. Applying ISR
  meaningfully needs a decision on which future public route(s) it targets; see
  `WEB_SEO_AND_RENDERING_STRATEGY.md`.
- Added a shared image crop-on-upload feature: `apps/web/src/components/ui/image-crop-modal.tsx`
  (`ImageCropModal`, Canvas/pointer-based, no external dependency) and
  `apps/web/src/hooks/use-image-crop.tsx` (`useImageCrop`, a promise-based wrapper for inserting
  cropping into an existing file-select handler with one `await`). Wired into the avatar upload in
  both `EditProfileModal.tsx` and `screens/profile-page.tsx` (circular) and the cover upload in
  `screens/profile-page.tsx` (3:1 rect). Added `apps/web/src/components/ui/slider.tsx` (`Slider`) as
  the project's range-input primitive backing the crop dialog's zoom control, and allowlisted both
  new primitive files in `scripts/check-component-reuse.mjs`. Deliberately not wired into
  `CreatePostModal.tsx`'s post-image attachment — see `docs/COMPONENT_CATALOG.md` "Image
  crop-on-upload" for why forcing it there is a product decision, not a mechanical one.

- Implemented real ISR/metadata/public-route SEO on explicit request: added `app/(public)/page.tsx`
  (marketing landing, `revalidate: 3600`, `robots: index/follow` overriding the root layout's
  default noindex) and `app/(public)/players/[id]/page.tsx` (public profile, `revalidate: 300`,
  per-profile `generateMetadata`/OG tags, anonymous credential-free server fetch via new
  `infrastructure/server/public-profile.ts`). Moved the authenticated home feed from `/` to `/home`
  (`constants/paths.ts` is the single source of truth all navigation already derived from, so this
  was a one-line change plus the file move). Updated `robots.ts`/`sitemap.ts` accordingly. Added a
  core shadcn-style `@theme` token set to `index.css` (Tailwind 4 CSS-first, no JS config) — this
  also fixes a real pre-existing bug where `error.tsx`/`global-error.tsx`/`not-found.tsx` referenced
  `bg-background`/`text-foreground`/etc. classes that resolved to nothing because no token set was
  ever defined. Split all 13 route `page.tsx` files (client components calling hooks) into a thin
  Server Component `page.tsx` (exports `metadata`, e.g. distinct browser-tab titles) plus a sibling
  `route-client.tsx` carrying the unchanged client logic — the standard Next.js pattern for giving a
  client-rendered route real metadata. Fixed the pre-existing global "server down" overlay (any
  `/auth/me` 5xx blocked the entire app) to skip the new public routes, since a search crawler or
  first-time visitor must see the marketing page regardless of an unrelated auth-check failure.
  **Not** enabled: ISR/public indexing on any authenticated route — those correctly remain
  dynamic/no-store per the existing security rule (never cache personalized content); "add metadata
  everywhere" was satisfied via titles, not by making private routes cacheable.
- Verified the Events feature (`screens/events-page.tsx`) is 100% hardcoded sample data with no
  backend endpoint (`API_ENDPOINTS` has no `EVENTS` entry) — a public/ISR events page was requested
  but deliberately not built, since it would put fabricated data behind real SEO. Needs the events
  feature connected to a real backend before a public version is meaningful.
- Added backend-issued OTP auto-prefill for login/signup/resend (`OnboardingModal.tsx` +
  `VerifyEmailForm.tsx`), reading `OtpRequestResponse.devCode`/`code` — a field the contract already
  declared for use while no email service is wired up — into the OTP field so testers only need to
  press Confirm. Has no effect once the backend stops returning that field for real email delivery.

- Completed Phase 2 (shared modal primitive), Phase 3 (already-complete architecture foundation
  audit — no gaps found requiring rework), and a scoped slice of Phase 4 (feed/post query and
  mutation hooks layer) from the 9-phase implementation plan. Added
  `apps/web/src/components/ui/modal.tsx` (`Modal`) — the single overlay/Escape/click-outside/focus
  dialog primitive — and migrated `DeleteCareerModal.tsx` and `ImageCropModal.tsx` onto it as proof;
  other existing `.mhn-modal-overlay` call sites migrate opportunistically as they're touched, not in
  one sweeping pass. Added `apps/web/src/hooks/use-post-mutations.ts`
  (`useCreatePostMutation`/`useLikePostMutation`/`useUnlikePostMutation`/`useUpdatePostMutation`/
  `useDeletePostMutation`) and `apps/web/src/hooks/use-feed-query.ts` (`useFeedQuery`,
  `feedQueryKey`) as the `Endpoints → API services → query/mutation hooks → components` tier for
  feed/post actions. Wired `useCreatePostMutation` into `screens/home-page.tsx`'s `handleCreatePost`
  and `useLikePostMutation`/`useUnlikePostMutation`/`useUpdatePostMutation`/`useDeletePostMutation`
  into `FeedPostCard.tsx`'s like, edit, delete, and undo-repost actions, in every case preserving the
  existing optimistic local-state update/rollback and error handling — only the HTTP call itself
  moved into the mutation hook, whose `onSuccess` now also invalidates `QueryKeys.FEED_POSTS`.
  Corrected `home-page.tsx`'s imperative feed fetch to build its cache key via the same exported
  `feedQueryKey(...)` helper `useFeedQuery` uses, instead of an ad hoc string key — this also fixed a
  real pre-existing bug where post-create's `removeQueries`/`invalidateQueryPrefix` calls (targeting
  `QueryKeys.FEED_POSTS`) never actually matched the feed's old string-based cache key, so a
  same-window re-fetch could silently return stale cached results. Declarative `useFeedQuery` itself
  remains unadopted by `home-page.tsx`'s render path (the raw-item → `FeedPostProps` mapping, search
  debounce, and silent-refresh behavior stay on the imperative `fetchFeedPosts`) — the two now share
  one cache identity, so this is a naming/wiring difference, not a functional gap. Confirmed no
  `axios` anywhere in the workspace and only 3 allowlisted raw `fetch()` call sites (BFF proxy route,
  public-profile server read, direct-to-signed-URL media upload) — all other server reads/writes in
  components go through TanStack Query (`useQuery`/`useMutation`) backed by the shared API client.
- Audited Phase 5 (auth/cookies/routing) against its checklist: same-origin BFF proxy, httpOnly
  cookies (JS never reads them), in-memory CSRF, and mobile on React Navigation were already correct.
  `AuthenticatedGuard`/`GuestGuard`/`ParentRoleGuard` already fail closed (render a skeleton, not
  protected content) while `!hasBootstrapped`. Added missing coverage:
  `apps/web/src/components/routing/__tests__/guards.test.tsx` (9 tests) exercises fail-closed
  rendering, the onboarding/home redirects (including a session-expiry-shaped case — bootstrapped but
  no longer authenticated), the `returnTo` query param, and both `ParentRoleGuard` role-detection
  paths. **Confirmed still open, not attempted**: server-side/session-aware route authorization at
  the route or data boundary (documented in `DATA_FETCHING_AND_AUTH.md`'s "Gap" note and the
  Maintainability backlog below) — the backend's session-cookie name isn't part of this codebase's
  contract, so a real server-side check means either a backend-provided introspection endpoint or a
  documented cookie name; guessing one in Next.js Middleware without a live backend to verify against
  risks breaking login for every user, so it was left as the same open item rather than guessed at.
- Audited Phase 6 (post flow and API defects) against its checklist and found it already resolved by
  earlier work plus this pass's Phase 4 wiring, not a fresh gap: `packages/core/src/api/postsApi.ts`
  already coalesces `likePost`/`unlikePost`'s response with `?? { success: true }` (the "returning
  undefined" defect), `normalizeFeedResponse`/`getComments`/`addComment` already tolerate multiple
  backend response shapes, and `packages/api-client/src/index.ts`'s `notifyServerDown` already
  early-returns for every non-GET method with an explicit comment explaining why — a failed
  like/comment/post mutation surfaces as a local toast, never the app-replacing server-down screen.
  Guardian approval for posts/comments/reactions was already fully implemented (see the dedicated
  entry above). This pass's contribution is the last unchecked item: every post mutation now
  invalidates the `QueryKeys.FEED_POSTS` cache on success. The specific runtime defects the plan named
  (500s while liking, 502s on post/profile requests) describe live backend behavior this environment
  cannot reproduce or confirm against — the client-side handling for each is in place and tested, but
  treat backend-side resolution as unverified until checked against a real backend.
- Audited Phase 7 (styling/theme/layout) against its checklist: Tailwind 4 `@theme` tokens, Lucide
  replacing raw SVG (enforced by `pnpm components:check`), separate web/mobile presentation (also
  enforced), and the home page's fixed left/right columns with center-only scroll
  (`lg:overflow-hidden` asides, `lg:overflow-y-auto` center section in `screens/home-page.tsx`) were
  already done. **Not attempted, left as backlog**: reducing `index.css`'s 226 `!important`
  declarations across ~13,970 lines. This is a real, large, purely-visual refactor with no automated
  visual-regression tooling in this repository to verify against — attempting it in this pass would
  trade a big, hard-to-verify diff for a checklist tick, not an actual improvement. A full
  responsiveness/keyboard-nav/accessibility audit is likewise unattempted beyond the form-level a11y
  check already done in Phase 3 and `Modal`'s focus/Escape handling; treat it as Phase 8 (testing)
  scope, not folded into this pass.
- Found and fixed a real, previously-hidden bug while validating Phase 8 against a live dev server:
  `apps/web/.env.local` still had the pre-migration `VITE_API_BASE_URL` variable name — the Next.js
  server (`infrastructure/server/environment.ts`) only reads `API_BASE_URL`, so every backend-proxied
  request has been throwing `Missing API_BASE_URL` in local dev since the Vite migration. Fixed the
  variable name (same backend URL) and added the missing `NEXT_PUBLIC_SITE_URL`.
  `docs/AGENTS.md` — the mandatory pre-implementation reading list — had the same stale variable name
  and is the likely source of the bug; corrected there too, along with two other stale claims in the
  same document (the route-group list was missing `(public)`, and the "only one allowlisted native
  fetch" claim was outdated now that three are allowlisted). Confirmed against the now-reachable
  backend: the guest sign-in form at `/onboarding` renders correctly end to end.
- Completed Phase 8 (testing/quality gates): confirmed `@typescript-eslint/no-explicit-any` and the
  component-reuse checker both already enforce no explicit `any`; security-baseline and
  component-reuse already enforce no hard-coded API origins, no duplicate raw controls, and no
  direct feature-level `fetch()`. Added the two categories of test coverage this checklist still
  needed: `apps/web/src/hooks/__tests__/use-post-mutations.test.tsx` and `use-feed-query.test.tsx`
  (13 tests covering the mutation/query hook layer built in Phase 4 — media-upload orchestration,
  feed-cache invalidation, error surfacing, and `feedQueryKey`'s cache-sharing behavior), and
  Playwright infrastructure: `apps/web/playwright.config.ts`,
  `apps/web/e2e/public.spec.ts` (6 guest-only smoke tests — marketing page, `robots.txt`,
  `sitemap.xml`, 404, onboarding form, guard redirect — verified passing live against both the real
  backend and a fake/unreachable one, and wired into `.github/workflows/ci.yml` after the build step),
  and `apps/web/e2e/authenticated-flow.spec.ts` (the full login → feed → post → like → comment →
  logout journey the plan named, authored and ready but gated behind `E2E_TEST_EMAIL`/
  `E2E_ALLOW_LIVE_WRITES=1` — see `apps/web/e2e/README.md` — since running it writes real data to
  whatever backend it targets and this environment has no dedicated CI test account). Excluded
  `apps/web/e2e/**` from Vitest's own test discovery (`vitest.config.mts`), which had started trying
  to collect Playwright's spec files as unit tests and failing.
- While live-verifying Phase 8, found and fixed two small pre-existing bugs surfaced by the new
  `public.spec.ts` suite and a manual pass: `app/robots.ts` never emitted a `Sitemap:` directive
  (added, pointing at `NEXT_PUBLIC_SITE_URL`/sitemap.xml — a real crawler-discovery gap, not just a
  test nicety), and the public landing page's own `title` metadata repeated "My Hockey Network"
  on top of the root layout's `%s | My Hockey Network` template, rendering a duplicated brand name in
  the browser tab/SERP snippet — every other route's metadata already followed the short-title
  convention the template expects; this was the one outlier. Also fixed a `next/image` aspect-ratio
  console warning on that page's logo (Tailwind's preflight `img { height: auto }` was overriding one
  of the two explicit dimension props; added matching `h-[37px] w-[140px]` utility classes).
- Completed Phase 9 (documentation/release) for the items verifiable from this pass: corrected the
  stale claims in `docs/AGENTS.md` described above, documented the Playwright suite
  (`apps/web/e2e/README.md`), and updated this file and `docs/COMPONENT_CATALOG.md` alongside every
  change rather than after. Confirmed Husky's pre-commit hook already runs its checks through `pnpm`
  and commit-msg already runs commitlint (`.commitlintrc.json` exists; `@commitlint/cli` doesn't need
  `pnpm` to invoke a local script directly with `node`, which is what it does). `pnpm verify` passes
  end-to-end after all of the above (see the updated count directly below).
- Closed the server-side route-authorization open item as far as it can go from this codebase:
  added `apps/web/src/proxy.ts`, Next.js 16's Middleware replacement (`middleware.ts` is deprecated;
  confirmed via the dev-server deprecation warning and the bundled Next.js docs). Deliberately built
  as an *optimistic* cookie-presence check rather than a real backend call, per Next.js's own
  guidance (Proxy runs on every navigation including prefetches). Verified with `curl`: an
  unauthenticated request to `/home` gets an immediate server-side `307` to `/onboarding`, before any
  client code runs; a request carrying any cookie passes through un-redirected, leaving the real
  validity check to `AuthenticatedGuard` as designed. Attempting to fully verify the authenticated
  pass-through path with a live login (`saksham.garg@chicmicstudios.in`, OTP auto-prefill) surfaced a
  backend contract gap, not a frontend defect: `POST /auth/otp/verify` returns bearer tokens with no
  `Set-Cookie`/`csrfToken` even with the correct `X-Client-Type: web` header — see
  `docs/DATA_FETCHING_AND_AUTH.md` for the full reproduction. No web user can complete a real
  cookie-based session against this backend deployment right now; this needs a backend-side fix.
- Investigated Phase 7's CSS `!important`/`index.css` backlog item on request; left as documented
  backlog per explicit direction — no visual-regression tooling exists in this repository to verify a
  226-declaration change safely.
- Implemented the directional guardian relationship flow after re-auditing existing services and
  components: `/profile/guardian-requests` is protected by the new `MinorPlayerGuard` and consumes
  parent-to-child guardian invites; parent-only Supervision consumes child-to-parent guardian
  requests. Both surfaces reuse `GuardianRelationshipRequestCard`, `ApprovalCodeModal`, existing
  feedback primitives, and direction-specific TanStack Query hooks/cache keys. Supervision is now
  hidden from non-parent Header menus. Profile editing is restricted to the authenticated user's own
  profile because the existing `updateAuthProfile` endpoint cannot safely edit a viewed/managed
  child. Stabilized the one-shot `/auth/me` bootstrap using refs and forced the post-OTP `/auth/me`
  request so a completed guest bootstrap cannot suppress login hydration. Added role/guard, query,
  reusable-card, and auth-bootstrap regression tests. Removed the unused `apps/web/src/services`
  facade, which duplicated the already-tested relationship/supervision operations in `packages/core`.
- Removed the unapproved public marketing landing page. `/` now performs a server redirect directly
  to `/onboarding`; `GuestGuard` continues authenticated users to `/home`. Removed the now-unused
  marketing redirect component, removed `/` from crawl/sitemap ownership, and changed Playwright
  smoke coverage to assert the root-to-sign-in flow. Public profiles remain separately available at
  `/players/[id]`.

- Fixed an asymmetric error-handling bug in the guardian-request decline flow, found during a code
  review of the recent guardian/auth implementation pass: `handleDeclineGuardianReq`
  (`screens/profile-page.tsx`) and `handleDeclineCodeSubmit` (`screens/supervision-page.tsx`) caught
  their own errors and never rethrew, while their `handleAcceptGuardianReq`/`handleApproveCodeSubmit`
  counterparts correctly did. Since `ApprovalCodeModal`'s `onSubmit` wrapper unconditionally closes
  the modal after `await`ing the handler, a failed decline (wrong/expired code, network error) closed
  the modal as if it had succeeded — showing a contradictory error toast with no way to retry without
  reopening the flow — while a failed approve correctly kept the modal open with an inline,
  retryable error. Both handlers now rethrow on failure, matching their approve counterparts; the
  fire-and-forget "quick decline" call sites on `GuardianRelationshipRequestCard` (which have no modal
  to keep open) now explicitly `.catch(() => {})` since the toast/notice already fires inside the
  handler before it rethrows.
- Decomposed `screens/profile-page.tsx` (1,750 → 577 lines) and `screens/supervision-page.tsx`
  (1,872 → 231 lines) into focused components and hooks, and converted every remaining
  manually-managed form in the project to React Hook Form + Zod.
  - Profile: `components/features/profile/ProfileHeroCard.tsx`, `ProfileAboutTab.tsx`,
    `ProfileIntroSection.tsx`, `ProfilePersonalDetailsSection.tsx`, `ProfileCareerSection.tsx`,
    `ProfilePostsTab.tsx`, `ProfileMediaTab.tsx`, `ProfileStatsTab.tsx`,
    `ProfileGuardianRequestsTab.tsx`; `hooks/use-profile-image-uploads.ts`,
    `hooks/use-profile-career.ts`.
  - Supervision: `components/features/supervision/SupervisionSidebar.tsx`,
    `SupervisionAddPlayerFlow.tsx`, `SupervisionCreatePlayerDetailsStep.tsx`,
    `CreatePlayerProtectStep.tsx`, `LinkExistingPlayerStep.tsx`, `SupervisionPermissionsTab.tsx`,
    `SupervisionRequestsTab.tsx`, `SupervisionLogsTab.tsx`; `hooks/use-supervision-wards.ts`,
    `hooks/use-supervision-permissions.ts`, `hooks/use-supervision-requests.ts`,
    `hooks/use-supervision-logs.ts`.
  - New Zod schemas in `packages/validation/src/forms.ts`: `profileIntroFormSchema`,
    `profilePersonalDetailsFormSchema`, `careerFormSchema`, `linkPlayerFormSchema`,
    `createPlayerDetailsFormSchema`, `parentOnboardingPlayerDetailsFormSchema` — each wraps the
    exact prior hand-rolled validation rules (via `validateProfileField`/`validateCareerField` or,
    for the two player-details forms, an inline age check) rather than re-deriving new rules, so
    behavior is unchanged even though the state layer moved to RHF.
  - Also converted a 6th manual form discovered only during a final project-wide sweep:
    `components/features/parent/CreatePlayerDetailsStep.tsx` (the separate `ParentOnboardingModal`
    flow's player-details step) — nearly identical in shape to the new
    `SupervisionCreatePlayerDetailsStep.tsx` but with its own stricter 5–100 year age validation,
    which was preserved via a dedicated schema rather than reusing the supervision one. Renamed the
    new supervision component from `CreatePlayerDetailsStep` to
    `SupervisionCreatePlayerDetailsStep` once this pre-existing, differently-located component of
    the same name was found, to avoid two identically-named components in the codebase.
  - Two bugs caught and fixed during this pass: a TypeScript correlated-generics error where a
    plain inline arrow lost the `field`/`value` type correlation `react-hook-form`'s `setValue`
    needs (fixed with an explicitly generic bridge function); and a genuine circular-update bug —
    an initially-added `useEffect` that resynced `formData` back into the form would have reset
    RHF's own state (touched/errors/dirty) on every keystroke, since the parent's `onChange` gives
    it a new object reference each time. Removed once traced, since the step component unmounts/
    remounts per wizard step anyway, so `defaultValues` alone is correct.
  - Project policy applied throughout: hardcoded data stays where no backend endpoint exists yet
    (see the Events/media-gallery entry above), consistently marked with a comment naming the
    missing endpoint.
- Closed the TanStack Query, coverage-boundary, and accessibility-testing backlog items, and
  completed the route inventory:
  - **TanStack Query**: Settings had zero adoption — added `hooks/use-settings.ts`
    (`useBlockedUsersQuery`, `useUnblockUserMutation`, `useNotificationSettingsQuery`,
    `useUpdateNotificationSettingsMutation`) and rewired `screens/settings-page.tsx` onto it. Also
    fixed a real bug found while touching that screen: the General tab's Email/Primary Role fields
    were hardcoded to a garbled placeholder string, not read from `useAuth()`. Profile's remaining
    raw calls: added `hooks/use-update-profile.ts` (`useUpdateProfileMutation`), used with three
    separate instances (Intro/Details/Edit-Profile-modal) so each keeps its own independent
    `isPending` — one shared instance would have made all three sections show "saving" together.
    Wired `useCreatePostMutation` into `profile-page.tsx`'s own create-post flow, which surfaced a
    second real bug: that flow never accepted `CreatePostModal`'s 4th `imageFile` argument, so
    attached post images there were never actually uploaded — only a local `blob:` preview URL was
    ever sent, which the backend cannot resolve. Also converted career create/update/delete
    (`hooks/use-profile-career.ts`) onto `useMutation`. Home's feed-read stays imperative (documented
    reasoning unchanged) and Events/Calendar stay hardcoded (project policy, no backend endpoint).
  - **Coverage boundary**: added `apps/web/src/utils/guardianUtils.ts`, `mediaUtils.ts`, `toast.ts`
    to `vitest.config.mts`'s `include` list, each with new comprehensive tests (44 new tests total).
    Found and fixed a real bug while writing the `mediaUtils.ts` tests: `resolveCoverUrl`'s
    placeholder-path guard did a case-sensitive `.includes('placeholder')` check, so it never
    actually matched the app's real placeholder path (`/userPlaceholder.png`, capital P) — fixed to
    `.toLowerCase().includes(...)`. Overall coverage rose from 92.59% to 93.94% statements.
  - **Accessibility/keyboard testing**: added `components/ui/__tests__/modal.a11y.test.tsx` (10
    tests: ARIA role/name, focus-on-open, Escape-to-close incl. the `closeOnEscape=false` case,
    overlay-click-to-close incl. `closeOnOverlayClick=false`, closed-state safety, listener cleanup
    on unmount) and `components/common/__tests__/OtpCodeInput.a11y.test.tsx` (10 tests: per-digit
    labels, auto-advance, Backspace-to-previous-field, non-digit key rejection, Tab/arrow-key
    passthrough, paste-completion, error-triggered refocus). Not exhaustive across every interactive
    component — these are the two most interaction-critical primitives (dialogs, OTP entry), not full
    site coverage; treat further a11y/keyboard suites as a follow-up, not "done."
  - **Route inventory** (`docs/WEB_SEO_AND_RENDERING_STRATEGY.md`): documented every route's actual
    rendering mode, confirmed from a real `pnpm build:web` output rather than assumed from source —
    this also resolved the "root layout sets noindex as an unconsidered default" backlog item, since
    the blanket default plus `/players/[id]`'s single override turns out to already be the correct,
    now-documented decision for every current route, not a placeholder.
  - **Not attempted** (flagged, not silently skipped): package consolidation (`core`/`shared`/
    `types`/`utils`/`design-system`) is real, monorepo-wide, high-risk work, distinct in kind from
    everything above; centralized error monitoring needs a provider chosen first; the Events backend
    connection and the OTP/cookie backend fix are outside this repo entirely; the mobile Expo SDK
    upgrade and RTK `fetchBaseQuery` removal are real but the RTK piece is not dead code as
    previously assumed — see the correction directly below. The CSS `!important` reduction, listed
    here as deferred in the prior review, was completed in a later pass the same day — see the
    dedicated entry below instead of this line.
- Corrected a prior claim in this document: `apps/mobile/src/redux/store/api.ts`'s RTK
  `fetchBaseQuery` setup was **not** unused/dead code — `screens/ForgotPassword/index.tsx` genuinely
  used `useForgotPasswordMutation` from it. This was resolved in a later pass the same day — see the
  dedicated entry below instead of this line.
- Migrated `apps/mobile/src/screens/ForgotPassword/index.tsx` off RTK Query onto TanStack Query, on
  direct request, then removed the RTK plumbing entirely (`redux/ApiReducer/index.ts` and
  `redux/store/api.ts`, deleted; `redux/store/index.ts` no longer registers an `api` reducer/
  middleware). `login`/`signup` RTK mutations in the same file were confirmed dead (no consumers
  anywhere in `apps/mobile/src`) and removed with it rather than ported, since porting unused code
  serves no purpose. Added `@tanstack/react-query` (`^5.102.4`, matching web's pinned version) as a
  mobile dependency, a `QueryClientProvider` at the `App.tsx` root mirroring
  `apps/web/src/query/query-client.ts`'s retry/staleTime rules
  (`apps/mobile/src/platform/query-client.ts`), and `hooks/use-forgot-password.ts`'s
  `useForgotPasswordMutation` (TanStack, same exported name as the RTK hook it replaces, to keep the
  screen's diff minimal). The forgot-password call itself now goes through the same layered
  `Endpoints -> API services -> hooks -> components` path every other auth call already uses, not a
  one-off: added `API_ENDPOINTS.AUTH.FORGOT_PASSWORD`, `ForgotPasswordDTO`/`ForgotPasswordResponse`
  to `packages/contracts`, a `forgotPassword` method on the shared `AuthService`
  (`packages/auth/src/index.ts`, with a new test), and a `forgotPassword` export from
  `packages/core`'s `authApi.ts` — explicitly documented as mobile-only there and in the `AuthService`
  interface, since web has no password field and never calls it. Verified: `pnpm -r typecheck` and
  `pnpm -r lint:check` pass for both apps, the full shared-package test suite passes (190 tests,
  coverage still above the 80% gate), and `pnpm --filter @my-hockey-network/mobile build:ios` (Metro
  bundling all 1,244 modules via `expo export`) succeeds with no unresolved-import or bundling
  errors. **Not verified**: this machine's Xcode isn't `xcode-select`-configured (needs a `sudo`
  command only the user can run), so the iOS Simulator tool could not attach and the screen was never
  exercised live — the try/catch error-message path in particular (`ApiError` from
  `@my-hockey-network/api-client` vs. the old RTK `normalizeApiError` shape) is covered by static
  typing and the shared-service test, not by an actual failed-request screenshot.
- Reduced `apps/web/src/index.css`'s `!important` usage from 226 declarations to 3, on direct
  request, using a custom static analyzer (no visual-regression tooling exists in this repo, and
  `postcss` is only a transitive/hoisted dependency, not directly resolvable from the workspace per
  `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md` — writing a small from-scratch analyzer avoided adding
  a new dependency for a one-off pass). The analyzer parses the file into rule blocks and classifies
  every `!important` declaration by whether another rule anywhere in the file sets the same property
  for the exact same selector text: 212 were "redundant" (no competing declaration exists at all, so
  `!important` cannot be resolving any in-file conflict). The remaining 14 "duplicate-selector" cases
  were individually read and reasoned about by hand: 11 turned out to be either identical-value
  duplicate rule blocks (e.g. `.mhn-action-count-reposted` was accidentally defined twice, ~9,200
  lines apart, with the same color/font-weight) or legitimate mobile-first `@media` breakpoint
  overrides where normal cascade order already picks the right rule without `!important`
  (`.illustration-panel`/`.guardian-panel`'s `height`/`min-height`/`padding` at the `768px`
  breakpoint) — all 11 were safe to strip. The final 3, all on `.mhn-parent-btn-secondary`
  (`background-color`, `color`, `border`), were **left untouched**: that class is genuinely defined
  three separate times in the file with conflicting values (heights 48px vs. 46px, border widths
  1px vs. 1.5px, font-weights 700 vs. 600), so `!important` there is plausibly load-bearing today;
  fixing it properly means consolidating the three duplicate rule blocks first, not stripping a
  keyword. Verified: `pnpm verify` passes in full (typecheck, lint with zero warnings, all 189
  tests, production build), and the two breakpoint-affecting selectors were visually spot-checked
  before/after at both desktop and mobile viewport widths on `/onboarding` (the only page exercising
  `.illustration-panel`) with no visible difference. Not verified beyond that spot-check: the
  `.guardian-panel`/`.mhn-action-count-reposted`/etc. selectors' rendering on authenticated screens
  this session had no live-login access to re-screenshot; the underlying diff for those is a
  byte-for-byte-equivalent `!important` strip on either identical-value or uniquely-set
  declarations, which is why they were included in the same safe-to-strip class as the visually
  re-verified ones, but that reasoning has not been independently re-confirmed by an actual
  screenshot on those specific screens.
- Connected the Notifications screen to the real `/alerts` backend, on request. The service layer
  (`packages/core/src/api/alertsApi.ts`) and its presentation component (`NotificationCard.tsx`)
  already existed but were completely unwired — confirmed live via `curl` that `/v1/alerts` returns
  `401` (exists, needs auth) while `/v1/events` and `/v1/messages` both `404` (genuinely don't exist
  yet), which is why Notifications was the correct target here and Events/Messaging were not. Added
  `hooks/use-notifications.ts` (`useAlertsQuery`, `useUnreadAlertCountQuery`,
  `useMarkAlertReadMutation`, `useMarkAllAlertsReadMutation`) and wired `screens/notifications-page.tsx`
  to it: loading skeletons, the existing honest empty state for a genuinely empty list, and real
  mark-as-read/mark-all-as-read actions. Added a missing `.mhn-notification-item-unread` background
  CSS rule the pre-existing `NotificationCard` component referenced but nothing had ever defined.
  Extracted a small shared `utils/dateUtils.ts` (`formatRelativeTime`) out of a duplicate local copy
  in `PostCommentSection.tsx` rather than writing a second one, added to the coverage `include` list
  with new tests. Verified: typecheck, lint, component-reuse check, full test suite (203 tests), and
  production build all pass. Not verified: the actual rendered list, since this session still has no
  way to complete a real login (see the backend cookie blocker above) — same limitation as design QA.
- Decomposed 4 of the 5 highest-priority large files against `docs/FRONTEND_DEVELOPMENT_GUIDELINES.md`'s
  100–200-line preference, on request, re-prioritized by actual current line count rather than the
  original (stale) list order — `FeedPostCard.tsx` and `profile-page.tsx` were the real offenders;
  `supervision-page.tsx` was already down to 232 lines from an earlier pass and left alone as
  comparatively low priority:
  - **`FeedPostCard.tsx`** (645 → 183 lines): extracted `hooks/use-feed-post-card.ts` (all like/
    repost/follow/edit/delete mutation state) and four presentational components —
    `PostCardHeader`/`PostCardContent`/`PostCardActions`/`PostEditModal`/`PostDeleteModal`. Public
    `FeedPostProps` unchanged, so its 3 existing consumers needed no changes.
  - **`profile-page.tsx`** (579 → 310 lines): extracted a pure data-transformation hook
    (`use-profile-view-model.ts`, no state/API calls — just the raw-profile-response → display-fields
    derivation), plus `use-profile-about-save.ts` (Intro/Details/Edit-Profile save flows),
    `use-profile-guardian-approval.ts`, and `use-profile-create-post.ts`.
  - **`EditProfileModal.tsx`** (495 → 166 lines): extracted `hooks/use-edit-profile-form.ts` (RHF
    setup, avatar crop/upload, submit) and three form-section components
    (`EditProfileIdentitySection`/`EditProfileAthleticSection`/`EditProfileLocationBioSection`) plus a
    generic `DiscardChangesDialog`. Confirmed `<Form methods={form}>` uses `FormProvider`, so the
    extracted sections' `FormInput`/`FormSelect`/`FormTextarea` fields resolve RHF context without
    threading `form` through props.
  - **`Header.tsx`** (403 → 131 lines): extracted `hooks/use-header-family.ts` (active-user + family-
    switcher data) and three components — `HeaderNavMenu` (also de-duplicated 5 near-identical
    copy-pasted nav buttons into one data-driven loop), `HeaderFamilyMenu`, `HeaderProfileDropdown`.
    Found and removed one genuinely dead function (`handleSwitchUser` — defined, never called, not
    exported) during extraction, same as the earlier `userPosts` removal precedent.
  Verified after each file: typecheck, lint (`--max-warnings=0`), `pnpm check:component-reuse`, full
  test suite, and production build all pass. Not attempted: `supervision-page.tsx` (232 lines, already
  near the guideline).
- Investigated mobile item "connect remaining screens to shared services and TanStack Query" and
  found the actual scope narrower and differently shaped than assumed: `Home/index.tsx` and
  `Profile/index.tsx` are literal pre-feature placeholder screens (a "Hi" label and a demo icon;
  a bare "Profile" heading) with no backend data to connect — building their real content is separate,
  larger work, not a connection task. `Onboarding/index.tsx` is pure local-state role selection with
  no backend call. `Login/index.tsx` and `Signup/index.tsx` already call the shared `mobileAuth`
  service correctly (not disconnected), just imperatively via `useState`/`try-catch` rather than
  `useMutation` — a real modernization, but converting core authentication screens with zero
  simulator/device access to verify against (same Xcode blocker as the `ForgotPassword` migration
  above) is a different risk tier than that one form was, so it was deliberately not attempted blind
  this pass. Left as a corrected, scoped backlog item instead.
- **The backend web session cookie blocker is resolved — the single biggest open item in this
  document all session.** On report that the backend team had shipped a fix, re-verified live rather
  than taking it on faith: `curl` directly against `https://my-hockey-network.onrender.com/v1`
  confirmed `POST /auth/otp/verify` with `X-Client-Type: web` now returns `tokenDelivery: "web"`,
  real `Set-Cookie` headers for `mhn_at`/`mhn_rt` (both `HttpOnly`) and `mhn_csrf`, and `csrfToken` in
  the body — exactly the documented contract. But testing the same flow through this app's own
  same-origin proxy (`localhost:3000/api/backend/...`) still failed: `tokenDelivery: "mobile"`, no
  cookies at all. Root cause was in this repo, not the backend: `apps/web/src/app/api/backend/
  [...path]/route.ts`'s `REQUEST_HEADERS` allowlist — the fixed set of headers the proxy forwards to
  the backend — never included `x-client-type`, so the proxy was silently stripping the one header
  that tells the backend "this is a web client" on every single proxied request, regardless of what
  the backend now correctly supports. Added it to the allowlist and re-verified the full loop through
  the local proxy (`otp/request` → `otp/verify` → `/auth/me`) via `curl`, then completed a real
  browser login end to end for the first time this session.
  - That login surfaced two more real, previously undiscoverable-without-a-live-session bugs, both
    fixed:
    1. **A stale, malformed avatar URL crashed the entire Home page.** The signed-in test account's
       `avatarUrl` was `http://localhost:3000/v1/media/local/avatars/...` — leftover from earlier
       local dev media-storage testing, now just persisted account data. `next.config.js`'s
       `images.remotePatterns` only allows `https://` hosts (a deliberate choice, not loosened), so
       `next/image` threw synchronously at render — before `onError` ever gets a chance to run — and
       took the whole authenticated shell down to a generic "Something went wrong" error boundary.
       Fixed in two layers: `utils/mediaUtils.ts`'s `resolveMediaUrl`/`resolveCoverUrl` now reject any
       non-`https://`, non-local-path URL (new exported `isRenderableImageUrl` helper, tested); and
       `components/ui/fallback-image.tsx` — the shared wrapper nearly every avatar/cover in the app
       renders through — independently re-validates the same way as defense-in-depth, since several
       call sites (`screens/home-page.tsx`'s own header avatar, notably) were passing a raw
       `user.profile.avatarUrl` straight through with only an `||` falsy-check, never actually calling
       `resolveMediaUrl` at all. Fixed `home-page.tsx`'s specific bypass directly too.
    2. **The feed's sort dropdown had two options with the same `value: 'RECENT'`** (`screens/
       home-page.tsx`) — a redundant fake "Sort by" placeholder option colliding with the real
       "Newest First" option. React logged a duplicate-key warning, and the visible symptom was the
       dropdown always displaying "Sort by" instead of "Newest First" even when `RECENT` was the
       active sort (the browser's native `<select>` resolves a duplicate value to the first matching
       `<option>`). Removed the redundant entry.
  - Live-verified (screenshots, not just static checks) for the first time this session: `/home`
    (real feed posts, Matches/Upcoming Events/Invite widgets, dark theme, no console errors), `/network`
    (pending requests, people-you-may-know, all avatars via `i.pravatar.cc` rendering correctly),
    `/messaging` (honest "No Conversations" empty state, confirming that work was genuinely correct),
    `/notifications` (honest "No Notifications" empty state, confirming this pass's own Alerts
    connection works against a real session).
  - **New findings surfaced, not yet fixed** — flagged rather than chased further given the size of
    this pass: `GET /supervision/me/permissions` returns `400` for this (non-parent, `PLAYER`-role)
    test account rather than a clean not-applicable response — doesn't break anything visibly, but
    worth a backend-side look; a `placehold.co`-sourced group/team logo 400s through the Next.js image
    optimizer (gracefully handled by `FallbackImage`, just never loads); the `/notifications` card
    renders with a light background against the rest of the shell's dark theme — a real, visible
    dark-mode styling gap for whoever picks up the design-QA pass now that it's unblocked.
- Live-verified the adult vs. minor signup/onboarding age branching end to end, on request, using the
  now-working session — two full real signups through the browser, not just code reading:
  - **Adult (18+) player**: signed up with DOB giving age 25. Confirmed the form live-computes and
    displays "Age: 25 yrs" as typed. Went straight from OTP verification to `/home` — no guardian
    step, no `RequestSentCard`. `/auth/me` afterward: `isMinor: false`, `accessLevel: "INDEPENDENT"`,
    `guardianship: { required: false, approved: false, guardians: [] }`, correct `dateOfBirth`
    (`2001-08-15T00:00:00.000Z`, matching the entered `15/08/2001`), correct `primaryRole`/
    `roleAssignments`/`displayName`. Matches `OnboardingModal.tsx`'s branching exactly (role
    PLAYER/COACH/STAFF + age ≥ 18 → `finalizeOnboarding()` directly, no guardian step) and
    `packages/core/src/api/signUpRules.ts`'s documented rule.
  - **Minor (under 18) player**: signed up with DOB giving age 15 ("Age: 15 yrs (Under 18)" shown live
    in orange). Correctly routed to the "Guardian Approval Required" screen instead of Home; entering
    a parent email and submitting showed "Request Sent! ... you'll have limited access ... until they
    approve" and landed on Home with a persistent "Your account is waiting for guardian approval —
    Check Approval" banner. `/auth/me` afterward: `isMinor: true`, `accessLevel: "LIMITED"`,
    `guardianship: { required: true, approved: false, pendingRequestId: "<uuid>", pendingRequestSentTo:
    "<the entered parent email>", pendingRequestExpiresAt: "<+24h>" }` — all correctly recorded.
    Traced the actual restriction mechanism: `packages/domain/src/permissions/feedPermissions.ts`'s
    `evaluateFeedPermissions()` returns `allowed: false` (reason `GUARDIAN_APPROVAL_REQUIRED`) whenever
    `guardianship.required && !approved`, and every one of `canCreatePost`/`canLikePost`/`canComment`/
    `canSharePost`/`canRepost`/`canFollowOthers`/`canSendMessages`/`canCreateGroupChats` checks that
    first before its own specific control — so a pending minor is correctly locked out of every
    feed/social write action, not just a subset.
  - **Two real bugs found live-testing this, one fixed, one flagged:**
    1. **Fixed**: `screens/home-page.tsx`'s empty-feed "Create Post" button (`NoDataFound`'s
       `onAction`) called `setIsCreatePostOpen(true)` directly, completely bypassing
       `requirePermission('CREATE_POST')` — while the *identical* action from the left-sidebar
       composer (`ProfileSummaryCard`'s `onPostClick`), on the same page, correctly went through it.
       Live-confirmed: the pending-minor account above could open the full post composer via this one
       button. Fixed by routing it through the same `requirePermission` check; re-verified live — now
       shows the "Your account is waiting for guardian approval" toast instead of opening the modal.
       Audited every other `setIsCreatePostOpen`/`openCreatePostModal` call site
       (`ProfilePostsTab.tsx`'s two triggers, `profile-page.tsx`'s `handleOpenCreatePost`) — all
       already correctly gated; this was the only bypass.
    2. **Flagged, not fixed**: the "Check Approval" CTA the pending-minor banner and toast both point
       to (`ctaAction: 'GUARDIAN_APPROVAL'` → `onNavigate('supervision')` in
       `hooks/use-feed-permissions.ts`) silently does nothing from the minor's perspective — live-
       confirmed via network log that it briefly navigates to `/supervision` and is immediately
       bounced back to `/home` by `components/routing/parent-role-guard.tsx`'s `ParentRoleGuard`,
       which is correctly parent-only for the Supervision *management* page itself. The bug is the
       destination, not the guard: there is currently no page a minor can actually reach to check
       their own pending guardian-request status. Not fixed this pass because the right destination is
       a product decision (e.g. a read-only status view, or just re-fetching `/auth/me` and toasting
       the current state instead of navigating anywhere) rather than an obvious code fix.
- Started the approved sidebar-nav redesign (dark-theme reference screenshots supplied by the user,
  2026-08-27 — full replace of the top `Header` bar app-wide, `/home` first per explicit sequencing,
  then expand outward page by page). This pass:
  - Added `components/common/Sidebar.tsx` — the new left nav (Home, Messaging, Explore, Events,
    Groups, Teams, Notifications, Saved, Profile, Create Post, plus the user chip + reused
    `HeaderProfileDropdown` at the bottom). Reuses `hooks/use-header-family.ts` and
    `stores/shell-ui-store.ts` rather than duplicating that state.
  - Added light-mode default values for the `--color-*` semantic tokens at plain `:root` (previously
    only defined inside `:root[data-theme='dark']`) and built every new class in this pass —
    `.mhn-app-shell`, `.mhn-sidebar*`, `.mhn-feed-scope-tab*`, `.mhn-who-to-follow*` — on those
    tokens rather than literal hex values, specifically to not repeat the "9% dark-mode coverage"
    problem diagnosed earlier the same day (see the dark-theme discussion above the QA entry).
  - Rebuilt `screens/home-page.tsx` to match the mockup: removed the `ProfileSummaryCard` left column
    entirely (its only job — opening the post composer — moved to the sidebar's own "Create Post"
    item); added "For You / Network / Groups" tabs above the feed (Network/Groups show an honest
    "coming soon" `NoDataFound` — no backend connections-only or group-post feed filter exists yet,
    and fabricating one isn't this project's policy); replaced the fabricated-data `MatchesWidget` in
    the right column with a new `WhoToFollowWidget`.
  - Added `hooks/use-who-to-follow.ts` + `WhoToFollowWidget.tsx`, wiring the already-existing (but
    previously only used on `/network`) `getPeopleYouMayKnow` endpoint into a compact 5-person
    sidebar card with an inline Follow action — same pattern as `/network`'s own "People you may
    know", not a new endpoint.
  - Added four new stub routes the sidebar nav needs but that don't have real pages yet — `/explore`,
    `/groups`, `/teams`, `/saved` — each just `Sidebar` + a shared `ComingSoonPage` honest-empty-state
    component, not full pages (those are separate, larger "expand outward" work per the user's own
    sequencing). New `AppRoute` enum members, `paths`, and `ROUTE_MAP` entries for all four.
  - Verified: typecheck, lint (`--max-warnings=0`), `pnpm check:component-reuse` (fixed 3 raw
    `<button>` usages it caught — new code must use the shared `Button` component too, same rule as
    everything else in this codebase), full test suite, and production build all pass. Live-verified
    in the browser with two different real accounts (one restricted/pending, one unrestricted): nav
    highlighting, the dropdown (repositioned to open upward from the bottom-fixed user chip instead
    of downward — `HeaderProfileDropdown` is reused as-is, just the anchor CSS is flipped), all four
    new stub routes, the For You/Network/Groups tabs, and a clean fresh-tab console (zero errors).
  - **Not done this pass** (explicitly deferred, not overlooked): every other authenticated route
    still renders the old top-nav `Header`, not `Sidebar` — Network/Events/Messaging/Notifications/
    Profile/Settings/Supervision all need the same migration in a follow-up pass, per "then expand
    outward". `WhoToFollowWidget`'s populated state was later confirmed live too (see the supervision-
    permission fix entry directly below, same session) — real names, working inline Follow buttons.
- **Fixed a real, in-production bug reported directly by the user**: an 18+ adult `saksham.garg`
  test account was seeing "Your parent did not give permission for this feature" on every like/
  comment/share attempt, and lock icons on all three action buttons, despite having
  `guardianship.required: false` — i.e. no guardian, nothing to be restricted by. Root cause was in
  `contexts/auth-context.tsx`, two related bugs in the supervision-permissions logic:
  1. The effect fetching `GET /supervision/me/permissions` was gated only on `!isParent && !isCoach`
     — its own comment said "ONLY for minor players", but the code never actually checked
     `user.profile?.isMinor`. Every adult `PLAYER`/`STAFF` account fell through to calling an
     endpoint that (correctly, from the backend's perspective) 400s for a non-supervised account —
     this is the same `/supervision/me/permissions` 400 flagged as a live-testing finding earlier the
     same day, now traced to its actual user-facing consequence rather than just "doesn't visibly
     break anything".
  2. `checkSupervisionPermission()` — the function every lock icon and `assertSupervisionPermission`
     toast in the app goes through — failed *closed* (blocked) whenever `supervisionPermissions` was
     null or still loading, for anyone who wasn't Parent or Coach. Since step 1's 400 meant
     `supervisionPermissions` was permanently null for every adult player, every one of them was
     permanently blocked from every supervised action, forever, with no way to recover.
  Fixed both: the fetch now also requires `user.profile?.isMinor`, and `checkSupervisionPermission`
  now treats any non-minor account the same as Parent/Coach — always allowed, no fetch, nothing to
  fail closed against. Live-verified with the actual reporting account: no more 400 to
  `/supervision/me/permissions` (confirmed via network log — the call no longer happens at all), no
  lock icons, and a real Like click went through end to end (0 → 1) with no error toast.
- Confirmed the Figma MCP connection on request (`whoami` → authenticated as `Chicmic UI`,
  `ui@chicmicstudios.in`, with access to ~70 teams including one named "Shunya"). The user's linked
  node (`cqlBXHZtqPkKcLRmR6a1B8`, node `1418:8806`) turned out to resolve to a section called
  "Feedback Final" containing ~90 authenticated-app screens (Home, Messaging, Profile, Events,
  Groups, Teams, ...) — searched every name in it for a Login/Sign-In frame and found none. Confirmed
  directly with the user: there is no Figma source for this screen; it's the app's existing Sign
  In / Verify Email flow, dark-themed rather than pixel-matched from a design file.
- Dark-themed the Sign In and Verify Email (OTP) screens
  (`components/features/auth/login/LoginForm.tsx`, `verify-email/VerifyEmailForm.tsx` — no component
  changes, CSS only), on request. Built entirely on the existing `--color-*` semantic tokens rather
  than new hardcoded hex values, same principle as the sidebar redesign. The illustration panel keeps
  its brand blue (`#0d59cf`) in both themes — that's brand color, not a light/dark surface, and was
  already confirmed unchanged between themes earlier this session.
  - The email input (`.auth-input`) gets three distinct, requested states: empty (default muted
    border), focused (primary-colored ring while typing — live-verified by clicking in), and filled
    (`:not(:placeholder-shown)`, which fires once real text is entered and persists after blur —
    live-verified by typing an email and clicking away: border visibly changes from the empty state's
    color to a stronger neutral, distinct from both empty and focused).
  - Also covered the OTP digit boxes, the "Check your email"/masked-address text, the resend timer,
    the green "code sent" notice card, and the Google/back-link buttons on the Verify Email screen,
    which is the very next step of the same flow — left unstyled, they'd have been white boxes on a
    dark page. The digit boxes intentionally do NOT get a `:not(:placeholder-shown)` filled state:
    `OtpCodeInput.tsx` never sets a `placeholder` attribute on them, so that pseudo-class can't
    distinguish empty from filled there (verified in the component source before relying on it) —
    unlike the emphasized case, that's a lower-severity gap acceptable to skip since each typed digit
    is already visually obvious as a character.
  - Verified live end-to-end: empty → focused → filled screenshots on Sign In, then the real submit
    flow through to a live Verify Email screen (auto-prefilled dev OTP), confirming both screens
    render correctly together, not just in isolation. Clean console. `pnpm verify` passes (typecheck,
    lint, 208 tests, production build — CSS-only change, no component logic touched).
  - **Light theme deliberately left alone**, per explicit instruction — every rule added is scoped to
    `:root[data-theme='dark']`; the existing unscoped (light) rules are untouched.
  - **No static-data file was needed for this specific screen** — the Sign In/Verify Email flow has
    no feed, list, or fabricated content to isolate (its own dev-only OTP auto-prefill was already a
    clearly-commented, separately-flagged temporary behavior in `OnboardingModal.tsx` before this
    pass). Flagging this explicitly rather than silently skipping the instruction: the "keep static
    data in its own removable file" pattern applies to the *next* screen that actually needs
    placeholder content, not retroactively to this one.
- Fixed two sidebar-consistency issues reported by the user:
  1. **Icon misalignment.** `Sidebar.tsx`'s nav items visibly jittered left/right by label length
     ("Home" vs "Notifications") instead of lining up in a clean column. Root cause:
     `buttonVariants` (`components/ui/button.tsx`) applies Tailwind's `justify-center`
     unconditionally as a base class, and `.mhn-sidebar-nav-item` never set its own
     `justify-content`, so nothing overrode it — each full-width button centered its icon+label
     group within its own width, and the centering offset varied per item. Fixed by adding
     `justify-content: flex-start; text-align: left;` to `.mhn-sidebar-nav-item` in `index.css`.
     Verified via `getBoundingClientRect()` on every item's icon (`svgLeft` identical across all 9
     items after the fix, previously varied by up to ~23px) and a visual screenshot.
  2. **Sidebar changing on navigation to Profile (and every other non-Home page).** Only
     `home-page.tsx` had been migrated to the new `Sidebar.tsx` earlier this session; the other 9
     screens still rendered the old `Header.tsx`, which a separate, earlier pass had independently
     CSS-styled into a different, narrower (184px), 5-item vertical nav — so navigating away from
     Home visibly swapped one sidebar design for another. Fixed by migrating the remaining 9 screens
     (`profile-page.tsx`, `my-network-page.tsx`, `events-page.tsx`, `messaging-page.tsx`,
     `notifications-page.tsx`, `settings-page.tsx`, `supervision-page.tsx`, `help-page.tsx`,
     `event-detail-page.tsx`) to the same `<div className="mhn-app-shell"><Sidebar .../><div
     className="mhn-app-content ...">` shell pattern already used by Home, and adding
     `.mhn-notifications-card` (and related) dark-theme coverage that Notifications was still
     missing. `Header.tsx` now has zero remaining usages anywhere in `apps/web/src/screens`
     (confirmed via grep). `components/common/index.ts` was updated to re-export `Sidebar` since
     some screens import shared components via that barrel.
  - Live-verified end-to-end in a fresh login session (`saksham.garg@chicmicstudios.in`): Home →
    Profile → Messaging all render the identical 9-item `Sidebar`, correctly highlighting the active
    tab, with no visual swap and a clean console (no parse errors, no hydration mismatches, no
    `Sidebar is not defined`). Note: mid-verification, a stale Turbopack dev-server cache produced
    misleading "Unexpected token" parse errors on these exact files even though `tsc --noEmit` was
    already clean — a `rm -rf apps/web/.next` + dev-server restart cleared it, and the production
    build (`next build --webpack`) compiled all 22 routes successfully, confirming the files
    themselves were never broken.
  - `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`, `node
    scripts/check-component-reuse.mjs`, and `pnpm --filter @my-hockey-network/web build` all pass.
  - **Not done this pass**: the inner *content* of Settings/Supervision/Events/Messaging/Help/
    Event-Detail still uses light-only `.mhn-*` classes (only their nav shell was swapped to
    `Sidebar` + dark-capable `mhn-app-shell`/`mhn-app-content` wrappers) — same "shell migrated,
    content not yet dark-themed" pattern already noted for Home's siblings earlier in this doc.

- Icon replacement, feed action row, layout spacing, and a signup-illustration
  positioning bug, all on request:
  - **Sidebar icons.** All 9 nav icons plus the "Create Post" and bottom-chip
    "…" icons were lucide-react stand-ins that didn't match the Figma sidebar
    (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8, node 1398:3904, "Navigation").
    Traced the exact path data from that node into new
    `components/icons/SidebarIcons.tsx` (kept, per request, alongside the
    raw source SVGs in `assets/icons/sidebar/` — both under `src/`), inlined
    as `<svg>` with `fill="currentColor"` rather than `<img src>` so hover/
    active states still inherit the sidebar's existing text-color system
    (the same reason `BrandIcons.tsx`'s `GoogleIcon` is inlined, not an
    image). `Sidebar.tsx` now imports these instead of
    `Home/MessageSquare/Search/CalendarCheck2/MessagesSquare/Shield/Bell/
    Bookmark/User/Plus/ChevronDown` from lucide-react.
  - **Feed action icons.** `PostCardActions.tsx` previously rendered only 3
    actions (Like via `ThumbsUp`/`/like.png`, Comment via `/comment.png`,
    and a "Share" button that was actually Repost via `/share.png`) — Figma's
    "Footer of post" component (same file, node 1398:3904) has 5: Like,
    Comment, Repost, a separate Send (external share) icon, and Save
    (bookmark), split into a left group (like/comment/repost) and a right
    group (send/save) with `justify-content: space-between`, not one
    left-aligned row. Traced all 5 into new
    `components/icons/FeedActionIcons.tsx`; rebuilt the footer to match:
    - Like now renders Figma's red (`#ff483d`) circular reaction badge with
      its spark-icon glyph when liked, a neutral outlined circle when not
      (previous behavior used a filled blue lucide `ThumbsUp`).
    - Repost keeps its existing working logic (`handleShare`/`hasReposted`/
      `reposts` — genuinely a repost, despite the old "Share" naming) but
      now uses the correct traced icon instead of `/share.png` + a
      hue-rotate CSS filter hack (`.mhn-repost-icon-filter`, removed —
      no longer needed once the icon is an inlined SVG that takes `color`
      directly).
    - Added the two previously-missing buttons: **Send** (paper-plane, right
      group) shows an honest "not available yet" toast — there is no
      external-share feature built, and the codebase has no post-detail
      route to link to yet; **Save** (bookmark, right group) is a
      client-only optimistic toggle with a toast noting the Saved page
      (`screens/saved-page.tsx`) is itself still a coming-soon stub — there
      is no `savePost`/`SavedPost` endpoint anywhere in `packages/core` to
      wire it to. Both are flagged in code comments as follow-up work once
      those backends exist, same honesty standard as the existing "Network
      feed coming soon" / "Groups feed coming soon" states on this page.
  - Both new icon files needed adding to `scripts/check-component-reuse.mjs`'s
    `allowedCustomSvgFiles` allowlist (the same mechanism `BrandIcons.tsx`
    and `HockeyAnalyticsVisuals.tsx` already use) — inline `<svg>` is
    disallowed outside that allowlist precisely to keep icon usage
    centralized instead of scattered inline SVGs.
  - **Layout spacing.** `.mhn-home-main-layout`'s gutter (sidebar↔feed via
    its own left padding, feed↔right-column via `grid-gap`) was 24px;
    increased to 40px on both axes for closer-to-Figma breathing room,
    proportional rather than pixel-identical since this sidebar is 240px vs
    Figma's 300px reference. Tab labels ("For You"/"Network"/"Groups") were
    already correct and unchanged.
  - **Signup illustration shifting position bug**, confirmed via
    `getBoundingClientRect()` comparison across steps: `.onboarding-modal`'s
    row layout (desktop, ≥768px) used `align-items: center`. The
    illustration panel has a fixed 672px height, but the form side doesn't —
    Sign In's 1-field form fit within that easily, while Sign Up's Create
    Account step (3 fields) is taller, growing the row's cross-axis height
    (720px → 736px at the tested viewport) and re-centering the shorter,
    fixed-height illustration upward by half the difference (8px) relative
    to Sign In. Fixed by changing that rule to `align-items: flex-start`,
    which pins both panes to the same top edge regardless of which step's
    form is taller — verified the illustration's offset from the card's own
    top edge is now identically 24px (the card's padding) on Sign In, Role
    Select, and Create Account, at both a 1100×800 desktop size (where the
    bug reproduced) and mobile width.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`,
    `node scripts/check-component-reuse.mjs`, `pnpm test:run` (208/208), and
    `pnpm --filter @my-hockey-network/web build` all pass. Live-verified in
    a fresh session (`saksham.garg@chicmicstudios.in`): sidebar and feed
    icons render correctly on Home, Save button toggles with the expected
    toast, wider column gutters visible, and the Sign In → Sign Up →
    Create Account illustration no longer shifts.
  - **Not done this pass**: the Explore page's own tab set
    ("Popular"/"Suggested"/"Verified Accounts", node 1495:12242) and its
    "You Might Like" right-column widget were referenced for context but
    not touched — the request's tab/spacing/icon scope was the Home page
    (node 1398:3904); Explore already inherits the sidebar and action-row
    icon fixes since both pages share `Sidebar.tsx`/`PostCardActions.tsx`.

- Follow-up round of fixes on the icon/spacing/feed pass above, all from live
  screenshots the user sent back after trying it:
  - **Sidebar active/inactive icon states.** `Sidebar.tsx` was rendering the
    same Figma-traced (solid/filled) icon regardless of active state — but
    Figma's own sidebar shows the active tab bolder/solid and implies a
    lighter look otherwise (its "Home" example is an explicit `filled`
    variant; the design's own layer is literally named "Container
    (Instagram)", which uses this exact filled-active/outline-inactive
    convention). `NAV_ITEMS` now carries both an `ActiveIcon` (the traced
    Figma icon) and `InactiveIcon` (the original lucide-react outline icon
    for that item, reinstated) and `Sidebar.tsx` picks between them by
    `activeTab === id`. Verified via `svg path` count per item in a live
    DOM check (2 paths = active/filled Home, 1 path = inactive lucide icons)
    rather than by eye.
  - **Post options menu opening at the page's top-right corner instead of
    under the "…" icon.** Same root cause as the sidebar's
    `HeaderProfileDropdown` fix earlier this session: `PostCardHeader.tsx`'s
    wrapper relied on a `.mhn-relative-container` class for positioning
    context that has no CSS definition anywhere, so `.mhn-post-menu-popover`
    (`position: absolute; right: 0; top: 36px`) had no positioned ancestor
    and resolved against the page instead. Added `position: relative` to
    the real wrapper (`.mhn-post-header-actions`) and dropped the dead
    class from the JSX. Live-verified: the Edit/Delete popover now opens
    directly under the icon on the post it was clicked on.
  - **Feed section, several issues from one Figma re-check**
    (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8, node 1398:3904):
    - Removed the "Newest First" sort dropdown — not present in Figma's
      feed at all.
    - Moved the search bar from above the feed tabs (center column) to the
      right column, above "Who to follow" — that's where Figma actually
      places it (its own metadata has the search `Button` node inside the
      right-column container, not the center one), not a design guess.
    - Removed the white/pink pill background `.mhn-action-liked` put behind
      the entire like button, and the forced bold-red override on its
      count — Figma's footer never puts a background behind an action and
      its count text is plain `font-medium` in every state; the red
      circular reaction badge alone is what signals "liked" now. Also
      deleted a second, conflicting definition of the same count classes
      further down the stylesheet (`color: #1860C3` blue vs the nearby
      block's `color: #ef4444` red for the identical `.mhn-action-count-
      liked` selector) — pre-existing duplicate CSS the cascade was
      silently resolving in a way that didn't match either intended color.
  - **"Spacing between the sidebar and the center content is way too
    much."** This was NOT the ~24px grid gutter tweaked in the pass above —
    live DOM measurement found a leftover
    `:root[data-theme='dark'] { padding-left: 184px }` rule (inside an
    entire `@media(min-width:1024px)` block) applied to every page root
    (`.mhn-home-page-root` and 7 others), compensating for the *old*
    `Header.tsx` component once being styled as a fixed-position 184px-wide
    floating sidebar. `Header` has zero remaining usages anywhere in
    `apps/web/src/screens` (fully replaced by `Sidebar.tsx`, a normal flex
    child) — so that compensating padding was stacking on top of
    `Sidebar`'s own real flex-layout space, in dark theme specifically
    (this app's primary/default theme), on every single migrated page, not
    just Home. Removed the entire obsolete block (`.mhn-header*`,
    `.mhn-nav-item*`, the old `.mhn-profile-dropdown` positioning, the
    184px padding, and a stale `.mhn-home-main-layout`/`.mhn-network-main-
    layout`/`.mhn-messaging-main-container` grid override that also
    silently overrode the real light-mode layout with pre-Sidebar values —
    itself a violation of the earlier-agreed "colors only, same UX between
    themes" principle). Live-verified on Home, Profile, and Messaging.
  - **"There is no scroll bar."** The center feed column's independent
    scroll (`overflow-y: auto`, confirmed working via
    `scrollHeight > clientHeight` in a live check) was real, just using the
    browser's thin/near-invisible default scrollbar. Added an explicit
    themed scrollbar (`scrollbar-width: thin` + WebKit
    `::-webkit-scrollbar*`) to `.mhn-layout-col-center` so it's visibly
    there.
  - **Feed footer "looks unstylish" vs Figma's.** Two real, measurable
    mismatches, not just a vague style gap: (1) icon sizes didn't match
    Figma's own spec — the reaction spark inside the red badge was sized at
    11px inside a 16px circle (Figma's is a ~15px spark, nearly filling the
    circle — the badge read as mostly-empty), and the send/save icons were
    17px/18px against Figma's 19px/20px. Resized all three to match. (2)
    the footer's icons and counts inherited the app's general muted
    secondary-text color (`--color-muted-foreground`, a mid gray-blue) in
    dark theme, while Figma's footer icons are near-white — a primary
    action row, not secondary metadata. Gave `.mhn-action-item`/
    `.mhn-action-count` their own dark-theme rule using
    `var(--color-foreground)` instead of pulling the muted one.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`,
    `lint:check`, `node scripts/check-component-reuse.mjs`, `pnpm test:run`
    (208/208), and `pnpm --filter @my-hockey-network/web build` all pass.
    Live re-verified end-to-end after every fix (not just at the end) —
    active/inactive sidebar icons via DOM inspection, the post menu
    position, the removed sort dropdown and relocated search bar, the
    plain-typography like count, the corrected sidebar↔feed gutter on
    Home/Profile/Messaging, the visible scrollbar under a forced-short
    viewport, and the resized/re-colored footer icons.
  - **Not done this pass**: `HeaderSkeleton.tsx` (the old component's
    loading-skeleton, still reachable via `FullAppSkeletonLoader.tsx` during
    brief auth-loading states) still uses the `.mhn-header`/`.mhn-nav-item`
    class names whose desktop dark-theme fixed-184px-sidebar styling was
    just removed as dead code — it now falls back to those classes' base
    (non-dark-specific) rules during that brief flash instead. Low-visibility
    (shown only momentarily while auth resolves) and out of scope for this
    pass; flagging as a known follow-up rather than silently leaving it
    undocumented.

- Fixed the exact follow-up the "Not done this pass" note above predicted the
  user would hit: the route-transition/auth-check loading skeleton
  (`FullAppSkeletonLoader.tsx`, shown by `app/loading.tsx` and all four route
  guards — `guest-guard.tsx`, `authenticated-guard.tsx`,
  `parent-role-guard.tsx`, `minor-player-guard.tsx`) still rendered the OLD
  `HeaderSkeleton` — a horizontal top-bar placeholder modeled on the
  long-removed `Header.tsx` top nav, on a hardcoded light background,
  regardless of theme (screenshot from the user: "skeleton is still working
  on the old as we don't have top bar now"). Replaced it with a new
  `SidebarSkeleton.tsx` that renders through the *real* `.mhn-sidebar`/
  `.mhn-sidebar-nav`/`.mhn-sidebar-footer` classes (logo, 10 nav-row
  placeholders, user-chip placeholder) inside the real `.mhn-app-shell`, so
  it's pixel-matched to the actual `Sidebar.tsx` and swaps in without a
  layout shift; its shimmer uses theme tokens (`--color-secondary`/
  `--color-border`) instead of a hardcoded white-only gradient, so it reads
  correctly in both themes. Deleted `HeaderSkeleton.tsx` and its dead CSS
  outright (confirmed zero other usages first). Also found and fixed the
  same stale-layout pattern one level in: `HomeSkeletonLoader.tsx` still
  rendered a `.mhn-layout-col-left`/`ProfileSummarySkeleton` third column
  left over from the old 3-column Home design — Home's real grid is 2 columns
  now (`.mhn-home-main-layout { grid-template-columns: 1fr 340px }`) — removed
  it so the skeleton has the same 2 columns as the page it's standing in for.
  - While in this file, also fixed a **real, pre-existing hydration
    mismatch** it was directly causing on every route: it read
    `typeof window !== 'undefined' ? window.location.pathname : ''` to pick
    which content skeleton to show, which is `''` during SSR (always
    picking `HomeSkeletonLoader`) but the real pathname on the client —
    disagreeing HTML between server and client hydration on every route but
    Home. Switched to `usePathname()` (`next/navigation`, the pattern
    already used in `authenticated-guard.tsx`), which returns the same value
    in both places; the component now needs (and has) `'use client'`. Note:
    a *separate*, unrelated hydration warning was already present on this
    app before any of today's changes (confirmed via live testing — it did
    not go away after this fix) and is out of scope here; flagging it as a
    known pre-existing issue rather than silently leaving it undiscussed.
  - On the "scroll bar still not removed" half of the same message: could
    not reproduce an unwanted/stray scrollbar on any settled page after
    these fixes at a normal viewport (checked `document.documentElement.
    scrollWidth`/`scrollHeight` against the viewport directly — no
    horizontal or page-level vertical overflow on Home or Profile). The
    center feed column's own intentional scroll (added last pass, see
    above) is working and visibly styled. The old skeleton's un-constrained
    wrapper (`.mhn-app-skeleton-viewport`, now deleted) is the most likely
    source of whatever stray scrollbar was visible in the screenshot, since
    it had no height relationship to the real page at all — the new
    skeleton reuses the exact same `.mhn-app-shell` sizing as the real,
    already scroll-verified pages, so this should be resolved as a
    consequence of the skeleton fix; flagging rather than claiming certainty
    since the exact scrollbar in the screenshot couldn't be isolated and
    reproduced directly.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`,
    `node scripts/check-component-reuse.mjs` (the inline `style={{width}}`
    the first draft used for label-bar widths had to be replaced with three
    discrete `.mhn-sidebar-skeleton-label-{sm,md,lg}` classes to pass this —
    inline style objects are disallowed app-wide), `pnpm test:run`
    (208/208), and `pnpm --filter @my-hockey-network/web build` all pass.
    Live-verified the new sidebar-shaped skeleton on `/profile` and
    `/events` (caught mid-transition), confirming it matches the real
    sidebar's shape/position and settles into the real page with no visible
    shift.

- Wide-monitor layout gap, missing Repost/Quote choice, and skeleton theming,
  all from a follow-up screenshot batch (2026-08-27):
  - **Huge, growing gap between the sidebar and the feed on screens wider
    than a MacBook 14"** ("in figma we have left and right space" — a
    symmetric outer margin, not an internal gap). Root cause: `.mhn-sidebar`
    was a plain flex child docked to the viewport's left edge, while only
    `.mhn-home-main-layout` (feed+right columns) had `margin: 24px auto` —
    centering *itself* within whatever width was left after the sidebar. The
    wider the monitor, the further that centered block drifted from the
    edge-pinned sidebar. Figma's own 3-column block (nav+feed+right) is
    itself centered with equal side margins, sidebar included (its nav
    starts at x=137 of a 1440-wide frame, not x=0). Fixed by capping and
    centering `.mhn-app-shell` itself (`max-width: 1440px; margin: 0 auto`)
    — no breakpoint needed, since `max-width` is inert below 1440px, so a
    MacBook 14" is unaffected. Verified at 1920px: 240px margin on both
    sides, sidebar and feed sitting at a constant gap between them.
  - **Missing Repost/Quote choice.** The repost button previously reposted
    instantly on click. Figma's repost button (node 1766:8766) opens a
    small "Repost" / "Quote" popover first — traced its 2 icons into
    `FeedActionIcons.tsx` and built it as a new popover in
    `PostCardActions.tsx`, backed by new state/handlers in
    `use-feed-post-card.ts` (`isRepostMenuOpen`, `chooseRepost`,
    `chooseQuote`) — clicking the button when *not yet* reposted opens the
    choice; already-reposted still undoes directly with no menu (no
    ambiguity to resolve there). "Repost" reuses the existing, unmodified
    `handleShare` plain-repost/undo flow. "Quote" opens a new
    `QuoteRepostModal.tsx` (modeled on the existing `PostEditModal.tsx`)
    for commentary text, then calls `repostPost(id, { commentary })` — the
    backend already supports this (`RepostDTO.commentary` already existed
    in `packages/core`, unused until now), so this is real, working
    functionality, not a stub. Both paths go through the same
    `requirePermission('SHARE_POSTS')` guardian-approval gate `handleShare`
    already had, plus the existing `assertSupervisionPermission('share_posts',
    ...)` wrapper at the `FeedPostCard.tsx` call site.
    - Found and fixed a real clipping bug while wiring this: the popover
      initially opened downward and was invisible (present in the DOM,
      `aria-expanded="true"`, but never rendered) — `.mhn-feed-post-card`
      clips overflow (needed for its rounded corners around the header
      image), and the repost button sits in the footer, the card's last
      section, so anything opening downward from it immediately extends
      past the card's own bottom edge. Opens upward instead, staying
      within the card's existing content bounds. Live-verified end-to-end
      with a real quote: repost count went 2→3, "Post quoted successfully!"
      toast fired.
  - **Skeleton loaders using hardcoded light-mode colors regardless of
    theme** ("skeleton color should be according to theme... it should
    change according to the theme"). Beyond last pass's sidebar-shaped
    skeleton fix, the *content* skeletons (`HomeSkeletonLoader.tsx`,
    `ProfileSkeletonLoader.tsx`, `NetworkSkeletonLoader.tsx`, and everything
    built from the shared `.mhn-shimmer-box`/`.mhn-skeleton-line`/
    `.mhn-skeleton-avatar` classes) still rendered white cards with a
    light-gray shimmer unconditionally. Two-part fix: (1) added the ~7
    skeleton *card* container classes (`.mhn-post-figma-card`,
    `.mhn-feed-skeleton-card`, `.mhn-profile-skeleton-card`,
    `.mhn-widget-skeleton-card`, `.mhn-profile-skeleton-hero`,
    `.mhn-network-skeleton-card`, `.mhn-skeleton-card`) to the *existing*
    dark-theme card-background override list (the same one `.mhn-feed-post-
    card` etc. already used) rather than inventing a new one; (2) switched
    the 3 *shared* shimmer classes from a hardcoded light-gray gradient to
    one built from `--color-secondary`/`--color-border`/`--color-muted`
    tokens — since virtually every skeleton in the app is built by combining
    one of these 3 shared classes with a size-only modifier class (verified
    this pattern holds via `grep` across every skeleton component before
    relying on it, rather than patching each one individually), this one
    change fixes the shimmer color everywhere at once.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`,
    `node scripts/check-component-reuse.mjs` (the repost-menu backdrop
    needed converting from a raw `<button>` to the project's `Button`
    component to pass this), `pnpm test:run` (208/208), and
    `pnpm --filter @my-hockey-network/web build` all pass. Live-verified at
    1920px width (symmetric margins, measured via `getBoundingClientRect`),
    the Repost/Quote popover opening correctly and a full quote-repost
    round-trip, and the dark-themed skeleton shimmer on page load.

- Removed 3 divider lines the Home layout had that Figma doesn't
  (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8, node 1398:3904 — confirmed by
  re-checking the reference screenshot, sidebar and feed share one
  background with nothing between them there) — flagged directly with
  screenshots, 2026-08-27 ("no lines in the figma, match exactly"):
  - `.mhn-sidebar`'s `border-right` (the line between the sidebar and the
    feed).
  - `.mhn-sidebar-footer`'s `border-top` (the line above the bottom profile
    chip).
  - `.mhn-feed-scope-tabs`'s full-row `border-bottom` — Figma only
    underlines the *active* tab itself (already handled by
    `.mhn-feed-scope-tab-active`), not the whole tab row.
  - The visible, always-on scrollbar thumb added to `.mhn-layout-col-center`
    last pass (to fix "no scroll bar") itself read as a 4th unwanted line
    once actually themed and colored — switched to transparent at rest,
    with the themed thumb appearing only on `:hover` (matches how most
    browsers already behave by default; scrolling itself was never the
    problem, only its constant visual presence).
  - **Search-to-"Who to follow" spacing** ("check spacing between search and
    who to follow"): `.mhn-feed-search-wrapper-standalone`'s own
    `margin-bottom: 16px` was stacking on top of `.mhn-layout-col-right`'s
    flex `gap: 16px`, doubling the real gap to ~32px against Figma's own
    ~21px (search bar bottom at y=92, "Who to follow" card top at y=113 in
    Figma's metadata). Removed the redundant margin so the flex gap alone
    (16px) sets the spacing.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`,
    `node scripts/check-component-reuse.mjs`, `pnpm test:run` (208/208), and
    `pnpm --filter @my-hockey-network/web build` all pass. Live-verified all
    3 borders compute to `0px` and the scroll column still genuinely scrolls
    (`scrollHeight > clientHeight`, `overflow-y: auto` both confirmed via
    `getComputedStyle`) — the fix removed the line, not the scrolling.

## Current quality gates

- Obfuscation/security scan must report zero findings.
- TypeScript and lint must pass for both applications.
- Shared executable code must exceed 80% statements, branches, functions, and lines.
- Production web build must pass.
- Web/native UI ownership and pnpm-only dependency management checks must pass.

Latest measured enforced-code coverage: 94.15% statements, 88.79% branches, 98.14% functions, and
94.48% lines (enforced boundary: `packages/api-client`, `auth`, `domain`, `validation` index files;
`packages/core/src/api/signUpRules.ts`; `apps/web/src/platform/auth-storage.ts`,
`query/query-client.ts`, `utils/guardianUtils.ts`, `utils/mediaUtils.ts`, `utils/toast.ts`,
`utils/dateUtils.ts`). The Vitest suite contains 212 tests across 33 test files, plus 6 Playwright smoke tests
(`apps/web/e2e/public.spec.ts`, run separately via `pnpm test:e2e`, not counted in the Vitest total).
Web form validation, secure storage behavior, query/mutation hook behavior, route-guard
fail-closed/redirect behavior, dialog/OTP-input keyboard and focus behavior, and route/form
integration are represented in addition to shared logic. The latest web, Android, and iOS production
bundle commands pass. `pnpm verify` passes
end-to-end.

## Maintainability backlog

- Migrate the remaining authenticated routes (Network, Events, Messaging, Notifications, Profile,
  Settings, Supervision) from the old top-nav `Header` to the new `Sidebar` component, and rebuild
  each page's own layout to match its dark-theme mockup the way `/home` was this pass — Connections
  (Following/Followers), a richer Events page (Personal/Network/Explore tabs, Yours/Interested/
  Registered/Saved filters), and a Profile page with an Age/DOB/Height/Weight/Position/Shoots stat
  grid were all shown in the reference set but not built yet. `Header.tsx` itself should not be
  deleted until every page has migrated off it.
- Build out the four new stub pages (`/explore`, `/groups`, `/teams`, `/saved`) for real once their
  backend endpoints and full designs exist — they're currently `ComingSoonPage` honest-empty-states
  so the sidebar nav has somewhere to go, not finished features.
- ~~Get the backend to issue an httpOnly session cookie for web requests~~ — **resolved.** Both the
  backend fix and this repo's own proxy header-forwarding bug (see Completed) are confirmed fixed via
  a real live browser login. `docs/DATA_FETCHING_AND_AUTH.md` still describes the old broken state and
  needs a follow-up pass to update once someone has time to rewrite it against the now-working flow.
- ~~Investigate `GET /supervision/me/permissions` returning `400` for a non-parent (`PLAYER`-role)
  account~~ — **resolved.** The frontend now only calls this endpoint for actual minors (see
  Completed); the 400 itself was expected backend behavior for a non-supervised account being asked
  for supervision controls, not a backend bug — the frontend just should never have been asking.
- Fix the `/notifications` card rendering with a light background against the rest of the shell's
  dark theme — found in the same live-testing pass, a real visible dark-mode gap now that
  authenticated screens can actually be inspected. Good first target for the design-QA pass this
  unblocks.
- A `placehold.co`-sourced group/team logo 400s through the Next.js image optimizer (gracefully
  handled by `FallbackImage`'s fallback, just never loads the real image) — found in the same pass,
  low severity.
- `screens/settings-page.tsx`'s blocked-users list renders `blockedUser.teamLogo` (from
  `hooks/use-settings.ts`'s `mapBlockedUser`) without ever calling `resolveMediaUrl` on it — the same
  class of bug as the avatar-URL crash fixed this pass (see Completed), just for team logos instead of
  user avatars, and not yet confirmed to have actually fired in practice. Lower priority since
  `FallbackImage`'s own new validation now covers it defensively either way, but the data layer should
  still be consistent.
- Give a minor pending guardian approval somewhere real to land when they click "Check Approval" —
  today `hooks/use-feed-permissions.ts` sends them to `/supervision`, which `ParentRoleGuard` (correctly)
  bounces straight back to `/home` since Supervision is parent-only management tooling, not a child-
  facing status page. Confirmed live: the CTA currently does nothing visible. Needs a product decision
  on the right destination (a read-only pending-status view, or just re-checking `/auth/me` and
  toasting the current state) before implementing — see Completed for the full trace.
- Expand Playwright beyond the guest-only `public.spec.ts` now running in CI: give
  `authenticated-flow.spec.ts` a CI-owned test account/secret so the full login → feed → post →
  like → comment → logout journey actually runs there instead of only locally on demand.
- Re-pin `eslint` to the latest compatible major once `eslint-config-next` supports it without the
  `scopeManager.addGlobals is not a function` crash seen on ESLint 10.9.1 during this migration pass;
  currently pinned to `^9.30.1` to match the working Admin Panel baseline.
- Consolidate the compatibility packages (`core`, `shared`, `types`, `constants`, `utils`,
  `design-system`) into their target owners per `NEXTJS_MIGRATION_PLAN.md`, incrementally and only
  after each package's import inventory and tests are verified.
- Events, profile media/stats, and messaging currently use explicit empty states where no production
  list endpoint is implemented (`/v1/events` and `/v1/messages` both 404 on the live backend, confirmed
  this pass; `/v1/conversations` returns 401, so a real endpoint likely exists there but has no
  request/response shape documented or typed yet — reverse-engineering it blind was judged out of
  scope for this pass). Connect those screens through the required endpoint → service → TanStack hook
  → component hierarchy when APIs land or are properly typed; do not restore sample production
  records. Do not make Events public/ISR until it is backed by real publishable data. Notifications is
  no longer in this list — connected to the real `/alerts` endpoint this pass, see Completed.
- Consolidate `apps/web/src/index.css`'s three separate `.mhn-parent-btn-secondary` rule blocks
  (currently defined with conflicting `height`/`border`/`font-weight` values across the file) into
  one, so the remaining 3 `!important` declarations that are today resolving that conflict can be
  removed too. Left as-is this pass rather than guessed at, since picking the wrong one of the three
  conflicting definitions would be a real visual regression with no automated way to catch it here.
- Expand UI integration/e2e coverage as stable Figma screens are implemented.
- Migrate Expo SDK 54 to a patched SDK in a dedicated native change, then re-run Android/iOS
  regression tests.
- Live-verify the migrated `apps/mobile/src/screens/ForgotPassword/index.tsx` (TanStack Query,
  formerly RTK) on an actual iOS Simulator — this machine's Xcode isn't `xcode-select`-configured, so
  only static verification (typecheck, lint, tests, `expo export` bundling) was possible this pass.
  Run it once Xcode is configured, and check the failed-request error-message path specifically,
  since that's the one behavior difference between the old RTK error shape and the new `ApiError`
  one that static checks can't fully rule out.
- Decompose `apps/web/src/screens/supervision-page.tsx` (232 lines) — the last of the original
  five large-file targets. Low priority relative to the other four (already decomposed this pass):
  it's only marginally over the 100–200-line guideline, not a real offender.
- Convert `apps/mobile/src/screens/Login/index.tsx` and `Signup/index.tsx` from imperative
  `mobileAuth` calls (`useState` + `try/catch`) to `useMutation`, matching the pattern already used by
  the migrated `ForgotPassword` screen and the whole web app. Both screens already call the correct
  shared service layer today — this is a state-management modernization, not a missing-connection
  fix. Deliberately not attempted without simulator/device access to verify against: these are the
  app's core sign-in/sign-up flows, a materially higher-risk surface to change blind than the
  single-field `ForgotPassword` form was. `Home/index.tsx` and `Profile/index.tsx` are pre-feature
  placeholder screens with no backend data at all (not a connection gap); building their real content
  is separate, larger work and out of scope for a "connect to shared services" item.
