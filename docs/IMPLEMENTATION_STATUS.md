# Implementation status

Last reviewed: 2026-08-31

## Completed

- Migrated `useSupervisionLogs` from a sequential `useEffect`-based fetch to a single `useQuery` call, giving the hook automatic caching, deduplication, and TanStack Query loading states.
- Removed the redundant `getSupervisionControls` fetch from `useSupervisionLogs`; controls are already fetched by `use-supervision-permissions.ts` on ward selection, so the duplicate call and its permission-setter fan-out were deleted entirely.
- Gated the Requests tab skeleton loader behind a real ward-UUID check so the spinner only appears when switching between players, not on the initial tab visit without a selection.
- Refactored permission updating state to track `updatingControlKeys` Record rather than a single string, enabling other switches and dropdowns to remain active and clickable in parallel during toggling.

- Configured loading spinners for PermissionToggleRow switches and dropdown selectors in the Supervision "Permissions" tab when actively saving changes.
- Refactored `SupervisionLogItem` interface schema and logs mapping parser to match the actual backend API payload parameters (`type`, `params`, `actorDisplayName`).
- Enabled the Next page button in the Supervision "Logs" tab dynamically when the backend API returns a `hasMore: true` pagination flag.
- Configured loading skeleton/shimmer indicators for the Supervision Permissions, Requests, and Logs tabs to trigger immediately and clear stale data when switching between children/players.
- Removed mock data from the Supervision "Logs" tab and configured it to load live logs exclusively via the backend API.
- Added hover states to `.mhn-parent-choice-card` that mirror `.mhn-active` styles for visual feedback.
- Centered the player details onboarding form block (`.mhn-parent-step-container`) horizontally inside the wizard panel by setting `margin: 0 auto` and added `32px` top/bottom padding.
- Styled `.mhn-select-input` (used by native FormSelect) to match `.auth-input` height (48px) and left padding (1rem) for form fields alignment, following the native select approach used in the profile stats section.
- Removed mock data from the Supervision "Requested" tab.
- Redesigned the Supervision "Requested" tab (formerly "Requests") from a list of rows to a grid of centered request cards (`.mhn-supervision-req-card`) with custom team logo and location pin assets.
- Constrained the height of `.mhn-supervision-tab-body` (the container for permissions, requests, and logs tabs) using a screen-relative max-height (`calc(100vh - 150px)`) and enabled scrolling.
- Fixed text color and active state for supervision ward listing to work seamlessly in dark and light modes.
- Added vertical scrolling (`overflow-y: auto`) with flex height constraints to the supervision tab contents (Permissions, Requests, Logs).
- Refactored pending guardian invite property from `items` to `invites` to correctly match the updated API response format in both the frontend core client and related UI components.

- Removed the `PendingBanner` duplication. The component itself was already shared, but its _usage_
  was not: all 10 authenticated screens inlined the same `!permissions.allowed &&
permissions.message` guard plus an identical 8-line CTA dispatch — 9 of the 10 blocks byte-for-byte
  identical, with `profile-page` differing on a single line (it opens its edit modal instead of
  navigating to itself). An 11th copy of the same if/else chain lived inside
  `use-feed-permissions.ts`'s toast handler, so the banner and the toast could silently drift on
  where they sent a user for the same reason.
  Added `common/FeedPermissionBanner`, which owns the visibility rule and the CTA routing and calls
  the hook itself, so a screen renders `<FeedPermissionBanner onNavigate={onNavigate} />` and nothing
  else. Profile passes `onCompleteProfile` to keep its in-place behaviour. The dispatch is now one
  exported `resolveFeedPermissionCta(ctaAction, onNavigate)` in the hook module, used by both the
  banner and the toast handler — typed with the domain's `FeedCtaAction` union rather than a loose
  string, which the typecheck caught.
  Eight screens were then calling `useFeedPermissions` purely to feed the banner, so those dead hook
  calls and imports were removed; `home-page` and `profile-page` keep theirs for `requirePermission`.
  Net effect: ~120 lines of duplicated JSX deleted, and the banner's behaviour has one owner.
  Covered by 9 new tests including all three CTA routes and the Profile override.

- Added the missing back control to the parent add-player choice step and extracted the shared
  `common/BackButton`. `AddPlayerChoiceStep` ("How would you like to add them?") was the only
  mid-flow step in the wizard without a way back — every step _after_ it could return _to_ it, so a
  parent who reached it and changed their mind was stranded. Verified against git history that this
  was never present rather than recently removed. The new `onBack` prop is optional and the control
  only renders when the flow supplies one, so the component stays usable at a flow entry point.
  The three existing hand-rolled back buttons now use the shared component too, which closes a real
  drift: `CreatePlayerProtectStep` and `PlayerDetailsFormFields` used `.mhn-parent-btn-secondary`
  while `LinkExistingPlayerStep` used `.mhn-btn-outline`, so the same action rendered as two
  different buttons depending on the step. Covered by 6 new tests.
  Noted but not changed: `features/auth/signup/CreateAccountModal.tsx` declares an `onBack?` prop
  that is never used inside the component and never passed by `OnboardingModal` — dead since the file
  was created. Left alone pending a decision on whether that step should have a back affordance at
  all, rather than silently deleting a prop or wiring a new user-facing control.
