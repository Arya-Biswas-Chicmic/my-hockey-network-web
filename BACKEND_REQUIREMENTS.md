# Backend API Requirement & Data Gap Specification

**Project:** My Hockey Network  
**Reference Docs:** `endpoints.md`, `flows.md`, `README.md`  
**Figma Spec:** [My Hockey Network Figma Design](https://www.figma.com/design/cqlBXHZtqPkKcLRmR6a1B8/My-Hockey-Network?node-id=455-13733&t=4bpe2iYjQMAnRTqE-0)

---

## 1. Executive Summary

This document specifies the exact missing backend fields, current vs. expected response schemas, and required API adjustments necessary to fully support the frontend UI and Figma design requirements for My Hockey Network.

All endpoints in `packages/core/src/api` have been integrated using production-level standard architecture (`apiFetch`, token refresh serialization, `X-Client-Type` routing, CSRF token headers, and error handling).

---

## 2. Detailed Backend API Requirements

### Requirement 1: Categorized Supervision Controls
* **Endpoint:** `/v1/supervision/:minorId/controls`
* **Method:** `GET` / `PUT`
* **Current Response:**
  ```json
  {
    "controls": [
      { "control": "CREATE_POST", "value": true },
      { "control": "PROFILE_VISIBILITY", "value": "CONNECTIONS" }
    ]
  }
  ```
* **Missing/Incorrect Fields:** Missing category metadata (`id`, `title`), control display labels (`label`), and configurability flags (`configurable`).
* **Expected Fields / Data Structure:**
  ```json
  {
    "minorId": "minor-123",
    "categories": [
      {
        "id": "home",
        "title": "Home & Feed",
        "controls": [
          { "control": "VIEW_FEED", "value": true, "label": "View feed", "configurable": true },
          { "control": "CREATE_POST", "value": false, "label": "Create posts", "configurable": true },
          { "control": "COMMENT_ON_POSTS", "value": true, "label": "Comment on posts", "configurable": true }
        ]
      },
      {
        "id": "network",
        "title": "My Network",
        "controls": [
          { "control": "REQUIRE_APPROVAL_ADULT_CONTACT", "value": true, "label": "Adult contact requests", "configurable": true },
          { "control": "REQUIRE_APPROVAL_CONNECTIONS", "value": true, "label": "Connections", "configurable": true }
        ]
      }
    ]
  }
  ```
* **Required UI/Figma Usage:** Supervision Page accordion categories (Figma Images 31 & 32).
* **Priority:** High (P1)
* **Backend Action Required:** Group returned controls by category and supply `label` and `configurable` properties in payload.

---

### Requirement 2: Initial Safety Toggles on Child Creation
* **Endpoint:** `/v1/supervision/children`
* **Method:** `POST`
* **Current Response:**
  ```json
  {
    "child": { "id": "minor-999", "displayName": "Noah Kim" }
  }
  ```
* **Missing/Incorrect Fields:** Payload ignores initial safety toggle preferences (`requireApprovalAdultContact`, `requireApprovalConnections`, `requireApprovalTeamInvites`, `requireApprovalMedia`).
* **Expected Fields / Data Structure:**
  ```json
  {
    "displayName": "Noah Kim",
    "firstName": "Noah",
    "lastName": "Kim",
    "dateOfBirth": "2014-06-01",
    "guardianRelation": "MOTHER",
    "profileVisibility": "CONNECTIONS",
    "initialControls": {
      "requireApprovalAdultContact": true,
      "requireApprovalConnections": true,
      "requireApprovalTeamInvites": true,
      "requireApprovalMedia": true
    }
  }
  ```
* **Required UI/Figma Usage:** Minor creation wizard Step 2A (Figma Image 37).
* **Priority:** High (P1)
* **Backend Action Required:** Accept `initialControls` in request body and persist safety kernel settings immediately upon minor account creation.

---

### Requirement 3: Expanded Counterparty Metadata on Relationship Lists
* **Endpoint:** `/v1/relationships`
* **Method:** `GET`
* **Current Response:**
  ```json
  {
    "items": [
      { "id": "rel-001", "type": "CONNECTION", "status": "PENDING", "sourceId": "usr-1", "targetId": "usr-2" }
    ]
  }
  ```
* **Missing/Incorrect Fields:** `counterparty` object is `null` or missing profile metadata (`displayName`, `avatarUrl`, `roleTag`, `position`, `jerseyNumber`, `teamName`, `teamLogo`, `location`, `verificationStatus`).
* **Expected Fields / Data Structure:**
  ```json
  {
    "items": [
      {
        "id": "rel-001",
        "type": "CONNECTION",
        "status": "PENDING",
        "counterparty": {
          "id": "prof-101",
          "displayName": "Connor McDavid",
          "avatarUrl": "https://cdn.mhn.com/avatars/connor.png",
          "primaryRole": "PLAYER",
          "roleTag": "C • #97",
          "position": "Center",
          "jerseyNumber": 97,
          "teamName": "HC Bloemendaal",
          "teamLogo": "https://cdn.mhn.com/teams/hc.png",
          "location": "Austria, Europe",
          "isMinor": true,
          "verificationStatus": "VERIFIED"
        }
      }
    ]
  }
  ```
* **Required UI/Figma Usage:** Supervision Requests Grid cards (Figma Image 33) and Connections View.
* **Priority:** High (P1)
* **Backend Action Required:** Join and expand nested `counterparty` profile objects on list responses.

---

### Requirement 4: Aggregated Post Author & Reaction Metadata
* **Endpoint:** `/v1/feed` & `/v1/posts/:id`
* **Method:** `GET`
* **Current Response:**
  ```json
  {
    "items": [
      { "id": "post-1", "body": "Great game today!", "audience": "PUBLIC" }
    ]
  }
  ```
* **Missing/Incorrect Fields:** Missing `author` profile object (`displayName`, `avatarUrl`, `primaryRole`, `teamName`) and reaction/comment counts (`reactionsCount`, `commentsCount`, `userReaction`).
* **Expected Fields / Data Structure:**
  ```json
  {
    "items": [
      {
        "id": "post-1",
        "body": "Great game today!",
        "audience": "PUBLIC",
        "createdAt": "2026-08-18T12:00:00Z",
        "author": {
          "id": "prof-200",
          "displayName": "Lucas Bennett",
          "avatarUrl": "/player.png",
          "primaryRole": "PLAYER"
        },
        "reactionsCount": 24,
        "commentsCount": 5,
        "userReaction": "LIKE"
      }
    ]
  }
  ```
* **Required UI/Figma Usage:** Home Feed post cards.
* **Priority:** Medium (P2)
* **Backend Action Required:** Join author profile details and compute reaction/comment count aggregates.

---

### Requirement 5: Dev Mode Exposure of Guardian Invite Code
* **Endpoint:** `/v1/relationships/guardian-invites`
* **Method:** `POST`
* **Current Response:**
  ```json
  { "success": true, "message": "GUARDIAN_INVITE_SENT", "data": null }
  ```
* **Missing/Incorrect Fields:** In non-production environments with `OTP_DEV_EXPOSE=true`, the 6-digit invitation code is not returned in the payload.
* **Expected Fields / Data Structure:**
  ```json
  {
    "success": true,
    "message": "GUARDIAN_INVITE_SENT",
    "data": { "devCode": "654321", "expiresAt": "2026-08-19T10:00:00Z" }
  }
  ```
* **Required UI/Figma Usage:** Automated end-to-end invite acceptance testing (`POST /v1/relationships/guardian-invites/accept`).
* **Priority:** Medium (P2)
* **Backend Action Required:** Include `devCode` in data object when `OTP_DEV_EXPOSE=true` is active.

---

### Requirement 6: Profile Update & Avatar Upload Endpoints
* **Endpoint:** `/v1/auth/profile` (or `/v1/users/me/profile`) & `/v1/media/upload`
* **Method:** `PUT` / `PATCH` (Profile) & `POST` (Media Upload)
* **Current Response:** Currently, `GET /v1/auth/me` returns current user profile metadata, but no `PUT` / `PATCH` endpoint is documented in `endpoints.md` for updating user profile fields.
* **Missing/Incorrect Fields:** Missing `PUT /v1/auth/profile` route and image binary/S3 upload handler (`POST /v1/media/upload`).
* **Expected Request Payload Structure:**
  ```json
  {
    "displayName": "Saksham Garg",
    "firstName": "Saksham",
    "lastName": "Garg",
    "phone": "+1 (555) 000-0000",
    "bio": "Competitive ice hockey player focused on teamwork...",
    "city": "Toronto, ON",
    "dateOfBirth": "2000-11-11T00:00:00.000Z",
    "position": "Center",
    "shootsCatches": "Left",
    "jerseyNumber": 97,
    "genderCategory": "Male",
    "preferredLanguage": "en",
    "defaultVisibility": "CONNECTIONS",
    "avatarUrl": "https://cdn.mhn.com/avatars/user-97.png"
  }
  ```
* **Required UI/Figma Usage:** Edit Profile Modal "Save Changes" action button.
* **Priority:** High (P1)
* **Backend Action Required:**
  1. Implement `PUT /v1/auth/profile` endpoint to accept player profile edits and save them to the database.
  2. Expose avatar image upload route `POST /v1/media/upload` returning `{ "url": "https://cdn..." }`.

---

## 3. Summary Matrix of Backend Dependencies

| Endpoint | Method | Priority | Key Missing Data | Backend Impact |
|---|---|---|---|---|
| `/v1/supervision/:minorId/controls` | GET / PUT | P1 | Category grouping & labels | Refactor controls DTO serializer |
| `/v1/supervision/children` | POST | P1 | Initial safety controls object | Save initial controls on create |
| `/v1/relationships` | GET | P1 | Counterparty profile metadata | Expand counterparty relation |
| `/v1/feed` | GET | P2 | Author metadata & reaction counts | Add author join & counts aggregate |
| `/v1/relationships/guardian-invites` | POST | P2 | `devCode` field in non-prod | Return code when `OTP_DEV_EXPOSE=true` |
| `/v1/auth/profile` | PUT | P1 | Player Profile Update route | Add PUT controller for profile updates |
