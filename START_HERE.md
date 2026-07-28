# QuizArena — Complete Setup Guide
# Read this top to bottom. Every step matters.

## YOUR OLD ZIP FILE — What to do with it

Your old zip had these files:
  backend/  — Express + MongoDB + Socket.io (v1, incomplete)
  frontend/ — React + Vite + Tailwind (v1, incomplete)

**THROW AWAY YOUR OLD ZIP. Use the upgraded zip I gave you.**
The upgraded zip is your old code + all the new production features merged in.
Nothing from your old code was deleted. Everything was extended.

---

## WHAT YOU HAVE NOW (Upgraded Project)

### Backend has 16 models:
  User, Quiz, Contest, Leaderboard, Transaction, Achievement, Notification  ← your originals
  QuizAttempt, ContestParticipant, Question, Wallet, PrizeTemplate          ← new
  Referral, KYC, Withdrawal, FraudDetection, AuditLog                       ← new

### Backend has 15 routes:
  /api/auth, /api/contests, /api/quizzes, /api/leaderboard  ← your originals
  /api/wallet, /api/users                                   ← your originals
  /api/attempts, /api/questions, /api/kyc                   ← new
  /api/withdrawals, /api/prize-templates, /api/fraud        ← new
  /api/admin                                                ← new

### Frontend has these pages:
  Home, Login, Register, ForgotPassword, Categories  ← your originals
  ContestLobby, ContestDetail, QuizPlay, Result       ← upgraded
  Leaderboard, Profile, Dashboard                     ← your originals
  Wallet (with withdrawals tab)                       ← upgraded
  Admin: Dashboard, Contests, Users, Quizzes          ← your originals
  Admin: QuestionBank, KYC, Withdrawals, Fraud        ← new
  Admin: Analytics, PrizeTemplates                    ← new
  Legal: Terms, Privacy, Refund, FairPlay             ← new

---

## STEP 1 — INSTALL REQUIRED SOFTWARE

You need these installed on your computer:

1. Node.js v18+
   Download: https://nodejs.org/en/download
   Check: node --version  (should show v18 or higher)

2. MongoDB Community Server
   Download: https://www.mongodb.com/try/download/community
   OR use MongoDB Atlas (free cloud) — recommended for beginners

3. Redis (optional but recommended)
   Windows: https://github.com/microsoftarchive/redis/releases
   Mac: brew install redis
   Linux: sudo apt install redis-server
   OR skip Redis — the app has an in-memory fallback built in

4. Git (optional, for version control)
   Download: https://git-scm.com/downloads

---

## STEP 2 — EXTRACT THE ZIP

1. Download quizarena-v2-upgraded.zip
2. Extract it anywhere — e.g. C:\Projects\quizarena or ~/projects/quizarena
3. You should see two folders: backend/ and frontend/

---

## STEP 3 — SET UP THE BACKEND

Open your terminal and run these commands one by one:

```bash
cd quizarena-upgraded/backend
```

### 3a. Create your .env file
Copy the example file:
```bash
cp .env.example .env
```

