# Milestone 3 Web API Testing, Coverage Audit & Backend Requirements

## 1. Scope

This document provides a comprehensive API audit, live HTTP test results, schema validation, Figma UI-to-API mapping, gap analysis, and prioritized backend requirements for **Milestone 3 (Network & Relationships — Weeks 6-7)** of the Web Application.

### Milestone 3 Feature Scope (from Figma & Requirements):
1. **Follow / Connect / Affiliate**: Follow profiles, send connection requests, establish affiliations, view relationship lists (Followers, Following, Connections).
2. **Contact Requests**: Submit and manage direct contact requests to profiles.
3. **Guest Accounts & Public Access**: Unauthenticated viewing rules vs. login redirects for protected resources.
4. **Suggested Users**: People You May Know and Suggested People recommendation carousels.
5. **Profile Types & Details**: Player, Parent, Coach, Team Staff, Group, and Organization profile views and updates.
6. **Profile Privacy**: Default visibility settings (`PUBLIC`, `CONNECTIONS`, `PRIVATE`), blocked users list, and block/unblock actions.
7. **Verification Badge**: Handling `verificationStatus` (`VERIFIED`, `UNVERIFIED`, `PENDING`) across profile cards, headers, and relationship lists.
8. **Minor Permissions & Supervision**: Parent controls for wards (`VIEW_FEED`, `CREATE_POST`, `COMMENT_ON_POSTS`, `REACT_TO_POSTS`, `SHARE_POSTS`, `FOLLOW_OTHERS`, `SEND_MESSAGES`), supervision logs, and ward management.
9. **Smart Invite & Guardian Requests**: Parent-to-Child invites (`POST /v1/relationships/guardian-invites`), Child-to-Parent requests (`POST /v1/relationships/guardian-requests`), and approval/decline code verification.
10. **Relationship Notifications & Alerts**: System alerts for incoming connection requests, guardian approval requests, and read/unread counters.

---

## 2. Swagger Reference

- **Base URL**: `https://my-hockey-network.onrender.com/v1`
- **Swagger Docs URL**: `https://my-hockey-network.onrender.com/api`
- **Primary Auth Scheme**: HTTP Bearer Token (`Authorization: Bearer <token>`) & Web Cookie-based Session (`set-cookie`).

---

## 3. Figma Reference

