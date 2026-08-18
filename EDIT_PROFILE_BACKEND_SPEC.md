# Edit Profile — Backend API Specification Document

**Project:** My Hockey Network  
**Target Audience:** Backend API Engineering Team  
**Date:** 18 August 2026  
**Status:** Required for Frontend Integration

---

## 1. Overview

This document specifies the exact API contract, request payload structures, field validation rules, and response schemas required to complete the **Edit Profile** feature for PLAYER user accounts.

The frontend modal UI in [EditProfileModal.tsx](file:///Users/harpindersingh/Desktop/my-hockey-network/apps/web/src/components/features/profile/EditProfileModal.tsx) has been fully built, typed, and validated using live data from `GET /v1/auth/me`. 

---

## 2. Endpoints Required

### 2.1 Endpoint: Update User Profile
* **Route:** `PUT /v1/auth/profile` *(or `PUT /v1/users/me/profile`)*
* **Method:** `PUT` / `PATCH`
* **Content-Type:** `application/json`
* **Authentication:** Required (Web Cookie `mhn_at` or Bearer Token `Authorization: Bearer <accessToken>`)

#### Request Headers
| Header | Value | Required | Description |
|---|---|---|---|
| `Authorization` | `Bearer <token>` | Mobile | Access JWT token |
| `X-Client-Type` | `web` \| `mobile` | Yes | Client transport type |
| `X-CSRF-Token` | `<csrf_token>` | Web | CSRF token for mutating request |
| `Content-Type` | `application/json` | Yes | Request payload format |

---

### 2.2 Request Payload Schema (JSON)

```json
{
  "displayName": "Saksham Garg",
  "firstName": "Saksham",
  "lastName": "Garg",
  "phone": "+1 (555) 000-0000",
  "bio": "Competitive ice hockey player focused on teamwork and discipline.",
  "city": "Toronto, ON",
  "dateOfBirth": "2000-11-11T00:00:00.000Z",
  "position": "Center",
  "shootsCatches": "Left",
  "jerseyNumber": 97,
  "genderCategory": "Male",
  "avatarUrl": "https://cdn.mhn.com/avatars/user-97.png"
}
```

---

## 3. Field Specifications & Validation Rules

| Field Name | Type | Allowed Values / Constraints | Editable | Description |
|---|---|---|---|---|
| **displayName** | `string` | Min 2 chars, Max 100 chars | **Yes** (Required) | Public name shown across feed & comments |
| **firstName** | `string` \| `null` | Max 50 chars | **Yes** | User's legal first name |
| **lastName** | `string` \| `null` | Max 50 chars | **Yes** | User's legal last name |
| **phone** | `string` \| `null` | Phone regex string | **Yes** | Contact phone number |
| **bio** | `string` \| `null` | Max 500 chars | **Yes** | Player intro / summary |
| **city** | `string` \| `null` | Max 100 chars | **Yes** | City / Location string |
| **dateOfBirth** | `string` \| `null` | ISO 8601 (`YYYY-MM-DD...`) | **Yes** | User date of birth |
| **position** | `enum` \| `null` | `"Center"`, `"Left Wing"`, `"Right Wing"`, `"Defense"`, `"Goaltender"` | **Yes** | Player hockey position |
| **shootsCatches** | `enum` \| `null` | `"Left"`, `"Right"` | **Yes** | Dominant hand |
| **jerseyNumber** | `integer` \| `null` | Range: `0` to `99` | **Yes** | Player jersey number |
| **genderCategory** | `enum` \| `null` | `"Male"`, `"Female"`, `"Non-Binary"`, `"Prefer not to say"` | **Yes** | Gender category |
| **avatarUrl** | `string` \| `null` | Valid Image URL | **Yes** | Profile picture CDN URL |
| **email** | `string` | Immutable | **NO** | Email cannot be changed via profile edit |
| **primaryRole** | `string` | Immutable | **NO** | Primary role is locked to `PLAYER` |

---

## 4. Expected Success Response (HTTP 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "cac757f3-74ba-40aa-a603-e5470749937c",
    "email": "saksham.garg@chicmicstudios.in",
    "status": "ACTIVE",
    "primaryRole": "PLAYER",
    "profile": {
      "id": "b8d6cba4-603f-40ec-8564-d847ca4fddbe",
      "type": "PLAYER",
      "publicRef": "HKY-B5E3EMET",
      "displayName": "Saksham Garg",
      "firstName": "Saksham",
      "lastName": "Garg",
      "avatarUrl": "https://cdn.mhn.com/avatars/user-97.png",
      "bio": "Competitive ice hockey player focused on teamwork and discipline.",
      "city": "Toronto, ON",
      "dateOfBirth": "2000-11-11T00:00:00.000Z",
      "position": "Center",
      "shootsCatches": "Left",
      "jerseyNumber": 97,
      "genderCategory": "Male",
      "preferredLanguage": "en",
      "defaultVisibility": "CONNECTIONS"
    }
  }
}
```

---

## 5. Error Responses

### 5.1 Validation Error (HTTP 400 Bad Request)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: jerseyNumber must be between 0 and 99",
  "data": null
}
```

### 5.2 Unauthorized (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication token is required",
  "data": null
}
```

---

## 6. Avatar Media Upload Endpoint (Optional / Recommended)

* **Route:** `POST /v1/media/upload`
* **Content-Type:** `multipart/form-data`
* **Response (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "File uploaded successfully",
    "data": {
      "url": "https://cdn.mhn.com/avatars/user-97.png"
    }
  }
  ```
