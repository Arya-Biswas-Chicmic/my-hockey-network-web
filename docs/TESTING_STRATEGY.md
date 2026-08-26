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