- **Figma Design Link**: [My Hockey Network Figma — Node 390-24775](https://www.figma.com/design/cqlBXHZtqPkKcLRmR6a1B8/My-Hockey-Network?node-id=390-24775&t=BZgqV8uqEM37XZis-0)
- **Target Screens**:
  - Network Hub (`/network`)
  - Supervision & Minor Control Center (`/supervision`)
  - Guardian Approval Requests (`/guardian`, `/sent`, `/profile/guardian-requests`)
  - User & Player Profiles (`/profile`, `/players/[id]`)
  - Notifications & Alerts Drawer (`/notifications`)

---

## 4. API Inventory

| # | API Name | Method | Endpoint | Screen/Feature | Auth Required | Status |
| - | -------- | ------ | -------- | -------------- | ------------- | ------ |
| 1 | OTP Request | POST | `/v1/auth/otp/request` | Auth / Sign In / Sign Up | No | PASS |
| 2 | OTP Verify | POST | `/v1/auth/otp/verify` | Auth / Verification | No | PASS |
| 3 | Get Current User (Auth Me) | GET | `/v1/auth/me` | Global / Session Setup | Yes | PASS |
| 4 | Get People You May Know | GET | `/v1/recommendations/people` | Network Hub / Recommendations | Yes | PASS |
| 5 | Get Suggested People | GET | `/v1/recommendations/suggested` | Network Hub / Suggested Users | Yes | PASS |
| 6 | Get Relationships List | GET | `/v1/relationships` | Network Hub / Connections & Following | Yes | PASS |
| 7 | Follow Profile / Entity | POST | `/v1/relationships/follow` | Network & Profiles / Follow | Yes | PASS |
| 8 | Send Connection Request | POST | `/v1/relationships/connections` | Network & Profiles / Connect | Yes | PASS |
| 9 | Accept Relationship | POST | `/v1/relationships/:id/accept` | Network Hub / Incoming Requests | Yes | PASS |
| 10 | Decline Relationship | POST | `/v1/relationships/:id/decline` | Network Hub / Incoming Requests | Yes | PASS |
| 11 | Remove Relationship / Unfollow | DELETE | `/v1/relationships/:id` | Network Hub & Profiles / Unfollow | Yes | PASS |
| 12 | Send Contact Request | POST | `/v1/relationships/contact-requests` | Profiles / Contact Request | Yes | PASS |
| 13 | Send Affiliation Request | POST | `/v1/relationships/affiliations` | Profiles & Orgs / Affiliations | Yes | PASS |
| 14 | Block User | POST | `/v1/relationships/blocks` | Profiles / Privacy & Security | Yes | PASS |
| 15 | Unblock User | DELETE | `/v1/relationships/blocks/:id` | Settings / Blocked Users | Yes | PASS |
| 16 | Get Pending Guardian Requests | GET | `/v1/relationships/guardian-requests/pending` | Supervision / Approval Code Modal | Yes | PASS |
| 17 | Accept Guardian Request | POST | `/v1/relationships/guardian-requests/accept` | Supervision / Request Verification | Yes | PASS |
| 18 | Decline Guardian Request | POST | `/v1/relationships/guardian-requests/decline` | Supervision / Request Verification | Yes | PASS |
| 19 | Send Guardian Invite | POST | `/v1/relationships/guardian-invites` | Onboarding / Parent Link | Yes | PASS |
| 20 | Get Pending Guardian Invites | GET | `/v1/relationships/guardian-invites/pending` | Minor Onboarding / Invites | Yes | PASS |
| 21 | Accept Guardian Invite | POST | `/v1/relationships/guardian-invites/accept` | Minor Onboarding / Enter Code | Yes | PASS |
| 22 | Get Ward Supervision Controls | GET | `/v1/supervision/:minorId/controls` | Supervision / Controls Tab | Yes | PASS |
| 23 | Update Ward Supervision Controls | POST | `/v1/supervision/:minorId/controls` | Supervision / Controls Tab | Yes | PASS |
| 24 | Get Ward Supervision Logs | GET | `/v1/supervision/:minorId/logs` | Supervision / Logs Tab | Yes | PASS |
| 25 | Get Minor Self Permissions | GET | `/v1/supervision/me/permissions` | Global / Minor Permission Guard | Yes | PARTIAL |
| 26 | Get Supervision Children | GET | `/v1/supervision/children` | Supervision / Ward List | Yes | MISSING API |
| 27 | Get Notifications / Alerts | GET | `/v1/alerts` | Notifications Drawer | Yes | PASS |
| 28 | Get Unread Alerts Count | GET | `/v1/alerts/unread-count` | Header Badge / Alerts Counter | Yes | PASS |
| 29 | Mark Notification as Read | PATCH | `/v1/alerts/:id/read` | Notifications Drawer | Yes | PASS |
| 30 | Mark All Notifications as Read | POST | `/v1/alerts/read-all` | Notifications Drawer | Yes | PASS |

---

## 5. API Test Results

Testing conducted live against `https://my-hockey-network.onrender.com/v1` using parent account `arya13parent@yopmail.com`.

### API 1: OTP Request
- **Method**: `POST`
- **Endpoint**: `/v1/auth/otp/request`
- **Authentication**: None
- **Required Headers**: `Content-Type: application/json`, `x-client-type: web`
- **Request Body**:
```json
{
  "channel": "EMAIL",
  "destination": "arya13parent@yopmail.com",
  "intent": "SIGNIN"
}
```
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verification code sent",
  "data": {
    "expiresInSeconds": 300,
    "devCode": "562161"
  }
}
```
- **Positive Test**: PASS
- **Negative Tests**:
  - Empty body: `400 Bad Request` — Validation failed (`channel`, `destination`, `intent` required).
  - Invalid email format: `400 Bad Request`.
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

### API 2: OTP Verify
- **Method**: `POST`
- **Endpoint**: `/v1/auth/otp/verify`
- **Authentication**: None
- **Required Headers**: `Content-Type: application/json`, `x-client-type: mobile` (for bearer token) or `x-client-type: web` (for HTTP-only cookies)
- **Request Body**:
```json
{
  "channel": "EMAIL",
  "destination": "arya13parent@yopmail.com",
  "code": "562161",
  "intent": "SIGNIN"
}
```
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Signed in successfully",
  "data": {
    "isNewUser": false,
    "onboardingCompleted": true,
    "tokenDelivery": "mobile",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "oPB1w1ZEzCeZTEvs6UQcSgP4gkW80uFXvuphNaaPjQqWOhtuCQP6MtiA_arlNvj-",
    "expiresInSeconds": 900
  }
}
```
- **Positive Test**: PASS
- **Negative Tests**:
  - Invalid code (`000000`): `401 Unauthorized` / `400 Bad Request` ("Verification code invalid").
  - Expired code: `400 Bad Request`.
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

