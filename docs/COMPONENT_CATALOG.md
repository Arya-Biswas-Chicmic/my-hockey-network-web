# Component catalog and reuse policy

Last reviewed: 2026-08-28

## Rule

Before creating a component, search this catalog and `apps/*/src/components`. Extend an existing
component with typed variants when the interaction and semantics match. Create a new component only
when it represents a distinct reusable behavior or feature composition. Web React DOM and React
Native presentation remain separate; share contracts, state machines, validation, tokens, and props
concepts across platforms rather than forcing DOM/native markup into one component.

Prefer 100–200 focused lines and review components over 300 lines for meaningful decomposition by
responsibility. Do not create trivial wrappers solely to satisfy a line-count target. Follow the
page → feature/container → feature component → existing platform primitive hierarchy described in
`FRONTEND_DEVELOPMENT_GUIDELINES.md`.

## Existing web primitives and shared compositions

- `common/Button`: generic button foundation; currently underused and its variants need completion.
- `common/FormControls`: the single web `Input`, `Select`, `Textarea`, accessible `Dropdown`, and
  `FormField` implementation. Do not create a second control file or accept inline style objects.
- `common/OtpCodeInput`: the accessible six-digit OTP input reused by email verification and
  guardian approval.
- `common/Header`: reused across the authenticated web pages.
- `icons/SidebarNavigationIcon`: the single renderer for desktop and mobile-menu navigation icons.
  It selects the exact Figma-exported filled/outline asset pair from
  `public/icons/sidebar/<name>-{active,inactive}.svg`, uses a CSS mask so semantic theme colors own
  presentation without altering the supplied vector geometry, and
  replaces the prior mix of hand-traced active SVGs and unrelated Lucide inactive icons. Extend its
  typed icon-name union and asset map when a new sidebar destination is approved; do not create a
  route-local navigation icon component.
- `core/theme-provider`: the only web theme owner. It wraps `next-themes` (`attribute="class"`,
  `defaultTheme="dark"`, `enableSystem`) and re-exports `useTheme`, so consumers import the hook from
  this module, never from `next-themes` directly. It persists `light`, `dark`, or `system`, resolves
  system preference changes, mirrors state into cookies via `theme/theme-cookie.ts`, and exposes the
  resolved palette to the common Header toggle. See "Theming and dark mode" below before touching
  any dark-mode styling.
- `common/Spinner`, `Toast`, `PendingBanner`, `NoDataFound`, `ServerDown`: reusable feedback/state UI.
- `ui/file-picker-button`: accessible reusable file selection through a native associated label and
  input rather than `ref.current.click()` or input-event mutation.
- `ui/switch`: the single accessible 40×22 web switch for Settings, Supervision, onboarding
  protection, and theme controls. Active is blue with a white thumb; inactive is gray with a white
  thumb, matching the approved Figma states in both themes.
- `supervision/guardian-relationship-request-card`: reusable presentation for both child-facing
  guardian invitations and parent-facing guardian requests. It receives typed request data and
  callbacks; routes/hooks choose the endpoint direction.
- `ProfileSummaryCard`: reused by Home and Network; updated with word-break and overflow containment for display names and team handles.
- `GuardianApprovalModal` and `RequestSentCard`: reused in onboarding and dedicated auth pages.
- Feature components exist for events, feed/posts, messaging, network/groups, notifications, profile,
  and onboarding. Search the appropriate feature folder before adding another card/modal/view.
- Profile specifically reuses `RightSidebar` + `SearchWidget` + `WhoToFollowWidget`, `FeedPostCard`,
  the compact typed variant of `EventCard`, the atomic RHF field adapters, and
  `ProfileCareerSection`. Temporary API-gap fixtures are centralized under
  `apps/web/src/demo-data/profile/*.json`; feature components must never grow their own inline dummy
  arrays. Remove the relevant fixture as soon as its real query is wired.
- `features/onboarding/OnboardingModal` owns the responsive Figma auth/onboarding shell and selects
  the appropriate shared illustration and feature step. Auth forms remain under `features/auth`;
  role presentation remains under `features/onboarding`; parent-specific compositions remain under
  `features/parent`. Do not duplicate this shell for another auth state.
- `features/supervision/LinkExistingPlayerStep` is the canonical existing-player link form for both
  parent onboarding and authenticated Supervision. Extend its typed props when those flows require
  a presentation variation; do not restore a second parent copy.
- `features/parent/AddPlayerChoiceStep`, `CreatePlayerDetailsStep`,
  `CreatePlayerProtectStep`, and `PlayerAddedSuccessStep` compose the parent onboarding journey from
  shared `Button`, form, spinner, Lucide, validation, and service layers. Their callbacks own routing
  and API orchestration outside presentation components.

