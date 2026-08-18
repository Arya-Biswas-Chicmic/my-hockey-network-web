# My Hockey Network — Web Application & API Integration

Production-ready web application for **My Hockey Network**, built with React 19, TypeScript 5, Vite, and centralized core architecture. Fully integrated with backend endpoints specified in `endpoints.md`, `flows.md`, and `README.md`.

---

## 1. System Architecture & Tech Stack

* **Core Framework:** React 19 + TypeScript 5
* **Build Tool:** Vite 6 Monorepo
* **Shared Architecture:** `packages/core` (Centralized `apiFetch`, HTTP interceptors, token refresh, and endpoint catalogs)
* **Styling:** Vanilla CSS design system with HSL tokens, CSS variables, glassmorphism, and responsive breakpoints ([index.css](file:///Users/harpindersingh/Desktop/my-hockey-network/apps/web/src/index.css))

---

## 2. API Integration & Service Mappings

All API operations are implemented in `packages/core/src/api`:

| Module | Service File | Core Endpoints Handled |
|---|---|---|
| **Auth** | [authApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/authApi.ts) | `POST /v1/auth/otp/request`, `POST /v1/auth/otp/verify`, `POST /v1/auth/onboarding`, `GET /v1/auth/me`, `POST /v1/auth/refresh`, `POST /v1/auth/logout` |
| **Relationships** | [relationshipsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/relationshipsApi.ts) | `GET /v1/relationships`, `POST /follow`, `POST /connections`, `POST /contact-requests`, `POST /affiliations`, `POST /blocks`, `POST /guardian-invites`, `POST /guardian-requests` |
| **Feed & Posts** | [postsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/postsApi.ts) | `GET /v1/feed`, `POST /v1/posts`, `POST /v1/posts/:id/repost`, `POST /v1/posts/:id/reactions`, `POST /v1/posts/:id/comments` |
| **Groups** | [groupsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/groupsApi.ts) | `GET /v1/groups`, `POST /v1/groups`, `GET /v1/groups/:id`, `POST /v1/groups/:id/join`, `POST /v1/groups/:id/members` |
| **Organizations** | [organizationsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/organizationsApi.ts) | `GET /v1/organizations`, `POST /v1/organizations`, `GET /v1/organizations/:id` |
| **Supervision** | [supervisionApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/supervisionApi.ts) | `GET /v1/supervision`, `POST /v1/supervision/children`, `GET /v1/supervision/:minorId/controls`, `PUT /v1/supervision/:minorId/controls`, `GET /v1/supervision/:minorId/logs` |
| **Approvals** | [approvalsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/approvalsApi.ts) | `GET /v1/approvals`, `GET /v1/approvals/:id`, `POST /v1/approvals/:id/approve`, `POST /v1/approvals/:id/decline` |
| **Alerts** | [alertsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/alertsApi.ts) | `GET /v1/alerts`, `GET /v1/alerts/unread-count`, `POST /v1/alerts/:id/read`, `POST /v1/alerts/read-all` |

---

## 3. Key Screen Navigation Flows

1. **Home Feed (`HomePage.tsx`):** Displays home feed posts, create post box, suggestions sidebar, and skeleton loaders.
2. **My Network (`MyNetworkPage.tsx`):** Connections, Followers, and Pending Requests with tab switching and search filtering.
3. **Supervision / Family Hub (`SupervisionPage.tsx`):**
   - **Permissions Tab:** Granular permission category accordions (Home, Network, Messaging, Notifications).
   - **Requests Tab:** Supervision request cards with Accept / Ignore CTAs.
   - **Logs Tab:** Activity audit logs with date/time, activity summary, initiator, and action links.
   - **Add Minor Wizard (`+`):** Multi-step wizard supporting both *Create a new player profile* and *Link an existing player profile* leading to the **Request Sent!** screen.
4. **Settings (`SettingsPage.tsx`):** General Account settings, Notification preferences toggle, and Blocked Users unblock management with search filtering.
5. **User Profile (`ProfilePage.tsx`):** Public player/user profile header, stats, bio, media items, and connections list.
6. **Notifications (`NotificationsPage.tsx`):** Alerts list with unread filter and mark-as-read options.

---

## 4. Testing Status & Quality Assurance

* **TypeScript Compilation:** `npm run typecheck` passes with **0 errors**.
* **Automated API Testing:** `node scripts/test-all-apis.mjs` executes integration tests against backend routes.
* **Code Security:** `npm run scan` verifies no obfuscation or security issues exist.

---

## 5. Documentation & Backend Dependencies

* **[API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md):** Complete architectural breakdown, flow sequence diagrams, and endpoint catalog.
* **[BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md):** Specification of missing backend fields (`categories` grouping on controls, initial controls on child create, counterparty nested profile expansion).

---

## 6. Running Locally

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run automated API integration tests
node scripts/test-all-apis.mjs

# Execute TypeScript typecheck
npm run typecheck
```
