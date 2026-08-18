# My Hockey Network — API Integration & Architecture Guide

This document presents the architecture, endpoint mappings, flow sequences, token lifecycle, error handling rules, and integration status for **My Hockey Network** based on `endpoints.md`, `flows.md`, and `README.md`.

---

## 1. Core Architecture & Client Conventions

### Base Configuration
- **Base URL:** `https://reposeful-kareen-controllingly.ngrok-free.dev/v1` (Configurable via `VITE_API_BASE_URL`).
- **HTTP Client Location:** [packages/core/src/api/client.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/client.ts)
- **Data Envelope Standard:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { }
}
```

### Transport & Headers
| Header | Value / Description | Handled By |
|---|---|---|
| `X-Client-Type` | `web` (cookie delivery) or `mobile` (Bearer token delivery) | `apiFetch` in `client.ts` |
| `Authorization` | `Bearer <accessToken>` (Mobile / JWT session) | `apiFetch` in `client.ts` |
| `X-CSRF-Token` | Value from `mhn_csrf` cookie for mutating requests | `apiFetch` in `client.ts` |
| `Accept-Language` | `en` (Server-side error message translation) | `apiFetch` in `client.ts` |

---

## 2. Integrated API Flow Sequences

### 2.1 Passwordless Auth & Onboarding Flow
1. **Request OTP:** `POST /v1/auth/otp/request` (`{ channel: "EMAIL", destination, intent: "SIGNUP" | "SIGNIN" }`).
2. **Verify OTP:** `POST /v1/auth/otp/verify` (`{ channel, destination, code, intent }`). Returns `{ accessToken, refreshToken, onboardingCompleted }`.
3. **Submit Profile:** `POST /v1/auth/onboarding` (`{ roles: ["PLAYER", "PARENT"], displayName, dateOfBirth }`).
4. **Bootstrap Session:** `GET /v1/auth/me` returns role assignments, `isMinor`, and `accessLevel` (`LIMITED`, `SUPERVISED`, `FULL`).

### 2.2 Parent Links Child Flow (Parent → Child)
1. **Send Invite:** `POST /v1/relationships/guardian-invites` (`{ childEmail }`).
2. **Child Fetches Pending:** `GET /v1/relationships/guardian-invites/pending`.
3. **Child Accepts:** `POST /v1/relationships/guardian-invites/accept` (`{ code }`).
4. **Refetch Session:** `GET /v1/auth/me` updates child `accessLevel` from `LIMITED` to `SUPERVISED`.

### 2.3 Minor Signs Up Alone Flow (Child → Parent)
1. **Child Requests Guardian:** `POST /v1/relationships/guardian-requests` (`{ parentEmail }`).
2. **Child Onboards:** `POST /v1/auth/onboarding`.
3. **Parent Accepts Request:** `POST /v1/relationships/guardian-requests/accept` (`{ code }`).

### 2.4 Youth Safety Kernel (ALLOW / DENY / PENDING)
- Actions by minors or targeted at minors return `200 OK` with `pendingGuardianApproval: true` when guardian approval is required.
- Posts, team joins, and connection requests held for approval exist in a `PENDING` state and fan out only after guardian decision via `POST /v1/approvals/:id/approve`.

---

## 3. Core API Services Catalog

All services are exported from `@my-hockey-network/core`:

| Module | Source File | Key Service Functions |
|---|---|---|
| Auth | [authApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/authApi.ts) | `requestOtp`, `verifyOtp`, `submitOnboarding`, `getAuthMe`, `logout`, `refreshAuthSession` |
| Relationships | [relationshipsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/relationshipsApi.ts) | `followUser`, `sendConnectionRequest`, `getRelationships`, `acceptRelationship`, `declineRelationship`, `sendGuardianInvite`, `acceptGuardianInvite`, `declineGuardianInvite`, `getPendingGuardianRequests`, `acceptGuardianRequest`, `declineGuardianRequest`, `sendContactRequest`, `sendAffiliation`, `blockUser`, `unblockUser` |
| Posts & Feed | [postsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/postsApi.ts) | `getFeed`, `createPost`, `likePost`, `unlikePost`, `getComments`, `addComment`, `repostPost` |
| Groups | [groupsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/groupsApi.ts) | `getGroups`, `getGroupById`, `createGroup`, `joinGroup`, `leaveGroup`, `getGroupMembers`, `addGroupMember`, `approveGroupMember`, `registerGroupFile` |
| Organizations | [organizationsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/organizationsApi.ts) | `getOrganizations`, `getOrganizationById`, `createOrganization`, `updateOrganization` |
| Supervision | [supervisionApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/supervisionApi.ts) | `getSupervisionData`, `createManagedChild`, `getSupervisionControls`, `updateSupervisionControls`, `getSupervisionLogs` |
| Approvals | [approvalsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/approvalsApi.ts) | `getApprovals`, `getApprovalById`, `approveRequest`, `declineRequest` |
| Alerts | [alertsApi.ts](file:///Users/harpindersingh/Desktop/my-hockey-network/packages/core/src/api/alertsApi.ts) | `getAlerts`, `getUnreadAlertCount`, `markAlertAsRead`, `markAllAlertsAsRead` |

---

## 4. Verification & Testing

### Automated Test Suite Execution
Run the automated endpoint test suite against the live ngrok backend:

```bash
node scripts/test-all-apis.mjs
```

### Test Coverage Results
- **Health Checks:** `/v1/health` (200), `/v1/health/ready` (200).
- **Authentication:** `requestOtp` (200), `verifyOtp` (200/400 validation), `onboarding` (201), `getAuthMe` (200).
- **Supervision & Family Hub:** `getSupervisionData` (200), `createManagedChild` (201), `getSupervisionControls` (200), `updateSupervisionControls` (200).
- **Approvals & Governance:** `getApprovals` (200), `approveRequest` (200), `declineRequest` (200).
- **Feed & Groups:** `getFeed` (200), `createPost` (201), `getGroups` (200), `createGroup` (201).
- **Alerts & Notifications:** `getAlerts` (200), `getUnreadAlertCount` (200).
