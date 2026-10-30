# Esport Hub — User Flows & Operational Lifecycles

## 1. Player Journey

```mermaid
flowchart TD
    A[Visit Esport Hub] --> B[Register / Login]
    B --> C[Create or Join Team with Invite Code]
    C --> D[Explore Tournaments BGMI / Free Fire]
    D --> E[Submit Registration as Captain]
    E --> F{Organizer Review}
    F -->|Approved| G[Status: Approved in Dashboard]
    F -->|Rejected| H[Status: Rejected with Feedback]
    G --> I[Wait for Bracket Generation]
    I --> J[Match Assigned in Knockout Tree]
    J --> K{Scheduled Room Release Time Reached?}
    K -->|No| L[Room Status: Locked - Releases at Time]
    K -->|Yes| M[View & Copy Room ID & Password]
    M --> N[Play Match in BGMI / Free Fire]
    N --> O[Organizer Enters Score & Winner]
    O --> P{Did Team Win?}
    P -->|Yes| Q[Advance to Next Bracket Round]
    P -->|No| R[Eliminated with Final Placement]
```

---

## 2. Tournament Organizer Journey

```mermaid
flowchart TD
    A[Organizer Login] --> B[Access Organizer Dashboard]
    B --> C[Launch Tournament Creation Wizard]
    C --> D[Step 1: Game & Basics]
    D --> E[Step 2: Format & Slots & Deadlines]
    E --> F[Step 3: Prizes & Rules]
    F --> G[Step 4: Review & Publish]
    G --> H[Monitor Registrations Queue]
    H --> I[Approve Qualified Rosters]
    I --> J{Slots Full or Deadline Reached?}
    J -->|Yes| K[Close Registrations & Click 'Generate Bracket']
    K --> L[System Seeds Teams & Byes Deterministically]
    L --> M[Configure Room Credentials & Release Time for Matches]
    M --> N[Matches Go Live]
    N --> O[Submit Verified Scores & Select Winner]
    O --> P[System Automatically Advances Winner to Next Round]
    P --> Q{Final Match Finished?}
    Q -->|Yes| R[Mark Tournament Completed]
```

---

## 3. Room ID & Password Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor Org as Organizer
    participant API as Backend API
    participant Enc as Encryption Service (AES-256)
    participant DB as MongoDB (RoomDetails)
    actor Player as Team Player
    
    Org->>API: POST /matches/:id/room (RoomID, Pass, ReleaseTime)
    API->>Enc: Encrypt Password using ROOM_ENCRYPTION_KEY
    Enc-->>API: Ciphertext + IV
    API->>DB: Save encrypted RoomDetails
    API-->>Org: Success response (Never exposing raw pass in logs)
    
    Note over Player, API: Prior to Release Time
    Player->>API: GET /matches/:id/room
    API->>DB: Find RoomDetails for Match
    API->>API: Check releaseAt > now
    API-->>Player: 403 Forbidden ("Room credentials will be released at [time]")
    
    Note over Player, API: After Release Time
    Player->>API: GET /matches/:id/room
    API->>API: Verify Player is member of Team1 or Team2
    API->>Enc: Decrypt Password with stored IV
    Enc-->>API: Plaintext Room ID & Password
    API-->>Player: 200 OK { roomId, password, instructions }
```

---

## 4. Single-Elimination Bracket Logic with Byes
- For $N$ teams, the bracket size is the next power of 2, denoted as $P = 2^{\lceil \log_2 N \rceil}$.
- The number of byes is $B = P - N$.
- Number of matches in Round 1 is $(N - B) / 2 = N - P/2$.
- Teams receiving byes skip Round 1 and advance automatically to Round 2.
- Deterministic seeding ensures balanced brackets without unpredictable changes on reloads.