Open .env in any text editor and fill in:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/quizarena
JWT_SECRET=ThisMustBeAtLeast32CharactersLongAndRandom123!
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
DAILY_BONUS_COINS=50
REFERRER_BONUS=200
REFEREE_BONUS=100
MIN_WITHDRAWAL=100
```

IMPORTANT: Change JWT_SECRET to any random string of 32+ characters.
You can generate one here: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

### 3b. Install dependencies
```bash
npm install
```
This installs all packages. Takes 1-2 minutes.

### 3c. Start MongoDB
If using local MongoDB:
- Windows: MongoDB starts automatically as a service after install
- Mac/Linux: sudo systemctl start mongod
If using MongoDB Atlas: paste your connection string as MONGO_URI in .env

### 3d. Seed the database (creates test data)
```bash
npm run seed
```
This creates:
  Admin account: admin@quizarena.io / admin123
  Test user:     test@quizarena.io  / test1234
  Sample quizzes and contests

### 3e. Start the backend server
```bash
npm run dev
```
You should see:
  🚀 QuizArena API on port 5000
  [DB] MongoDB connected
  [DB] Indexes synced ✓

---

## STEP 4 — SET UP THE FRONTEND

Open a NEW terminal window (keep the backend running):

```bash
cd quizarena-upgraded/frontend
```

### 4a. Check your .env file
It should already contain:
```
VITE_API_URL=/api
```
That's correct. Leave it as is.

### 4b. Install dependencies
```bash
npm install
```

### 4c. Start the frontend
```bash
npm run dev
```
You should see:
  ➜  Local:   http://localhost:5173/

---

## STEP 5 — VERIFY IT WORKS

Open your browser and go to: http://localhost:5173

Test these things in order:

1. ✅ Home page loads with hero section and contests
2. ✅ Click Register — create an account
3. ✅ Login with your new account
4. ✅ Go to Contests — you should see the seeded contests
5. ✅ Click a contest — see contest detail page
6. ✅ Go to Wallet — see your 100 bonus coins
7. ✅ Go to Leaderboard — see rankings

Now test admin:
1. Login with: admin@quizarena.io / admin123
2. Go to: http://localhost:5173/admin
3. You should see the full admin dashboard
4. Try: /admin/question-bank — add a test question
5. Try: /admin/kyc — see KYC requests
6. Try: /admin/analytics — see charts

---

## STEP 6 — ADD YOUR OWN QUESTIONS (Important!)

The quiz engine now pulls questions from the Question Bank.

**Option A — Admin Dashboard (easiest)**
1. Login as admin
2. Go to http://localhost:5173/admin/question-bank
3. Click "Add Question"
4. Fill in: question text, 4 options, correct answer, category, difficulty
5. Click Create

**Option B — Bulk Import via API**
Create a file called questions.json:
```json
{
  "questions": [
    {
      "text": "What does HTML stand for?",
      "options": ["HyperText Markup Language", "HighText Machine Language", "HyperText and links Markup Language", "None of above"],
      "correctIndex": 0,
      "category": "general",
      "difficulty": "easy",
      "explanation": "HTML stands for HyperText Markup Language.",
      "points": 10,
      "timeLimit": 30
    }
  ]
}
```

Then run:
```bash
curl -X POST http://localhost:5000/api/questions/bulk \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @questions.json
```
(Get your admin token by logging in and checking localStorage in DevTools)

**Option C — Auto-generate a quiz from the bank**
Once you have 10+ questions in the bank:
1. Go to /admin/quizzes
2. Create a quiz — it will pick random questions from the bank

---

## STEP 7 — CREATE A LIVE CONTEST

1. Login as admin
2. Go to /admin/quizzes — create a quiz first
3. Go to /admin/contests — create a contest
   - Set status to UPCOMING
   - Set startTime to 5 minutes from now
   - Set endTime to 60 minutes from now
   - Link to your quiz
4. Within 5 minutes the scheduler auto-changes it to LIVE
5. Login as test user — join the contest — take the quiz
6. After endTime, prizes auto-distribute

---

## STEP 8 — COMMON ERRORS AND FIXES

**Error: Cannot connect to MongoDB**
Fix: Make sure MongoDB is running. On Windows: Services → MongoDB → Start

**Error: ECONNREFUSED 127.0.0.1:6379 (Redis)**
Fix: Either install Redis or ignore this — the app works without Redis using in-memory cache.

**Error: JWT_SECRET must be defined**
Fix: Open backend/.env and set JWT_SECRET to any 32+ character string

**Error: Cannot find module 'node-cron'**
Fix: Run npm install again in backend/

**Error: 404 on /api routes from frontend**
Fix: Make sure backend is running on port 5000. Check frontend/.env has VITE_API_URL=/api

**Error: White screen on frontend**
Fix: Open browser DevTools (F12) → Console tab → read the error message

**Error: seed.js fails**
Fix: Make sure MongoDB is running first, then run npm run seed

---

## STEP 9 — WHAT EACH FILE DOES

### Backend — Key Files

| File | Purpose |
|------|---------|
| src/server.js | Entry point — starts Express, Socket.io, scheduler |
| src/config/db.js | MongoDB connection |
| src/config/redis.js | Redis + in-memory cache fallback |
| src/models/*.js | Database schemas |
| src/controllers/*.js | Business logic for each feature |
| src/routes/*.js | URL routing — maps URLs to controllers |
| src/middleware/auth.js | JWT verification, RBAC |
| src/middleware/antiCheat.js | Tab switch + fast submission detection |
| src/services/walletService.js | Credit/debit coins, daily bonus |
| src/services/prizeService.js | Auto-distribute prizes on contest end |
| src/services/referralService.js | Referral bonus on first contest |
| src/jobs/contestScheduler.js | Cron — auto LIVE, COMPLETED, prize dist |
| src/socket/index.js | Real-time leaderboard + contest events |
| src/utils/seed.js | Create test data |
| src/utils/dbIndexes.js | MongoDB indexes for performance |

### Frontend — Key Files

| File | Purpose |
|------|---------|
| src/main.jsx | React entry point |
| src/App.jsx | Root component |
| src/routes/AppRoutes.jsx | All page routes |
| src/context/AuthContext.jsx | Global login state |
| src/services/api.js | All API calls — every endpoint in one place |
| src/pages/QuizPlay.jsx | Quiz game with server timer + anti-cheat |
| src/pages/Wallet.jsx | Balance, transactions, withdrawals |
| src/pages/admin/* | All admin dashboard pages |
| src/pages/legal/* | Terms, Privacy, Refund, Fair Play |

---

## STEP 10 — FLOW OF A COMPLETE USER JOURNEY

1. User visits site → sees Home page
2. User registers → gets 100 bonus coins, referral code
3. User shares referral code → friend registers with it
4. User browses Contests → joins one (pays entry fee from wallet)
5. Contest starts (auto by scheduler) → user gets notified
6. User opens QuizPlay → server starts timer
7. User answers questions → tab switches are detected
8. User submits → server calculates score, updates leaderboard
9. Socket broadcasts updated leaderboard to all participants
10. Contest ends (auto) → prizes auto-distributed
11. User gets notification → sees prize in Wallet > Winning Balance
12. User completes KYC → requests withdrawal
13. Admin reviews withdrawal → marks as PAID
14. Referral reward triggers → both users get bonus coins

---

## STEP 11 — PRODUCTION DEPLOYMENT (when you're ready)

### Option A — VPS (DigitalOcean / Linode / AWS EC2)

```bash
# On your server
git clone your-repo
cd quizarena-upgraded/backend
cp .env.example .env
# fill in production values
npm install
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