## Existing mobile primitives

- `components/Button`: loading, disabled, pressed, accessibility, and theme behavior.
- `components/Input`: label, error, focus, disabled, accessibility, and theme behavior.
- `components/Header` and `components/ScreenWrapper`: screen shell and navigation header.

## Audit findings and completed consolidation

The original audit found approximately 195 raw web buttons and 76 raw web form elements. These now
route through `common/Button` and `common/FormControls`; raw DOM controls are permitted only inside
those primitive implementations. Mobile Signup now uses the existing native Button, Input, and
ScreenWrapper. `design-system` is retained as a compatibility facade over canonical `design-tokens`.
`pnpm components:check` prevents raw controls from returning to web features or mobile screens.
It also rejects React Native/mobile presentation imports from web, React DOM/web presentation imports
from mobile, inline web style objects, non-React-Hook-Form semantic web forms, and JSX presentation
inside shared packages. It rejects relative app imports, explicit `any`, and inline SVG outside the
approved custom icon components. Ordinary web icons come from Lucide; branded and analytics visuals
remain isolated under reusable icon/illustration components. Therefore web common components are used
only by web, and mobile common components are used only by mobile.

React Hook Form (with Zod resolvers) owns state, touched, validation-error, and submission behavior
for every semantic web form: login, signup, guardian approval, OTP verification, support tickets,
profile editing, post creation, and comments. Formik has been fully removed. Validators live in
`packages/validation/src/forms.ts` and are shared with mobile where applicable. New substantial web
forms must follow this pattern, composing the shared field adapters in
`apps/web/src/components/form/fields`.

`common/FormControls.Input` exposes `onValueChange(value, event)` for sanitized values. Consumers
must update form state from that value; they must never mutate `event.target.value` or fabricate a
synthetic change event.

## Required consolidation before new screen work

1. Add feature-specific variants to existing primitives instead of introducing parallel controls.
2. Add a Storybook or component showcase as approved Figma implementation begins.
3. Add component-level interaction and accessibility tests screen-by-screen.

## Next.js primitive reuse gate

The web primitive layer (`apps/web/src/components/ui`) adapts project-owned shadcn-style components
rather than allowing feature folders to generate private copies. Before touching each screen, map
every existing control, card, dialog, feedback state, and layout composition to reuse, extend,
refactor, or retire. Record new reusable primitives here and cover their meaningful variants and
interactions. `apps/web/src/components/form/fields` (`FormInput`, `FormSelect`, `FormTextarea`,
`FormDateInput`) are the shared React Hook Form field adapters; extend them with typed variants
before adding a new field wrapper. `apps/web/src/components/ui/form.tsx` provides the single
`Form`/`FormField`/`FormItem`/`FormMessage` error-rendering pattern — do not hand-roll a second error
display alongside it for the same field.

## Media/image components

Following the reviewed Admin Panel pattern (`next/image` everywhere, raw `<img>` reserved for
local/object-URL previews only): every remote or static image in `apps/web` renders through
`next/image` directly, or through `apps/web/src/components/ui/fallback-image.tsx`
(`FallbackImage`) when the call site needs automatic error handling.

- **`FallbackImage`**: wraps `next/image` and replaces the old per-call-site
  `onError={(e) => (e.target as HTMLImageElement).src = '...'}` DOM-mutation pattern. Use for
  avatars, cover banners, team/event logos — anything with a user- or backend-supplied URL that may
  be empty or fail to load.
  - `fallbackSrc` (default `/userPlaceholder.webp`): shown when `src` is empty or the image fails to
    load. Pass a different fallback (`/cover.webp`, `/HC.webp`, `/kcBlue.webp`, ...) to match the
    original per-feature placeholder.
  - `hideOnError`: renders nothing instead of swapping to a fallback — use for optional decorative
    images (e.g. a team logo badge) where hiding is preferable to a generic placeholder.
- **Plain `next/image`**: use directly for static local assets (icons, illustrations under
  `public/`) that have no failure/fallback requirement.
- **Sizing**: existing image CSS classes in this codebase set explicit pixel `width`/`height` on the
  element. Match that with the `width`/`height` props for a standard (non-`fill`) render. Use `fill`
  only when the call site already has (or was given) a `position: relative` sized wrapper with
  `overflow: hidden` — a bare `fill` image with no positioned ancestor renders relative to the
  nearest positioned ancestor further up the tree, which is almost never what you want. Several
  wrapper classes (`mhn-user-avatar-circle`, `mhn-network-avatar-circle`, `mhn-author-avatar-box`,
  `mhn-chat-item-avatar-box`, `mhn-conv-avatar-box`, `mhn-msg-avatar-box`,
  `mhn-group-member-avatar-circle`, `mhn-suggested-avatar-box`/`mhn-request-avatar-box`,
  `mhn-notification-avatar-box`, `mhn-profile-avatar-inner`,
  `mhn-supervision-req-avatar-wrapper`) had `position: relative` added to `index.css` specifically to
  support this.
