# Demo data policy

Last reviewed: 2026-08-28

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

- `profiledata.json`: field-level identity fallback, including Figma profile photo and unsupported
  Height/Weight display values.
- `feed.json`: fallback posts when the Profile posts endpoint returns no records.
- `media.json`: Profile Media gallery.
- `stats.json`: Profile Stats filters and dashboard.
- `events.json`: Profile Events list.
- `teams.json`: fallback Career entries when the Career response is empty.
- `people-you-may-know.json`: fallback rows supplied to the shared `WhoToFollowWidget` only when its
  recommendation query has no records.

All Profile fixture images are local WebP files under `apps/web/public/demo/profile/`. Demo IDs use
the `demo-` prefix; mutations against them are handled locally and must never be sent to backend APIs.
