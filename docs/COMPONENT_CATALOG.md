# Component catalog and reuse policy

Last reviewed: 2026-08-26

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
- `common/Spinner`, `Toast`, `PendingBanner`, `NoDataFound`, `ServerDown`: reusable feedback/state UI.
- `supervision/guardian-relationship-request-card`: reusable presentation for both child-facing
  guardian invitations and parent-facing guardian requests. It receives typed request data and
  callbacks; routes/hooks choose the endpoint direction.
- `ProfileSummaryCard`: reused by Home and Network; updated with word-break and overflow containment for display names and team handles.
- `GuardianApprovalModal` and `RequestSentCard`: reused in onboarding and dedicated auth pages.
- Feature components exist for events, feed/posts, messaging, network/groups, notifications, profile,
  and onboarding. Search the appropriate feature folder before adding another card/modal/view.

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
  - `fallbackSrc` (default `/userPlaceholder.png`): shown when `src` is empty or the image fails to
    load. Pass a different fallback (`/cover.png`, `/HC.png`, `/kcBlue.png`, ...) to match the
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
  const cropped = await cropImage(files[0], { shape: 'circle', title: 'Adjust profile photo' });
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
sweeping pass. Every new modal must be built on `Modal`, not a hand-rolled overlay div.

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
