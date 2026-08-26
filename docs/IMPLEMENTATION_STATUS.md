# Implementation status

Last reviewed: 2026-08-25

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
- Implemented Profile Career / Teams history feature matching backend specification. Added `PROFILES` catalog to `@my-hockey-network/contracts`, created `careerApi.ts` (`getProfile`, `createCareerEntry`, `updateCareerEntry`, `deleteCareerEntry`), added unit test coverage in `career.test.ts` (5 tests), and connected real API CRUD state, privacy handling, and verified badges to ProfilePage About tab.
- Created `DeleteCareerModal` component styled identically to `LogoutModal` (modal backdrop, pop-in animation, team name prompt, red danger delete action with loading state) for confirmation before deleting career team entries.
- Implemented dynamic backend error handling in `@my-hockey-network/api-client` (parsing ngrok `ERR_NGROK_3200` offline pages, 502/503 HTML gateway errors, network failures, and backend JSON error envelopes) and centralized all web toast messages into a single utility file `apps/web/src/utils/toast.ts`.
- Standardized TypeScript enums into dedicated files in `packages/contracts/src/enums/` (`headers.enum.ts`, `roles.enum.ts`, `permissions.enum.ts`, `auth.enum.ts`, `toast.enum.ts`), exported from `@my-hockey-network/contracts`, and refactored API client, domain permissions, and web toast modules to consume typed enums.
- Implemented 59-second countdown timer (`00:59`) on OTP verification screen (`VerifyEmailForm`), turning text color red during the last 10 seconds (`<= 10s`) and revealing the active `Resend OTP` button at `00:00`.
- Standardized cover image resolution in mediaUtils and components across Home, My Network, and Profile cards to default to high-res professional banner /cover.png whenever user coverUrl is null or missing.
- Centralized all hardcoded user-facing strings, toasts, validation alerts, error fallbacks, and helper texts across web/mobile applications and shared packages into structured constants (`ERROR_MESSAGES`, `SUCCESS_MESSAGES`, `VALIDATION_MESSAGES`, `HELPER_MESSAGES`, `TOAST_MESSAGES`) in `@my-hockey-network/constants`.
- Centralized all hardcoded UI navigation tabs, page main tabs, subtabs, view modes, sections, and auth modes into strongly-typed TypeScript enums (`NavTabEnum`, `SupervisionMainTabEnum`, `SupervisionViewModeEnum`, `ProfileTabEnum`, `ProfileAboutSectionEnum`, `SettingsSubTabEnum`, `NetworkViewModeEnum`, `AuthModeEnum`, `FeedSortEnum`) in `@my-hockey-network/contracts/enums/ui.enum.ts` and refactored state and conditionals across web pages.
- Implemented global application-level `ServerStatusWrapper` at root level (`apps/web/src/theme/providers.tsx`) catching HTTP 502/503/504 and network disconnects from `@my-hockey-network/api-client`, blocking the entire viewport (`100vw` x `100vh`, `zIndex: 99999`), disabling all user interaction, and providing an active ping-check reconnect retry mechanism that automatically restores app state upon server recovery.
- Expanded `SupervisionControlKeyEnum` in `packages/contracts/src/enums/permissions.enum.ts` and refactored `fetchControlsForWard` in `supervision-page.tsx` to eliminate hardcoded supervision control key strings.
- Enforced strict numeric digit (`0-9`) input restrictions across all OTP verification fields (`VerifyEmailForm`, `ApprovalCodeModal`) via regex sanitization on paste/type, `e.preventDefault()` on non-digit keystrokes, and `inputMode="numeric"` / `pattern="[0-9]*"` HTML5 attributes.
- Implemented search input debouncing via `useDebounce` hook across all search inputs in the web application (`home-page.tsx`, `my-network-page.tsx`, `events-page.tsx`, `supervision-page.tsx`, `settings-page.tsx`, `ChatSidebar.tsx`, `ConnectionsView.tsx`, `GroupsView.tsx`, `GroupDetailView.tsx`), delaying feed API requests (`/v1/feed?query=...`) and expensive list filters until 800ms after typing pauses.
- Resolved 400 Bad Request post creation privacy validation errors (`POST /v1/posts`) by translating `Custom` privacy settings to `audienceEnum = 'PRIVATE'` (matching backend schema `"PUBLIC" | "HOCKEY_NETWORK" | "CONNECTIONS" | "GROUP" | "PRIVATE"`), adding real-time field validation for custom `shareWithEmails` / `dontShareWithEmails` textareas in `CreatePostModal.tsx`, and filtering out invalid email strings using `isEmailValid` from `@my-hockey-network/validation`.
- Created `PostAudienceEnum` in `@my-hockey-network/contracts/enums/posts.enum.ts` (`PUBLIC`, `HOCKEY_NETWORK`, `CONNECTIONS`, `GROUP`, `PRIVATE`) and updated `CreatePostDTO` (`@my-hockey-network/core`) and web handlers (`home-page.tsx`, `profile-page.tsx`) to consume the centralized backend enum.
- Created dedicated `/help` page (`HelpPage` in `apps/web/src/pages/help-page.tsx`) featuring real-time debounced topic search, category pills (Account & Profile, Players & Teams, Messaging, Notifications, Privacy & Safety, Technical Support), expandable FAQ accordions, ticket submission form with file upload preview, and direct support contact cards. Integrated route into `ROUTE_MAP`, `AppRouter`, `NavTabEnum.HELP`, and Header user dropdown menu.
- Created `HeaderSkeleton` component (`apps/web/src/components/common/HeaderSkeleton.tsx`) with dark navy gradient background (`#051020` -> `#0a1b36`) and `.mhn-header-shimmer-box` animation to display a professional topbar shimmer matching the real header layout (Left Logo, 5 Center Nav item placeholders, Right Avatar/Name pill) across application loading states.
- Integrated full Post, Comment & Reaction Guardian Approval flow (`/v1/posts`, `/v1/approvals`). Minor/player actions held for guardian approval (`pendingGuardianApproval: true`, `isDraft: true`) display centralized pending notification (`HELPER_MESSAGES.GUARDIAN_APPROVAL_SUBMITTED: "Your post has been submitted and is waiting for parent/guardian approval."`) without adding drafts to active feed. Parent supervision queue (`supervision-page.tsx`) renders action badges (`Post Approval`, `Comment Approval`, `Reaction Approval`), post subject body previews, and executes `approveRequest` (`mode: 'SINGLE_USE'`) to publish posts (`POST_PUBLISHED`) or `declineRequest` to leave posts in draft state.
- Created separate standalone GitHub repository `https://github.com/Arya-Biswas-Chicmic/my-hockey-network-web` under permitted account, pushed complete codebase (`main` and `feature/fixes-stable`), configured root `vercel.json` SPA build rules (`buildCommand: "npm run build:web"`, `outputDirectory: "apps/web/dist"`), connected to Vercel (`chicmic/my-hockey-network`), and deployed production application to `https://my-hockey-network.vercel.app`.
- Refactored web component presentation code, replaced all static inline JS style objects across web pages (`home-page.tsx`, `settings-page.tsx`, `profile-page.tsx`, `supervision-page.tsx`) with modular, reusable CSS utility and component classes in `index.css`, and passed repository verification checks (`npm run verify`).
- Standardized form state management and validation across all web forms (`CreateAccountForm`, `LoginForm`, `VerifyEmailForm`, `GuardianApprovalForm`, `EditProfileModal`, `CareerFormFields`, `ApprovalCodeModal`, `HelpPage`) using Formik + Yup (`createAccountSchema`, `loginSchema`, `otpSchema`, `guardianApprovalSchema`, `editProfileSchema`, `careerSchema`, `createPlayerSchema`, `linkPlayerSchema`, `approvalCodeSchema`, `helpTicketSchema`), created reusable Formik controls (`FormikInput`, `FormikSelect`, `FormikDateInput`, `FormError`), added unit tests (`schemas.test.ts`), and passed monorepo verification checks (`npm run verify`).











## Current quality gates

- Obfuscation/security scan must report zero findings.
- TypeScript and lint must pass for both applications.
- Shared executable code must exceed 80% statements, branches, functions, and lines.
- Production web build must pass.
- Web/native UI ownership and npm-only dependency management checks must pass.

Latest measured shared-code coverage: 93.44% statements, 86.45% branches, 100% functions, and
93.83% lines. The suite currently contains 74 tests across 12 test files. The latest web, Android,
and iOS production bundle commands pass.

## Maintainability backlog

- Split the largest presentation files (`profile-page`, `supervision-page`, `EditProfileModal`).
- Replace remaining legacy `any` response normalization with contracts.
- Add route-level lazy loading to reduce the web entry bundle.
- Expand UI integration/e2e coverage as stable Figma screens are implemented.
- Review and remediate dependency audit findings without forced breaking upgrades.
