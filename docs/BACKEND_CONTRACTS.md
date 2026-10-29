# Civora Mobile — Backend API & Asset Contracts Specification

Per Section 13 of the Civora Mobile implementation specification, this document records the required backend contracts, authentication endpoints, authorization boundaries, idempotency semantics, and brand assets expected by the mobile client.

> **Security Boundary:** Role-aware routing (`/(engineer)` vs `/(stakeholder)`) improves mobile UX only. The Civora backend **must** independently authorize every API request, project ID, submission mutation, and document download. Never bundle PostgreSQL/Prisma or private API keys in the mobile client.

---

## 1. Authentication & Session Contract

| Endpoint | Method | Purpose | Request Payload | Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| `/v1/auth/login` | `POST` | Credential sign-in | `{ email, password }` | `AuthSessionResponseSchema` (`user` + `tokens`) |
| `/v1/auth/oauth/exchange` | `POST` | OAuth 2.0 / OIDC Authorization Code + PKCE exchange | `{ code, codeVerifier, redirectUri }` | `AuthSessionResponseSchema` |
| `/v1/auth/refresh` | `POST` | Token rotation prior to access token expiry | `{ refreshToken }` | `AuthSessionResponseSchema` |
| `/v1/auth/me` | `GET` | Fetch current user profile, permissions, and assigned project IDs | `Authorization: Bearer <accessToken>` | `AuthenticatedUserSchema` |
| `/v1/auth/logout` | `POST` | Revoke refresh token on logout / account switch | `{ refreshToken }` | `204 No Content` or `{ ok: true }` |

### Required Permission Scopes (`CivoraPermission`)
- **Engineer Workspace (`/(engineer)`):**
  - `workspace:engineer`
  - `projects:read`
  - `submissions:create`
  - `submissions:read`
  - `uploads:create`
  - `reports:draft`
  - `ai_analysis:request`
  - `ai_analysis:accept_suggestion`
  - `tasks:update`
- **Stakeholder Workspace (`/(stakeholder)`):**
  - `workspace:stakeholder`
  - `projects:read`
  - `reports:read_released`
  - `documents:download_released`

---

## 2. Field Submissions, Idempotency & Conflict Resolution

| Endpoint | Method | Headers | Purpose |
| :--- | :--- | :--- | :--- |
| `/v1/projects/:projectId/uploads` | `POST` | `Authorization`, `Idempotency-Key`, `X-Correlation-Id` | Register/upload field evidence photo or attachment and return `{ fileId: string }`. |
| `/v1/projects/:projectId/submissions` | `POST` | `Authorization`, `Idempotency-Key`, `X-Correlation-Id` | Create or update a field submission record (`FieldSubmissionRecordSchema`). |

### Truthful Upload & Conflict Rules
1. **Idempotency:** The mobile client sends a deterministic `Idempotency-Key` header and `clientSubmissionId` field per draft/attachment so retries over unreliable construction-site connectivity never create duplicate records.
2. **Server Confirmation Required:** The mobile app keeps drafts in `saved_on_device` state until the backend responds with HTTP `200`/`201` and a valid `FieldSubmissionRecord` containing `serverVersion`.
3. **Version Conflicts (`409 Conflict`):** If `baseServerVersion` is behind the server's current record version, the backend must return HTTP `409` with `{ message, serverVersion }`. The client transitions the draft to `conflict` rather than overwriting newer server data.

---

## 3. Stakeholder Reports & Protected Downloads

| Endpoint | Method | Authorization Rule |
| :--- | :--- | :--- |
| `/v1/projects/:projectId/reports/released` | `GET` | Caller must hold `reports:read_released`, be assigned to `:projectId`, and only reports with `visibilityStatus === "released"` may be returned. |
| `/v1/reports/:reportId/download` | `GET` | Caller must hold `documents:download_released`, be assigned to the report's project, and the report must be `released`. Returns short-lived signed URL or PDF stream. |

---

## 4. AI Field Analysis Lifecycle

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/v1/submissions/:submissionId/ai-analysis` | `POST` | Enqueue an AI analysis job (`AiAnalysisJobSchema`, initial status `queued`). |
| `/v1/ai-analysis/:jobId` | `GET` | Poll or fetch job status (`queued` \| `processing` \| `completed` \| `failed`) and structured `suggestions`. |
| `/v1/ai-analysis/:jobId/suggestions/:suggestionId` | `PATCH` | Record engineer acceptance or dismissal (`{ accepted: boolean }`). |

---

## 5. Pending External Assets Checklist

- **Font file (`EncodeSansCondensed`):** Place approved `.ttf`/`.otf` files in `assets/fonts/` and register via `expo-font` in `app/_layout.tsx` once supplied by the design team.
- **Official Brand Logos:** Place approved SVG/PNG wordmarks in `assets/brand/` and production app icons in `assets/images/`.

