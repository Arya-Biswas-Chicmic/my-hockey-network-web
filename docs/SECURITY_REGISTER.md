# Security and severity register

Last reviewed: 2026-08-21

## Closed P0

| Finding | Resolution |
| --- | --- |
| API client printed cookies, authorization headers, OTP/body data as cURL | Removed all credential/body logging; added regression coverage. |
| Mobile signup authenticated with `user_auth_token` | Removed; signup and login now require backend OTP verification and `/auth/me`. |

## Closed P1

| Finding | Resolution |
| --- | --- |
| User web routes relied on static local-storage checks | Replaced with hydrated auth/guest/role guards and BrowserRouter. |
| Web persisted access/refresh credentials in browser storage | Web now relies on httpOnly cookies; CSRF is memory-only. |
| Mobile persisted bearer credentials through Redux/AsyncStorage | Tokens moved to Expo SecureStore; Redux persists no auth state. |
| Shared API code accessed browser globals and build environment directly | Environment and storage are injected by platform adapters. |
| Runtime `.env` was tracked | `.env` patterns are ignored; only `.env.example` is versioned. |
| Temporary API origin was duplicated in source/deployment files | Removed URL fallbacks and proxies; each platform now requires its runtime variable. |

## Closed P2

| Finding | Resolution |
| --- | --- |
| Duplicate web API clients could bypass the secure shared client | Removed duplicates; remaining service facade uses configured core client. |
| Duplicate auth/navigation state caused inconsistent refresh behavior | Removed static auth store/session navigation and centralized bootstrap state. |
| Security workflow was optional | Scanner is attached to npm lifecycle commands and the pre-commit hook. |
| Architecture documentation was stale | Added maintained context, status, security, testing, and policy documents. |

## Open risk/debt

- Dependency audit currently reports third-party findings; upgrades require compatibility review.
- Raw `console.log` calls are prohibited in production source by `npm run security:check`. Future
  telemetry must use redacted structured events rather than request/profile payloads.
- The obfuscation scanner detects suspicious source patterns; it is not a substitute for dependency,
  SAST, secret, or backend security review.