- **Remote origins**: `next.config.ts` sets `images.remotePatterns: [{ protocol: 'https', hostname:
'**' }]` because uploaded media resolves to a backend-controlled signed-storage host that varies
  per environment (see `packages/core/src/api/mediaApi.ts`), matching the Admin Panel's own
  wide-open pattern for the same reason.
- **Documented raw-`<img>` exceptions** (3, all with an `eslint-disable-next-line
@next/next/no-img-element` comment explaining why): `CreatePostModal.tsx`'s post-image preview
  (`FileReader.readAsDataURL` result, a local `data:` URI), `EditProfileModal.tsx`'s avatar preview
  (`URL.createObjectURL` result before upload), and `ImageCropModal.tsx`'s live crop preview (see
  below) — none is a Next-optimizable remote asset, matching Admin's identical exception in
  `form-image-upload.tsx`. Do not add a new raw `<img>` outside these categories; `pnpm lint:check`
  enforces `@next/next/no-img-element` at `--max-warnings=0`.

### Static asset location and format (2026-08-27 consolidation)

Every static/local image ships from exactly one place per app — do not add a second images
directory or copy an asset into `src/`:

- **Web**: `apps/web/public/` — referenced by root-relative string path (`/foo.webp`) from
  `next/image`, `FallbackImage`, or CSS `url(...)`. Files here are served as-is; nothing under
  `src/` is a valid place for a static image, since Next.js can only reference `public/` this way
  (a `src/`-relative image would instead require an ES module `import`, which is a different,
  incompatible pattern — see "Why not `src/assets`" below).
- **Mobile**: `apps/mobile/assets/` (icons/splash consumed by `app.config.ts` — `icon`, `splash`,
  `adaptiveIcon` — stay at this top level) and `apps/mobile/assets/images/` (everything else),
  referenced via static `require('../../../assets/images/foo.webp')` calls. Metro requires a
  literal string argument to `require()` — no dynamic path construction.
- **Format**: photos/illustrations are `.webp` (q≈85) — same visual quality as the PNG originals at
  roughly an 87% size reduction (web `public/` went from 13.6 MB to 1.7 MB across 83 files). Icons
  and logos stay `.svg`. Mobile app icons/splash images (`apps/mobile/assets/*.png` at the top
  level) stay `.png` — Expo's `app.config.ts` icon/splash/adaptive-icon pipeline expects PNG
  specifically; do not convert those four files.
- **Why not `src/assets`**: this was evaluated and rejected. Every existing image reference in this
  codebase (`next/image`, `FallbackImage`, CSS `url()`) uses a root-relative string path against
  `public/`, and `FallbackImage` in particular is built around plain string URLs because it also
  handles backend-supplied avatar/post-image URLs that are never known at build time — a
  static-import pattern can't express those. Moving to `src/assets/` would mean converting every
  reference in every component to an ES module import, a rewrite with no functional benefit here:
  `next/image`'s optimizer is already active against `public/` (confirmed serving `.webp` output
  with automatic width/quality negotiation via `/_next/image?...`).
- A leftover `apps/web/src/assets/` directory (pre-Next.js Vite scaffolding — `hero.png`,
  `react.svg`, `vite.svg`, plus a set of sidebar/feed SVGs that had already been hand-traced into
  `SidebarIcons.tsx`/`FeedActionIcons.tsx` as inline JSX) was confirmed unused via a codebase-wide
  import search and removed.
- Some existing files in both locations have **zero code references** (24 in `apps/web/public/`,
  including the unused `Social Icons.png`→`.webp`; 1 in `apps/mobile/assets/images/`,
  `GurdianApprovalRequest.png`→`.webp`) — these were converted for consistency but were not deleted,
  since removing them wasn't explicitly requested. Treat them as candidates for a future prune.

### Theme-variant images (light/dark)

Most images and icons in this codebase render identically regardless of theme (avatars, event
photos, badge-style icons that carry their own background) and stay directly under
`public/`/`assets/images/` as above — **do not** move an image into a theme subfolder, or
duplicate a file across both folders, unless it genuinely needs a different asset per theme. An
audit of every icon/logo reference in the web app (2026-08-28) found exactly two real
theme-dependent cases, both below; nothing else needs this treatment — several icons that look
theme-risky in isolation (plain, no self-background) turned out fine because the surface they
render on is itself hardcoded to one theme and never switches (e.g. `event-detail-page.tsx`, the
`Dropdown` component, `ProfileHeroCard` — none of these participate in dark mode at all yet, which
is a separate, larger gap than icon theming).

