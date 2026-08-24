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
- Updated Vite development server HMR configuration and local runtime environment configuration for seamless local dev startup.
- Implemented production-ready Centralized Feed-Access Permission System in @my-hockey-network/domain based on /v1/auth/me response (evaluating profile completion and guardian approval across Web & Mobile).
- Replaced free-form Position text input with a Select dropdown constrained strictly to backend-validated options (Center, Left Wing, Right Wing, Defense, Goaltender) preventing 400 validation errors on profile updates.
- Standardized cover image resolution in mediaUtils and components across Home, My Network, and Profile cards to default to high-res professional banner /cover.png whenever user coverUrl is null or missing.
- Updated HomePage feed layout to conditionally hide Search and Sort controls when feed contains no data and no active search query.
- Connected Career Teams form on Profile page to updateAuthProfile API (PATCH /v1/auth/profile) with loading spinner and session re-fetch.
- Replaced static sample post fallbacks on Profile page Posts tab with NoDataFound empty state component when GET /v1/posts returns empty items array.
- Updated Gender input to Select dropdown with valid enum options (Male, Female, Non-Binary), eliminated browser alert() popups in favor of Toast notifications, and conditionally hid player-specific fields (Position, Jersey Number, Career) for non-player roles.
- Aligned right-side icon padding for DOB and Gender inputs, restricted Gender options strictly to Male and Female, and removed Public Reference ID and Account Status read-only fields from Personal Details.
- Routed Create Post actions on Profile Page through requirePermission() to ensure permission restriction toasts display with interactive CTA button when profile is incomplete or guardian approval is pending.
- Implemented complete Parent role onboarding and player management wizard (ParentOnboardingModal) matching Figma designs with real API calls (POST /v1/supervision/children and POST /v1/relationships/guardian-invites) and Family Hub refetch integrations.
- Integrated child-specific gated approval requests (GET/POST /v1/approvals) and activity logs (GET /v1/supervision/:minorId/logs) in SupervisionPage, added unit tests in packages/core for approvals and supervision logs, and added a dedicated Guardian Requests tab (GET /v1/relationships/guardian-requests/pending) on ProfilePage for Parent role users.
- Updated default initial authentication mode in OnboardingModal and OnboardingPage to default to Sign In (login) instead of Sign Up, ensuring both first-time visits and post-logout redirects default to Sign In.
- Fixed right-alignment padding and positioning for Date of Birth calendar picker icon and replaced native select arrows with crisp custom SVG chevron dropdown arrows across ProfilePage and EditProfileModal.
- Created PermissionSkeletonLoader and SidebarWardSkeleton with gradient shimmer wave animation matching the My Network theme, replacing static gray loading boxes and request skeleton fallbacks on the Supervision Permissions page.
- Connected Family Hub dropdown member clicks to navigate directly to the selected child's Supervision page, preserved the in-page add player card workflow (`viewMode === 'choice'`), and added simultaneous shimmer wave loading during player creation/invitation API calls.
- Created `apps/web/src/utils/guardianUtils.ts` containing standardized `GUARDIAN_RELATION_OPTIONS` (`MOTHER`, `FATHER`, `LEGAL_GUARDIAN`, `GRANDPARENT`, `OTHER`), `formatDobToIso` helper, and `formatDobInput` live typing auto-formatter. Connected live typing formatting (`DD/MM/YYYY`) and native datepicker synchronization to the Supervision page DOB field, matching Sign Up.
- Updated Header Family dropdown to display the first 3 members with a "Show More" option navigating to Supervision page, and updated the post-player-creation "Go to Profile" button to navigate directly to the newly created player's profile view.
- Implemented production-ready live supervision permissions evaluation based on `GET /v1/supervision/me/permissions`. Updated `@my-hockey-network/domain` (`evaluateFeedPermissions`, `canCreatePost`, `canLikePost`, `canComment`, `canSharePost`, `canFollowOthers`, `canSendMessages`, `canCreateGroupChats`), normalized API response in `@my-hockey-network/core`, and integrated control checks in `useFeedPermissions` and UI components.

## Current quality gates

- Obfuscation/security scan must report zero findings.
- TypeScript and lint must pass for both applications.
- Shared executable code must exceed 80% statements, branches, functions, and lines.
- Production web build must pass.
- Web/native UI ownership and npm-only dependency management checks must pass.

Latest measured shared-code coverage: 92.54% statements, 86.45% branches, 100% functions, and
93.19% lines. The suite currently contains 48 tests across 8 test files. The latest web, Android,
and iOS production bundle commands pass.

## Maintainability backlog

- Split the largest presentation files (`profile-page`, `supervision-page`, `EditProfileModal`).
- Replace remaining legacy `any` response normalization with contracts.
- Add route-level lazy loading to reduce the web entry bundle.
- Expand UI integration/e2e coverage as stable Figma screens are implemented.
- Review and remediate dependency audit findings without forced breaking upgrades.
