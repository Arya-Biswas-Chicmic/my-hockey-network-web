# Security and severity register

Last reviewed: 2026-08-26

## Closed P0

| Finding | Resolution |
| --- | --- |
| API client printed cookies, authorization headers, OTP/body data as cURL | Removed the formatter and logger; tests cover `console.log` and `console.info`, and the scanner rejects either pattern. |
| Mobile signup authenticated with `user_auth_token` | Removed; signup and login now require backend OTP verification and `/auth/me`. |

## Closed P1

| Finding | Resolution |
| --- | --- |
| User web routes relied on static local-storage checks | Replaced with hydrated auth/guest/role guards and BrowserRouter. |
| Web persisted access/refresh credentials in browser storage | Removed local/session storage and JavaScript cookie token reads. Web relies on credentialed httpOnly cookies; CSRF is memory-only. |
| Mobile persisted bearer credentials through Redux/AsyncStorage | Tokens moved to Expo SecureStore; Redux persists no auth state. |
| Shared API code accessed browser globals and build environment directly | Environment and storage are injected by platform adapters. |
| Runtime `.env` was tracked | `.env` patterns are ignored; only `.env.example` is versioned. |
| Temporary API origin was duplicated in source/deployment files | Removed fallbacks, tunnel headers, and deployment proxies; the scanner audits deployment configuration files. |
| Cookie login appeared to work without a readable cookie | Confirmed the intended HttpOnly flow: credentialed requests and `/auth/me` establish auth; JavaScript cookie visibility is neither required nor permitted. Backend CORS/cookie requirements are documented. |

## Closed P2

| Finding | Resolution |
| --- | --- |
| Duplicate web API clients could bypass the secure shared client | Removed duplicates; remaining service facade uses configured core client. |
| Duplicate auth/navigation state caused inconsistent refresh behavior | Removed static auth store/session navigation and centralized bootstrap state. |
| Security workflow was optional | Scanner is attached to npm lifecycle commands and the pre-commit hook. |
| Architecture documentation was stale | Added maintained context, status, security, testing, and policy documents. |

## Open risk/debt

- Dependency audit currently reports third-party findings; upgrades require compatibility review.
- A non-breaking `npm audit fix` resolved the independently patchable Nano ID advisory. The remaining
  report is 17 Expo/Metro toolchain advisories (9 high, 8 moderate) whose npm-proposed remediation is
  the breaking Expo SDK 54 to 57 upgrade. Do not run `--force`; perform that migration with Expo's SDK
  upgrade tooling and full Android/iOS regression testing in a dedicated change.
- Raw `console.log` calls are prohibited in production source by `pnpm security:check`. Future
  telemetry must use redacted structured events rather than request/profile payloads.
- The obfuscation scanner detects suspicious source patterns; it is not a substitute for dependency,
  SAST, secret, or backend security review.
- Feature-level native fetch and Axios are prohibited. The only direct-fetch exception is a signed
  object-storage upload that deliberately receives no application credentials.
