# Testing and coverage strategy

Last reviewed: 2026-08-28

## Test layers

- Unit tests cover domain calculations, role authorization, and validation schemas, including the
  shared date-of-birth parser/age rules in `packages/validation/src/date.ts` (format strictness,
  birthday boundaries, leap days, and future-date rejection) under a frozen clock.
- API-client tests cover headers, envelopes, network/JSON server failures, empty 204 responses, refresh
  serialization, retry, logout paths, and mutation 5xx localization (no global outage trigger).
- Core posts-flow tests cover feed normalization, post-ID validation, update/delete/reaction paths, and
  comment fetch error propagation.
- Web toast tests cover feature-safe error fallback messaging.
- Auth integration tests exercise shared auth use cases through the real API client with mocked HTTP.
- jsdom integration tests exercise React Hook Form auth, OTP, post, and comment submission plus
  authenticated/role route redirects. Platform/UI tests continue to grow screen-by-screen.
- Query tests exercise TanStack Query caching, request deduplication, retries, and prefix invalidation.
- Profile presentation tests cover birthday-boundary age calculation, Figma date/count formatting,
  and the complete centralized demo-data contract (identity/feed/media/stats/events/teams/people).
  Profile posts use the TanStack infinite-query facade and scroll sentinel; demo IDs are mutation-
  isolated, while authenticated browser coverage still requires the gated test account.
- API-client tests verify credentialed cookie requests, refresh serialization, and storage boundaries.
- Production smoke tests cover application startup, root-to-sign-in redirect, public SEO output,
  login/session bootstrap, protected-route redirect, one critical authenticated shell route, and
  not-found behavior.

## Next.js test matrix

- Unit: domain rules, validation, metadata/canonical builders, cache-tag mapping, serializers, query
  keys, error normalization, and permission decisions. **In place** for domain/validation/API-client
  layers plus atomic control sanitization, accessible file selection, and feed mapping (196 Vitest
  tests across 31 files, ≥80% coverage on the enforced boundary).
- Component integration: React Hook Form + Zod behavior, loading/empty/error states, accessible
  primitives, Client Component interactions, and TanStack Query mutation/invalidation behavior. **In
  place** for auth and content forms.
- Route integration: Server/Client boundaries, layouts, auth and role protection, cookie forwarding,
  no-store privacy, metadata, status codes, and rendering-mode assumptions. Route guard fail-closed
  and redirect behavior (`AuthenticatedGuard`/`GuestGuard`/`ParentRoleGuard`) is now covered directly
  by `apps/web/src/components/routing/__tests__/guards.test.tsx`, mocking `next/navigation` and
  `useAuth` rather than a real router — dedicated route-level tests for cookie forwarding/no-store
  privacy/metadata are still not added.
- Directional guardian coverage includes domain role predicates, `MinorPlayerGuard`, child-invite
  query/mutation invalidation, the shared request card callback contract, and one-shot/post-OTP auth
  bootstrap behavior.
- Playwright smoke/e2e: `apps/web/playwright.config.ts` and `apps/web/e2e/` (see
  `apps/web/e2e/README.md`) now exist. `public.spec.ts` covers public entry/SEO output (root sign-in redirect,
  `robots.txt`, `sitemap.xml`), 404s, the onboarding form, and a protected-route guest redirect — it
  needs no real backend and runs in CI on every push/PR. `authenticated-flow.spec.ts` covers the full
  login → feed → post creation → like → comment → logout journey but is gated behind
  `E2E_TEST_EMAIL`/`E2E_ALLOW_LIVE_WRITES=1` since it writes real data to whatever backend it targets;
  it is not yet wired into CI because CI has no dedicated test account. **Remaining gap:** the broader
  navigation/refresh/direct-entry/production-build-startup coverage this section originally called
  for is still not authored beyond what the two specs above exercise.
- Non-functional: automated accessibility checks, representative Lighthouse CI budgets, dependency
  audit, obfuscation scan, type/lint/format checks, and secret/environment validation. Obfuscation
  scan, type/lint checks, and CI (`.github/workflows/ci.yml`) are in place; accessibility and
  Lighthouse budgets are not yet established.

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

Latest verified result (2026-08-28): 95.32% statements, 89.08% branches, 98.14% functions, and
95.48% lines. All 286 tests across 41 files passed; the production Next.js build also passed.

## Commands

- `pnpm test:run`: fast test suite without coverage.
- `pnpm test:coverage`: test suite plus enforced coverage.
- `pnpm verify`: full local/CI quality gate.

No feature is considered complete when it lowers enforced coverage below the threshold.

Coverage is necessary but not sufficient. New or changed logic must be meaningfully asserted, and
critical route, security, SEO, accessibility, and production-start behavior must pass even when the
numeric threshold is already satisfied.

Playwright smoke/e2e remains a separate `pnpm --filter @my-hockey-network/web test:e2e` command.
Authenticated write coverage requires a dedicated non-production test account and remains gated.
