# Esport Hub — Feature Specification & Role Matrix

## 1. Feature Breakdown by Domain

### 1.1 Authentication & Profile
- **Registration**: Email, username, password confirmation, role assignment.
- **Secure Authentication**: Bcrypt password hashing (10 salt rounds), JWT tokens.
- **Session Management**: Persistent authentication with HTTP-only cookie or bearer token storage.
- **Profile Management**: In-game identifiers (BGMI Character ID / IGN, Free Fire UID / IGN), avatar customization, game preferences.

### 1.2 Team Management System
- **Squad Creation**: Team Name, Tag (e.g. `[SOUL]`, `[GODL]`), Game focus, Team Logo.
- **Roster Controls**: Unique alphanumeric invitation code generator (safe against collision).
- **Membership Validation**: Players join by entering team code; owners can remove members; members can leave (provided not actively locked in ongoing matches).
- **Ownership Transfer**: Team captains can promote co-captains or transfer ownership.

### 1.3 Tournament Management & Lifecycle
- **Supported Games**: BGMI, Free Fire (extensible enum/registry).
- **Lifecycle States**:
  1. `draft`: Configurable by organizer; invisible to public.
  2. `published`: Visible publicly; registration pending start date.
  3. `registration_open`: Accepting team submissions.
  4. `registration_closed`: Slot limit reached or deadline passed.
  5. `ongoing`: Brackets generated, matches active.
  6. `completed`: Final match resolved, champions declared.
  7. `cancelled`: Aborted with audit log record.
- **Multi-step Creation Wizard**:
  - Step 1: Game, Title, Description, Banner, Contact.
  - Step 2: Format (Single Elimination), Team Size (Solo/Duo/Squad), Slots (4, 8, 16, 32, 64), Timelines (Reg Start, Reg End, Tournament Start).
  - Step 3: Entry Type (Free/Paid), Prize Pool, Rules & Regulations.
  - Step 4: Summary validation & Publishing.

### 1.4 Registration & Slot Management
- **Team-based Submission**: Only team captains can register their squad.
- **Verification Gates**: Check eligibility (game match, minimum team size, duplicate participation check).
- **Organizer Approval Queue**: Review team lineup, approve slot or reject with custom feedback message.
- **Slot Capacity Locks**: Automatic closure upon hitting `maxTeams` approved registrations.

### 1.5 Single-Elimination Bracket Engine
- **Deterministic Seeding**: Supports power-of-two (4, 8, 16, 32) and arbitrary counts using algorithmic byes.
- **Match Graph Representation**: Tree of rounds where winners populate subsequent round slots.
- **Result Recording**: Organizer inputs scores/kills/winner; validation prevents double-advancement.
- **Bracket Visualization**: Clean SVG/CSS connection lines, interactive match popup modals.

### 1.6 Secure Room Credential Release Vault
- **Time-gated Access Control**: Room ID and encrypted password stored securely with a scheduled release timestamp.
- **Authorized Revelation Only**:
  - Server verifies that the requesting user is an active approved member of one of the two competing teams in that match.
  - Returns credentials ONLY if `releaseAt <= Date.now()` OR user is the tournament organizer/admin.
  - Revoke and audit status.
- **One-click Copy**: Quick copy for mobile players to switch into the game client.

### 1.7 Notification Hub
- **Event-triggered Alerts**: Registration status updates, match schedules, room release alerts, tournament outcome notifications.
- **Status Tracking**: Unread counts, mark individual as read, mark all read.

### 1.8 Administrator Controls
- **User Oversight**: View all accounts, suspend/reactivate accounts.
- **Tournament Oversight**: Emergency cancel with mandatory audit reason.
- **Audit Logging**: Structured log entries for sensitive operational triggers.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Action / Resource | Guest / Public | Player | Organizer | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| Browse Tournaments & Brackets | ✅ | ✅ | ✅ | ✅ |
| View Public Tournament Details | ✅ | ✅ | ✅ | ✅ |
| Register Account / Login | ✅ | ✅ | ✅ | ✅ |
| Create & Manage Own Team | ❌ | ✅ | ✅ | ✅ |
| Register Team to Tournament | ❌ | ✅ (Captain) | ✅ (Captain) | ✅ |
| View Assigned Match Room ID/Pass | ❌ | ✅ (Match Teams only) | ✅ (Own Tourn) | ✅ |
| Create Tournament | ❌ | ❌ | ✅ | ✅ |
| Approve / Reject Registrations | ❌ | ❌ | ✅ (Own Tourn) | ✅ |
| Generate Brackets & Post Results | ❌ | ❌ | ✅ (Own Tourn) | ✅ |
| Manage Room Credentials | ❌ | ❌ | ✅ (Own Tourn) | ✅ |
| Moderate Any Tournament / User | ❌ | ❌ | ❌ | ✅ |
| View Platform Audit Logs | ❌ | ❌ | ❌ | ✅ |
