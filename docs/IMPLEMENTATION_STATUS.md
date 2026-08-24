# Implementation status

Last reviewed: 2026-08-24

## Completed

- Established npm workspaces for reusable web/mobile code.
- Added contracts, domain, API client, auth, validation, and design-token packages.
- Added web and mobile platform adapters for environment and credential storage.
- Replaced static user-panel path/token checks with BrowserRouter and hydrated guards.
- Aligned mobile sign-in/sign-up with the shared OTP flow.
- Removed hard-coded mobile authentication and bearer-token Redux persistence.
- Removed credential-bearing cURL logging and duplicate legacy API clients.
- Added AutoBid-style pre-command obfuscation scanning and Husky checks.
- Added documentation freshness enforcement and an 80% shared-code coverage gate.
- Added unit and integration coverage for API refresh/error behavior, OTP onboarding, role rules,
  validation schemas, and signup age/guardian rules.
- Migrated all web buttons/form controls through shared web primitives and migrated mobile Signup to
  the existing native Button, Input, and ScreenWrapper.
- Added component-reuse enforcement and consolidated design-system compatibility onto design-tokens.
- Validated npm workspace manifests, declared internal package dependencies, and retained one npm lockfile.
- Standardized the repository on npm, with install-time and verification checks rejecting other lockfiles.
- Moved web/mobile API origins into ignored runtime environment files and removed all checked-in URL fallbacks.
- Added verified Android and iOS Expo export commands without adding Expo web presentation.
- Added mandatory coding-agent instructions and explicit web-routing/mobile-navigation documentation.
- Extended automated boundary checks to reject React Navigation in web and browser routing in mobile.
- Updated shared API client options to support sessionStorage adapter alias and added unit test coverage.
- Centralized API endpoint URLs into @my-hockey-network/contracts/urls.ts and updated auth/api-client services to reference API_ENDPOINTS catalog.

## Current quality gates

- Obfuscation/security scan must report zero findings.
- TypeScript and lint must pass for both applications.
- Shared executable code must exceed 80% statements, branches, functions, and lines.
- Production web build must pass.
- Web/native UI ownership and npm-only dependency management checks must pass.

Latest measured shared-code coverage: 94.73% statements, 88.99% branches, 100% functions, and
95.9% lines. The suite currently contains 37 tests across six test files. The latest web, Android,
and iOS production bundle commands pass.

## Maintainability backlog

- Split the largest presentation files (`profile-page`, `supervision-page`, `EditProfileModal`).
- Replace remaining legacy `any` response normalization with contracts.
- Add route-level lazy loading to reduce the web entry bundle.
- Expand UI integration/e2e coverage as stable Figma screens are implemented.
- Review and remediate dependency audit findings without forced breaking upgrades.
