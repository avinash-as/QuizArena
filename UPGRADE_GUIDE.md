# QuizPitara v2.0 — Production Upgrade Guide

## What Was Added

### Backend — New Models
| Model | Purpose |
|---|---|
| `QuizAttempt` | Server-side timer, one-submission enforcement, anti-cheat tracking |
| `ContestParticipant` | Dedicated ranking store (replaces inline contest.participants for scores) |
| `Question` | Enterprise question bank with category, difficulty, tags, explanation |
| `Wallet` | Separate deposit / winning / bonus balance ledger per user |
| `PrizeTemplate` | Admin-configurable prize distribution templates |
| `Referral` | Referral relationship tracking |
| `ReferralReward` | Bonus crediting on first contest completion |
| `KYC` | PAN, Aadhaar, bank details with PENDING/VERIFIED/REJECTED flow |
| `Withdrawal` | User withdrawal requests with admin PENDING→PAID workflow |
| `FraudDetection` | Anti-cheat event store with risk scores |
| `AuditLog` | Admin action audit trail |

### Backend — New Services
| Service | File |
|---|---|
| Prize Distribution | `src/services/prizeService.js` |
| Referral Reward | `src/services/referralService.js` |

### Backend — New Routes
| Route | Description |
|---|---|
| `POST /api/attempts/start` | Start quiz attempt (server timer) |
| `POST /api/attempts/:id/submit` | Submit answers (server-scored) |
| `GET /api/attempts/contest/:id` | Check attempt status |
| `GET/POST/PUT/DELETE /api/questions` | Question bank CRUD (admin) |
| `POST /api/questions/bulk` | Bulk import questions |
| `POST /api/questions/generate-quiz` | Auto-generate quiz from bank |
| `POST /api/kyc` | Submit KYC |
| `GET /api/kyc/me` | Get my KYC status |
| `GET/PUT /api/kyc/admin` | Admin KYC review |
| `POST /api/withdrawals` | Request withdrawal |
| `GET /api/withdrawals/me` | My withdrawal history |
| `GET/PUT /api/withdrawals/admin` | Admin withdrawal processing |
| `GET/POST/PUT/DELETE /api/prize-templates` | Prize template management |
| `GET/PUT /api/fraud` | Fraud case management |
| `GET /api/admin/stats` | Dashboard stats |
| `GET /api/admin/analytics` | 30-day analytics |
| `GET /api/admin/audit-logs` | Audit trail |
| `POST /api/admin/broadcast` | Broadcast notification |
| `GET /api/auth/referral-info` | Referral stats + code |

### Frontend — New Pages
| Page | Route |
|---|---|
| Wallet with withdrawals | `/wallet` |
| Quiz Play (server-timer, anti-cheat) | `/quiz/:contestId` |
| Result (detailed breakdown) | `/result` |
| Admin Question Bank | `/admin/question-bank` |
| Admin KYC Review | `/admin/kyc` |
| Admin Withdrawals | `/admin/withdrawals` |
| Admin Fraud Detection | `/admin/fraud` |
| Admin Analytics | `/admin/analytics` |
| Admin Prize Templates | `/admin/prize-templates` |
| Terms & Conditions | `/terms` |
| Privacy Policy | `/privacy` |
| Refund Policy | `/refund` |
| Fair Play Policy | `/fair-play` |

---

## Installation

### 1. Prerequisites
```
Node.js >= 18
MongoDB >= 7
Redis >= 7 (optional — degrades gracefully)
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in: MONGODB_URI, JWT_SECRET (32+ chars), CLIENT_URL

npm install
npm run dev        # development
npm run prod       # production
```

### 3. Frontend Setup
```bash
cd frontend
cp .env .env.local
# Set VITE_API_URL=http://localhost:5000/api

npm install
npm run dev        # development
npm run build      # production build
```

### 4. Docker (recommended for production)
```bash
cp backend/.env.example backend/.env  # fill in secrets
docker-compose up -d
```

---

## Migration Steps (from v1)

### Step 1 — Create Wallets for existing users
```js
// Run once in mongosh or a migration script
const users = await db.users.find({}).toArray()
for (const u of users) {
  await db.wallets.insertOne({
    user: u._id,
    depositBalance: 0,
    winningBalance: 0,
    bonusBalance: u.coins || 0,
    totalDeposited: 0,
    totalWon: 0,
    totalWithdrawn: 0,
    isWithdrawalEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
```

### Step 2 — Migrate ContestParticipants from Leaderboard
```js
// Existing contest leaderboard entries → ContestParticipant records
const contestEntries = await db.leaderboards.find({ period: 'contest' }).toArray()
for (const e of contestEntries) {
  await db.contestparticipants.insertOne({
    contest: e.contest,
    user: e.user,
    score: e.score,
    correctAnswers: e.correctAnswers,
    totalQuestions: e.totalQuestions,
    timeTaken: e.timeTaken,
    accuracy: e.accuracy,
    submittedAt: e.createdAt,
    joinedAt: e.createdAt,
    entryFeePaid: 0,
    prizeWon: 0,
    prizeDistributed: false,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  })
}
```

### Step 3 — Seed Question Bank
Import questions via the admin dashboard at `/admin/question-bank` or use the bulk API:
```bash
curl -X POST http://localhost:5000/api/questions/bulk \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"questions": [...]}'
```

### Step 4 — Create a Prize Template
```bash
curl -X POST http://localhost:5000/api/prize-templates \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Top 3",
    "platformFeePercent": 10,
    "ranks": [
      {"rankFrom":1,"rankTo":1,"label":"1st Place","percentage":50},
      {"rankFrom":2,"rankTo":2,"label":"2nd Place","percentage":30},
      {"rankFrom":3,"rankTo":3,"label":"3rd Place","percentage":20}
    ]
  }'
```

---

## Deployment (Production)

### PM2 (single server)
```bash
cd backend
npm install -g pm2
npm install
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker Compose
```bash
docker-compose up -d --build
docker-compose logs -f backend
```

### Environment Variables (Production Checklist)
```
✅ JWT_SECRET            — 32+ random characters
✅ MONGODB_URI           — Atlas or self-hosted replica set
✅ REDIS_URL             — Upstash or ElastiCache
✅ CLIENT_URL            — Production frontend URL (no trailing slash)
✅ NODE_ENV=production
✅ REFERRER_BONUS=200
✅ REFEREE_BONUS=100
✅ MIN_WITHDRAWAL=100
```

---

## Architecture Summary (v2)

```
Browser / Mobile
      │
      ▼
  Nginx (reverse proxy + static)
      │
      ├── /api/*  ──► Express (PM2 cluster, N workers)
      │                    │
      │              ┌─────┴──────┐
      │           MongoDB      Redis
      │           (primary)   (cache + sessions)
      │
      └── WS/Socket.io ──► Real-time leaderboard,
                            contest countdown,
                            participant join events
```

### Security Layers
1. **helmet** — HTTP security headers
2. **express-rate-limit** — API (300/15min), Auth (15/15min), Submit (5/min)
3. **JWT RS256** — Access token (7d)
4. **bcrypt (12 rounds)** — Password hashing
5. **Server-side scoring** — Correct answers never sent to client
6. **Anti-cheat** — Tab-switch detection, fast-submission checks, IP logging
7. **RBAC** — user / moderator / admin / super_admin
8. **Audit logs** — All admin actions recorded
9. **KYC gate** — Withdrawal requires verified identity
10. **One attempt per user per contest** — DB-level unique index

### Caching Strategy
- Contest leaderboard: Redis TTL 30s (real-time feel without DB hammering)
- Contest list: 60s TTL
- In-memory fallback when Redis unavailable
