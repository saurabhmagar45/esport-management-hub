# Esport Hub — Project Plan & Architecture Roadmap

## 1. Executive Summary
**Esport Hub** is a modular, production-ready full-stack tournament management system inspired by the tournament operations workflows of Toornament. Tailored for popular esports including **BGMI (Battlegrounds Mobile India)** and **Free Fire**, with an extensible architecture for future titles (Valorant, CS2, CODM, etc.).

The system caters to three core user personas:
1. **Players / Team Captains:** Form squads, invite teammates via secure invite codes, discover tournaments, register teams, track live brackets, receive real-time notifications, and obtain match room credentials upon authorized release.
2. **Tournament Organizers:** Create competitions via a 4-step wizard, manage team registrations (approve/reject with rationale), automatically generate single-elimination tournament fixtures with bye-handling, schedule matches, publish verified scores, advance winners, and securely release encrypted room IDs & passwords to eligible rosters.
3. **Administrators:** Comprehensive platform moderation, user account status control (active/suspended), tournament oversight, issue resolution, and system audit logging.

---

## 2. Methodology & Development Phases

Following the mandated development sequence:

### Phase 1: Planning & Requirements Specification (Current)
- Workspace structure definition.
- Detailed technical specifications: `docs/PROJECT_PLAN.md`, `docs/FEATURES.md`, `docs/DATABASE_DESIGN.md`, `docs/API_DESIGN.md`, `docs/USER_FLOWS.md`.
- Definition of data schemas, security boundary models, and tournament lifecycle states.

### Phase 2: Complete Frontend Design & Interactive Prototype
- Setup Vite + React + Tailwind CSS + Lucide React + React Router.
- Premium dark esports design system (Navy/Slate palette, violet/electric blue accents, modern typography, glassmorphism badges).
- Full suite of client pages with mock data layer, rich filters, interactive tournament brackets, wizard creation, room credential release preview, notifications, and responsive navigation.
- Browser review and validation of all UI interactions prior to any backend code.

### Phase 3: Backend & Database Engine
- Express.js + Mongoose REST API.
- JWT authentication with secure HTTP-only cookies and role-based access control (`player`, `organizer`, `admin`).
- MongoDB models with schema validations, compound unique indexes, and audit logs.
- Deterministic single-elimination bracket generation algorithm with byes.
- AES-256 room credential encryption at rest with time-gated access control.

### Phase 4: Full-Stack Integration
- Seamless transition from client mock services to Axios API client.
- End-to-end state synchronization, auth persistence, protected route guards, and toast notification alerts.

### Phase 5: Verification, Documentation & Handover
- Automated backend and frontend tests.
- Comprehensive deployment guides (`INSTALLATION.md`, `TESTING.md`, `README.md`).

---

## 3. Technology Stack & Decision Matrix

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Blazing fast HMR, standard modern component architecture. |
| **Styling** | Tailwind CSS | Rapid design system implementation, consistent esports dark theme tokens. |
| **Icons** | Lucide React | Clean, lightweight SVG iconography for esports UI. |
| **Routing** | React Router DOM v6 | Nested layouts, role-based private routes, dynamic parameter resolution. |
| **HTTP Client** | Axios | Configurable interceptors, cookie management, uniform error handling. |
| **Backend Runtime** | Node.js (v24 LTS) + Express.js | High-throughput asynchronous REST server, battle-tested middleware ecosystem. |
| **Database** | MongoDB + Mongoose ODM | Flexible document model for tournament configurations, nested rosters, and matches. |
| **Security & Auth** | JWT + bcryptjs + Helmet + CORS | Secure hashed passwords, role-based authorization, rate-limiting, and header hardening. |
| **Encryption** | Node crypto (AES-256-CBC) | Zero plaintext room passwords at rest; decryption only on authorized demand. |

---

## 4. Work Breakdown & Scope Boundaries

### MVP Deliverables
- Dual game support: BGMI and Free Fire with game-specific team sizes (Solo/Duo/Squad).
- Complete authentication: Registration, login, logout, profile management.
- Team lifecycle: Creation, logo selection, unique invite codes, roster joining/leaving.
- Tournament creation wizard: Step-by-step validation of dates, formats, prizes, and rules.
- Registration approvals: Organizer roster review, approval/rejection with quota checks.
- Tournament fixture engine: Deterministic single-elimination bracket generation (power-of-2 and non-power-of-2 with byes).
- Secure Room ID/Password management: Time-locked encrypted storage, organizer publish control, dashboard revelation for approved roster players only.
- In-app notification center: Read/unread indicators, direct action links.
- Admin dashboard: User suspension, tournament oversight, audit trail.

### Future Enhancements (Post-MVP)
- Double-elimination and round-robin / Swiss stages.
- Razorpay test-mode payment gateway integration for paid entry tournaments.
- WebRTC voice rooms for organizers and team captains.
- Automated API integrations with game servers for automated kill/point parsing.
