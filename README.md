# ⚡ QuizPitara — Full Stack Production App

A Dream11-style quiz contest platform. Join contests, compete, climb leaderboards, and win coins.

---

## 🏗️ Project Structure

```
QuizPitara/
├── backend/          # Node.js + Express + MongoDB + Socket.io
│   ├── src/
│   │   ├── config/       # db.js, redis.js
│   │   ├── controllers/  # auth, contest, quiz, leaderboard, wallet, user
│   │   ├── middleware/   # auth.js (JWT), errorHandler.js
│   │   ├── models/       # User, Quiz, Contest, Leaderboard, Transaction, Achievement, Notification
│   │   ├── routes/       # auth, contests, quizzes, leaderboard, wallet, users
│   │   ├── services/     # walletService.js, achievementService.js
│   │   ├── socket/       # Socket.io real-time handler
│   │   ├── utils/        # seed.js
│   │   └── server.js     # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/   # Navbar, Footer, CoinBadge, LoadingSpinner, etc.
    │   ├── context/      # AuthContext, QuizContext
    │   ├── layouts/      # MainLayout
    │   ├── pages/
    │   │   ├── admin/    # AdminDashboard, AdminContests, AdminQuizzes, AdminUsers
    │   │   ├── Home, ContestLobby, ContestDetail, QuizPlay, Result
    │   │   ├── Dashboard, Profile, Wallet, Leaderboard
    │   │   └── Login, Register, ForgotPassword
    │   ├── routes/       # AppRoutes.jsx
    │   └── services/     # api.js (Axios + all API methods)
    ├── index.html
    └── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional — falls back to in-memory)

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, CLIENT_URL

npm install
npm run seed      # Seeds admin, test user, sample quizzes & contests
npm run dev       # Starts on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on port 5173
```


---

## 🔑 Key Features

| Feature              | Description                                               |
|---------------------|-----------------------------------------------------------|
| Auth                | JWT register/login, forgot password, profile edit         |
| Contest Lobby       | Filter by status, category, search; real-time participant count |
| Contest Detail      | Prize breakdown, rules, live leaderboard preview          |
| Quiz Engine         | Timed questions, option selection, auto-submit, dot nav   |
| Score System        | Base score (1000) + time bonus (200) based on speed       |
| Leaderboard         | Daily / Weekly / Monthly / All-time with podium display   |
| Wallet              | Coin balance, daily login bonus, streak multiplier, transaction history |
| Achievements        | Auto-unlocked based on user stats, with coin + XP rewards |
| Dashboard           | Stats, notifications, XP progress bar, quick actions      |
| Profile             | Edit info, real contest history, achievements display     |
| Admin Panel         | Create/edit contests, quizzes, manage users               |
| Real-Time           | Socket.io for live participant count and leaderboard updates |
| Dark Mode           | Full dark mode support with system preference detection   |

---

## 🌐 API Routes

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me                  (protected)
PUT  /api/auth/profile             (protected)
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

### Contests
```
GET  /api/contests                 ?status= &category= &search=
GET  /api/contests/:id
POST /api/contests/:id/join        (protected)
POST /api/contests/:id/submit      (protected)
GET  /api/contests/:id/leaderboard
POST /api/contests                 (admin)
PUT  /api/contests/:id             (admin)
DELETE /api/contests/:id           (admin)
POST /api/contests/:id/distribute-prizes (admin)
```

### Quizzes
```
GET  /api/quizzes
GET  /api/quizzes/:id              ?shuffle=true
POST /api/quizzes                  (admin)
PUT  /api/quizzes/:id              (admin)
DELETE /api/quizzes/:id            (admin)
```

### Leaderboard
```
GET  /api/leaderboard              ?period=daily|weekly|monthly|alltime
```

### Wallet
```
GET  /api/wallet                   (protected)
POST /api/wallet/daily-bonus       (protected)
```

### Users / Admin
```
GET  /api/users/me/dashboard       (protected)
GET  /api/users/me/notifications   (protected)
GET  /api/users/:id
GET  /api/users/admin/users        (admin)
PUT  /api/users/admin/users/:id    (admin)
GET  /api/users/admin/analytics    (admin)
```

---

## 🔌 Socket.io Events

### Client → Server
| Event                  | Payload                       |
|------------------------|-------------------------------|
| `contest:join`         | `{ contestId, userId }`       |
| `contest:leave`        | `{ contestId }`               |
| `leaderboard:subscribe`| `{ period }`                  |

### Server → Client
| Event                       | Payload                      |
|-----------------------------|------------------------------|
| `contest:state`             | `{ currentParticipants, status, startTime, endTime }` |
| `contest:participant_joined`| `{ count }`                  |
| `leaderboard:update`        | `[{ rank, name, score, ... }]` |
| `contest:status`            | `{ status }`                 |
| `contest:countdown`         | `{ secondsRemaining }`       |

---

## 🎨 Changes Made to Existing Codebase

1. **Preserved** all existing pages, components, context, and design system (Tailwind classes, card/btn-primary/gradient-text)
2. **Fixed** `QuizContext.jsx` — added missing `LEADERBOARD` export used by Home.jsx
3. **Fixed** `services/api.js` — corrected admin quiz routes, notification routes, and added proxy support (`/api` base instead of hardcoded URL)
4. **Fixed** `vite.config.js` — added dev proxy for `/api` and `/socket.io` to localhost:5000
5. **Fixed** `tailwind.config.js` — updated content glob to match `src/**` directory correctly
6. **Added** `ForgotPassword.jsx` page (was imported in AppRoutes but missing)
7. **Refactored** `Profile.jsx` — replaced dummy data with real API calls to `/users/me/dashboard`
8. **Added** `admin/AdminDashboard.jsx`, `AdminContests.jsx`, `AdminQuizzes.jsx`, `AdminUsers.jsx` (all were imported but missing)
9. **Backend** — fully new: all models, controllers, services, routes, middleware, socket handler, and seed script

---

## 🚢 Deployment

### Backend (Render / Railway)
```bash
# Set env vars: MONGO_URI, JWT_SECRET, CLIENT_URL, REDIS_URL (optional), NODE_ENV=production
npm start
```

### Frontend (Vercel / Netlify)
```bash
# Set: VITE_API_URL=https://your-backend.onrender.com/api
npm run build
# Deploy dist/
```

### MongoDB
Use MongoDB Atlas free tier — update MONGO_URI in .env

### Redis
Optional — app falls back to in-memory store if Redis is unavailable.