- **Web**: a theme-paired image lives at `apps/web/public/light/<name>.webp` and
  `apps/web/public/dark/<name>.webp`. Use the same basename in both folders when both exist, so the
  pairing is visible from the filename alone — but don't create a file in one folder just to
  mirror the other; an asset only goes in `light/`/`dark/` once a real per-theme file exists for
  it (see the logo entry below for the interim state while a light variant is pending). Resolve the
  path with `themedImageSrc(name, resolvedTheme)` from `@/utils/themedImage` (pass `resolvedTheme`
  from `useTheme()`, not the raw `theme` setting, which may be `'system'`) rather than hand-writing
  `isDark ? '/x.webp' : '/y.webp'` at each call site.
  - `onboarding-welcome` / `onboarding-otp` (`OnboardingModal.tsx`/`OnboardingIllustration.tsx`):
    light mode has two distinct step illustrations (`light/onboarding-welcome.webp`,
    `light/onboarding-otp.webp`); dark mode has one illustration shared across every step
    (`dark/onboarding.webp` — a single file, not duplicated under two names, since there is no
    real per-step dark art yet).
  - `logo` (`Header.tsx`, `MobileNavigation.tsx`, `LeftSidebar.tsx`, `Sidebar.tsx`): the only
    existing art (`dark/logo.webp`) is a white wordmark meant for a dark surface.
    `LeftSidebar.tsx`/`Sidebar.tsx` render it inside `.mhn-sidebar`, whose background switches to
    light via `var(--color-background)` — so it will read poorly there once light theme is
    exercised on an authenticated screen. `Header.tsx` is safe as-is (`.mhn-header` has a
    hardcoded dark gradient that never changes). **Pending**: a light-theme logo variant
    (`light/logo.webp`) — until it's supplied, all four call sites intentionally still point at
    `/dark/logo.webp` (no behavior change from before this audit) rather than wiring up
    `themedImageSrc` against a file that doesn't exist yet. Each call site has a comment marking
    exactly what to change once the asset lands.
- **Mobile**: no image is theme-differentiated yet — `apps/mobile/src/utils/images.tsx` already
  has the `IMAGES`/`DARK_IMAGES` object scaffolding for this, but both currently point at the same
  file (`money.webp`). When a real dark variant is needed, follow the same pairing convention
  (`apps/mobile/assets/images/light/<name>.webp` + `.../dark/<name>.webp`) and populate
  `DARK_IMAGES` with the dark-folder `require()`.

### Theme-variant icons — inline SVG, not light/dark files (2026-08-28)

For a **single-color stroke/fill icon** where only the color differs by theme (not the shape),
do **not** create `light/foo.svg` + `dark/foo.svg` file pairs — that duplicates a file forever for
something a CSS token already solves. Instead: trace the icon as a React component using
`currentColor` for every stroke/fill (see `SidebarIcons.tsx`, `FeedActionIcons.tsx`,
`LoginIcons.tsx`), and let the call site's CSS set the color via the existing theme-token system
(`var(--color-foreground)`, `var(--color-muted-foreground)`, etc., which already flip per theme via
`:root[data-theme='dark']` overrides in `index.css`). One component, no duplicate files, correct in
both themes automatically. Reserve actual `light/`/`dark/` **image** folders (see above) for cases
where the artwork itself is genuinely different, not just recolored — the onboarding illustration
is the one real example so far.

