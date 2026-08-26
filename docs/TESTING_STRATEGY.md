# Testing and coverage strategy

Last reviewed: 2026-08-26

## Test layers

- Unit tests cover domain calculations, role authorization, and validation schemas.
- API-client tests cover headers, envelopes, network/JSON server failures, empty 204 responses, refresh
  serialization, retry, and logout paths.
- Auth integration tests exercise shared auth use cases through the real API client with mocked HTTP.
- jsdom integration tests exercise Formik auth, OTP, post, and comment submission plus
  authenticated/role route redirects. Platform/UI tests continue to grow screen-by-screen.
- Query tests exercise TanStack Query caching, request deduplication, retries, and prefix invalidation.
- API-client tests verify credentialed cookie requests, refresh serialization, and storage boundaries.
- Production smoke tests cover application startup, one indexable public route, login/session
  bootstrap, protected-route redirect, one critical authenticated shell route, and not-found behavior.

## Future Next.js test matrix

This matrix becomes active only when the owner starts the migration:

- Unit: domain rules, validation, metadata/canonical builders, cache-tag mapping, serializers, query
  keys, error normalization, and permission decisions.
- Component integration: React Hook Form + Zod behavior, loading/empty/error states, accessible
  primitives, Client Component interactions, and TanStack Query mutation/invalidation behavior.
- Route integration: Server/Client boundaries, layouts, auth and role protection, cookie forwarding,
  no-store privacy, metadata, status codes, and rendering-mode assumptions.
- Playwright smoke/e2e: production build startup, public SEO output, authentication, protected routes,
  navigation, refresh/direct entry, 404s, and one happy-path journey per critical feature.
- Non-functional: automated accessibility checks, representative Lighthouse CI budgets, dependency
  audit, obfuscation scan, type/lint/format checks, and secret/environment validation.

Tests must be deterministic, isolated, and free from production writes. Use a controlled test API or
contract-faithful interception. Avoid fixed sleeps; use observable UI/network readiness. A smoke test
is short and release-blocking, while broader e2e suites may exercise more combinations.

## Coverage boundary

The enforced boundary includes shared executable code plus security-sensitive web storage, the web
query client, and centralized web form validators. Contracts and design tokens are declarative and
excluded. Presentation-heavy React DOM/Native markup uses focused integration tests rather than
meaningless render-line coverage.

The enforced minimum is 80% for statements, branches, functions, and lines. Coverage output is
written to `coverage/` and is not committed.

## Commands

- `npm run test:run`: fast test suite without coverage.
- `npm run test:coverage`: test suite plus enforced coverage.
- `npm run verify`: full local/CI quality gate.

No feature is considered complete when it lowers enforced coverage below the threshold.

Coverage is necessary but not sufficient. New or changed logic must be meaningfully asserted, and
critical route, security, SEO, accessibility, and production-start behavior must pass even when the
numeric threshold is already satisfied.

Planned post-migration command names should provide separate `test:unit`, `test:integration`,
`test:smoke`, `test:e2e`, `test:coverage`, and aggregate `verify` gates under pnpm. These commands do
not exist yet and must not be added before migration authorization.
