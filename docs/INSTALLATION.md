# Esport Hub — Installation & Deployment Guide

This guide details how to install, configure, start, and verify the complete **Esport Hub** tournament management application on a Windows local machine or production server.

---

## 1. Prerequisites
- **Node.js**: v18+ (Tested on v24.11.0 LTS)
- **npm**: v9+ (Tested on v11.6.1)
- **MongoDB**: (Optional) A local MongoDB daemon (`mongodb://localhost:27017`) or MongoDB Atlas URI. If no MongoDB service is running, the server automatically boots an embedded in-memory MongoDB engine, guaranteeing zero-config out-of-the-box execution!

---

## 2. Project Directory Setup

Clone or open the project folder in your terminal:
```powershell
cd "c:\Users\saura\Music\battel arena"
```

The workspace is organized into two primary applications:
- `client/` : React + Vite + Tailwind CSS Frontend
- `server/` : Express + Mongoose REST API Engine

---

## 3. Environment Configuration

Copy the example environment template to create `server/.env`:
```powershell
cp .env.example server/.env
```

Configuration variables in `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/esport_hub
JWT_SECRET=esport-hub-jwt-secret-key-production-grade-2026
COOKIE_SECRET=esport-hub-cookie-signing-key
ROOM_ENCRYPTION_KEY=esport-hub-aes256-super-secret-vault-key-32b
```

---

## 4. Installing Dependencies

### Backend Dependencies:
```powershell
cd server
npm install
cd ..
```

### Frontend Dependencies:
```powershell
cd client
npm install
cd ..
```

---

## 5. Starting the Services

Open two separate terminal windows (or PowerShell tabs):

### Terminal 1: Backend API Server
```powershell
cd server
npm start
```
*Output will confirm:*
```
🎮 ESPORT HUB REST API SERVER ACTIVE
📡 URL: http://localhost:5000
🔍 Health Check: http://localhost:5000/health
🎯 API Base: http://localhost:5000/api/v1
```

### Terminal 2: Frontend Web Application
```powershell
cd client
npm run dev
```
*Output will confirm:*
```
➜ Local:   http://localhost:5173/ (or http://127.0.0.1:5174/)
```

Open your browser and navigate to the printed Vite URL.

---

## 6. Default Demo Credentials

For convenience and live examination, safe pre-seeded accounts are provided:

| Role | Email | Password | Persona & Privileges |
| :--- | :--- | :--- | :--- |
| **Player** | `player@esporthub.gg` | `password123` | Aman "Mortal" Sandhu (Captain of Team Soul `[SOUL]`, view match room keys) |
| **Organizer** | `organizer@esporthub.gg` | `password123` | Karan Mehra (NODWIN Gaming, Host tournaments, approve entries, generate brackets, release room keys) |
| **Admin** | `admin@esporthub.gg` | `password123` | System SuperAdmin (User suspension, tournament moderation cancellation, audit trail) |

*Tip: You can also use the floating "Role View" switcher in the top navigation bar to toggle between personas instantly without manually retyping passwords.*

---

## 7. Running Verification Tests

Run the automated backend test suite:
```powershell
cd server
npm test
```
This tests:
1. AES-256 Room password encryption & decryption
2. Password hashing & verification
3. Deterministic single-elimination bracket generation (power of 2)
4. Non-power-of-two bye handling
5. Automatic winner advancement to the Grand Final