`apps/web/src/components/icons/LoginIcons.tsx` — icons traced from Figma's Login/onboarding
section (`cqlBXHZtqPkKcLRmR6a1B8`, node `2203:29491`), sourced via `download_assets` (never
hand-drawn): `LoginCalendarIcon` (now wired into `DatePickerButton.tsx`, replacing lucide's generic
`CalendarDays`), `LoginShieldIcon`, `LoginEyeIcon` (password-visibility toggle — no current call
site; this app's auth is OTP-based, no password field, kept for if one is ever added),
`LoginChevronDownIcon`. Added to `allowedCustomSvgFiles` in `scripts/check-component-reuse.mjs`,
matching the other hand-traced icon files.

**In progress, not complete**: the user asked for every icon across the full 118-screen design
(section `1418:8806`, "Feedback Final") to be inventoried and re-sourced from Figma this way,
removing the current ad hoc raster icons (`arrowBottom.webp`, `back.webp`, `edit2.webp`, etc.) once
real replacements exist. That is a large, multi-pass undertaking — do not assume it is done because
this section exists. Continue it screen-by-screen; verify (typecheck/lint/tests/build) after each
batch rather than mass-converting unverified.

## Image crop-on-upload

`apps/web/src/components/ui/image-crop-modal.tsx` (`ImageCropModal`) is the shared crop dialog —
pan (drag) and zoom (slider) a selected image inside a fixed viewport, then export the visible
region as a new `File` via Canvas. No external cropping dependency; built on native Canvas/pointer
events per `docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md`'s built-in-first rule. Its pan/zoom/viewport
geometry is applied via direct DOM style mutation on refs (not a JSX `style` prop), both because
these are per-frame runtime values Tailwind's static class generation cannot express and because
`pnpm components:check` rejects inline style objects outright.

Pair it with `apps/web/src/hooks/use-image-crop.tsx` (`useImageCrop`) — a promise-based wrapper that
inserts cropping into an existing `FilePickerButton` `onFilesSelected` handler with one `await` and
no other restructuring:

```tsx
const { cropImage, cropModal } = useImageCrop();
const handleAvatarFileChange = async (files: File[]) => {
  const cropped = await cropImage(files[0], {
    shape: "circle",
    title: "Adjust profile photo",
  });
  if (!cropped) return; // user cancelled
  // ...existing validation/upload logic using `cropped` instead of the raw file
};
return <>{cropModal}...</>;
```

Wired into the two upload flows that already have a well-defined target aspect ratio:
`EditProfileModal.tsx` and `screens/profile-page.tsx`'s avatar upload (`shape: 'circle'`) and
`screens/profile-page.tsx`'s cover upload (`shape: 'rect'`, `aspectRatio: 3`). **Not** wired into
`CreatePostModal.tsx`'s post-image attachment: the crop viewport always fills its frame (it cannot
"contain" an image smaller than the frame), so wiring it there would force-crop content out of every
post photo whose aspect ratio doesn't match — a real behavior change from today's full-image posts,
not a mechanical one. Add it there only after an explicit product decision on the target aspect
ratio.

`apps/web/src/components/ui/slider.tsx` (`Slider`) is the project's range-input primitive backing
the crop dialog's zoom control — extend it with typed variants before adding another raw
`<input type="range">`; `pnpm components:check` rejects raw web controls outside this file (and the
handful of other primitive-defining files already allowlisted there).

React Hook Form providers/field adapters must be shared by web forms while Zod schemas remain in the
platform-neutral validation boundary where possible. Mobile may reuse those schemas and domain
rules, but never the web form controls or shadcn presentation.

## Shared modal/dialog primitive

