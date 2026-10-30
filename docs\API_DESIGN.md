# Esport Hub — REST API Specifications

**Base URL:** `/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/auth/register` | Public | Any | Register a new user (Player / Organizer) |
| `POST` | `/auth/login` | Public | Any | Authenticate user, set cookie & return user object |
| `POST` | `/auth/logout` | Required | Any | Clear auth session |
| `GET` | `/auth/me` | Required | Any | Get currently authenticated profile |
| `PUT` | `/auth/profile` | Required | Any | Update profile details and in-game credentials |

---

## 2. Tournament Endpoints (`/tournaments`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/tournaments` | Public | Any | List tournaments with filters (`game`, `format`, `status`, `search`, `page`, `limit`) |
| `GET` | `/tournaments/:id` | Public | Any | Get detailed tournament info by ID or slug |
| `POST` | `/tournaments` | Required | Organizer, Admin | Create tournament (draft or published) |
| `PUT` | `/tournaments/:id` | Required | Organizer (Owner), Admin | Update tournament metadata |
| `PATCH` | `/tournaments/:id/status` | Required | Organizer (Owner), Admin | Transition status (`registration_open`, `ongoing`, etc.) |
| `DELETE` | `/tournaments/:id` | Required | Admin | Moderation cancellation / deletion |

---

## 3. Team Endpoints (`/teams`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/teams` | Required | Any | List teams user belongs to or owns |
| `GET` | `/teams/:id` | Public/Auth | Any | Get team roster and stats |
| `POST` | `/teams` | Required | Any | Create a new team |
| `PUT` | `/teams/:id` | Required | Team Leader | Update team name, logo, tag |
| `POST` | `/teams/join` | Required | Any | Join team using unique invitation code |
| `POST` | `/teams/:id/leave` | Required | Member | Leave a team |
| `DELETE` | `/teams/:id/members/:userId` | Required | Team Leader | Remove a member |
| `POST` | `/teams/:id/regenerate-code` | Required | Team Leader | Refresh invite code |

---

## 4. Registration Endpoints (`/tournaments/:id/registrations`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/tournaments/:id/registrations` | Required | Team Leader | Register team for tournament |
| `GET` | `/tournaments/:id/registrations` | Required | Organizer, Admin | List all registrations for tournament |
| `GET` | `/registrations/me` | Required | Any | List current user's team registrations |
| `PATCH` | `/registrations/:regId/approve` | Required | Organizer, Admin | Approve registration & allocate slot |
| `PATCH` | `/registrations/:regId/reject` | Required | Organizer, Admin | Reject registration with reason |

---

## 5. Tournament Brackets & Matches (`/tournaments/:id/bracket`, `/matches`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/tournaments/:id/bracket/generate` | Required | Organizer, Admin | Generate single-elimination bracket |
| `GET` | `/tournaments/:id/bracket` | Public | Any | Retrieve tournament bracket tree and matches |
| `GET` | `/tournaments/:id/matches` | Public | Any | Get flattened match list |
| `GET` | `/matches/:id` | Public/Auth | Any | Match details, scores, participating rosters |
| `PATCH` | `/matches/:id/schedule` | Required | Organizer, Admin | Schedule match date/time |
| `POST` | `/matches/:id/results` | Required | Organizer, Admin | Submit scores and advance winner |

---

## 6. Secure Room Credential Endpoints (`/matches/:id/room`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/matches/:id/room` | Required | Organizer, Admin | Create or update room ID & password (encrypted) |
| `GET` | `/matches/:id/room` | Required | Eligible Players / Org / Admin | Decrypt and retrieve credentials if released |
| `PATCH` | `/matches/:id/room/revoke` | Required | Organizer, Admin | Revoke access |

---

## 7. Notification Endpoints (`/notifications`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/notifications` | Required | Any | Get current user's notifications |
| `PATCH` | `/notifications/:id/read` | Required | Any | Mark single notification as read |
| `PATCH` | `/notifications/read-all` | Required | Any | Mark all as read |

---

## 8. Admin Oversight Endpoints (`/admin`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/admin/stats` | Required | Admin | Platform metrics (users, tournaments, matches) |
| `GET` | `/admin/users` | Required | Admin | List users with status & roles |
| `PATCH` | `/admin/users/:id/status` | Required | Admin | Suspend or activate user |
| `POST` | `/admin/tournaments/:id/cancel` | Required | Admin | Moderation tournament cancellation with audit log |
| `GET` | `/admin/audit-logs` | Required | Admin | Review audit trails |

---

## 9. Player Disputes & Match Reports (`/disputes`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/disputes` | Required | Player | File dispute (room password invalid, impersonation, etc.) |
| `GET` | `/disputes` | Required | Organizer, Admin | List submitted disputes with status filter |
| `PATCH` | `/disputes/:id` | Required | Admin | Investigate, resolve, or dismiss dispute |

---

## 10. Payments & Transaction Records (`/payments`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/payments/create-order` | Required | Player | Generate Razorpay sandbox order for paid tournament |
| `POST` | `/payments/verify` | Required | Player | Cryptographically verify HMAC SHA-256 signature and capture payment |
| `GET` | `/payments/history` | Required | Player | Retrieve user's completed tournament entry fee transactions |

