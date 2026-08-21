# Testing and coverage strategy

Last reviewed: 2026-08-21

## Test layers

- Unit tests cover domain calculations, role authorization, and validation schemas.
- API-client tests cover headers, envelopes, failures, refresh serialization, retry, and logout paths.
- Auth integration tests exercise shared auth use cases through the real API client with mocked HTTP.
- Platform/UI tests will grow screen-by-screen as approved designs are implemented.

## Coverage boundary

The enforced coverage boundary is shared executable code intended for both web and mobile:
`api-client`, `auth`, `domain`, `validation`, and signup age rules. Contracts and design tokens are
declarative and excluded. Presentation-heavy React DOM/Native files are excluded from this shared
gate and require focused component/e2e tests rather than meaningless render-line coverage.

The enforced minimum is 80% for statements, branches, functions, and lines. Coverage output is
written to `coverage/` and is not committed.

## Commands

- `npm run test:run`: fast test suite without coverage.
- `npm run test:coverage`: test suite plus enforced coverage.
- `npm run verify`: full local/CI quality gate.

No feature is considered complete when it lowers enforced coverage below the threshold.
