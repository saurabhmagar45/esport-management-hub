# Esport Hub — Testing & Quality Assurance Report

## 1. Automated Test Suite Summary
The backend includes automated integration tests under `server/src/tests/api.test.js`, executed via Node.js native test runner.

```
▶ Esport Hub — Core Backend Verification Tests
  ✔ 1. Crypto: AES-256 Encryption & Decryption Integrity (3.08ms)
  ✔ 2. Auth: Password Hashing & Comparison (377.55ms)
  ✔ 3. Tournament Engine: Single Elimination Bracket for Power of 2 (4 Teams) (125.43ms)
  ✔ 4. Tournament Engine: Non-Power-of-Two Participant Handling with Byes (3 Teams) (65.10ms)
  ✔ 5. Winner Advancement: Advancing a Semifinalist Populates Grand Final Slot (34.24ms)
  ✔ 6. Registration Rules: Unique registration enforced per team and tournament (12.32ms)
  ✔ 7. Dispute System: Player reports dispute and Admin resolves it (15.73ms)
  ✔ 8. Payment System: Test order generation and HMAC SHA-256 verification (5.24ms)
✔ Esport Hub — Core Backend Verification Tests (2095.12ms)
ℹ tests 8 | pass 8 | fail 0 | cancelled 0 | skipped 0
```

---

## 2. End-to-End User Journey Test Matrix

### 2.1 Authentication & Authorization
| Scenario | Steps | Expected Result | Result |
| :--- | :--- | :--- | :---: |
| **Valid Registration** | Register as a new player with email, password, and BGMI IGN | User saved in MongoDB with bcrypt hash; session token issued | ✅ PASS |
| **Duplicate Email** | Register second account with `player@esporthub.gg` | 409 Conflict with message "An account with this email already exists" | ✅ PASS |
| **Invalid Password** | Provide password < 6 characters | 400 Bad Request rejection with validation alert | ✅ PASS |
| **Role Escalation Defense** | Attempt sending `{ role: 'admin' }` to `/auth/register` | Server sanitizes role to `'player'` automatically | ✅ PASS |
| **Role Guarding** | Player attempting to access `/admin/stats` | 403 Forbidden ("Requires admin permissions") | ✅ PASS |

### 2.2 Teams & Rosters
| Scenario | Steps | Expected Result | Result |
| :--- | :--- | :--- | :---: |
| **Team Creation** | Captain creates squad `Team Soul` | Generates unique invite code `SOUL-9988` and binds owner as Captain | ✅ PASS |
| **Join with Code** | Teammate enters `SOUL-9988` | Roster member appended; duplicate membership prohibited | ✅ PASS |
| **Roster Mutation** | Member attempts removing another member | 403 Forbidden; only Captain or Admin can remove members | ✅ PASS |
| **Code Regeneration** | Captain triggers regenerate code | Secure unique code updated without breaking active tournament links | ✅ PASS |

### 2.3 Tournament Fixture & Single-Elimination Engine
| Scenario | Steps | Expected Result | Result |
| :--- | :--- | :--- | :---: |
| **Power-of-2 Bracket** | 4 approved teams seeded | Generates 2 Round 1 Semifinals and 1 Grand Final | ✅ PASS |
| **Odd Participant Count** | 3 teams seeded | Algorithmic bye allocated; bye team advances directly to Grand Final | ✅ PASS |
| **Score Recording** | Organizer records score `2-0` for Team Soul | Winner recorded; Team Soul automatically placed into Grand Final slot | ✅ PASS |
| **Final Resolution** | Grand Final resolved | Winner declared; tournament status transitions to `completed` | ✅ PASS |

### 2.4 Time-Locked Room Credential Vault
| Scenario | Steps | Expected Result | Result |
| :--- | :--- | :--- | :---: |
| **Credential Storage** | Organizer saves Room ID & Pass | Encrypted at rest via AES-256-CBC with dynamic IV | ✅ PASS |
| **Pre-Release Request** | Player requests room details before `releaseAt` | 403 Forbidden with exact scheduled unlock timestamp | ✅ PASS |
| **Post-Release Request** | Verified roster player requests details after `releaseAt` | Decrypted credentials `{ roomId, password, instructions }` delivered | ✅ PASS |
| **Unrelated Player** | User from non-competing squad requests room | 403 Forbidden ("Not an active member of competing squads") | ✅ PASS |
| **Emergency Revocation** | Organizer clicks Revoke Access | Room immediately locked for all players | ✅ PASS |