`apps/web/src/components/ui/modal.tsx` (`Modal`) is the single dialog primitive: overlay rendering,
Escape-to-close, click-outside-to-close, initial focus, and `role="dialog" aria-modal="true"` markup
in one place, replacing the previously hand-rolled `.mhn-modal-overlay`/`.mhn-modal-card` div pair
that each modal implemented (or partially implemented) itself. It reuses those same existing CSS
classes, so adopting it is a behavioral standardization only — no visual change. Props: `open`,
`onClose`, optional `title` (accessible name when there's no visible heading), `className` (card),
`overlayClassName` (overlay — use for a z-index bump on a modal that can open nested inside another,
e.g. crop-on-upload inside an edit-profile modal), `closeOnOverlayClick`/`closeOnEscape` (both default
`true`; set `false` while an in-flight async action should not be interrupted).

Adopted by `DeleteCareerModal.tsx` and `ImageCropModal.tsx`; migrate other existing
`.mhn-modal-overlay` call sites onto `Modal` opportunistically as they're touched, rather than in one
sweeping pass.

### `Dialog` / `Drawer` (preferred for new work)

`apps/web/src/components/ui/dialog.tsx` and `drawer.tsx` are the newer compound primitives, built on
`@base-ui/react` and ported from the Admin Panel. Prefer these for new modals; `Modal` above remains
supported for the existing `.mhn-modal-*` call sites and is not being removed in a sweeping pass.

- Compose with `Dialog` / `DialogTrigger` / `DialogContent` / `DialogHeader` / `DialogTitle` /
  `DialogDescription` / `DialogBody` / `DialogFooter` / `DialogClose`.
- `Dialog` takes `variant="dialog"` (centered, default) or `variant="drawer"` (swipeable side panel,
  rendered through `drawer.tsx`). Pass the same `variant` to `DialogContent`.
- Styling lives in the `@layer components` block at the end of `apps/web/src/index.css`
  (`.cn-dialog-*`, `.cn-drawer-*`), written with this app's own semantic tokens. Do not copy the
  Admin Panel's raw color values.
- `DialogContent` defaults to `max-w-[calc(100%-2rem)]`, which is full-bleed on desktop. Confirmation
  dialogs must pass an explicit width, e.g. `<DialogContent className="max-w-sm">` — see
  `common/LogoutModal.tsx`.
- The close button and footer buttons use `common/Button`. Use the token-backed variants (`solid`,
  `solid-outline`, `solid-destructive`); see the Button variant warning below.

Every new modal must be built on `Dialog` or `Modal`, never a hand-rolled overlay div.

`components/features/events/EventOrganizerDialog.tsx` is the Event Detail people-list composition:
it uses `Dialog`, `SearchWidget`, `FallbackImage`, and `common/Button`, and receives typed people from
`demo-data/events`. `components/features/network/GroupDetailView.tsx` is the single Group Detail
shell for `/groups` and Network; its tab content lives in `features/groups/GroupDetailContent.tsx`
and reuses `FeedPostCard` for Posts and `EventCard` for Events. Group tab fixtures and listing cards
must remain centralized in `demo-data/groups` rather than being copied into screens.
`components/features/teams/TeamDetailView.tsx` is the equivalent Team Detail shell, opened inline
from `screens/teams-page.tsx` (mirrors how Group Detail is opened from `screens/groups-page.tsx` —
neither is a separate route); its tab content lives in `features/teams/TeamDetailContent.tsx`, reuses
`FeedPostCard` for Posts, `EventCard` (`compact`) for Events, and the existing `WhoToFollowWidget`
verbatim for the sidebar (Figma's sidebar there is that exact widget, not a team-specific one). Team
tab fixtures live in `demo-data/teams`, same convention as `demo-data/groups`.

### `common/Button` sets `whitespace-nowrap`

`buttonVariants`' base class list includes `whitespace-nowrap` (and `shrink-0`), which is right for
an ordinary short button label but wrong for anything card-shaped that wraps onto multiple lines. A
`Button` used as a content card must override it (`white-space: normal`), or its text will run past
the element's edge no matter what width or `min-width: 0` constraints are applied around it — the
text simply cannot break. `.mhn-parent-choice-card` does this; do the same for any new
`Button`-backed card.

### `common/Button` variant warning

`common/Button`'s legacy variants `secondary`, `outline`, `danger`, `icon`, and `link` map to
`.mhn-ui-button--*` CSS classes that **do not exist anywhere in `index.css`**. They render unstyled.
Until that gap is closed, use the token-backed variants — `primary` (`.btn-continue`, which does
exist), `solid`, `solid-outline`, or `solid-destructive` — for any button that must be visible.

## Feed/post query and mutation hooks

`apps/web/src/hooks/use-post-mutations.ts` and `apps/web/src/hooks/use-feed-query.ts` are the
`query/mutation hooks` tier of the `Endpoints → API services → query/mutation hooks → components`
layering (endpoints and API service functions live in `packages/core`; `QueryKeys` in
`packages/contracts`):

- `useCreatePostMutation`: uploads the attached image (if any) via `uploadMediaFile` +
  `completeMediaUpload`, then calls `createPost`. Does not touch the feed cache — the caller
  invalidates `QueryKeys.FEED_POSTS` from its own `onSuccess`/inline `await`, since the caller also
  owns search/sort reset and re-fetch timing. Wired into `screens/home-page.tsx`'s
  `handleCreatePost`, replacing its previous inline upload-then-create orchestration.
- `useLikePostMutation`, `useUnlikePostMutation`, `useUpdatePostMutation`, `useDeletePostMutation`:
  each invalidates `QueryKeys.FEED_POSTS` on success via a shared internal `useInvalidateFeed` helper.
  Wired into `FeedPostCard.tsx`'s like, edit-save, delete-confirm, and undo-repost actions — the
  existing optimistic local-state update/rollback and error toasts stayed exactly as they were; only
  the HTTP call itself moved from a direct `packages/core` import into the mutation hook.
- `useFeedQuery` / `feedQueryKey`: declarative feed read via `useQuery`, plus the exported query-key
  builder both this hook and `home-page.tsx`'s imperative fetch now share. `home-page.tsx` still owns
  its feed fetch imperatively via `globalQueryClient.fetchQuery` (not `useFeedQuery` directly) inside
  a hand-written function tightly coupled to that screen's raw-item → `FeedPostProps` mapping, search
  debounce, and silent-refresh behavior — rebuilding that declaratively has real regression risk with
  no live backend in this environment to verify against. Sharing `feedQueryKey` means both call sites
  read/invalidate the exact same cache entry regardless, which is what actually matters for
  correctness (and fixed a real bug: post-create's cache invalidation targeted `QueryKeys.FEED_POSTS`
  but the feed's old ad hoc string key never matched it).

New feed/post call sites should use these hooks rather than calling `packages/core`'s post API
functions directly from a component.

## Guardian relationship query and UI ownership

`apps/web/src/hooks/use-guardian-relationships.ts` is the TanStack Query layer over the existing
relationship API services. Child Profile uses `usePendingGuardianInvites` plus invite accept/decline
mutations. Parent Supervision uses `usePendingGuardianRequests` plus request accept/decline mutations.
Both invalidate their direction-specific query key after a successful mutation.

`GuardianRelationshipRequestCard` is shared by both surfaces and never selects roles, routes, or
endpoints. `ApprovalCodeModal` remains the reusable RHF/Zod six-digit-code dialog and now accepts
typed title/submit-label variants for both approve and decline confirmation; it is built on the
shared `Modal` primitive.

## Profile and Supervision screen decomposition

`screens/profile-page.tsx` and `screens/supervision-page.tsx` are thin orchestrators (577 and 231
lines) over feature components and hooks, not monolithic screens. Before adding a new
Profile/Supervision feature, look for an existing section/tab component or hook here first.

**Profile** (`components/features/profile/`): `ProfileHeroCard` (cover/avatar/name/stats/tab bar),
`ProfileAboutTab` (owns the Intro/Career/Details sidebar nav and composes the three sections below),
`ProfileIntroSection`, `ProfilePersonalDetailsSection`, `ProfileCareerSection` (all three RHF+Zod —
see below), `ProfilePostsTab`, `ProfileMediaTab`, `ProfileStatsTab`, `ProfileGuardianRequestsTab`.
Supporting hooks: `hooks/use-profile-image-uploads.ts` (cover/avatar crop-upload flow),
`hooks/use-profile-career.ts` (career entries CRUD).

**Supervision** (`components/features/supervision/`): `SupervisionSidebar` (wards list),
`SupervisionAddPlayerFlow` (the add-player wizard — composes `SupervisionCreatePlayerDetailsStep`,
`CreatePlayerProtectStep`, `LinkExistingPlayerStep`; the choice/success/link-sent steps stay inline
in the flow component since they own no form state — see its file doc comment for why),
`SupervisionPermissionsTab`, `SupervisionRequestsTab`, `SupervisionLogsTab`. Supporting hooks:
`hooks/use-supervision-wards.ts`, `hooks/use-supervision-permissions.ts`,
`hooks/use-supervision-requests.ts`, `hooks/use-supervision-logs.ts` (the last has a documented,
preserved-not-fixed duplicate-fetch quirk inherited from the original screen — read its file doc
comment before touching it).

**Naming note**: `components/features/parent/CreatePlayerDetailsStep.tsx` (used by
`ParentOnboardingModal`) and `components/features/supervision/SupervisionCreatePlayerDetailsStep.tsx`
are two distinct components with historically near-identical purposes and, before this pass,
identical names — the supervision one was renamed to disambiguate. They are not currently unified
into one shared component: they have different field-naming conventions, different validation
strictness (only the `parent` one age-validates the child's DOB), and different external contracts
(controlled-from-parent vs. self-contained). Unifying them is a legitimate follow-up but a distinct,
larger change from converting each to RHF+Zod in place, which is what this pass did.

## Loading skeletons and route boundaries

Loading happens in two phases, and the distinction is what decides which component to use:

1. **The layout is not yet known** — the `/auth/me` bootstrap is in flight, or the root transition is
   resolving. Use `BrandLoader` (`common/BrandLoader.tsx`): the MHN mark, centred, theme-aware, with
   a `prefers-reduced-motion` fallback. Pass `fullScreen` for a first paint. A route-shaped skeleton
   here would guess at a layout that may not be the one that loads.
2. **The layout is known** — use the route's skeleton, which shimmers the real thing.

`app/loading.tsx` is the brand loader for exactly this reason: it is layout-agnostic, so unlike the
route-shaped skeleton that used to live there it is safe at a level that also covers `(auth)` and
`(public)`. Each route group then owns its own `loading.tsx` for phase 2.

- `(authenticated)/loading.tsx` → `FullAppSkeletonLoader` (sidebar + Home content skeleton).
- `(auth)/loading.tsx` → `AuthSkeletonLoader`, built on the real `.onboarding-screen`/
  `.onboarding-modal` classes.
- `(public)/loading.tsx` → `PublicProfileSkeletonLoader`, mirroring the public profile's own shell.
- Per-route overrides (`profile/loading.tsx`, `network/loading.tsx`) compose the exported
  `AppShellSkeleton` with their own content skeleton.

The route guards render their own placeholder while the `/auth/me` bootstrap is in flight, and that
is usually the one a user actually sees — `loading.tsx` alone is not the whole story. Keep the two in
sync: `GuestGuard` uses `AuthSkeletonLoader` (it only wraps signed-out routes), while
`AuthenticatedGuard`/`ParentRoleGuard`/`MinorPlayerGuard` use `FullAppSkeletonLoader`.

Add a new route's skeleton as a `loading.tsx` beside its `page.tsx` — do **not** branch on
`usePathname()` inside a shared skeleton. That is what the previous single root loader did; it
required `'use client'` and a hydration-mismatch workaround, and one of its branches silently never
matched the real route name.

Skeleton fills use `.mhn-skeleton-shimmer`, whose gradient is token-driven and follows the theme.
Never hardcode a skeleton colour.

## Cooldown / countdown primitives

`apps/web/src/hooks/use-countdown.ts` (`useCountdown`, `formatCountdown`) is the single countdown
timer, and `apps/web/src/components/ui/resend-countdown.tsx` (`ResendCountdown`) is the cooldown-gated
"resend" control built on it. Extracted from `VerifyEmailForm`'s inline `setInterval`; reuse these for
any throttled-retry surface rather than re-implementing a timer in a component.

- `useCountdown({ seconds, autoStart?, onComplete? })` → `{ remaining, isActive, restart, stop }`.
  The interval is created once per run, not once per tick — the inline version it replaced listed the
  current count in its effect dependencies, tearing the timer down and rebuilding it 60 times per
  cooldown and letting the countdown drift slower than real time.
- `ResendCountdown` renders a live `MM:SS` timer (`role="timer"`, using the existing
  `.mhn-timer-text` / `.mhn-timer-text-urgent` classes) and swaps to a `common/Button` action when the
  cooldown ends. It does **not** restart itself when the action fires: the owner calls `restart()`
  through the forwarded `ResendCountdownHandle` only after the request actually succeeds, so a failed
  resend leaves the button pressable instead of imposing a full cooldown for a code that never sent.
  `onCountdownComplete` fires at zero — `VerifyEmailForm` uses it to clear its "code sent" notice so
  the confirmation does not outlive the window it describes.

Success feedback colors come from the `--color-success*` tokens in `index.css`'s `@theme` block
(with dark overrides in `:root.dark`), added alongside `--color-destructive`. Do not hardcode greens
at the call site.

## Shared date-of-birth parsing and age rules

`packages/validation/src/date.ts` is the single owner of date-of-birth parsing and age calculation
across web and mobile. Use it instead of `new Date(value)` or hand-rolled year subtraction anywhere
a DOB is validated:

- `parseDob(value, format?)` — strict parse of `'DD/MM/YYYY'` (manual/masked text inputs) or
  `'YYYY-MM-DD'` (native `<input type="date">`); auto-detects when `format` is omitted. Rejects
  calendar overflow, US month-first ordering, pre-1900 years, and the loose strings `new Date()`
  would otherwise coerce.
- `ageFromDate(date, now?)` / `ageFromDob(value, format?, now?)` — whole years, adjusted for whether
  this year's birthday has passed (`date-fns`'s `differenceInYears`).
- `isFutureDate(date, now?)` — **use this to reject future dates.** `ageFromDate` truncates toward
  zero, so a date under a year ahead returns `0`, not a negative; testing the age's sign silently
  misses it.

`validateProfileField`'s `dateOfBirth` branch and `packages/core`'s `calculateAge` both delegate
here, so the signup, parent add-player, edit-profile, and Profile > Personal Details surfaces all
apply identical rules. Age _limits_ stay with each caller — they legitimately differ (parents 18+,
players 5–100), and the differing strictness noted below is preserved intentionally.

## Profile/Supervision form Zod schemas

All manually-managed forms across the project (the ones tracked as a `docs/IMPLEMENTATION_STATUS.md`
backlog item) are now RHF + Zod. The schemas live in `packages/validation/src/forms.ts`:
`profileIntroFormSchema`, `profilePersonalDetailsFormSchema`, `careerFormSchema`,
`linkPlayerFormSchema`, `createPlayerDetailsFormSchema` (Supervision's add-player wizard — no age
validation, matching its prior behavior), and `parentOnboardingPlayerDetailsFormSchema`
(`ParentOnboardingModal`'s equivalent step — does age-validate, matching its prior behavior). Each
wraps the exact prior hand-rolled validation rules rather than introducing new ones; do not
"strengthen" one to match the other without an explicit product decision, since their differing
strictness is preserved intentionally, not accidentally.

Where `CareerFormFields`/`PersonalDetailsFields` (pre-existing controlled `values`/`onChange`/`errors`
components) are reused rather than rebuilt on `Controller`, the owning RHF form bridges state via
`form.watch()`/`useWatch({ control })` + `form.setValue()` rather than per-field `Controller` — a
standard, valid RHF pattern for wrapping a multi-field controlled child. Use `useWatch({ control })`,
not `form.watch()`, in any new form component: `pnpm lint:check` enforces this (`form.watch()` trips
the `react-hooks/incompatible-library` rule, since React Compiler can't safely memoize around it).
