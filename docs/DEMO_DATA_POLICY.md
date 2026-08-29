# Demo data policy

Last reviewed: 2026-08-30

Temporary UI fixtures are allowed only when a supplied design includes content that the current
backend contract cannot provide and the product owner has explicitly requested a populated demo.
They are never a substitute for an existing API.

## Required structure

- Store web fixtures under `apps/web/src/demo-data/<feature>/*.json`.
- Export typed, read-only access through that feature's `index.ts`; components import the facade,
  not individual JSON files.
- Keep API-backed data authoritative. Profile identity, posts, career, and people suggestions query
  their real services first; when a successful response has no display records/fields, the Profile
  screen uses the matching centralized JSON fixture. Unsupported Profile Media, Stats, and Events
  read their JSON fixtures directly until contracts and endpoints exist.
- Do not put mock arrays, made-up people, statistics, media, events, or API response objects inside
  React components, hooks, stores, or service modules.
- Do not merge demo records into TanStack Query caches for real endpoints. Select fallbacks at the
  presentation/view-model boundary so a later successful API response replaces them naturally.
- Static demo images belong in `apps/web/public/` and are referenced from JSON with root-relative
  paths. Reuse an existing asset before adding another file.

## Removal rule

When a real endpoint supplies complete display data, add its contract/service/query tests and delete
the corresponding JSON fixture and facade export in the same change. A failed request remains an
error; fallback is for absent/empty display data, not for concealing transport or server failures.

## Current inventory

- `feed/records.json` (via `feed/index.ts`'s `toFeedPostProps`/`toPostItem`/`getMyDemoMediaItems`
  adapters): the single shared feed dataset — 30 records (10 "mine" + 20 "other"), spanning text-only,
  single-image, multi-image, and event-with-Register posts, 8 of the "other" 20 flagged `isSaved`.
  Product direction 2026-08-29: **these are appended after real API posts always, not only when the
  real feed is empty** — this is intentional filler to show a populated feed, not an empty-state
  fallback, and must not be re-gated on `items.length === 0` (a prior pass in this session did that
  by mistake — see `useHomeFeed.ts`'s comment). Read by Home feed (For You), Profile > Posts (own
  profile, "mine" records only), Profile > Media (derives its grid from "mine" records' images), and
  Saved (filters the `isSaved` records) — this is the "single data base ... used in multiple
  locations" this file's own header comment refers to. Network and Groups tabs still use their own
  small `home/network.json`/`home/groups.json` fixtures until they get the same treatment.
- `connections/connections.json`: Following and Followers preview members. The Connections query
  uses `GET /relationships?type=FOLLOW` with outgoing/incoming direction respectively, keeps API
  rows first, and appends the corresponding fixture rows without modifying its TanStack cache.
- `profiledata.json`: field-level identity fallback, including Figma profile photo and unsupported
  Height/Weight display values. Only ever consulted when there is no real profile at all
  (`hasRealProfile` in `use-profile-view-model.ts`) — a real profile's individually-unset fields
  render as `—`, never padded out from this fixture.
- `stats.json`: Profile Stats filters and dashboard.
- `events.json`: Profile Events list.
- `teams.json`: fallback Career entries when the Career response is empty.
- `people-you-may-know.json`: fallback rows supplied to the shared `WhoToFollowWidget` only when its
  recommendation query has no records.
- `supervision/index.ts` (`DEMO_GUARDIAN_REQUESTS`, `DEMO_SUPERVISION_LOGS`): 3 demo guardian-
  relationship requests and 10 demo activity-log rows for Supervision's Requests/Logs tabs,
  **appended after real API results always**, same "not an empty-state fallback" rule as the feed
  records above — feedback 2026-08-30: "multiple request from demo data and in log tabs and add 10
  logs". Demo request ids use the `demo-` prefix so `SupervisionRequestsTab` routes their Approve/
  Decline to an info toast instead of the real guardian-relationship API, which has no backend
  record for a fabricated id.
- `other-profiles/index.ts` (`getOtherProfileDemoData`): rich profile records (bio, position,
  jersey, DOB, follower counts, demo posts) for the "other user profile" popup
  (`OtherUserProfileModal.tsx`), keyed by the SAME `demo-person-*` ids `people-you-may-know.json`
  already uses and `demo-following-05` from `connections.json` — feedback 2026-08-30: "make a dummy
  data in json as discussed so that we can show other user profile similar to our profile". Only
  covers a handful of already-established identities (Connor McDavid, Sidney Crosby, Jack Hughes)
  deliberately — clicking any OTHER demo person or a real API author still opens the popup, it just
  falls back to whatever fields the click site itself had (name/avatar/role/team/location) with
  every other field showing its normal empty state, never fabricated.

All Profile fixture images are local WebP files under `apps/web/public/demo/profile/`. Demo IDs use
the `demo-` prefix; mutations against them are handled locally and must never be sent to backend APIs.

## Not demo data — permanent mechanisms, do not remove without asking

The following look like temporary/placeholder scaffolding but are **intentionally permanent**
(feedback 2026-08-29: "keep update document that why we have kept dummy data so whenever other try
to remove they must ask developer that this kept for this reason so no one can replace until they
want"). If you're a future session (or developer) tempted to delete or "properly implement" these
because a real API now exists — ask first; they are not stand-ins waiting to be swapped out.

- **`@/utils/local-avatar-storage.ts` (the local-first profile-photo cache).** Every profile photo
  render in the app reads from this `localStorage` cache in preference to whatever `avatarUrl` the
  backend returns — see the override in `auth-context.tsx`'s `updateUser` and
  `use-profile-view-model.ts`'s `liveAvatar`. This stays in place **even after** the real photo-upload
  API works: "even after implementing the API if API record successful uploading... we will keep the
  profile photo local also and everywhere we will fetch from the local profile photo." It is not a
  workaround for the upload API being broken; it is the permanent display source, by design.
- **`@/services/profile-photo.service.ts`'s `saveProfilePhotoDummy`.** A deliberately fake "save" call
  standing in for the real upload endpoint, which is a real, already-implemented multi-step flow
  (`uploadMediaFile` + `updateAuthProfile` in `@my-hockey-network/core`) that just isn't working right
  now. When it's fixed, replace this function's *body* with a real call (the file's own header comment
  shows exactly what that looks like) — keep the function name and
  `Promise<SaveProfilePhotoResult>` shape so `use-profile-image-uploads.ts` doesn't need to change.
  Do not delete the local-avatar-cache mechanism above when you do this.
