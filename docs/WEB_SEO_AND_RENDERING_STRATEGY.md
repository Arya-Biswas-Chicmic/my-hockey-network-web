# Web SEO, rendering, and ISR strategy

Last reviewed: 2026-08-26

## Status

This is the approved target policy for the future Next.js web migration. Implementation is paused
until the owner explicitly starts it. Nothing in this document authorizes adding Next.js files,
dependencies, cache configuration, metadata, or deployment changes to the current Vite application.

SEO applies to the public user-facing web portal. The authenticated portal, account screens, and
Admin Panel are not search acquisition surfaces and must not expose private data to crawlers or a
shared cache.

## Route classification comes first

Every web route must be recorded in a route inventory before migration and assigned one rendering
and indexing policy. Do not choose a rendering mode only because it is technically available.

| Route class | Examples | Rendering target | Search policy |
| --- | --- | --- | --- |
| Public, durable content | marketing, rules, venue directory | SSG or long-lived ISR | index and include in sitemap |
| Public, changing content | events, clubs, teams, leagues, news, public profiles | ISR with tag/path invalidation | index when content is canonical and complete |
| Public, request-sensitive content | location/personalized public results | SSR or dynamic rendering | decide per route; canonicalize stable URLs |
| Authenticated or role-protected | home feed, messages, supervision, settings | dynamic/no-store | `noindex`, excluded from sitemap |
| Authentication and transitions | login, OTP, reset, invite acceptance | dynamic | `noindex, nofollow`, excluded from sitemap |
| Draft, preview, empty, or restricted content | unpublished news/profile preview | dynamic/no-store | `noindex`, never emitted in structured data |

Personalized, permission-controlled, draft, or session-derived output must never be placed in an ISR
or public shared cache. Authorization must be enforced server-side; crawler directives are not an
access-control mechanism.

## ISR rules

- Use time-based revalidation only when bounded staleness is acceptable and documented per route.
- Prefer on-demand tag/path invalidation after a successful content mutation or trusted backend
  webhook. A cache tag needs one clear data owner and an invalidation test.
- Treat revalidation periods as product decisions. Record the source of truth, acceptable staleness,
  invalidation event, failure behavior, and owner in the route inventory.
- Keep the last valid public result available when regeneration fails, while reporting the failure
  to observability. Never replace valid content with a partially generated page.
- Avoid request waterfalls. Fetch independent server data concurrently and hydrate TanStack Query
  only where a Client Component needs the same interactive server state.
- Do not cache responses containing cookies, tokens, role data, private profile fields, or user-
  specific recommendations.
- Verify the installed Next.js version's cache and revalidation APIs at migration time. Do not copy
  stale examples from memory because these APIs can change between major versions.

## Required SEO implementation

- Define a metadata baseline at the root and route-specific static `metadata` or
  `generateMetadata` for unique title, description, canonical URL, Open Graph, and social cards.
- Generate `robots` and `sitemap` through Next.js metadata file conventions. Only canonical,
  indexable, successful public URLs belong in the sitemap.
- Emit valid JSON-LD only for supported public entity types. Serialize trusted structured values;
  never interpolate unsanitized user content into executable markup.
- Use meaningful HTTP status codes: real 404s for missing entities, permanent redirects for moved
  canonical content, and no soft-404 success pages.
- Provide one clear page heading, semantic landmarks, descriptive link text, useful image alt text,
  and accessible keyboard/focus behavior.
- Use `next/image`, `next/font`, and `next/script` where appropriate. Third-party scripts must have a
  business owner, consent/privacy review, loading strategy, and measurable performance budget.
- Establish canonical host, HTTPS behavior, trailing-slash policy, locale strategy, and redirect
  rules before production cutover.

## Verification gates

- Unit-test metadata builders, canonical URL helpers, route classification, and structured-data
  transformations.
- Integration-test public page rendering, empty/error states, auth privacy, cache ownership, and
  invalidation behavior.
- Playwright smoke tests must assert representative public metadata, canonical links, robots rules,
  sitemap reachability, protected-route redirects, 404 behavior, and a production-mode page load.
- Run automated accessibility checks and Lighthouse CI on a small representative route set. Budgets
  must be baselined during migration rather than invented without measurements.
- Validate rendered HTML as a signed-out browser and ensure no private/session payload is present.

## Primary references

- [Next.js metadata and `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js App Router project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [TanStack Query advanced server rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