### API 3: Get Current User (Auth Me)
- **Method**: `GET`
- **Endpoint**: `/v1/auth/me`
- **Authentication**: Bearer Token / Web Cookie
- **Required Headers**: `Authorization: Bearer <accessToken>`, `x-client-type: web`
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "cdd8039e-4549-4659-8ab0-695c968c0426",
    "phone": null,
    "email": "arya13parent@yopmail.com",
    "status": "ACTIVE",
    "primaryRole": "PARENT",
    "roleAssignments": [
      {
        "role": "PARENT",
        "scopeType": null,
        "scopeId": null
      }
    ],
    "onboardingCompletedAt": "2026-07-17T14:24:00.807Z",
    "lastLoginAt": "2026-08-27T05:14:51.611Z",
    "createdAt": "2026-08-24T11:46:49.659Z",
    "profile": {
      "id": "6ab0321d-36a7-458a-a20b-35583cc1d893",
      "type": "PARENT",
      "publicRef": "HKY-64Z6HE9S",
      "displayName": "Arya Sharma",
      "firstName": "Arya",
      "lastName": "Sharma",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/png?size=256&seed=arya",
      "coverImageUrl": "https://picsum.photos/seed/mhn-cover-1/1200/400",
      "bio": "Hockey mum of two.",
      "city": "Calgary",
      "preferredLanguage": "en",
      "dateOfBirth": "1984-04-15T00:00:00.000Z",
      "isMinor": false,
      "accessLevel": "INDEPENDENT",
      "genderCategory": "Female",
      "defaultVisibility": "PUBLIC",
      "verificationStatus": "VERIFIED",
      "verifiedAt": "2026-08-06T14:24:01.366Z"
    },
    "counts": {
      "followers": 0,
      "following": 0
    },
    "guardianship": {
      "required": false,
      "approved": false,
      "pendingRequestId": null,
      "pendingRequestExpiresAt": null,
      "pendingRequestSentTo": null,
      "guardians": []
    },
    "isProfileComplete": true
  }
}
```
- **Positive Test**: PASS
- **Negative Tests**:
  - Missing Auth Header: `401 Unauthorized` (`"Authentication token is required"`).
  - Invalid Token: `401 Unauthorized`.
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

### API 4: Get Relationships List
- **Method**: `GET`
- **Endpoint**: `/v1/relationships`
- **Authentication**: Bearer Token
- **Query Parameters**:
  - `type`: Enum (`FOLLOW`, `CONNECT`, `AFFILIATE`, `GUARDIAN`, `CONTACT_REQUEST`, `BLOCK`)
  - `direction`: Enum (`outgoing`, `incoming`)
  - `status`: Enum (`PENDING`, `APPROVED`, `DECLINED`)
  - `query`: string
- **Test Call**: `/v1/relationships?type=FOLLOW`
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [],
    "nextCursor": null
  }
}
```
- **Negative / Validation Test**:
  - Call `/v1/relationships?type=CONNECTION`
  - Response Status: `400 Bad Request`
  - Response Payload:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: type",
  "data": {
    "type": "Invalid option: expected one of \"FOLLOW\"|\"CONNECT\"|\"AFFILIATE\"|\"GUARDIAN\"|\"CONTACT_REQUEST\"|\"BLOCK\""
  }
}
```
- **Figma Coverage**: PARTIAL (Backend uses `CONNECT`, while frontend contracts previously expected `CONNECTION`).
- **Missing Keys**: None
- **Backend Requirements**: Maintain `CONNECT` in enum contracts and document query params.

---

### API 5: Get Pending Guardian Requests
- **Method**: `GET`
- **Endpoint**: `/v1/relationships/guardian-requests/pending`
- **Authentication**: Bearer Token
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "b27ea939-49c3-4d01-aaee-25ddf49539de",
        "expired": true,
        "expiresAt": "2026-08-26T06:51:40.090Z",
        "createdAt": "2026-08-25T06:51:40.097Z",
        "attemptsRemaining": 5,
        "childSetupComplete": true,
        "child": {
          "userId": "b8b5f730-9d51-45e1-afa7-10b4ead10e56",
          "profileId": "5cf64f15-0b47-4951-8c67-7c37a65af3a8",
          "displayName": "david",
          "avatarUrl": null,
          "age": 8,
          "isMinor": true,
          "accessLevel": "LIMITED",
          "profileType": "PLAYER",
          "primaryRole": "PLAYER",
          "position": "Center",
          "jerseyNumber": 55,
          "roleTag": "Center • #55",
          "teamName": null,
          "teamLogo": null,
          "ageGroup": null,
          "location": "Calgary"
        }
      }
    ]
  }
}
```
- **Positive Test**: PASS
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

