# 📱 Esport Hub — Android Mobile Application

The official Android mobile application for **Esport Management Hub**, built with **React Native** and **Expo**, directly connected to the live Render backend and database.

---

## 🚀 Key Features

- **🎮 Tournaments Hub**: Browse BGMI and Free Fire tournaments, view prize pools, slot availability, and rules.
- **🛡️ Squad Management**: Create teams, generate 6-digit squad invite codes, manage rosters, and join squads.
- **🔑 Secure Room Unlock**: Official Room ID and Password release 5 minutes before scheduled kickoff with 1-tap copy.
- **🪙 Coin Wallet**: View coin balance, recharge coins packages (₹), and review transaction histories.
- **👤 Player Profile**: Manage BGMI Character ID / IGN and Free Fire UID / IGN linked with your account.
- **🔔 Real-time Notifications**: Alerts for room credentials, tournament schedules, and squad invites.
- **⚖️ Help & Dispute Center**: Official rule FAQs and match report ticket submission.

---

## 🌐 Connected Live Backend

- **Backend API**: `https://esport-management-hub.onrender.com/api/v1`
- **Live Website**: [https://esportsgg.vercel.app](https://esportsgg.vercel.app)
- **Shared Data**: Tournaments, user profiles, team rosters, and wallet balances synchronize in real-time across website and mobile app.

---

## 📲 How to Run on Android (Expo Go)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Development Server
```bash
npm start
```

### 3. Open on your Android Phone
1. Install **Expo Go** from the Google Play Store on your Android phone.
2. Scan the QR code displayed in your terminal with the Expo Go app.
3. The **Esport Hub** app will load immediately on your device!

---

## 📦 How to Build an Android APK (Standalone App)

To generate a standalone `.apk` file that can be installed on any Android phone without Expo Go:

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in with your Expo account
eas login

# 3. Build standalone Android APK
eas build -p android --profile preview
```

EAS will compile the Android APK in the cloud and provide a direct download link for your `.apk` file.
