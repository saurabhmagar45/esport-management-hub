# 🎮 Esport Hub — Full-Stack Esports Tournament Management System

> **A College-Level B.Tech Computer Science Capstone Project**  
> Inspired by the tournament management workflows of Toornament. Tailored for **BGMI (Battlegrounds Mobile India)** and **Free Fire**, with an extensible architecture for future esports titles.

---

## 🌟 Executive Summary

**Esport Hub** is a modular, secure, full-stack esports tournament management web application. It automates the end-to-end competitive operations lifecycle:
1. **Player & Squad Hub**: Players register accounts, configure in-game gamer IDs (BGMI IGN / Free Fire UID), create squads, recruit teammates via unique invite codes, and register for tournaments.
2. **Organizer Control Console**: Tournament organizers build competitions via a 4-step wizard, review rosters in approval queues, enforce slot limits, deterministically generate knockout brackets, schedule matches, publish verified scores, and manage room credentials.
3. **Knockout Bracket Engine**: Built-in deterministic single-elimination tournament engine supporting both power-of-two (4, 8, 16, 32) and arbitrary participant counts with automatic byes.
4. **Time-Locked Room Credential Vault**: Custom room IDs and passwords are cryptographically encrypted at rest with AES-256-CBC and time-locked until a scheduled release timestamp. The server enforces access control so that only verified, approved roster players of competing teams can view credentials.
5. **In-App Notification Center**: Instant event notifications for registration approvals, match schedules, and room password releases.
6. **Platform Administration**: SuperAdmin oversight for user suspension, tournament cancellations, and immutable audit logging.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js (v24), Express.js REST API, JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB with Mongoose ODM (includes embedded in-memory fallback for zero-install demo runs) |
| **Security & Crypto** | AES-256-CBC cipher encryption with dynamic IV, bcrypt password hashing (10 rounds), HTTP-only cookies |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`) |

---

## 📁 Repository Structure

```
battel arena/
├── front end/                  # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Brackets, Badges, Modals, Navbar, Footer)
│   │   ├── context/            # AuthContext & NotificationContext
│   │   ├── data/               # Realistic Mock Dataset & Seed Fallback
│   │   ├── pages/              # 14 Full Pages (Public, Auth, Player, Organizer, Admin)
│   │   ├── services/           # Axios REST API Client Layer
│   │   ├── App.jsx             # React Router Configuration
│   │   ├── main.jsx            # React Root Mount
│   │   └── index.css           # Tailwind CSS Esports Dark Theme Tokens
│   ├── index.html              # HTML Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── back end/                   # Backend Express REST API Server
│   ├── src/
│   │   ├── config/             # Database Connection (MongoDB / In-Memory Fallback)
│   │   ├── controllers/        # Auth, Tournament, Team, Registration, Match, Room, Admin
│   │   ├── middleware/         # JWT Auth, Role Enforcement, Centralized Error Handler
│   │   ├── models/             # Mongoose Schemas (User, Team, Tournament, Match, RoomDetails, etc.)
│   │   ├── routes/             # REST API Endpoints prefixed with /api/v1
│   │   ├── services/           # Deterministic Single-Elimination Bracket Engine
│   │   ├── tests/              # Automated Backend Verification Test Suite
│   │   ├── utils/              # AES-256 Crypto & Database Seeder
│   │   ├── app.js              # Express App Configuration
│   │   └── server.js           # Server Bootstrap & Listener
│   ├── .env                    # Active Environment Configuration
│   └── package.json
│
├── database/                   # Database layer configuration and setup notes
│   └── README.md               # MongoDB/local database setup and runtime notes
│
├── docs/                       # Project Documentation & Architecture Specifications
│   ├── PROJECT_PLAN.md         # Requirements, scope, and technical roadmap
│   ├── FEATURES.md             # Role-based feature matrix
│   ├── DATABASE_DESIGN.md      # MongoDB schemas, indexes, and relations
│   ├── API_DESIGN.md           # REST API endpoint contracts
│   ├── USER_FLOWS.md           # Visual Mermaid lifecycle flows
│   ├── DESIGN_REVIEW.md        # Frontend design review & QA checklist
│   ├── INSTALLATION.md         # Step-by-step setup guide
│   └── TESTING.md              # Test execution & scenarios report
│
├── .env.example                # Environment Variable Template
└── README.md                   # Project Overview & Quick Start
```

---

## 🚀 Quick Start Guide

### 1. Configure Environment
```powershell
cp .env.example back end/.env
```

### 2. Start Backend Server
```powershell
cd "back end"
npm install
npm start
```
*Backend will start on `http://localhost:5000` and automatically populate seed data.*

### 3. Start Frontend Client
```powershell
cd "front end"
npm install
npm run dev
```
*Open `http://localhost:5173/` (or `http://127.0.0.1:5174/`) in your browser.*

---

## 🧪 Running Automated Tests

Run the test suite from the `back end` directory:
```powershell
cd "back end"
npm test
```
**Test Results (8/8 Passing):**
- ✅ 1. Crypto: AES-256 Encryption & Decryption Integrity
- ✅ 2. Auth: Password Hashing & Comparison
- ✅ 3. Tournament Engine: Single Elimination Bracket for Power of 2 (4 Teams)
- ✅ 4. Tournament Engine: Non-Power-of-Two Participant Handling with Byes (3 Teams)
- ✅ 5. Winner Advancement: Advancing a Semifinalist Populates Grand Final Slot
- ✅ 6. Registration Rules: Unique registration enforced per team and tournament
- ✅ 7. Dispute System: Player reports dispute and Admin resolves it
- ✅ 8. Payment System: Test order generation and HMAC SHA-256 verification

---

## 👥 Demo Personas & Credentials

| Persona | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Player** | `player@esporthub.gg` | `password123` | Aman "Mortal" Sandhu (Captain of Team Soul `[SOUL]`, view match room keys) |
| **Organizer** | `organizer@esporthub.gg` | `password123` | Karan Mehra (NODWIN Gaming, manage competitions, approve rosters, release room keys) |
| **Admin** | `admin@esporthub.gg` | `password123` | System SuperAdmin (User account suspension, tournament moderation cancellation, audit trail) |

*A 1-click **Role View Switcher** is also available in the top navigation bar to preview any persona immediately without logging in and out repeatedly.*

---

## 🔒 Security Architecture Highlights

1. **AES-256-CBC Encryption**: Custom room passwords are encrypted at rest with dynamic initialization vectors (IV).
2. **Server-Side Gating**: Room credentials return a `403 Forbidden` error with the exact unlock time until the scheduled release timestamp is reached.
3. **Roster Membership Verification**: Only verified roster players of the two competing teams in that match can view room credentials.
4. **Defense-in-Depth**: Helmet security headers, rate limiting on authentication routes, CORS protection, and HTTP-only cookie support.