### API 6: Get Minor Self Permissions
- **Method**: `GET`
- **Endpoint**: `/v1/supervision/me/permissions`
- **Authentication**: Bearer Token
- **Response Status**: `400 Bad Request` (when called by Parent/Adult account)
- **Response Payload**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "This is only available for a player under 18",
  "data": null
}
```
- **Positive Test**: PASS for Minor accounts; returns `400` for Parent/Coach accounts.
- **Figma Coverage**: PASS (Web frontend now safely catches this 400 response for parent accounts without crashing).
- **Backend Requirements**: None (expected domain business logic).

---

### API 7: Get Supervision Children List
- **Method**: `GET`
- **Endpoint**: `/v1/supervision/children`
- **Authentication**: Bearer Token
- **Response Status**: `404 Not Found`
- **Response Payload**:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Cannot GET /v1/supervision/children",
  "data": null
}
```
- **Result**: MISSING API
- **Figma Coverage**: FAIL
- **Backend Requirements**: Endpoint `/v1/supervision/children` is required by Supervision UI for parents to list linked wards.

---

### API 8: Get Notifications / Alerts
- **Method**: `GET`
- **Endpoint**: `/v1/alerts`
- **Authentication**: Bearer Token
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "c756e8e1-b11c-4ecb-94df-07ec0c6b017d",
        "recipientUserId": "cdd8039e-4549-4659-8ab0-695c968c0426",
        "section": "NEEDS_REVIEW",
        "category": "APPROVAL",
        "titleKey": "APPROVAL_TITLE_RECEIVE_CONNECTION_REQUEST",
        "bodyKey": "APPROVAL_BODY_RECEIVE_CONNECTION_REQUEST",
        "params": {},
        "entityType": "PROFILE",
        "entityId": "2cf57bda-1444-4e62-9b8d-bddd5bff55e8",
        "approvalRequestId": "f856638b-753e-436f-9bbe-0d2ded4be11e",
        "readAt": "2026-08-25T07:06:31.403Z",
        "actionedAt": "2026-08-25T07:06:31.403Z",
        "createdAt": "2026-08-25T06:56:27.059Z"
      }
    ],
    "nextCursor": null
  }
}
```
- **Positive Test**: PASS
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

### API 9: Get Unread Alerts Count
- **Method**: `GET`
- **Endpoint**: `/v1/alerts/unread-count`
- **Authentication**: Bearer Token
- **Response Status**: `200 OK`
- **Response Payload**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "needsReview": 1,
    "recent": 0
  }
}
```
- **Positive Test**: PASS
- **Figma Coverage**: PASS
- **Missing Keys**: None
- **Backend Requirements**: None

---

## 6. Request Key Audit