- Fixed Team Detail's tab bar (Posts/Members/Events/Media/About) leaving dead space after "About"
  instead of spanning the card's full width (feedback 2026-08-31: "make top bar filled entire width,
  check marked area"). Each tab was `shrink-0` with a `gap-8`, clustering left; switched to `flex-1`
  per tab (matching Figma's own `flex-[193_0_0]` equal-width tab list) so the row fills the card
  edge-to-edge with no side padding, same as the design.

- Fixed Event Detail rendering wider (less left/right gutter) than Team/Group Detail at the same
  window size (feedback 2026-08-31: "make this view port consistent similar to team tab by making
  left and right event spacing like group tab"). It passed `maxWidth={1166}` to `PageShell`, widening
  its own `--page-max-width`/`.mhn-app-content` grid track past the `932px` every other route
  (including Team/Group Detail) renders at — those pages get their own 1166px two-column feel from an
  *inner* `max-w-[1166px]` wrapper that is a no-op ceiling inside the shared 932px shell, not from a
  page-specific `PageShell` override. Removed the override and moved the same `max-w-[1166px]
  mx-auto` convention onto Event Detail's own inner section, so it now matches by construction
  instead of diverging via a one-off width. Confirmed via `--page-max-width` reading `932px` on both
  pages afterward, not just visually.

- Consolidated the repeated "this column is the scrollable region of a fixed-height detail page"
  pattern (`lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain`, hand-typed identically at
  Home/Profile/Event Detail's own call sites) into `.mhn-layout-col-center` itself in `index.css`
  (feedback 2026-08-31: "fix here only [by] adding [a] global factor"). Every consumer now just
  needs the one class name; simplified all three call sites accordingly. Fixed the Teams list's card
  grid redesign and Team Detail's own remaining issues from the same pass — Redesigned the Teams list
  from a plain row list into a card grid matching Groups/Events (feedback: "Make sure team list will
  be similar to card view like we have in groups or events... its not in figma we need to invoate
  this") — no Figma reference exists for this specific view, so the card (banner + centered crest,
  name, member count, a small overlapping roster-avatar preview, View/Join action) is an original
  design consistent with the Group card's information density. Fixed Team Detail's (and Group
  Detail's, same shared pattern) Events tab showing a redundant "Events" heading directly under a tab
  bar that already says Events; removed it and let the search bar fill the row. Fixed Team Detail's
  `WhoToFollowWidget` rendering empty — it never received `fallbackSuggestions` the way Home's own
  usage does, so `useFollowSuggestions` had nothing to fall back to when the real suggestions API
  returned empty (feedback: "who to follow is same compoent than why its not showing data").

- Built the Team Detail page (Figma nodes 1686:8399 hero/Posts, 1696:9258 Members, 1696:10222 Events,
  1884:14732 Media, 1733:21876 About), opened inline from `screens/teams-page.tsx` — same pattern as
  Group Detail (no separate route). `TeamDetailView`/`TeamDetailContent` mirror `GroupDetailView`/
  `GroupDetailContent`'s hero-card-plus-tabs shape: Posts reuses `FeedPostCard`, Events reuses
  `EventCard` in `compact` mode for the horizontal list layout Figma shows, Media reuses the same
  image-grid panel pattern as Group Detail, and the sidebar reuses the existing `WhoToFollowWidget`
  verbatim (Figma's sidebar there is that exact Home widget). Members is a new tab: a searchable
  roster list (avatar, name, position/jersey, per-row Follow) not covered by any existing pattern.
  Team fixtures live in `demo-data/teams`, mirroring `demo-data/groups`'s
  `DemoGroupDetail`/`getDemoGroupDetail` shape (`DemoTeamDetail`/`getDemoTeamDetail`). The Teams list's
  "Posts · Staff · Roster" row sub-links were updated to "Posts · Members · Events" to match the real
  tab set and now open Team Detail directly on that tab.

- Fixed Event Detail's own content being unreachable past one viewport height (bug report
  2026-08-31: "event page details scrolling is not working"). `.mhn-app-content` is `lg:h-dvh
  lg:overflow-hidden` — every route needs its own internal scroll owner inside that, and the
  rebuilt `event-detail-page.tsx` had none, so "About"/"Things to know"/the Organiser &amp;
  Attendant list past the fold were silently clipped and unreachable by any scroll gesture, not
  just visually cut off. Wrapped the page's content in a `mhn-layout-col-center` section with
  `lg:h-full lg:min-h-0 lg:overflow-y-auto` and gave `PageShell` `lg:min-h-0 lg:flex-1`, the same
  pattern Profile/Groups/Events already use. Verified live via `getBoundingClientRect()`/
  `scrollHeight` that `.mhn-app-content` no longer overflows the viewport and the previously
  clipped content now scrolls into view.

- Rebuilt Event Detail from Figma node `1523:15029`, including the exact Heritage Classic artwork,
  responsive action/about/metadata/guest layout, and the searchable Event Organiser & Attendant
  `Dialog` from node `2238:49228`. Rebuilt Group Detail from node `1630:7646` with the supplied
  Figma cover/media assets, Posts as the default tab, the shared `FeedPostCard`/`EventCard`, and
  populated About, People, Events, Media, and Files tabs. Event and group preview content now lives
  in typed `demo-data/events` and `demo-data/groups` facades; the Groups listing consumes the same
  centralized group fixtures. Added fixture-contract and interaction coverage for organizer search,
  follow/action states, shared post reuse, and every group tab.

- Aligned compact Profile dropdowns to Figma node `1725:20736`. Profile Stats previously rendered
  raw native selects, which pinned each browser-owned chevron to the far edge of its control rather
  than centering the selected label and chevron as one unit. The existing shared `Dropdown` now has
  a typed `compact-centered` variant with the Figma 36px height, 14px/20px regular label, 8px
  label-to-chevron gap, and centered composition, reusing the existing Figma-sourced chevron icon.
  Profile Stats' season/team/competition filters and Profile Events' relationship filter all use
  that shared variant; ordinary form dropdowns retain their standard end-aligned affordance. Added
  controlled-interaction and CSS-contract coverage.

- Corrected the shared feed-card author alignment against Figma node `1468:10048`. The shared
  `Button` primitive centers its contents by default, and `PostCardHeader` did not explicitly
  restore left alignment inside the author metadata column; longer role/date subtitles therefore
  made the name appear horizontally centered above them. `.mhn-post-author-group` now overrides
  the button layout with `justify-content: flex-start`/`text-align: left`, while
  `.mhn-author-meta` owns `align-items: flex-start`/`text-align: left` and retains Figma's 8px
  avatar-to-copy inset. Because Home, Explore, Profile, and Saved all render the same
  `FeedPostCard` -> `PostCardHeader` composition, the correction applies to every feed-card surface
  without route-specific copies. Added component and CSS-contract coverage for the shared header.

- Verified `FeedPostCard`/`PostCardHeader` against Figma node 1806:15295 ("Post") and confirmed the
  Header of post spacing (avatar 48px, `pt-12px pl-12px pr-4px pb-8px`), the name/subtitle container
  padding, and the caption/footer 12px-flush inset all already match exactly — measured via live
  `getBoundingClientRect()` on desktop, tablet, and mobile widths, not just a screenshot. Added the one
  real gap the spec called for that was missing: 4px between the author name and its subtitle line
  (`.mhn-author-meta` gained `gap: 4px`) — previously they sat with no breathing room between them.
  Migrated the Saved page off its own hand-rolled, hardcoded post/event card markup (own colors,
  own 40px avatar, own "Remove from Saved" button, no profile-click wiring) onto the same shared
  `FeedPostCard` component Home/Explore/Profile's Posts tab already use, via the existing
  `toFeedPostProps` adapter in `@/demo-data/feed` — Saved is now the last surface to read the single
  shared feed dataset through the shared card component rather than projecting it into a bespoke shape.
  This also gives Saved profile-click navigation and a working "..." menu (Delete/Not interested) as
  the replacement for its old bespoke remove button, for free. `FeedPostCard` is confirmed as the only
  post-card implementation left in the web app outside chat/comment UI, which is a different domain.

- Other-profile popup demo data, Career edit-modal, feed alignment, tab-color theming, and shared
  search widget pass (feature/other_profile). `ProfileMediaTab`/`ProfileStatsTab`/`ProfileEventsTab`
  gained a `showDemoFallback` flag: the real `/profile` page still shows an honest empty state for a
  real other user's unset data, while the other-user profile popup opts in to generic demo filler so
  Connections/Explore previews never look broken. `ProfilePostsTab` now renders a "No Feed Yet" empty
  state instead of nothing when a profile has no posts. Fixed `ProfileCareerSection`'s edit flow: it
  previously reopened the "add new" form at the top of the list; editing an existing entry now opens
  the pre-filled form inline at that team's own position (extracted a shared `renderCareerForm()` to
  deduplicate the add/edit JSX). Reverted an incorrect feed-caption-indent experiment: `.mhn-post-copy`
  and the post footer row are flush at a 12px inset matching the avatar's own left edge (Figma node
  1806:15295) — only the author name sits further right, past the avatar; a prior pass had indented
  the caption to 68px to match the name instead, which was backwards. Migrated the Explore page's two
  hand-rolled, hardcoded post cards onto the shared `FeedPostCard` component (the same one Home's feed
  uses), which fixed a real bug where clicking an author's name in Explore did nothing (no
  `onAuthorClick` wiring existed on the old hand-rolled markup) and made Explore's post alignment
  identical to Home by construction. Introduced shared `--tab-active-text`/`--tab-active-underline`
  CSS variables (Figma node 1806-15281) and applied them across every active-tab implementation (Home
  category tabs, Supervision, Connections, Group Detail, Profile hero tab bar) instead of each tab bar
  hardcoding its own mix of white/off-white text and a dull-blue underline. Consolidated the
  Events/Groups/Teams/Notifications/Saved/Explore page search inputs onto the one shared
  `SearchWidget` component (previously each had its own hand-rolled box with hardcoded colors and a
  12px radius instead of the shared 8px/token-based look).

- Completed the interrupted Settings/Help & Support pass from the supplied Figma/app screenshots.
  Settings now opens on Notification, uses the flat divider-row treatment from the Figma panel, and
  every switch surface (Settings, Supervision, parent/player protection, and the profile-menu theme
  control) uses one accessible `ui/switch` primitive with the same 40×22 blue/white active state and
  gray/white inactive state. Help & Support now keeps search in the compact top bar and uses the
  requested Settings-style two-panel layout: FAQ (filters plus scrolling accordion list), Support
  (the existing RHF/Zod ticket form), and Info (email, operating hours, and legal/guideline cards).
  Added responsive stacking and focused interaction tests for the shared switch and Help navigation.
  A follow-up boundary correction anchors each 18px thumb at an absolute 2px inset inside its 40×22
  track, clips the track defensively, and verifies both states through CSS-contract, controlled-state,
  authenticated-browser geometry, and interaction checks.

- Corrected the Home/Profile feed end-of-scroll clipping reported on 2026-08-29. The authenticated
  content shell remains viewport-fixed, but the shared `mhn-home-main-layout` now owns an explicit
  `minmax(0, 1fr)` desktop row and the center column is the single height-bounded scroll owner with
  bottom breathing room. The last post, its complete media, and action footer can therefore reach
  the visible viewport instead of stopping half-rendered behind the shell boundary. Tablet/mobile
  explicitly return to normal document flow rather than inheriting the desktop nested scroller.

- Implemented the populated Home and Connections designs from Figma nodes `1398:3904`,
  `2176:17096`, and `2176:18260`. Home now has ten centralized JSON posts for each of For You,
  Network, and Groups, with multi-image posts routed through the existing shared carousel. Live For
  You pages remain first and preview records are appended only in `useHomeFeed`; Network and Groups
  no longer stop at placeholder screens. The existing center-column scroll and API infinite-query
  sentinel remain authoritative. Connections now opens its existing real FOLLOW relationship API
  as Following/Followers tabs, renders the Figma four-column responsive card layout, keeps API
  members first, appends centralized connection fixtures, and retains retry visibility if the live
  request fails. Profile follower/following counts now deep-link into this one shared screen with
  the matching tab selected. Added fixture integrity tests covering counts, IDs, tab ownership, and
  multi-image coverage.

- Replaced the authenticated sidebar's mixed icon implementation with the exact selected/unselected
  Figma assets supplied for Home, Network, Events, Messaging, Explore, Notifications, Profile,
  Saved, Dashboard, Associations, Teams, Feed, and Groups. Desktop and mobile menus now share the
  typed `SidebarNavigationIcon` renderer, while route configuration stores only the semantic icon
  name. CSS-mask rendering preserves the supplied SVG geometry while semantic theme colors keep all
  exports visible across light/dark themes. The currently visible nine routes use
  their matching families; the remaining four approved families are ready for their routes without
  introducing duplicate components.
- Matched the shared feed card to Figma nodes `1468:9944`, `1468:9796`, and `1468:9883`: 48px author
  avatar, exact header/copy/footer padding, outlined 36px Follow action, theme-tokenized dark post
  surface and border, and 32px footer actions. Removed the card's obsolete bottom margin and set the
  owning feed/profile stacks to the Figma `1806:15962` 8px inter-card gap, preventing the previous
  margin-plus-gap accumulation. Added navigation asset/state tests. Full `pnpm verify` passes:
  documentation/security/component-reuse gates, web and mobile TypeScript/lint, 289 tests across 42
  files, 95.32% statements / 89.08% branches / 98.14% functions / 95.48% lines, and the production
  Next.js build.

- Rebuilt Profile against the six supplied Figma nodes (`1642:9236`, `1725:17554`, `1725:20538`,
  `2004:20941`, `1733:22397`, and `2176:12730`) after re-reading the current branch and correcting
  the incomplete first pass:
  - The authenticated page now uses the exact shared Home `mhn-home-main-layout`, `RightSidebar`,
    `SearchWidget`, and `WhoToFollowWidget`. The one authoritative desktop grid is 470px content,
    48px gutter, and 300px discovery rail; Home and Profile therefore cannot drift into separate
    right-panel widths or spacing. The existing Home breakpoint and center-only scrolling behavior
    apply unchanged.
  - Fixed the live regression shown in the 2026-08-28 Profile screenshot: the hero was present in
    the DOM but flexbox shrank its outer card to roughly 2px inside the fixed-height scrolling
    column, and `overflow-hidden` clipped the photo, identity data, actions, and tabs. The hero is
    now a non-shrinking 399px section at the desktop reference viewport. The Search and Who-to-follow
    rail uses the same shared components as Home and measures 300px instead of the prior oversized
    Profile-specific track. Also corrected the stylesheet cascade so this discovery rail is hidden
    at the shared `<=1120px` breakpoint as designed; tablet/mobile have no horizontal overflow.
  - `ProfileHeroCard` no longer renders the old cover-banner layout. It uses the Figma 102px avatar,
    real name/count/role values, the 3×2 Age/DOB/Height/Weight/Position/Shoots grid, correct
    Edit-then-Share action order, and Posts/Media/Stats/Events/Career tabs. Missing identity fields,
    including unsupported Height/Weight, resolve from `profiledata.json` rather than inline values.
  - Posts reuse `FeedPostCard`, no longer add the obsolete Posts/Create Post header, and page through
    `getUserPosts({cursor, limit})` using the shared TanStack `useInfiniteListQuery` facade plus an
    IntersectionObserver sentinel. The callback is stable across renders to avoid reconnecting the
    observer unnecessarily.
  - Demo team posts preserve their JSON author role and render the external-author Follow control;
    they no longer inherit the signed-in profile's role/jersey. Post media now uses the shared
    full-width card treatment from the Figma feed instead of accumulating nested component padding.
  - The complete Profile fallback set now lives in `apps/web/src/demo-data/profile/`: profiledata,
    feed, media, stats, events, teams, and people-you-may-know. Its WebP assets were exported from the
    supplied Figma screens into `apps/web/public/demo/profile/`; JSON contains every static display
    record and root-relative asset path. API-backed sections remain API-first and use fixtures only
    for empty/missing display data; demo mutations stay local and cannot hit backend endpoints.
  - Events reuse the existing `EventCard`; its new typed `compact` variant and all colors use the
    semantic theme palette instead of raw hex values. Career reuses
    `ProfileCareerSection`/`use-profile-career`; empty API career lists use `teams.json`, and editing
    or deleting those demo entries is local while real entries retain normal service mutations.
  - Edit Profile now matches the actual `2176:12730` full-field modal (not the earlier, incorrect
    pencil-accordion interpretation). It retains the existing React Hook Form + Zod save path,
    atomic field-level helper errors, avatar crop/upload, cover crop/upload, disabled unsupported
    Height/Weight fields, and one Cancel/Save footer.
  - Added deterministic tests for date/count presentation, birthday-boundary age calculation, and
    centralized profile demo-data integrity. Full `pnpm verify` passes: documentation/security/
    component-reuse gates, TypeScript, ESLint, 286 tests across 41 files, 95.32% statements / 89.08%
    branches / 98.14% functions / 95.48% lines, and the production Next.js build. Live
    authenticated browser QA passed with the existing local session: the profile hero, shared right
    rail, every Profile tab, and the Edit Profile form were exercised in the running app.

- Hoisted the sidebar into `(authenticated)/layout.tsx` so it never unmounts on navigation
  (feedback 2026-08-28: "I don't want mount and remount why we need to do just to show selected
  tab" — a follow-up to the earlier shimmer-only fix, which had explicitly flagged this as the
  larger change it wasn't yet doing). Previously all 15 authenticated screens each rendered their
  own `<LeftSidebar>`/`<AppShell>` instance; Next's `(authenticated)/loading.tsx` Suspense fallback
  swapped in over the _entire_ previous tree on every navigation while the next route rendered, so
  the sidebar really did remount every time a tab was clicked, not just visually flicker.
  - Added `AuthenticatedShell` (`app/(authenticated)/authenticated-shell.tsx`), a client component
    that renders one `<AppShell>` wired via `useAppNavigation()`, wrapped around `{children}` in
    `layout.tsx`. Confirmed every one of the 15 screens' own `handleTabChange` already reduced to
    nothing but `onNavigate(tab)` — `useAppNavigation()` is what every route's own `page.tsx`
    already passed down — so hoisting it needed no per-page behavior changes, just deleting the
    now-redundant local copies (`activeNavTab` state, `handleTabChange` wrappers, the
    `.mhn-app-shell`/`<LeftSidebar>`/`<AppShell>` JSX) from `home-page`, `explore-page`,
    `groups-page`, `saved-page`, `notifications-page`, `teams-page`, `events-page`,
    `messaging-page`, `help-page`, `profile-page`, `settings-page`, `event-detail-page`,
    `my-network-page`, `supervision-page`, and the unused `ComingSoonPage`.
  - **Caught and fixed a real regression from the first attempt**: making `layout.tsx` itself
    `'use client'` (needed for the hooks) silently disabled its own `export const dynamic =
'force-dynamic'` — Next only reads route segment config from Server Components — which flipped
    ~15 routes from server-rendered-on-demand to statically prerendered in the production build.
    Not something this change was meant to touch. Fixed by keeping `layout.tsx` a plain Server
    Component and moving all the client-only logic into `authenticated-shell.tsx`. Confirmed via a
    clean production build: every affected route (`/home`, `/messaging`, `/profile`, `/settings`,
    `/events`, `/explore`, `/groups`, `/supervision`, `/event-detail`, `/help`, `/notifications`,
    `/saved`, `/teams`, `/network`) is `ƒ` (dynamic) again, matching the pre-refactor build exactly.
  - **"Create Post" from the sidebar** used to call each page's own local handler directly; two
    pages (`home-page`, `profile-page`) own genuinely different post-creation flows (different
    mutations, different target lists), so a single shared modal wasn't right. Added
    `createPostRequestId`/`requestCreatePost()` to `shell-ui-store.ts` (a counter, not a boolean, so
    a second click while already open still re-fires) — the hoisted sidebar bumps it, and each page
    that owns a create-post modal watches it via a `useEffect` + `useRef` guard and opens its own
    local modal exactly as before. Verified live: clicking "Create Post" from Profile opens
    Profile's own modal; clicking it from Notifications (no modal there) does nothing, no error.
  - Verified the actual fix live by tagging the sidebar DOM node with a random marker and clicking
    through Home → Messaging → Profile: the marker (i.e. the same React instance) survived every
    navigation instead of getting a fresh one, confirming the sidebar genuinely never remounts now.
  - One accepted, narrow behavior change: `my-network-page`'s `handleTabChange` used to reset its
    internal `currentView` back to the network list specifically when re-clicking "Network" while
    already on that page (e.g. out of a group-detail view) — that per-click reset is gone now that
    the sidebar's click goes straight to `router.push` without passing through the page's own
    handler. Everything else on that page is unaffected.

- Pixel-matched the profile dropdown (`HeaderProfileDropdown.tsx`/`HeaderFamilyMenu.tsx`) against
  Figma node 1418:8871, fetched directly rather than inferred (feedback 2026-08-28, numbered list +
  screenshot). Traced exact values from `get_design_context`/`download_assets`, not guessed:
  - Icon circles (Settings/Supervision/Help/Dark-Theme/Family-header): 26px (16px icon + 5px
    padding), not a fixed 32px — background `#112744`, glyph `var(--color-auth-action)` (`#0b66c2`,
    confirmed the same in both themes already) instead of the generic accent tokens, which read a
    visibly different blue. Found and removed a second, later-in-cascade `:root.dark
.mhn-dropdown-icon-box` rule that was silently winning over the first attempt at this fix.
  - View Profile avatar 32px→26px, family member avatars 28px→26px, family-switch icon frame
    26px→24px, row padding 10px→9px, `.mhn-dropdown-item-left` gap 12px→8px, row text weight
    600→500 (family member names specifically use 400, confirmed from the design's own "Inter:Regular"
    label).
  - Row chevrons (View Profile/Settings/Supervision/Help) were `--color-muted-foreground` (gray);
    Figma's are full white/foreground.
  - Family member rows' right-side icon was a plain `ChevronRight` — Figma uses a distinct circular
    "switch account" glyph. Traced it for real from the exported SVG path data into a new
    `components/icons/DropdownIcons.tsx` (`SwitchAccountIcon`), `#f0f0f0` (this file's own "Stroke"
    design token, confirmed via `get_design_context`'s reported styles).
  - Divider color `var(--color-border)` → exact `#1d2432`.
  - Logout row: icon circle `#322525`, icon+text `#c20b0e` in both themes (confirmed via the
    exported SVG's own `fill`) — was reading the generic, lighter `--color-destructive` token.
  - **Dark Theme row rebuilt to match Figma's actual component**: it was a `Sun`/`Moon`-swapping
    row with a `ChevronRight`, dynamically labeled "Light mode"/"Dark mode" — Figma has a static
    "Dark Theme" label, a fixed moon icon, and a real toggle switch, not a chevron (feedback
    2026-08-28: "Dark theme switch button to change theme and icon"). Reused
    `.mhn-parent-toggle-track`/`.mhn-parent-toggle-thumb` (already in `index.css` from
    `CreatePlayerProtectStep.tsx`, and its own later-cascade override already happened to be
    exactly Figma's spec: 40×22 track, `#0b66c2` on-state, 18px knob) instead of building a new
    toggle component. Changed the row wrapper from `<Button>` to `<div>` since only the switch
    itself is interactive now, not the whole row — also avoids nesting a `<button>` inside one.
  - All verified live via computed styles at every value above, not just visually.

- Stopped the sidebar's loading skeleton from shimmering on route navigation (feedback 2026-08-28:
  "shimmer working on the left tab also... left keep consistent they won't have shimmer"). Root
  cause: `(authenticated)/loading.tsx` — the Suspense fallback Next.js shows for every navigation
  between authenticated routes — renders `FullAppSkeletonLoader`, which includes `SidebarSkeleton`.
  Its placeholder boxes used the same `pulseGlow` shimmer animation as real content skeletons, so
  clicking between Home/Messaging/Profile/etc. briefly showed the _entire_ sidebar shimmering, even
  though its nav labels and icons never actually change between routes. Made
  `.mhn-sidebar-skeleton-box` a static `var(--color-secondary)` fill instead — still the right shape
  for zero layout shift, no longer reads as "reloading." Verified the compiled rule directly (no
  reliable way to catch the sub-second Suspense flash live): `background: var(--color-secondary);
border-radius: 4px;`, no `animation`/gradient.
  - **Note on scope**: this stops the _shimmer motion_ specifically, which is what was reported.
    The sidebar still technically unmounts and remounts on every route change (each page currently
    renders its own `<LeftSidebar>`/`<AppShell>` instance, rather than the App Router's shared
    `(authenticated)/layout.tsx` owning one persistent instance) — the skeleton will still flash in
    briefly, just without animating. Confirmed live that this is a mechanically safe, low-risk
    change; eliminating the flash/remount entirely would mean hoisting the sidebar into the shared
    layout, which touches all 14 authenticated page components' shell-wrapper JSX plus how "Create
    Post" is triggered from the sidebar (currently page-local state on 2 of them) — a much larger
    change, out of scope here unless asked for.

- Follow-up fix to the Home feed tab bar's sticky-scroll pass, from a screenshot showing the
  active-tab underline cutting through the first post's avatar once scrolled (feedback 2026-08-28):
  1. **Underline overlapping the feed** — `HomeTabs.tsx` drew the active indicator as its own
     absolutely-positioned `::after` (`bottom: -9px`), which doesn't contribute to its ancestor's
     layout height — so it rendered outside `.mhn-feed-scope-tabs`'s own (sticky, opaque) box and
     the scrolled feed painted over it. The codebase already had the correct, contained mechanism
     for this sitting unused: `.mhn-feed-scope-tab-active { border-bottom-color: var(--color-primary) }`,
     a real `border-bottom` that's part of the tab's own border-box. Switched `HomeTabs.tsx` to apply
     that class instead of the ad-hoc pseudo-element. Verified live: the active tab's rendered height
     (34px) now exactly matches `.mhn-feed-scope-tabs`'s own height — nothing extends past it.
  2. **Tabs bunched left instead of spread** — after the previous pass removed `justify-between`
     (reasoning it'd space tabs too far apart), direct feedback said the opposite: "For You" should
     sit flush left, "Groups" flush right, "Network" between. Added `justify-content: space-between`
     back to `.mhn-feed-scope-tabs` itself (previously only ever a per-instance Tailwind class).
     Verified live: first tab starts at the row's left edge, last tab ends at its right edge.
  3. **Sidebar profile name not left-aligned** — `.mhn-sidebar-user-name` had no explicit
     `text-align`; the chip renders through `<Button>`, whose base classes include `justify-center`
     (and native `<button>` centers text by default), so the name read as centered in its
     flex-grown space instead of sitting flush after the avatar. Added `text-align: left`. Verified
     live: name starts immediately at avatar-right-edge + the row's 10px gap.

- Fixed four Home-page layout issues from a screenshot with numbered annotations (feedback
  2026-08-28):
  1. **Sidebar profile chip not full-width** — `.mhn-sidebar-user-chip` had no explicit `width`, so
     the `<Button>` shrink-wrapped to its content instead of filling `.mhn-sidebar-footer`. Added
     `width: 100%; box-sizing: border-box;`. Verified live: chip is now 208px, matching the sidebar's
     240px minus its own 16px inner padding on each side (same box every nav item already sits in).
  2. **Feed narrower than the "For You / Network / Groups" tab bar, needed the reverse** — `HomeTabs.tsx`'s
     `CategoryTabs` defaulted its wrapper to `w-[80%] mx-auto`, so the tab row rendered at 80% width
     centered while `<Feed>` below it spanned the full column. Removed the default (now `''`) and the
     `justify-between` that was spreading tabs across that narrowed box — the component's own
     `gap-24px` (`.mhn-feed-scope-tabs`) already sets tab spacing. Verified live: tab row is now
     586px vs. the feed column's 590px (the 4px gap is `.mhn-layout-col-center`'s own `pr-1`
     scrollbar gutter) — effectively equal, as required.
  3. **Full-row horizontal line under the tabs, not in Figma** — same `CategoryTabs` wrapper also had
     a literal `border-b border-[#182740]` in its Tailwind classes, contradicting `.mhn-feed-scope-tabs`'s
     own CSS comment ("No full-row border — Figma only underlines the active tab itself"). Removed
     it; the active-tab underline (a `::after` pseudo-element scoped to just that button) already
     handled the real Figma treatment untouched. Verified live: `border-bottom-width: 0px`.
  4. **Tab bar should stay fixed while the feed scrolls beneath it** — added
     `position: sticky; top: 0; z-index: 5; background: var(--color-background);` to
     `.mhn-feed-scope-tabs`, inside `.mhn-layout-col-center`'s own `overflow-y-auto`. Shared by
     `CategoryTabs`, so Explore and Events (which reuse the same component in their own scrolling
     columns) get the same sticky behavior for free. Verified live: scrolling the feed column 350px
     left the tab bar's `top` at 24px, unmoved.
- Removed a duplicate sidebar implementation, `components/common/Sidebar.tsx`, that 8 screens
  (`messaging-page`, `help-page`, `profile-page`, `settings-page`, `event-detail-page`,
  `supervision-page`, `my-network-page`, `ComingSoonPage`) rendered directly instead of going
  through `components/layout/LeftSidebar.tsx` (feedback 2026-08-28: "why side panel icon is broken
  if we are using same icon and sidepanel... make sure we are using same side bar"). The two had
  drifted: the old one still pointed its logo `<Image>` at `/logo.png`, which doesn't exist in
  `public/` and rendered as a browser broken-image icon on every page that used it; it also
  hardcoded its own `NAV_ITEMS` list (no `additionalRoutes` support) and matched active state
  against a caller-supplied `activeTab` string instead of the real URL. `LeftSidebar` already had
  the same prop shape (`activeTab`, `onTabChange`, `onLogout`, `onCreatePostClick`) and derives the
  active tab from `usePathname()` via the shared `NAVIGATION_ITEMS` config, so every call site was a
  drop-in swap — no prop or behavior changes needed. Removed the export from
  `components/common/index.ts` and deleted the file. Verified live across Home, Messaging, Profile,
  and Settings: one consistent sidebar, correct logo, and the filled Figma icon swapping in only for
  the actual active tab.
- Fixed the branded loader's own broken logo — same root cause as above, `BrandLoader.tsx`'s
  `<Image src="/logo.png">` pointed at a nonexistent asset; switched it to the same
  `/dark/logo.webp` `LeftSidebar.tsx` uses. Also added a diagonal shine sweep across the logo
  (`mix-blend-mode: overlay` so it only highlights the logo's own pixels, not the transparent space
  around it) and changed the progress bar from an indeterminate 40%-wide back-and-forth sweep to an
  eased progressive fill (0% → 92%, decelerating) so it reads as actually loading rather than
  bouncing (feedback 2026-08-28: "remove this broken icon and add logo here and a shiny effect,
  loading progress bar below and make it progressive").
- Fixed the sidebar profile dropdown and the logout confirmation modal both rendering **behind**
  the feed content, plus dropdown width, on the post-merge codebase (feedback 2026-08-28: repeat of
  an earlier-session fix that a `git merge` favoring the incoming branch had reverted). Root cause
  unchanged from the original fix: `.mhn-sidebar { position: sticky; top: 0; }` needs an explicit
  `z-index` since `position: sticky` establishes a local stacking context even at `z-index: auto`,
  which otherwise traps `HeaderProfileDropdown`'s dropdown and `LogoutModal`'s `position: fixed`
  overlay below `.mhn-app-content`. This turn's incoming merge already carried the `z-index: 20` fix
  (independently present in the developer's own commit, word-for-word the same diagnosis), so only
  `.mhn-sidebar-footer .mhn-profile-dropdown`'s width needed correcting again — it had reverted to
  `min(320px, calc(100vw - 32px))` (320px on desktop); restored to `width: 240px; left: -16px;` to
  match the sidebar's actual 240px width exactly.
- Fixed the Home page's 3-column spacing (sidebar / feed / right column) again after the merge
  reverted `.mhn-home-main-layout` to `padding: 0 24px; gap: 32px;` (its own separate history —
  the incoming branch's own feedback trail, not this session's). Figma (`1398:3904`) still gives
  both gaps as 48px; restored `padding: 0 24px 0 38px; gap: 48px;`. Verified live at 1440px: both
  gaps exactly 48px.
- Fixed "Change Email" on the OTP screen again after the merge reverted it to the old bug: dark
  mode grouped `.btn-change-email` into the same muted-foreground rule as `.verify-email-subtitle`/
  `.verify-email-footer`, rendering it gray instead of Figma's white/18px/28px spec. This codebase
  has three separate `.btn-change-email` rule blocks scattered through `index.css` (a pre-existing
  duplication pattern, not introduced this pass) that all had to be brought in line: the base rule,
  a later "Figma onboarding flow" section's rule that was winning in light mode via source order,
  and the dark-mode `:is(...)` grouping. Fixed all three to the exact Figma spec (light: `#6c6c6c`,
  16px/1.4, 0.2px tracking; dark: `var(--color-foreground)`, 18px/28px) and added the `opacity: 0.85`
  hover from the original fix. Verified live: dark mode now renders `rgb(244, 247, 251)` at 18px/28px.
- Added a branded global loader, `apps/web/src/components/common/BrandLoader.tsx` — the MHN logo
  centred with a pulsing glow and an indeterminate progress sweep — and split the app's loading
  states into two clearly separated phases:
  1. **Layout unknown → brand loader.** Before the `/auth/me` bootstrap resolves, the app does not
     know whether the visitor is signed in, so no route-shaped skeleton would be honest. Both
     `AuthenticatedGuard` and `GuestGuard` now render `<BrandLoader fullScreen />` while
     `hasBootstrapped` is false, and a root `app/loading.tsx` does the same for the root transition
     (safe to reintroduce at the root precisely because it is layout-agnostic — the previous root
     loader was the _authenticated shell_, which is why it had to be removed).
  2. **Layout known → route skeleton.** Once the group is known, the existing shimmering skeletons
     take over: `FullAppSkeletonLoader` for authenticated routes, `AuthSkeletonLoader` for `(auth)`,
     `PublicProfileSkeletonLoader` for `(public)`, plus the per-route `profile`/`network` overrides.
     Colours are token-driven so it follows the theme, and a `prefers-reduced-motion` block drops the
     animation while keeping the brand visible rather than removing the loading affordance entirely.
     Covered by 5 new tests (live-region semantics, custom label, empty `alt` so the mark is not
     announced twice, `fullScreen` opt-in, decorative track hidden) plus an updated guard test.

- Fixed onboarding still showing the authenticated app skeleton after the `loading.tsx` split. The
  route-group boundaries were correct, but the shimmer on `/onboarding` was not coming from
  `loading.tsx` at all: `GuestGuard` renders its own fallback while the `/auth/me` bootstrap is in
  flight, and it used `FullAppSkeletonLoader` — the sidebar+feed shell. Since that guard wraps every
  guest route and the bootstrap runs on each load, it was the placeholder users actually saw. It now
  renders `AuthSkeletonLoader`, matching `(auth)/loading.tsx`. Covered by a new regression test
  asserting the guest fallback contains `.onboarding-screen` and **not** `.mhn-app-shell`/
  `.mhn-sidebar`. The other three guards (`AuthenticatedGuard`, `ParentRoleGuard`,
  `MinorPlayerGuard`) correctly keep the app-shell skeleton — they only ever wrap authenticated
  routes, where that shell is what loads next.

- Split the single root `app/loading.tsx` into per-route-group loading boundaries. It rendered
  `FullAppSkeletonLoader` — the _authenticated_ shell — at the app root, so it also covered `(auth)`
  and `(public)`: a signed-out visitor loading `/onboarding` or an indexable `/players/[id]` briefly
  saw a fake logged-in app (sidebar, feed, right rail) before the real centered page replaced it,
  with a visible layout jump. Now `(authenticated)/loading.tsx` owns the app-shell skeleton, and two
  new components cover the others — `AuthSkeletonLoader` (renders through the real
  `.onboarding-screen`/`.onboarding-modal` classes) and `PublicProfileSkeletonLoader` (mirrors that
  page's own cover/avatar/max-w-2xl shell). The root `loading.tsx` was deleted.
  `FullAppSkeletonLoader` also picked its content skeleton by reading `usePathname()`, which forced
  `'use client'` plus a hydration-mismatch workaround — and whose `/my-network` branch **never
  matched**, since the real route is `/network`, so every network load silently fell back to the Home
  skeleton. Those are now per-route `loading.tsx` files (`profile/`, `network/`) composing an
  exported `AppShellSkeleton`; the component is a server component again with no pathname sniffing.
- Fixed the profile dropdown being painted over by the feed. `.mhn-sidebar` is `position: sticky`,
  which creates a stacking context whether or not a `z-index` is set — so the dropdown's own
  `z-index: 1000` only ever competed _inside_ the sidebar and the feed column rendered on top.
  Giving `.mhn-sidebar` `z-index: 20` is what actually lifts it. Also reverted the `overflow-x:
hidden` added to `.mhn-home-main-layout` in the previous pass: it made the grid a clipping context,
  which would cut off any popover anchored inside it. The `minmax(0, 1fr)` + `min-width: 0` fix is
  what stops the horizontal overflow, and it does so without clipping.
- Tokenized the remaining skeleton colors. `.mhn-skeleton-shimmer`/`.animate-pulse` built their
  gradient from hardcoded light slate stops (`#f1f5f9`/`#e2e8f0`), so every shimmer flashed a light
  gradient on the dark shell; it now uses `--color-secondary`/`--color-border`. Two stragglers
  (`.mhn-profile-skeleton-avatar`'s `#FFF` border, `.mhn-perm-skeleton-header`'s `#FAFAFA`) went with
  them.

- Standardised button hover/press states across `index.css`, which were inconsistent in three
  distinct ways:
  - **Redundant press animations.** The `Button` primitive already applies `active:scale-[0.98]` to
    every button, yet five CSS rules added their own `:active` transform at four different depths
    (0.95, 0.96, 0.98, 0.99) — each fighting the global one. All five removed; the six `:active`
    rules that change a press _colour_ (a real effect the primitive does not provide) were kept.
  - **Outlier hover effects.** Four buttons did something no other button did — `transform:
scale(1.05)` (`.mhn-chat-input-action-btn`), `text-decoration: underline` on a button
    (`.mhn-post-more-btn`), and shadow blooms (`.mhn-btn-post`, `.btn-google`). Removed, so every
    button hover is now a colour change only.
  - **Thirteen different hover colours for one state.** 38 hover/active rules hardcoded their own
    value, including seven near-identical dark blues (`#09519b`, `#1452a8`, `#1558a6`, `#0d4fa8`,
    `#0f4c9c`, `#0f4288`, `#073f78`) all meaning "primary button hovered". Added
    `--color-primary-hover`, `--color-primary-active`, and `--color-destructive-hover` (each with a
    dark value) and routed every one through them. **Zero hardcoded colours remain in any button
    hover/active rule.**
- Fixed the Home shell overflowing horizontally, pushing the right sidebar off-screen.
  `.mhn-home-main-layout` was `grid-template-columns: 1fr 340px` with no `min-width: 0` — a grid item
  defaults to `min-width: auto` and refuses to shrink below its content, so a wide feed post forced
  the whole grid wider than the viewport. Now `minmax(0, 1fr) 340px` plus `min-width: 0` on the
  children and `overflow-x: hidden` on the shell, so wide content scrolls or wraps inside its own
  card instead of widening the page. Same root cause as the add-player card overflow fixed earlier.

- Consolidated the parent-flow primary/secondary buttons, which rendered inconsistently across the
  add-player screens. `.mhn-parent-btn-primary` and `.mhn-parent-btn-secondary` were declared in
  **five separate places** in `index.css` with conflicting heights (44/46/48px), font sizes
  (14/15/18px), weights (400/600/700), and colors, resolved only by **four competing `!important`
  blocks** — the long-standing backlog item about this class pair, now closed. All five are replaced
  by one contiguous token-driven definition:
  - Both buttons now share one geometry block (44px, 16px/600), so the pair reads as one control set
    instead of two unrelated buttons. `.mhn-parent-success-actions` still raises them to 48px, which
    is a deliberate per-screen override rather than a conflict.
  - Primary is solid `--color-auth-action` with `--color-primary-hover` (a new token, with a dark
    value) and a `--color-foreground-subtle` disabled state; secondary is its outlined counterpart in
    `--color-auth-action-bright`, with hover and disabled states it previously lacked.
  - **Zero `!important`** remains on either class, and the `:root.dark` override that existed purely
    to out-`!important` the light rules was deleted — the tokens handle both themes.
  - `.mhn-btn-modal-cancel`/`-submit` had been sharing the first of those five blocks; they now own
    their own rules, so changing the parent buttons no longer silently restyles the delete-post,
    delete-career, and supervision modals.
    All four consuming screens (`WhoDoYouManageStep`, `CreatePlayerProtectStep`,
    `PlayerDetailsFormFields`, `PlayerAddedSuccessStep`) use the same pair and now render identically.

- Swept hardcoded colors out of `apps/web/src/index.css` and onto theme tokens: **1,029 literal hex
  values across ~1,000 declarations replaced**, taking the file from 1,467 hex occurrences to 421
  (of which 103 are the token _definitions_ themselves, 17 are gradient/shadow stops deliberately
  left alone, and 1 is a comment) — i.e. live rules went from ~1,370 hardcoded colors to 300.
  Done in three verified passes:
  1. The nine values that were byte-identical to an existing token's definition
     (`#ffffff`→`--color-background`, `#0f172a`→`--color-foreground`, `#e2e8f0`→`--color-border`,
     `#64748b`→`--color-muted-foreground`, `#f1f5f9`→`--color-secondary`, `#1860c3`→`--color-primary`,
     `#0b66c2`→`--color-auth-action`, `#dc2626`→`--color-destructive`, `#eff6ff`→`--color-accent`) —
     803 replacements.
  2. The remaining slate ramp, which had no token, added as six role-named tokens with dark
     overrides (`--color-surface-subtle`, `--color-border-strong`, `--color-foreground-muted`,
     `--color-foreground-subtle`, `--color-foreground-strong`, `--color-neutral-700`) — 226
     replacements.
  3. The destructive-surface and accent/info tint families, likewise added as tokens
     (`--color-destructive-surface{,-strong}`, `--color-destructive-border`,
     `--color-destructive-bright`, `--color-accent-surface`, `--color-info-surface`) — 44
     replacements.
     Each pass was checked by resolving every changed line's tokens back to their light-mode literals
     and diffing against the original: **0 semantic mismatches**, so light mode is provably unchanged
     and the gain is entirely in dark mode. `@theme`/`:root`/`:root.dark` definition blocks were
     excluded programmatically so no token was rewritten to reference itself.
     Also closed a real gap found on the way: `--color-destructive` and `--color-destructive-foreground`
     had **no dark override at all**, so every error message and destructive control (24 usages) kept
     light mode's `#dc2626` against the dark navy shell. Dark now uses `#f87171`/`#450a0a`.
     Gradients and box-shadows were skipped on purpose — their hex often encodes an alpha ramp or a
     deliberate blend rather than a semantic color, and swapping those blind would change appearance.

- Fixed the parent add-player choice card's description overflowing past the card edge. The cause was
  not a missing width constraint: `.mhn-parent-choice-card` is a `common/Button`, and
  `buttonVariants`' base classes include `whitespace-nowrap`, so the text could not wrap at all and
  no `max-width`/`min-width: 0` could help. The card now sets `white-space: normal` (documented in
  `docs/COMPONENT_CATALOG.md` as a trap for any future `Button`-backed content card). Alongside it:
  `min-width: 0` on the flex row and its children (flex items default to `min-width: auto` and refuse
  to shrink below their content), `overflow-wrap: anywhere` on the description so a long unbroken
  string still breaks, and `flex-shrink: 0` on the 40px icon so the text column yields first. Also
  removed the duplicate `.mhn-parent-flex-row-center-16` definition that was dropping the base rule's
  `flex: 1`. Previously only the second card had a `w-full overflow-hidden text-ellipsis` Tailwind
  patch, which truncated rather than wrapped and left the first card unconstrained; the fix is in CSS
  so both cards and `SupervisionAddPlayerFlow`'s copy of the same card all benefit.

- Removed the static color scheme from the parent add-player choice step
  (`AddPlayerChoiceStep.tsx`) and the `.mhn-parent-*` classes behind it. The screen's styling was
  spread across three separate, conflicting definitions of the same classes in `index.css` — the same
  pathology already logged for `.mhn-parent-btn-secondary`. The last block (token-based) was winning
  on cascade order, so every literal hex in the two earlier blocks was already dead code that only
  made the file look like it set those colors:
  - Deleted the dead hex declarations from both earlier blocks, keeping only the structural
    properties (`cursor`, `display`, `align-items`, `justify-content`, `transition`) the token block
    does not set. `.mhn-parent-choice-icon-box` (and its `.mhn-blue`/`.mhn-gray` modifiers) went with
    them — it had no consumer anywhere in the codebase.
  - Tokenized the _base_ `.mhn-parent-card-title`, `-card-sub`, `-card-title-lg`, `-card-sub-sm`,
    `-step-title`, and `-step-desc` rules to `--color-foreground`/`--color-muted-foreground`. These
    are shared well beyond the parent flow, and the dark fix that existed was scoped under
    `.mhn-parent-step-container` — so the help page and the profile career/identity sections, which
    use the same classes outside that container, were still rendering light-mode navy text in dark
    mode. Tokenizing the base rule fixes those too and made the four `:root.dark` overrides
    redundant; they were removed rather than left as no-ops.
  - Replaced the `.mhn-parent-chevron-blue`/`-gray` pair with a single state-driven
    `.mhn-parent-chevron`. The old classes named a _color_ to express selection state, forcing the
    markup to know which literal color a selected card used; selection now drives the color through
    the card's existing `.mhn-active` class. Updated both consumers — `AddPlayerChoiceStep` and
    `SupervisionAddPlayerFlow`, which renders the same card.
    `AddPlayerChoiceStep` itself was also de-duplicated: its two hand-copied card blocks became one
    `ChoiceCard` sub-component driven by an options array, so the two cards cannot drift apart.

- Extracted `VerifyEmailForm`'s inline resend cooldown into two reusable pieces —
  `apps/web/src/hooks/use-countdown.ts` (`useCountdown`/`formatCountdown`) and
  `apps/web/src/components/ui/resend-countdown.tsx` (`ResendCountdown`) — and fixed four defects
  found while doing it:
  - **The timer rebuilt itself on every tick.** The effect listed the current count in its
    dependencies, so each decrement cleared the interval and started a new one (60 teardowns per
    cooldown), re-anchoring each next tick to the moment the effect re-ran and letting the countdown
    run slower than the wall clock. The interval is now created once per run.
  - **A failed resend still imposed a full cooldown.** The old handler reset the counter immediately
    after calling `onResendCode`, regardless of outcome, so a request that errored locked the user
    out for 59 seconds with no new code coming. `OnboardingModal.handleResendCode` (which catches its
    own errors, so awaiting it could not distinguish success) now returns a boolean, and the cooldown
    restarts only on success.
  - **The "code sent" notice outlived its window.** It persisted until the step changed; it is now
    cleared when the cooldown reaches zero via `onCountdownComplete` → `onResendNoticeExpire`.
  - **The notice card hardcoded greens** (`#F0FDF4`/`#86EFAC`/`#166534`, plus a `#22c55e` dark
    block), so it read as off-theme against the dark shell. Added `--color-success`,
    `--color-success-foreground`, `--color-success-surface`, and `--color-success-border` to
    `index.css`'s `@theme` block with `:root.dark` overrides, alongside the existing
    `--color-destructive`; the card now resolves entirely from tokens in both themes.
    Also on the same screen: Confirm is disabled until all six digits are entered (it previously
    submitted into a guaranteed validation failure), the resend notice carries `role="status"` and the
    validation error `role="alert"` so both are announced, and the countdown is a `role="timer"`.
    Covered by 24 new tests across `use-countdown.test.tsx`, `resend-countdown.test.tsx`, and
    `verify-email-form.test.tsx`, including a regression guard asserting 30 seconds of timers consumes
    exactly 30 counts.

- Consolidated four divergent date-of-birth parsers/age calculators into one shared module,
  `packages/validation/src/date.ts` (`parseDob`, `ageFromDate`, `isFutureDate`, `ageFromDob`), built
  on `date-fns` (already a dependency of `apps/web` and the Admin Panel — no new library was added
  to the approved baseline). `forms.ts`'s `ageFromDdMmYyyy` and `parseDisplayDate`/`ageAt`,
  `profileValidation.ts`'s inline `new Date()` check, and `packages/core`'s `calculateAge` all now
  route through it. Three real bugs fixed in the process:
  - **Minimum-age gate off by up to a year.** `validateProfileField`'s DOB branch computed age as
    `today.getFullYear() - dob.getFullYear()` with no birthday adjustment, so a child born
    2021-12-01 validated as 5 years old for all of 2026 and passed the `age < 5` minimum-age check
    while still 4. `date-fns`'s `differenceInYears` handles the boundary. This drove
    `editProfileFormSchema` and `profilePersonalDetailsFormSchema`.
  - **Unenforced date format.** The same branch used bare `new Date(trimmed)`, which accepted
    anything the engine could coerce (`'2010'` → Jan 1 2010, US-order `'05/13/2010'`) and read
    `YYYY-MM-DD` as UTC midnight, skewing the future/age comparisons west of UTC. Parsing is now
    strict per format and rejects calendar overflow (`31/02/2010`) rather than rolling it forward.
  - **Future dates read as age 0.** `differenceInYears` truncates toward zero, so a DOB under a year
    in the future produces `0`, not a negative — meaning the pre-existing `age < 0` guards in
    `parentOnboardingPlayerDetailsFormSchema` and `core`'s `calculateAge` never fired for it, and a
    31/12/2026 birth date surfaced the misleading "Minimum age is 5 years" message. An explicit
    `isFutureDate` check replaces every age-sign test, and `createAccountFormSchema` gained the
    future-date rejection it never had.
    Also fixed `createPostFormSchema`'s share/don't-share email lists splitting on `/[, \n;]+/`, which
    left the `\r` on every entry of a CRLF-pasted list and reported each as an invalid address; the
    pattern is now `/[,\s;]+/`. Covered by 29 new tests in
    `packages/validation/src/__tests__/date.test.ts`. One deliberate behavior change:
    `createAccountFormSchema` previously required strict two-digit `DD/MM/YYYY` and now also accepts
    `D/M/YYYY`, matching what the parent "Add Player" form already accepted — the two forms
    disagreeing on the same field shape was itself part of the inconsistency being removed.

- Matched the first-load left sidebar and center feed skeleton motion to the calmer right-column
  pulse in `apps/web/src/index.css`: the sidebar skeleton now uses `pulseGlow`, and center feed
  skeleton items get the same targeted pulse override as the right rail instead of the faster
  moving `shimmerWave`.
- Refined the parent onboarding `PlayerAddedSuccessStep` UI with a token-based success badge,
  balanced heading/body widths, a stable action stack, and mobile-safe sizing so the completion
  screen sits cleanly inside the Figma onboarding shell.
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
  as an _optimistic_ cookie-presence check rather than a real backend call, per Next.js's own
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
       `requirePermission('CREATE_POST')` — while the _identical_ action from the left-sidebar
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
       which is correctly parent-only for the Supervision _management_ page itself. The bug is the
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
     toast in the app goes through — failed _closed_ (blocked) whenever `supervisionPermissions` was
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
    data in its own removable file" pattern applies to the _next_ screen that actually needs
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
  - **Not done this pass**: the inner _content_ of Settings/Supervision/Events/Messaging/Help/
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
    (`.mhn-home-page-root` and 7 others), compensating for the _old_
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
  `SidebarSkeleton.tsx` that renders through the _real_ `.mhn-sidebar`/
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
    a _separate_, unrelated hydration warning was already present on this
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
    centering _itself_ within whatever width was left after the sidebar. The
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
    `chooseQuote`) — clicking the button when _not yet_ reposted opens the
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
    skeleton fix, the _content_ skeletons (`HomeSkeletonLoader.tsx`,
    `ProfileSkeletonLoader.tsx`, `NetworkSkeletonLoader.tsx`, and everything
    built from the shared `.mhn-shimmer-box`/`.mhn-skeleton-line`/
    `.mhn-skeleton-avatar` classes) still rendered white cards with a
    light-gray shimmer unconditionally. Two-part fix: (1) added the ~7
    skeleton _card_ container classes (`.mhn-post-figma-card`,
    `.mhn-feed-skeleton-card`, `.mhn-profile-skeleton-card`,
    `.mhn-widget-skeleton-card`, `.mhn-profile-skeleton-hero`,
    `.mhn-network-skeleton-card`, `.mhn-skeleton-card`) to the _existing_
    dark-theme card-background override list (the same one `.mhn-feed-post-
card` etc. already used) rather than inventing a new one; (2) switched
    the 3 _shared_ shimmer classes from a hardcoded light-gray gradient to
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
    underlines the _active_ tab itself (already handled by
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

- Code-reviewed the user's own follow-on edits to the Profile rebuild (Agent
  tool unavailable all session — every finder/verify pass done directly per
  the code-review skill's own fallback instructions) and fixed the two
  confirmed bugs: `profile-page.tsx`'s posts-fallback effect showed demo
  posts during the _loading_ state, not just a genuinely-empty response
  (violated `docs/DEMO_DATA_POLICY.md`); `useProfileViewModel`'s
  `followers`/`following` read from a field that exists on neither profile
  DTO, so they silently always resolved to the demo fixture's 1,000,000/268
  regardless of the real value.

- Profile photo editing, three iterations converging on: avatar-only, edited
  from the hero card's own camera badge, no cover photo at all.
  - First added a cover-photo strip to `ProfileHeroCard` (misreading earlier
    feedback) — feedback 2026-08-29 "no cover photo required in user
    profile" reverted it back to avatar-only, and removed the now-dead
    cover-upload code from `useProfileImageUploads`/`useEditProfileForm`
    rather than leaving it unused.
  - Removed the photo/cover section from `EditProfileModal` entirely — both
    photos update immediately from the hero card, not staged inside the
    edit form.
  - Fixed the shared crop dialog (`ImageCropModal`/`.mhn-crop-modal-card`):
    a stray `max-width: 92vw` was overriding `.mhn-modal-card`'s 440px cap,
    so it rendered nearly full-screen everywhere it's used (avatar and,
    when it still existed, cover). Capped at `min(92vw, 400px)`.
  - Added a full-width "Cancel" button below Apply in the crop dialog,
    styled from Figma node `2203:43222` ("Back" button: `#439CF7` outline,
    8px radius, 18px/28px label) — matched the existing
    `--color-auth-action-bright` token exactly.

- Design-token consistency pass (feedback 2026-08-28/29): "each component...
  sharing 8px radius... make this consistent", "buttons are using this
  #0B66C2 color".
  - `--color-primary` held three different blues depending on theme/file
    (`#1860c3` light, `#168bff` dark, plus a duplicate light `:root` block)
    while `--color-auth-action` was already the theme-stable `#0b66c2` used
    across the auth flow. Aligned `--color-primary` (and its light/dark
    duplicates, `--color-ring`, `--color-accent-foreground`) to `#0b66c2`,
    and re-derived `--color-primary-hover`/`-active` via `color-mix()`
    instead of hand-picked hex. Also fixed three buttons with their own
    hardcoded off-brand blues bypassing the token (`.btn-submit`,
    `.mhn-btn-post`, `.mhn-btn-custom-done`).
  - Standardized 131 `border-radius` declarations to 8px across cards,
    panels, buttons, modals, inputs, and dropdowns (structural chrome only,
    per explicit scoping — avatars/dots/genuinely pill-shaped elements
    excluded) — found via a full-file audit
    (`awk`/`python3` selector-tracking script, not spot-checking) that
    classified all ~365 non-circular `border-radius` rules in `index.css`.
  - k/m/b number formatting (`formatCompactNumber` in
    `apps/web/src/helpers/formatters.ts`) applied to follower/following
    counts, feed like/comment/repost counts, comment likes, and group
    member counts; `ProfileHeroCard`'s old `formatProfileCount` is now a
    deprecated re-export of the shared helper.

- Home feed pagination (feedback 2026-08-28/29: "home page feed scroll is
  not working... why working in the profile feed and not home feed"):
  `useHomeFeed` only ever fetched page 1 — `getFeed` already accepted a
  `cursor` but nothing on the frontend used it. Rewired through
  `useInfiniteListQuery` + `useInfiniteScrollSentinel`, the same pair
  `ProfilePostsTab` already used. Also added a plain `scroll`-event
  listener as a second, independent trigger alongside the
  `IntersectionObserver` in `use-infinite-scroll-sentinel.ts` (found via
  live debugging that `requestAnimationFrame`/`IntersectionObserver`
  callbacks don't fire at all while this session's own browser pane is
  backgrounded — the scroll listener doesn't depend on either). As a side
  effect, `FeedService` no longer unconditionally prepends 2 demo posts
  ahead of real ones; the demo fallback now only applies when a resolved
  first page is genuinely empty, matching `docs/DEMO_DATA_POLICY.md`.

- Shared page layout, rebuilt on CSS Grid after three narrower attempts each
  broke something feedback caught (2026-08-28 through 2026-08-30 — full
  history of what failed and why is in the `.mhn-app-shell` comment in
  `index.css`, kept there so the next change doesn't silently re-try a
  dead end):
  1. `flex` shell + `flex: 1` content, each page self-centering via
     `margin: auto` — sidebar position stayed constant across routes, but
     the gap before the sidebar and the gap after the card were unequal
     (only the _outer_ shell margins were symmetric).
  2. `width: fit-content` shell + a fixed 48px gutter — did get the two
     visible gaps equal, but (a) pages with wider content resized the
     whole shell and visibly shifted the sidebar navigating between routes
     ("moving from home to messaging tab... left panel move to left"), and
     (b) a percentage-width descendant doesn't feed its resolved size back
     into an ancestor's `fit-content` calculation, so a page whose actual
     rendered content was narrower than its own `max-width` (Groups' 4-card
     grid, ~823px under a 932px cap) leaked the smaller number into the
     shell and shifted the sidebar yet again, differently, per page. A
     `vw`-based width formula fixed that specific case but still overflowed
     ~74px at a 900px viewport — nested `fit-content` needed its own
     workaround at every level.
  3. **CSS Grid**, no `fit-content` anywhere: `.mhn-app-shell` is one grid,
     `minmax(0,1fr) 240px 48px minmax(0,var(--page-max-width,932px))
minmax(0,1fr)`. The two outer `1fr` columns are equal by definition —
     not something that depends on any content's actual size — so the two
     visible gaps stay equal with no per-page workaround needed.
     `--page-max-width` is set by the one new `PageShell` component
     (`apps/web/src/components/layout/PageShell.tsx`, via
     `useLayoutEffect` on `document.documentElement`) — the single place
     every route configures its content width, replacing 14 pages' worth
     of hand-copied `<main className="... max-w-[Npx] ...">` strings and,
     on 2 pages, a leftover legacy CSS rule with its own conflicting
     `max-width`/`margin` silently winning the cascade over the Tailwind
     class in the JSX. All 14 authenticated routes (Home, Profile, Events,
     Groups incl. its detail view, Teams, Notifications, Saved, Explore,
     Messaging, Settings, Supervision, Help, Event Detail, My Network) now
     render `<PageShell>` and default to Home's own 932px unless a route
     genuinely needs more (Messaging's two-pane chat capped its content
     from 1380px down to 932px to match everyone else instead, per
     feedback — "if required make chat detail component width wise
     smaller"). This also fixed the reload/tab-navigation sidebar flicker
     reported once the migration was mid-way through — every route reading
     the same default leaves nothing to fluctuate.
  - Verified: `pnpm --filter @my-hockey-network/web typecheck`, `lint:check`,
    `node scripts/check-component-reuse.mjs`, `pnpm test:run` (286/286).
    Live-verified via `getBoundingClientRect` on Home/Settings/Messaging/
    Groups/My Network at 2000px (sidebar position and both gaps identical
    across all of them, 48px gutter, no `scrollWidth` overflow) and at
    1200/900/700px (no overflow at any, including the exact width that
    previously overflowed).

- Explore/Home visual consistency and the "standard base area" direction
  (feedback 2026-08-30): Explore's own content capped to 932px to match
  Home exactly (was 1180px); still pending — reshaping Explore's actual
  content (search bar at the top of the feed, "who to know" shifted up) to
  visually mirror Home, not just share its width.

- Debugged "why is feed not scrolling till end" (2026-08-29): root cause was
  CSS, not the pagination code. `.mhn-home-main-layout`'s single implicit
  grid row sized itself to content instead of the viewport (`align-items:
start`, no explicit row height), so `.mhn-layout-col-center`'s `lg:h-full`
  had nothing definite to resolve against and the column's own box grew
  taller than `.mhn-app-content`'s clipped viewport — permanently hiding the
  bottom of the feed, including the infinite-scroll sentinel that triggers
  `fetchNextPage`. Fixed with `grid-template-rows: minmax(0, 1fr)` +
  `align-items: stretch`. Verified live: created 11 real posts, confirmed
  the sentinel became reachable, scrolling fired a real `cursor=...` page-2
  request, and the paginated post rendered.

- Demo/local feed data model reset to match actual product intent
  (2026-08-29): a prior pass in this session had gated the Home feed's demo
  posts to only show when the real feed was empty, treating the always-
  appended demo tail as a demo-data-policy violation — corrected feedback:
  "demo posts were added purposely to show how the feed page will
  look... after getting feed from APIs we will append the local feed." Real
  API posts now always come first (never during loading) with the local set
  always appended after, on both Home (`useHomeFeed.ts`) and Profile > Posts
  (`profile-page.tsx`).
  - New single shared dataset (`apps/web/src/demo-data/feed/` — 30 records:
    10 "mine" + 20 "other", varied across text-only/single-image/multi-
    image/event posts) replaces three previously separate, inconsistent
    fixtures (`home/for-you.json`, `profile/feed.json`,
    `profile/media.json`, all now deleted). `toFeedPostProps`/`toPostItem`
    adapters project the same records into whatever shape each surface
    already expects; `isMine` records get the real signed-in viewer's name/
    avatar stamped on at render time rather than a fixed fake identity.
    Home feed, Profile > Posts, Profile > Media (derives its grid from the
    viewer's own posts' images), and Saved (filters the 8 records flagged
    `isSaved` out of the 20 "other") all read this one dataset now — "single
    data base will be used in multiple locations."
  - Event-kind posts got a "Register"/"Registered" CTA next to the event
    date banner (`PostMedia.tsx`) — local toggle + toast, no registration
    backend exists yet, same pattern already used for the demo Save button.
  - Verified live: 30 demo posts render after real ones on Home; "mine"
    posts show the real signed-in profile's name; Profile > Media shows
    exactly the images from the 10 "mine" posts; Saved shows exactly the 8
    `isSaved` records (7 posts + 1 event). `typecheck`/`lint:check`/
    `test:run` (295/295) all pass; `profile-presentation.test.tsx` and
    `demo-data.test.ts` updated for the new dataset shape/size.

- Right rail (discovery column — Search/Who to Follow/Upcoming Events/
  Invite & Earn) scroll clipping (2026-08-29): `.mhn-layout-col-right` had
  `height: auto; overflow: visible`, no scroll mechanism of its own, so
  whatever fell below `.mhn-app-content`'s clipped viewport (usually the
  Invite & Earn card) was permanently unreachable. Fixed with `max-height:
100%; overflow-y: auto` (keeps `align-self: start` so it still doesn't
  stretch to match the feed's height). Also needed `min-height: 0` — grid
  items default to `min-height: auto` (their content's max-content size),
  which forced the shared `minmax(0, 1fr)` row to grow to fit this column's
  full content, defeating `.mhn-layout-col-center`'s own clipping too, the
  same failure mode `min-h-0` already prevents there. (A ~15,500px "both
  columns collapsed to full content height" reading seen mid-investigation
  turned out to be the _test_ browser's viewport having collapsed to 0×0
  after a dev-server restart, tripping the `max-width: 1023px` mobile
  layout — not a real regression; see the comment on `.mhn-layout-col-right`
  for the dead end so it isn't rediscovered.)

- Messaging layout (2026-08-29): three fixes.
  - Chat list column narrowed 340px → 280px (gap 24px → 20px) to give the
    conversation pane more room (~568px → ~632px) — total width unchanged
    at 932px — "message details section looks compact... decrease the
    width of message group... increase [conversation pane] width, keep
    entire viewport same."
  - "message details page height is more than others going below the
    screen": `.mhn-messaging-page-root` was the one page wrapper not
    participating in `.mhn-app-content`'s flex column (`min-height: 100vh`
    instead of `flex: 1 1 auto; min-height: 0`), and `.mhn-chat-sidebar-
card`/`.mhn-chat-conversation-card`/`.mhn-chat-messages-stream` used
    guessed fixed pixel heights (640px/620px) instead of filling the actual
    available space. Replaced with the same `flex`/`min-height: 0`/
    `grid-template-rows: minmax(0, 1fr)` + `align-items: stretch` pattern
    Home's feed needed. Header and input footer now stay fixed
    (`flex-shrink: 0`); only the message stream and the chat list itself
    scroll.
  - `ChatItem.canMessage` (default `true`) — when `false`, `ChatConversation`
    replaces the composer with a "Only admin can message in this group"
    notice instead of a normal input, for chats where the viewer isn't
    allowed to post — "where we don't have permission show only admin can
    message." Demo data marks the 187-person "Hockey Club" group this way.
  - Verified live: conversation card bottom now sits inside the viewport
    (696px vs. 720px window), message stream scrolls independently of the
    fixed header/footer, sending a message in an allowed chat still works
    end-to-end, and the restricted group shows the lock notice instead of
    an input.

- Local-first profile photo, a new Connections nav destination, the
  Invite & Grow widget's real crop/scroll bugs, and a scroll-to-slide
  carousel (2026-08-30):
  - **Profile photo local cache** — the real upload endpoint isn't working
    right now, so `@/services/profile-photo.service.ts`'s
    `saveProfilePhotoDummy` stands in for it (swap its body for the real
    `uploadMediaFile`/`updateAuthProfile` call later, same return shape,
    same call site). The cropped photo is cached in `localStorage`
    (`@/utils/local-avatar-storage.ts`, keyed per profile id) as soon as
    that dummy call succeeds, and **every** avatar render in the app reads
    from that cache in preference to the backend's `avatarUrl` — patched
    once at `auth-context.tsx`'s `updateUser` (covers the sidebar, Home
    feed's own-post identity) and once in `use-profile-view-model.ts`'s
    `liveAvatar` (the Profile page's own separate `getProfile()` fetch
    doesn't go through `auth-context`). This stays in place permanently,
    not just until the real API works — see `docs/DEMO_DATA_POLICY.md`'s
    new "Not demo data" section. Along the way, `resolveMediaUrl`'s
    https-only URL guard (added earlier this session) was blocking
    `data:image/...` URLs entirely, silently falling back to the
    placeholder — extended to allow them, since Next's `<Image>` renders
    data URLs unoptimized and never hits the `remotePatterns` check that
    guard exists for.
  - **Connections page** — `ConnectionsView` existed (`GroupsView`-style
    tabs/search/grid) but was only reachable buried inside My Network's
    menu. Added a dedicated `/connections` route + sidebar nav item (the
    `network` icon assets already existed, unused, in
    `SidebarNavigationIcon.tsx`/`index.css` — never wired into
    `NAVIGATION_ITEMS`) rendering just `ConnectionsView` with no extra
    left-column card, matching Figma node 2176:17096 exactly. Profile's
    followers/following clicks now land here instead of
    `/network?view=connections`.
  - **Invite & Grow real bugs, not just styling** — feedback was "I asked
    you add scrolling but no added so not able to see tha section": the
    scroll `max-height`/`overflow-y` fix from the right-rail work above
    _was_ in place, but `.mhn-layout-col-right`'s flex children had no
    `flex-shrink: 0`, so the browser satisfied the overflow by silently
    squashing the _last_ child (Invite & Grow, down to ~42px) instead of
    leaving every widget at its natural size and scrolling — the entire
    point of adding `overflow-y: auto`. Fixed with `.mhn-layout-col-right >
    - { flex-shrink: 0; }`. Also matched Figma node 1806:16060 exactly
(border-only card, `#1d2432`border,`--color-primary`button) and
replaced the generic`/player.webp`illustration with the design's own
glowing-skater graphic, exported as one flattened PNG via`download_assets` rather than hand-porting its ~30 nested
      mix-blend-mode SVG layers.
  - **Carousel scroll-to-slide** — `PostMedia.tsx`'s image carousel now
    uses a native CSS scroll-snap track (`overflow-x: auto; scroll-snap-
type: x mandatory`) instead of only prev/next buttons, so trackpad
    swipe / shift+wheel / touch drag change the image too — deliberately
    not a custom `onWheel` handler, which would fight the feed's own
    vertical scroll. The reported "counter and arrow rendering at the top
    of the page, overlapping the tab bar" turned out not to be a real bug:
    reproducing it consistently showed every `.mhn-media-badge` correctly
    positioned against its own card once the test viewport was confirmed
    non-zero-width — same false-alarm class already documented on
    `.mhn-layout-col-right`.
  - Verified live: dummy photo save round-trips through localStorage and
    survives a full page reload (sidebar, Profile hero, and Home feed's own
    posts all pick it up); `/connections` renders and its nav item
    highlights active; Invite & Grow's card height goes from ~42px to its
    real ~202px and the full card (title/description/button/illustration)
    is reachable by scroll; carousel badge updates on programmatic
    horizontal scroll. `typecheck`/`lint:check`/`test:run` (295/295) all
    pass — one existing test asserting `data:` URLs were rejected was
    updated to assert the opposite, deliberately.

- Messaging composer/header cleanup, Register-button React error, repost
  menu/Invite & Grow styling, header z-index, and the shared sticky-
  header/scroll-body pattern rollout (2026-08-30):
  - **Composer** — input pill `border-radius: 24px` → `8px`; Send button
    activates immediately on text entry (see the send-button entry below —
    this pass only wired `disabled={!inputText.trim()}`, the visual "looks
    active" fix landed later the same day, see further down); a real emoji
    popover (`QUICK_EMOJI`, native color emoji, no image assets needed);
    an attach popover (`FilePickerButton`-based, Photo/Video + Document,
    5MB limit, multi-file, no real upload yet — shows an info/error toast);
    GIF button removed entirely.
  - **Headers** — chat list's pencil icon replaced with `+`; conversation
    header's `+`/Settings icons removed (no feature behind them yet;
    Search kept).
  - **`PostMedia.tsx` React error** — "Cannot update a component
    (`Providers`) while rendering a different component (`PostMedia`)":
    the Register button's `setIsRegistered(prev => {...})` updater called
    `showSuccessToast`/`showInfoToast` as a side effect _inside_ the
    updater function — impure updaters can run during React's render
    phase. Fixed by reading `isRegistered` directly and moving the toast
    calls into the handler body, outside the updater.
  - **Repost menu** — `.mhn-repost-menu-item`'s text color was
    `var(--color-background)` (a copy/paste slip), making "Repost"
    near-invisible dark-on-dark; fixed to a light, readable color and
    aligned its icon with `flex-shrink: 0`.
  - **Invite & Grow real background bug** — Tailwind-utility rewrite never
    touched the legacy `.mhn-invite-grow-card` plain-CSS rule (light-theme
    `#d0e2ff` border / `--color-accent-surface` background) or a
    `:root.dark .mhn-invite-grow-card` override two classes deep that
    always won regardless of source order — neither ever got removed.
    Rewrote the CSS classes to match Figma exactly (transparent
    background, `#1d2432` border) and deleted the dark-mode override.
    Reconfirms this codebase's convention: structural chrome styling
    belongs in `index.css`'s `.mhn-*` classes, not scattered Tailwind
    utilities per component file.
  - **Z-index scale, documented** — the event-register banner overlapping
    the top header traced to `.mhn-feed-scope-tabs` sitting at `z-index: 5`
    ; raised to `15`. Documented the scale directly in `index.css`:
    in-post overlays = 10, in-page sticky headers = 15, `.mhn-sidebar` = 20.
  - **Shared "sticky header, scrolling content" pattern** — added
    `.mhn-page-sticky-header` / `.mhn-page-scroll-body` to `index.css`
    (feedback: "now top will be move only content below them will
    scroll... like explore... event have title and search and filter in
    top bar"). Applied to `events-page.tsx` this pass; Help & Support
    picked it up in the next entry below, others remain pending.

- Settings alignment, Supervision's permanent shimmer, Help & Support's
  theme/scroll/radius bugs, messaging media-preview + send-button-active,
  and uneven right-sidebar spacing (2026-08-30):
  - **Settings tab alignment** — the shared `Button` component's
    `buttonVariants` base classes always include Tailwind `justify-center`,
    which overrides `.mhn-settings-subtab-btn`'s plain-CSS `text-align:
left` (flex-item positioning isn't affected by `text-align`). Added an
    explicit `justify-start` to each subtab button; `twMerge` (via `cn()`)
    resolves the conflict correctly. Search input `border-radius: 20px` →
    `8px`.
  - **Supervision's permanent shimmer** — `isControlsLoading` initialized
    `useState(true)` with no path to ever become `false` when zero managed
    players exist ("No managed players found"): `setIsControlsLoading
(false)` only ran inside the user-click-driven `handleSelectWard`, and
    the separate auto-select-on-load path (`onWardsRefreshed`) never
    touched the flag at all. Fixed by defaulting to `false` and giving
    `onWardsRefreshed` the same load/`finally` pairing `handleSelectWard`
    already had.
  - **Help & Support** — category pills `border-radius: 24px` → `8px`;
    `.mhn-faq-card-item.expanded`'s hardcoded `#93C5FD`/`#F0F9FF`
    light-theme colors (rendered as a jarring white card in dark mode)
    replaced with the theme-aware `--color-auth-action`/
    `--color-accent-surface`; `.mhn-faq-cat-badge`'s hardcoded `#0369A1`
    text replaced the same way. Adopted the sticky-header/scroll-body
    pattern; the page's own wrapper div's `min-height: 100vh` was fighting
    the shell's `lg:h-dvh`/`lg:overflow-hidden` clipped flex column, so its
    real content (FAQ list + ticket form + contact cards, 2700px+)
    overflowed past the clip boundary and the whole document scrolled
    instead — dragging the left sidebar along with it. Scoped the wrapper
    to `flex: 1; min-height: 0; overflow: hidden` at the `lg` breakpoint so
    only `.mhn-page-scroll-body` scrolls internally. 14 FAQs already
    exceeded the requested 10+.
  - **Messaging media "getting cropped"** — the conversation avatar and
    group banner render via `object-fit: cover` into small fixed-
    aspect-ratio boxes, which necessarily crops anything that doesn't
    match; there was no way to see the whole image. Both are now clickable
    and open a `Modal`-based preview with `object-fit: contain`, showing
    the full uncropped image.
  - **Messaging send button "active" state** — `.mhn-btn-chat-send` had no
    default `background-color` at all, only a `:hover` one, so it only
    ever looked active while the mouse was literally over it. Default is
    now the active color; `:disabled` (empty input) dims it instead.
    Enter-to-send was already wired and verified working.
  - **Right-sidebar uneven spacing** — `.mhn-layout-col-right` already
    applies a uniform `gap: 22px` between every widget, but
    `UpcomingEventsWidget`'s root div also carried a stray Tailwind `mb-4`,
    stacking an extra 16px on top of the gap below it specifically (~38px
    vs. 22px everywhere else). Removed the redundant margin.
  - Verified live for all of the above: Settings tabs left-align; Help &
    Support's pills, expanded-FAQ card, and badge are all dark-themed with
    no white patches, and scrolling the FAQ list leaves the sticky header
    and the app's left sidebar both fixed in place (confirmed by scrolling
    the actual `.mhn-page-scroll-body` element, not just the page — the
    Browser pane's own `scroll` action was independently confirmed to
    force `documentElement.scrollTop` in a way a real wheel event over a
    genuinely non-scrollable ancestor chain wouldn't, i.e. a testing-tool
    artifact, not the bug); clicking the messaging group banner/avatar
    opens the full uncropped image; the send button is visibly active
    as soon as text is typed, with the mouse elsewhere on screen; Enter
    sends a message end-to-end; the three right-sidebar gaps measure 22px/
    22px/22px. `typecheck`/`lint:check`/`check-component-reuse.mjs`/
    `test:run` (295/295) all pass.

- Own-post avatar staleness, project-wide 8px card-stack spacing, logout
  alignment, and a compact sidebar-less shell for Settings/Supervision/
  Help & Support (2026-08-30):
  - **Feed/Profile post avatars going stale** — `mapFeedPosts` and
    `ProfilePostsTab` both read the post record's own embedded
    `author.avatarUrl`, which is whatever the backend/demo data had at
    fetch time; updating the local photo cache (see the earlier
    "Profile photo local cache" entry) never touched already-fetched
    posts, so the viewer's OWN older posts kept showing the old photo
    even after every other avatar in the app updated (feedback
    2026-08-30: "I updated the profile photo only this post doesn't
    have... we need to still update the profile photo if same user").
    Both now prefer the local cache over the embedded value specifically
    for the viewer's own posts (`isSelf`/`isSelfPost`); other authors'
    posts are untouched.
  - **Project-wide 8px spacing** — `.mhn-feed-posts-stack`'s 8px
    inter-post gap (Figma node 1806:15962) is now the one reference
    spacing for any vertical card stack, applied to
    `.mhn-layout-col-right` (was 22px), Notifications' and Saved's item
    lists, and Explore's post stack (feedback: "spacing between two feed
    this is ideal spacing I need everywhere, in right panel side and in
    other tabs also"). Left untouched: multi-column card grids (Groups)
    and dense single-line list rows (Messaging's chat list), which are
    different UI shapes than a feed-style card stack.
  - **Logout button alignment** — `.mhn-dropdown-logout-btn` had no
    `justify-content` of its own, so nothing opposed the shared `Button`
    component's Tailwind `justify-center` base class, and it rendered
    centered instead of flush left like every other row in that dropdown
    (which all set `justify-content: space-between` explicitly). Fixed
    by adding `justify-content: flex-start`.
  - **Compact sidebar-less shell** — Figma (node 2176:19341, Supervision)
    shows Settings/Supervision/Help & Support full-bleed with no
    persistent app sidebar, just a back arrow in the page's own header
    (feedback: "check how setting is looking no left panel only back
    button, similarly for help and support"). `AppShell.tsx` now detects
    those three routes and skips `LeftSidebar`/`MobileNavigation`
    entirely rather than hiding them with CSS, backed by a new
    `.mhn-app-shell--compact` grid variant that drops the sidebar
    column. New shared `CompactPageHeader` component (back arrow + title
    - optional right-side actions) used by Settings and Help & Support;
      Supervision's existing ward-list panel header grew its own back
      arrow instead, since Figma nests it there rather than in a separate
      top bar.
  - **Help & Support compacted further** — the old hero (icon badge +
    title + subtitle + a large centered search box) is gone, replaced by
    `CompactPageHeader` with the search box in its `actions` slot,
    freeing up real height for the FAQ list (feedback: "we have 14
    articles which looks in small area... increase their area so that
    we can easily see 3 4 faq"). Also found and fixed the actual reason
    the FAQ chevron read as a barely-visible dot: `.mhn-arrow-rotate`
    hardcoded a `9px × 4.5px` box sized for a _different_ small inline
    caret icon on the event-detail page, and the FAQ chevron was
    reusing that same class — split into its own `.mhn-faq-arrow-rotate`
    at a real 24px instead of enlarging the shared class and breaking
    the other use site.
  - Verified live: Settings and Help & Support both render with no main
    app sidebar, a back arrow + title, and the full viewport width;
    Help & Support now shows 3-4 FAQ cards at once with clearly visible
    chevrons; the right sidebar's three gaps are all 8px. Supervision's
    back-arrow change was verified by code/typecheck only — the
    available test session isn't a parent-role account, so
    `ParentRoleGuard` redirects it before the page renders; the same
    `AppShell` mechanism already proven on Settings/Help applies
    identically here since it's a pure pathname check with no role
    dependency. `typecheck`/`lint:check`/`check-component-reuse.mjs`/
    `test:run` (295/295) all pass.

- Supervision pixel-matched to Figma (node 2176:19341), a shared request-
  row component, and demo requests/logs (2026-08-30):
  - **Two genuine invisible-text bugs, not styling nitpicks** —
    `.superTitle` (the "Home"/"My Network"/etc. section titles) had
    `color: '#080809';` — a quoted string, which is not a valid CSS color
    value, so the whole declaration was silently dropped and the text
    rendered in the browser's black default against the dark theme.
    `.mhn-permission-title` (every toggle row's own title, "View feed"/
    "Create posts"/etc.) had a real but hardcoded `#080809`, same
    practical effect. Both now use `var(--color-foreground)`. This is
    what the "Permissions tab showing shimmer" feedback screenshot
    actually was in the reported case where it wasn't blank shimmer —
    rows with only their gray subtitle line visible.
  - **Category icon badges** — Figma's 32px, 8px-corner, per-category-
    tinted badges (blue/purple/cyan/amber for Home/My Network/Messaging/
    Notifications) replaced the previous plain 32px illustration images,
    reusing lucide (already the app's icon library) instead of new image
    assets — new `CategoryIcon` helper in `SupervisionPermissionsTab.tsx`.
  - **Toggle switch** sized to Figma's exact 40x22 (handle 18px), not a
    rounder 44x24 — shared by Settings' notification toggles too.
  - **Section border-radius** 12px, not 8px, and no more "thicker border
    while expanded" (Figma doesn't have that; only the chevron rotates).
  - **Request cards → the follow-card pattern** — `GuardianRelationship
RequestCard` (shared by Supervision's Requests tab and Profile's own
    Guardian Requests tab) and Supervision's separate content-approval
    list both rendered their own vertically-centered card. Replaced both
    with one new shared `SupervisionRequestRow`, which reuses `WhoTo
FollowWidget`'s own row shape (`.mhn-who-to-follow-row`/`-avatar`/
    `-name`) — avatar + name/role-team-location on the left, Decline/
    Approve on the right — per feedback: "make request similar to card
    we have follow user card similar".
  - **Demo requests/logs** — `demo-data/supervision/index.ts` adds 3 demo
    guardian-relationship requests (feedback: "multiple request from
    demo data") and 10 demo activity logs ("add 10 logs like accepted
    request, like the video etc"), both appended after real API results,
    never replacing them (same convention as `useHomeFeed`'s demo posts).
    Demo request ids are prefixed `demo-` so their Approve/Decline route
    to an info toast instead of the real guardian-relationship API, which
    has no record for a fabricated id. Also fixed the Logs tab's
    pagination footer, which hardcoded "1 - 5 of 5 items" regardless of
    the actual row count.
  - Verified by code/typecheck/lint/tests only, same limitation as the
    entry above — `ParentRoleGuard` blocks the only available test
    session from reaching `/supervision` at all.
    `typecheck`/`lint:check`/`check-component-reuse.mjs`/`test:run`
    (295/295) all pass.

- Text-visibility regression sweep, Invite & Grow / Upcoming Events matched
  to Figma (2026-08-30):
  - **Root cause of the recurring "invisible text" reports** — many colored
    buttons/badges/overlays used `color: var(--color-background)` for their
    own text, reading it as a generic "high-contrast" token. It's actually
    the page background color, so it silently broke wherever a surface's
    color happened to converge with it. Replaced every such usage with the
    new `--color-primary-foreground` token (white in both themes, meant
    specifically for text on a primary/colored surface) and added a
    regression test (`sidebar-widgets.test.tsx`) asserting `index.css`
    never reintroduces `color: var(--color-background)` as a text color.
  - **Invite & Grow** — illustration resized/repositioned to Figma nodes
    1993:19396/1993:19390 exactly (136×126 at top:16/right:13, `normal`
    blend mode in light theme, `color-dodge` kept for dark), description
    text now theme-aware instead of a fixed `rgba(255,255,255,0.7)`.
  - **Upcoming Events** date box restyled to Figma's gradient badge
    (74×84, `linear-gradient(90deg, #053769, #2e75bb)`,
    `--color-primary-foreground` text) and its info-line icons enlarged
    13px → 16px.
  - Verified live with a fresh parent-role test account (the prior
    session couldn't reach `/supervision` at all): Settings/Help &
    Support's two-panel layout and toggle contrast, and Supervision's
    permission section titles/request rows/demo logs all render with the
    fixed text-visibility rule. `typecheck`/`lint:check`/
    `check-component-reuse.mjs`/`test:run` (304/304) all pass.

- Other-user profile popup: click-to-profile navigation, reused hero/tabs,
  demo data (2026-08-30):
  - **Own vs. other navigation** — clicking a name/avatar anywhere (feed
    post authors, Who to Follow rows, Connections cards) now goes to the
    real `/profile` page if it's the viewer's own, or opens an in-place
    popup for anyone else — feedback: "if mine than redirect to profile
    page and if other user than redirect to other user profile... don't
    make separate page". New `useProfileClickHandler` hook centralizes the
    decision; feed posts pass their already-correct `isSelf` (computed by
    `mapFeedPosts.ts`, which already special-cases the viewer's own demo
    posts) rather than re-deriving identity from a plain id comparison,
    which misclassified the viewer's own demo posts as someone else's.
  - **`OtherUserProfileModal`** reuses the real Profile page's own
    `ProfileHeroCard` + `ProfilePostsTab`/`ProfileMediaTab`/
    `ProfileStatsTab`/`ProfileEventsTab` (no separate page, no Career tab
    — that needs real save/delete wiring that doesn't apply to a profile
    you can't edit) inside a wide `Modal` with a back arrow and a close
    (X), both dismissing it. `ProfileHeroCard` gained an
    `otherProfileActions` slot (Follow when not yet following, Message
    once following) in place of Edit Profile, and a `hideCareerTab` flag.
    Mounted once in `AppShell.tsx`, opened via a new
    `otherProfileTarget`/`openOtherProfile`/`closeOtherProfile` trio on
    the existing `shell-ui-store` so any component can trigger it without
    prop-drilling.
  - **New demo data** (`demo-data/other-profiles`) for a few already-
    established identities (Connor McDavid, Sidney Crosby, Jack Hughes);
    any other clicked person falls back to whatever the click site itself
    had, with the rest of the profile showing its normal empty state.
  - **Two real bugs found and fixed while building this**, both pre-
    existing and newly exposed by exercising "view someone else" for the
    first time:
    1. `ProfileMediaTab`/`ProfileStatsTab`/`ProfileEventsTab` rendered
       the VIEWER's own demo media/stats/events unconditionally,
       regardless of whose profile was being viewed — the real
       `/profile?userId=X` page had this bug already; now gated on a
       required `isOwnProfile` prop, with an honest empty state
       otherwise.
    2. A fresh "Cannot update a component while rendering a different
       component" React error — the exact same impure-setState-updater
       bug already fixed once this session in `PostMedia.tsx`, reintroduced
       in this new modal's own Follow-toggle handler; fixed the same way
       (side effect moved out of the updater into the handler body).
  - Verified live end-to-end with a fresh parent-role test account:
    clicking one's own post navigates to the real profile; clicking
    Connor McDavid (from Who to Follow) opens the rich popup, Follow
    toggles to Message with no console error, and Media/Stats/Events all
    show the correct honest empty state; clicking a Connections card
    without a demo-data match still opens the popup using just that
    card's own fields. `typecheck`/`lint:check`/`check-component-
reuse.mjs`/`test:run` (304/304) all pass.

## Current quality gates

- Obfuscation/security scan must report zero findings.
- TypeScript and lint must pass for both applications.
- Shared executable code must exceed 80% statements, branches, functions, and lines.
- Production web build must pass.
- Web/native UI ownership and pnpm-only dependency management checks must pass.

Latest measured enforced-code coverage: 95.35% statements, 89.14% branches, 98.14% functions, and
95.50% lines (enforced boundary: `packages/api-client`, `auth`, `domain`, `validation` index files;
`packages/core/src/api/signUpRules.ts`; `apps/web/src/platform/auth-storage.ts`,
`query/query-client.ts`, `utils/guardianUtils.ts`, `utils/mediaUtils.ts`, `utils/toast.ts`,
`utils/dateUtils.ts`). The Vitest suite contains 318 tests across 49 test files, plus 6 Playwright smoke tests
(`apps/web/e2e/public.spec.ts`, run separately via `pnpm test:e2e`, not counted in the Vitest total).
Web form validation, secure storage behavior, query/mutation hook behavior, route-guard
fail-closed/redirect behavior, dialog/OTP-input keyboard and focus behavior, and route/form
integration are represented in addition to shared logic. The latest web, Android, and iOS production
bundle commands pass. `pnpm verify` passes
end-to-end.

## Maintainability backlog

- Finish tokenizing the remaining ~300 literal colors in live `index.css` rules. What is left is a
  long tail of one-off variants (each used 18 times or fewer — `#0091ff`, `#0c1014`, `#eaeef4`,
  `#1d6ae5`, `#09519b`, `#424242`, ...) with no obvious shared semantic role, plus 17 gradient and
  box-shadow stops that were deliberately excluded. These need a design decision about which are
  genuinely distinct roles and which are accidental near-duplicates of tokens that already exist —
  mechanical replacement is not safe for them the way it was for the 1,029 already done.

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
- Fixed the cancel button layout bug in the delete team entry modal to prevent horizontal overflow, moved the post composer toolbar buttons to the left, styled them blue, and updated the post creation flow to invalidate and refetch the posts feeds.
