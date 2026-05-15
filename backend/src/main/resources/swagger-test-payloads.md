# Swagger Test Payloads

Copy-paste payloads for the Swagger UI (`/swagger-ui.html`) — covers every endpoint in the auth lifecycle plus the existing actions / users routes.

For local end-to-end testing, the verification and password-reset flows assume Mailpit is running on `http://localhost:8025` (see `docs/Authentication.md` §8).

---

## Auth

### POST `/api/auth/register`

Self-serve registration. Always returns `201` with the same body shape — independent of whether the address is new, taken-and-unverified, or taken-and-verified.

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Successful response:

```json
{
  "id": null,
  "username": "alice",
  "email": "alice@example.com",
  "address": null,
  "createdAt": null,
  "points": null,
  "role": null,
  "emailVerified": null
}
```

### POST `/api/auth/verify-email`

Confirms the address using the token mailed by `/register` or `/resend-verification`. Token is the raw 64-char hex value carried in the `?token=` query parameter of the verification URL.

```json
{ "token": "REPLACE_ME_WITH_TOKEN_FROM_MAILPIT" }
```

Returns `204` on success, `400` on invalid / expired / already-consumed token.

### POST `/api/auth/resend-verification`

Issues a fresh verification token for an existing unverified account. Always `204`.

```json
{ "email": "alice@example.com" }
```

### POST `/api/auth/login`

Existing seed users (BCrypt of "secret"):

```json
{ "username": "alice",   "password": "secret" }
```

```json
{ "username": "bob",     "password": "secret" }
```

```json
{ "username": "charlie", "password": "secret" }
```

Successful response sets `AUTH_SESSION` cookie and returns:

```json
{ "username": "alice", "role": "ROLE_USER" }
```

Failure shapes:

| Status | Body |
|---|---|
| `401` | `{ "message": "Invalid username or password" }` |
| `403` | `{ "message": "email_not_verified" }` |

### POST `/api/auth/logout`

No body. Requires the `AUTH_SESSION` cookie. Returns `204` and a `Max-Age=0` cookie.

### GET `/api/auth/whoami`

No body. Requires the `AUTH_SESSION` cookie.

Successful response:

```json
{
  "id": 1,
  "username": "alice",
  "roles": ["ROLE_USER"],
  "emailVerified": true
}
```

### POST `/api/auth/password-reset/request`

Always `204`, regardless of whether the email is known.

```json
{ "email": "alice@example.com" }
```

### POST `/api/auth/password-reset/confirm`

Token is the raw value carried by the password-reset URL in the email.

```json
{
  "token": "REPLACE_ME_WITH_RESET_TOKEN_FROM_MAILPIT",
  "newPassword": "newSecret456"
}
```

Returns `204` on success, `400` on invalid / expired / consumed token. On success, every active session for the user is invalidated.

### POST `/api/auth/dev-login` (only with `-Dspring.profiles.active=dev`)

Password-less login for local development. Returns `404` outside the `dev` profile because the controller bean is not registered.

```json
{ "username": "alice" }
```

Successful response: `200` + `AUTH_SESSION` cookie + body:

```json
{ "username": "alice", "role": "ROLE_USER" }
```

---

## Users

### GET `/api/users/{id}`

No body. Requires authentication. Authorized for the user themselves (`id == authentication.principal.userId`) or `ROLE_ADMIN`.

Example response:

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "address": 1,
  "createdAt": "2026-04-22T14:30:00",
  "points": 500,
  "role": "ROLE_USER",
  "emailVerified": true
}
```

### GET `/api/users/{id}/actions?active=<bool>`

Migrated from the old `/api/userActionHistory/getUserActions?userId=&active=` route.

| Query param | Meaning |
|---|---|
| `active=true` | only IN_PROGRESS actions |
| `active=false` | only COMPLETED actions (default) |

Same authorization rules as `GET /api/users/{id}`.

### POST `/api/users/me/password-change`

Authenticated. Verifies the current password, sets the new one, and **revokes every session for the user including the caller's** — the client must redirect to login on success.

```json
{
  "currentPassword": "secret",
  "newPassword": "evenBetter456"
}
```

| Status | Body |
|---|---|
| `204` | — |
| `400` | `{ "message": "wrong_current_password" }` |
| `401` | `{ "message": "Not authenticated" }` |

---

## Actions

### POST `/api/actions` — Create action without subtasks
```json
{
  "description": "Pick up litter in your neighbourhood",
  "displayName": "Clean Up",
  "points": 50,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": false,
  "validUntil": "2026-12-31T23:59:59"
}
```

### POST `/api/actions` — Create action with GPS subtasks
```json
{
  "description": "Visit all recycling stations in the city",
  "displayName": "Recycling Tour",
  "points": 100,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": true,
  "validUntil": "2026-12-31T23:59:59",
  "subTasks": [
    {
      "type": "GPS",
      "description": "Recycling station Hauptbahnhof",
      "displayName": "HB Station",
      "latitude": 47.3769,
      "longitude": 8.5417,
      "distanceThresholdLevel": "MEDIUM"
    },
    {
      "type": "GPS",
      "description": "Recycling station Oerlikon",
      "displayName": "Oerlikon Station",
      "latitude": 47.4108,
      "longitude": 8.5448,
      "distanceThresholdLevel": "HARD"
    }
  ]
}
```

### PUT `/api/actions/{id}` — Update action
```json
{
  "description": "Updated description",
  "displayName": "Updated Name",
  "points": 75,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": false,
  "validUntil": "2026-12-31T23:59:59"
}
```

### PUT `/api/actions/subaction/{id}` — Update GPS subaction
```json
{
  "description": "Updated checkpoint description",
  "displayName": "Updated Checkpoint",
  "latitude": 47.3769,
  "longitude": 8.5417
}
```

---

## User Progress

### POST `/api/actions/{id}/start`
No body required.

### POST `/api/actions/{id}/complete`
No body required.

---

## End-to-end smoke (cURL)

A scripted version of the full register → verify → login → reset flow lives in `docs/Authentication.md` §8.2. Recommended order when manually working through Swagger UI:

1. `POST /api/auth/register`
2. Open Mailpit → copy the verification token from the email link.
3. `POST /api/auth/verify-email` with the token.
4. `POST /api/auth/login` — Swagger UI will store the cookie automatically.
5. `GET /api/auth/whoami` — confirms you're logged in and verified.
6. `POST /api/auth/password-reset/request` — copy the new token from Mailpit.
7. `POST /api/auth/password-reset/confirm` — old cookie is now invalid.
8. `POST /api/auth/login` again with the new password to regain a session.
9. `POST /api/users/me/password-change` — every session is invalidated; log in again.
10. `POST /api/auth/logout`.