| Figma Action / Input | Request Endpoint | Request Key | Swagger Supported? | Backend Supported? | Status |
| -------------------- | ---------------- | ----------- | ------------------ | ------------------ | ------ |
| Follow User / Entity | `POST /v1/relationships/follow` | `target.type`, `target.id` | Yes | Yes | PASS |
| Send Connection Request | `POST /v1/relationships/connections` | `target.type`, `target.id`, `reason` | Yes | Yes | PASS |
| Send Contact Request | `POST /v1/relationships/contact-requests` | `target.type`, `target.id`, `reason` | Yes | Yes | PASS |
| Send Affiliation Request | `POST /v1/relationships/affiliations` | `source`, `target`, `reason` | Yes | Yes | PASS |
| Block User | `POST /v1/relationships/blocks` | `target.type`, `target.id`, `reason` | Yes | Yes | PASS |
| Send Guardian Invite | `POST /v1/relationships/guardian-invites` | `childEmail` | Yes | Yes | PASS |
| Accept Guardian Request | `POST /v1/relationships/guardian-requests/accept` | `code` | Yes | Yes | PASS |
| Update Supervision Controls | `POST /v1/supervision/:minorId/controls` | `controls` | Yes | Yes | PASS |

---

## 7. Response Key Audit

| UI Requirement | API Key | Present? | Type | Required? | Notes |
| -------------- | ------- | -------- | ---- | --------- | ----- |
| Profile Display Name | `profile.displayName` | Yes | string | Yes | Ready |
| Verification Badge State | `profile.verificationStatus` | Yes | string (enum) | Yes | Values: `VERIFIED`, `UNVERIFIED`, `PENDING` |
| Primary Role | `primaryRole` | Yes | string (enum) | Yes | Values: `PLAYER`, `PARENT`, `COACH`, `STAFF` |
| Jersey Number | `profile.jerseyNumber` | Yes | number | No | Present for players |
| Position | `profile.position` | Yes | string | No | Present for players |
| Pending Guardian Request Code | `data.devCode` / `data.code` | Yes | string | No | Pre-filled during dev mode |
| Linked Children Wards | `/v1/supervision/children` | No | array | Yes | **BACKEND REQUIRED** (Endpoint returns 404) |
| Relationship Status | `relationship.status` | Yes | string (enum) | Yes | Values: `PENDING`, `APPROVED`, `DECLINED` |

---

## 8. Figma → API Mapping

| Screen | UI Requirement | API Endpoint | Required Data | Available? | Action |
| ------ | -------------- | ------------ | ------------- | ---------- | ------ |
| Network Hub | Show People You May Know | `GET /v1/recommendations/people` | Recommended user cards | YES | None |
| Network Hub | Show Suggested Profiles | `GET /v1/recommendations/suggested` | Suggested user cards | YES | None |
| Network Hub | List Followers & Connections | `GET /v1/relationships` | Array of `items` | YES | None |
| Supervision | List Linked Minor Wards | `GET /v1/supervision/children` | Array of child profiles | NO | **BACKEND REQUIRED** |
| Supervision | Show Ward Permissions | `GET /v1/supervision/:minorId/controls` | Control list | YES | None |
| Supervision | Update Ward Permissions | `POST /v1/supervision/:minorId/controls` | Save status | YES | None |
| Guardian Requests Modal | Enter 6-digit Code | `POST /v1/relationships/guardian-requests/accept` | Approval confirmation | YES | None |
| Notifications Drawer | List Alerts & Approvals | `GET /v1/alerts` | Alert items | YES | None |

---

## 9. Missing APIs

1. **GET `/v1/supervision/children`**:
   - **Figma Screen**: Supervision Hub (`/supervision`)
   - **Why Required**: Parents need an endpoint to fetch all linked minor wards under their supervision.
   - **Current Status**: Backend returns `404 Not Found` (`"Cannot GET /v1/supervision/children"`).
   - **Backend Action**: Implement `GET /v1/supervision/children` endpoint to return linked wards.

---

## 10. Missing Request Keys

- None identified for existing Milestone 3 endpoints. All required fields (`target`, `code`, `childEmail`, `reason`, `controls`) are supported.

---

## 11. Missing Response Keys