Frontend — build and serve:
```bash
cd frontend
npm install
npm run build
# upload dist/ folder to your server or Nginx
```

### Option B — Docker (easiest)
```bash
cp backend/.env.example backend/.env
# fill in JWT_SECRET and other values
docker-compose up -d --build
```
Opens on port 80 automatically.

### Production Checklist
- [ ] Change JWT_SECRET (32+ random chars)
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Use Redis Cloud (Upstash free tier) instead of local Redis
- [ ] Set NODE_ENV=production
- [ ] Set CLIENT_URL to your actual domain
- [ ] Enable HTTPS (use Let's Encrypt / Cloudflare)
- [ ] Set up domain and point DNS to your server

---

## QUICK REFERENCE — API Endpoints

| Method | URL | Auth | What it does |
|--------|-----|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get my profile |
| GET | /api/contests | No | List all contests |
| POST | /api/contests/:id/join | Yes | Join a contest |
| POST | /api/attempts/start | Yes | Start quiz (get server timer) |
| POST | /api/attempts/:id/submit | Yes | Submit answers |
| GET | /api/wallet | Yes | My wallet balances |
| POST | /api/wallet/daily-bonus | Yes | Claim daily bonus |
| GET | /api/leaderboard | No | Global leaderboard |
| POST | /api/kyc | Yes | Submit KYC |
| POST | /api/withdrawals | Yes | Request withdrawal |
| GET | /api/questions | Admin | Question bank |
| POST | /api/questions | Admin | Add question |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/fraud | Admin | Fraud cases |

---

## NEED HELP?

If something doesn't work:
1. Check the terminal where backend is running — read error messages
2. Check browser DevTools (F12) → Console and Network tabs
3. Make sure both MongoDB AND backend are running before opening frontend
4. Make sure you ran `npm install` in BOTH backend/ AND frontend/