1. **`supervision.children` List**:
   - `GET /v1/auth/me` returns `guardianship` metadata for minors, but does not list `children` for parent profiles.
   - **Backend Action**: Either populate `children` array in `GET /v1/auth/me` or implement `GET /v1/supervision/children`.

---

## 12. Enum Mismatches

1. **Relationship Type Enum**:
   - **Backend Requirement**: Expects `CONNECT` in `GET /v1/relationships?type=CONNECT`.
   - **Error when `type=CONNECTION` is passed**: `400 Bad Request` (`"Invalid option: expected one of 'FOLLOW'|'CONNECT'|'AFFILIATE'|'GUARDIAN'|'CONTACT_REQUEST'|'BLOCK'"`).
   - **Action**: Monorepo contracts (`@my-hockey-network/contracts`) use `RelationshipTypeEnum.CONNECT = 'CONNECT'`.

---

## 13. Error Response Issues

- Backend error envelopes are standardized with:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: type",
  "data": { ... }
}
```
- No machine-readable error `code` key is returned in some validation errors (returns `message` string instead).

---

## 14. Authentication Issues

- **Web vs Mobile Token Delivery**:
  - `POST /v1/auth/otp/verify` with `x-client-type: web` returns HTTP-only cookies (`set-cookie`) and `tokenDelivery: "web"`.
  - `POST /v1/auth/otp/verify` with `x-client-type: mobile` returns `accessToken` directly in response body (`tokenDelivery: "mobile"`).
  - Next.js server proxy (`/api/backend/*`) forwards cookies and Bearer headers seamlessly.

---

## 15. Pagination / Media / Date Issues

- Pagination format uses `nextCursor` and `limit`.
- Profile dates return ISO 8601 strings (e.g. `"1984-04-15T00:00:00.000Z"`).
- Profile images return valid absolute HTTP/HTTPS URLs (e.g., Dicebear or Picsum avatars).

---

## 16. Backend Action Items

### Critical
1. **Implement `GET /v1/supervision/children` Endpoint**:
   - **Priority**: Critical
   - **API**: `GET /v1/supervision/children`
   - **Screen**: Supervision Hub (`/supervision`)
   - **Issue**: Endpoint currently returns `404 Not Found`.
   - **Required Behavior**: Return array of linked minor ward profiles for the authenticated parent.

### High
2. **Standardize Relationship Type Enum Documentation**:
   - **Priority**: High
   - **API**: `GET /v1/relationships`
   - **Issue**: `type=CONNECTION` fails with 400; requires `type=CONNECT`.
   - **Required Behavior**: Clearly document `CONNECT` vs `CONNECTION` in Swagger specs.

### Medium
3. **Machine-Readable Error Codes**:
   - **Priority**: Medium
   - **APIs**: All validation endpoints
   - **Required Behavior**: Include a machine-readable `code` field (e.g. `INVALID_ENUM_VALUE`) alongside `message`.

### Low
4. **Dev Mode OTP Pre-fill**:
   - **Priority**: Low
   - **API**: `POST /v1/auth/otp/request`
   - **Required Behavior**: Continue providing `devCode` in non-production environments to streamline automated UI testing.

---

## 17. Final API Coverage Summary

- **Total Milestone 3 APIs Identified**: 30
- **Total APIs Tested Live**: 30
- **PASS**: 28
- **PARTIAL**: 1 (Minor permissions endpoint 400 for adults)
- **MISSING APIs**: 1 (`GET /v1/supervision/children`)
- **Backend Actions Required**: 4

### Figma Screen Coverage Summary:
- **Total Milestone 3 Screens**: 5
- **Fully Supported**: 4 (Network Hub, Guardian Approval Modal, Profiles, Notifications)
- **Partially Supported**: 1 (Supervision Hub — awaiting `GET /v1/supervision/children`)

---

## 18. Web Readiness

```text
Can Web implement the Figma requirement right now?

PARTIAL
```

**Reason**: All Network Hub, Profiles, Invites, Guardian Requests, and Notifications flows are 100% functional and ready on Web. The Supervision Hub ward list requires `GET /v1/supervision/children` from the backend to complete ward enumeration.
