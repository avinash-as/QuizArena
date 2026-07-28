# QuizArena — What To Do Right Now
# Read this top to bottom. Do every step.

=====================================================
YOUR CURRENT STATUS
=====================================================

✅ App is built and working locally
✅ Backend: Express + MongoDB + Socket.io (15 routes, 16 models)
✅ Frontend: React + Vite + Tailwind (Dream11 dark theme)
✅ Admin panel: Create quizzes, contests, manage users
✅ Anti-cheat: Server-side scoring, tab detection
✅ Wallet: 3-balance system
✅ KYC + Withdrawal system
✅ Referral system
✅ PWA ready (manifest + service worker)
✅ Capacitor config ready for Android

❌ Not yet on internet (only runs on your laptop)
❌ No real money (Razorpay not configured)
❌ Not on Play Store

=====================================================
STEP 1 — MAKE IT WORK PERFECTLY LOCALLY (Today)
=====================================================

Open VS Code → Open Terminal → Run these:

Terminal 1 (Backend):
  cd backend
  npm install
  npm run seed
  npm run dev

Terminal 2 (Frontend):
  cd frontend
  npm install
  npm run dev

Open: http://localhost:5173
Login: admin@quizarena.io / admin123

TEST THESE IN ORDER:
1. Login as admin → go to /admin
2. Go to /admin/quizzes → click "New Quiz" → add 5 questions → Create
3. Go to /admin/contests → click "New Contest" → pick your quiz
   Set start time: 5 minutes from now
   Set end time: 30 minutes from now
   Status: UPCOMING
   Entry fee: 0 (free)
   Prize pool: 100
   Prize breakdown: 1st=60, 2nd=40
   → Click Create
4. Wait 5 minutes → contest auto-becomes LIVE
5. Register as new user (different email than admin)
6. Login as new user → go to /contests → join the contest
7. Click "Play Now" → answer questions → submit
8. Go to /leaderboard → see your score

If all this works → you are ready for Step 2.

=====================================================
STEP 2 — PUT IT ON THE INTERNET (Week 1, Free)
=====================================================

You need these 4 accounts (all FREE):

--- 2A: GITHUB ---
1. Go to github.com → Sign up
2. Create repository called "quizarena"
3. Upload your entire project folder

--- 2B: MONGODB ATLAS (Free Database) ---
1. Go to mongodb.com/atlas → Sign up
2. Create FREE cluster (M0 tier)
3. Click "Connect" → "Drivers" → copy connection string
   Looks like: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/quizarena
4. Save this string

--- 2C: RAILWAY (Free Backend Hosting) ---
1. Go to railway.app → Sign in with GitHub
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo → select "backend" folder
4. Click "Variables" → add these:
   NODE_ENV = production
   MONGO_URI = (paste your MongoDB Atlas string)
   JWT_SECRET = QuizArena2024SuperSecretKeyChangeThis!XYZ123
   CLIENT_URL = https://quizarena.vercel.app
   DAILY_BONUS_COINS = 50
   REFERRER_BONUS = 200
   REFEREE_BONUS = 100
   MIN_WITHDRAWAL = 100
5. Railway deploys → gives you URL like:
   https://quizarena-backend.up.railway.app
6. SAVE THIS URL

--- 2D: VERCEL (Free Frontend Hosting) ---
1. Go to vercel.com → Sign in with GitHub
2. Click "Import Project" → select your repo
3. Set Root Directory: frontend
4. Add Environment Variable:
   VITE_API_URL = https://quizarena-backend.up.railway.app/api
5. Click Deploy
6. Vercel gives you URL:
   https://quizarena.vercel.app

NOW YOUR APP IS LIVE!
Test at: https://quizarena.vercel.app

--- 2E: RUN SEED ON PRODUCTION ---
In Railway dashboard → your backend → "Shell" tab → type:
node src/utils/seed.js

This creates admin account on live server.

=====================================================
STEP 3 — ADD REAL MONEY (Week 2)
=====================================================

--- 3A: REGISTER RAZORPAY ---
1. Go to razorpay.com → Click "Sign Up for Free"
2. Enter your business details
3. For "Business type": Individual or Private Limited
4. Upload: PAN card, Aadhaar, bank account details
5. Wait 2-5 days for approval

--- 3B: GET API KEYS ---
After approval:
1. Go to Razorpay Dashboard → Settings → API Keys
2. Generate Test Keys
3. Copy: Key ID and Key Secret

--- 3C: ADD TO RAILWAY ---
In Railway Variables, add:
  RAZORPAY_KEY_ID = rzp_test_YOUR_KEY
  RAZORPAY_KEY_SECRET = YOUR_SECRET

--- 3D: UPDATE CAPACITOR ---
Open frontend/capacitor.config.json
Change: "url": "https://quizarena.vercel.app"
(Already done — just make sure it matches your Vercel URL)

--- 3E: TEST DEPOSITS ---
Go to your live app → Login → Wallet → Add Money
Use test card: 4111 1111 1111 1111 CVV: 123

When satisfied → switch to LIVE Razorpay keys.

=====================================================
STEP 4 — BUILD ANDROID APP (Week 3)
=====================================================

You need:
- Windows PC (you have this)
- Android Studio installed
- Java JDK 17 installed

--- 4A: INSTALL JAVA JDK 17 ---
Go to: adoptium.net
Download: Temurin 17 (LTS)
Install. Restart PC.

--- 4B: INSTALL ANDROID STUDIO ---
Go to: developer.android.com/studio
Download. Install (takes 20-30 minutes).
Open Android Studio → SDK Manager → Install Android SDK 33

--- 4C: BUILD YOUR FRONTEND ---
In VS Code terminal:
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build

--- 4D: INITIALIZE CAPACITOR ---
npx cap init
(If it asks for app name: QuizArena)
(App ID: in.quizarena.app)
(Web dir: dist)

--- 4E: ADD ANDROID ---
npx cap add android
npx cap sync

--- 4F: OPEN IN ANDROID STUDIO ---
npx cap open android

Android Studio opens.

--- 4G: CREATE APP ICON ---
Before building:
1. Go to appicon.co (website)
2. Upload a 1024x1024 PNG of your logo
   (Make it: black background, green Q letter)
3. Download icons
4. In Android Studio: Right click "app" → New → Image Asset
5. Import your 1024x1024 logo
6. Android Studio generates all sizes automatically

--- 4H: BUILD RELEASE APP ---
In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Choose: Android App Bundle (for Play Store)
3. Click "Create new keystore"
   - Save to Desktop/quizarena.keystore
   - Password: (create strong password, SAVE IT FOREVER)
   - Alias: quizarena
   - Fill your name, city, country
4. Click Next → Release → Finish
5. Wait 2-3 minutes
6. File saved to: android/app/release/app-release.aab

⚠️ IMPORTANT: Copy quizarena.keystore to Google Drive + USB.
   If you lose it, you can NEVER update the app again.

=====================================================
STEP 5 — SUBMIT TO PLAY STORE (Week 3-4)
=====================================================

--- 5A: CREATE DEVELOPER ACCOUNT ---
1. Go to play.google.com/console
2. Sign in with Google account
3. Pay $25 one-time fee
4. Fill registration details
5. Wait 24-48 hours for activation

--- 5B: CREATE YOUR APP ---
1. Click "Create app"
2. App name: QuizArena - Win Real Money
3. Default language: English (India)
4. Type: Game
5. Free or Paid: Free

--- 5C: UPLOAD APP ---
1. Click "Production" → "Create new release"
2. Upload your app-release.aab file
3. Release name: 1.0.0
4. Release notes: "First version of QuizArena - Play quiz contests and win real cash prizes!"

--- 5D: FILL STORE LISTING ---
Short description (80 chars):
"Play skill-based quiz contests and win real cash prizes daily!"

Full description:
---
QuizArena is India's #1 skill-based quiz competition platform.

🏆 WIN REAL CASH PRIZES DAILY!

HOW IT WORKS:
1. Create free account and get ₹100 bonus coins
2. Join quiz contests (free & paid)
3. Answer questions fast and accurately
4. Win if you rank in top positions
5. Withdraw winnings to your bank account

CATEGORIES:
• General Knowledge • Current Affairs
• Science • History • Mathematics
• Technology • Sports

WHY QUIZARENA:
✅ 100% Skill-Based — No luck, only knowledge
✅ Instant Withdrawals — Bank transfer within 24 hours
✅ Daily Contests — New contests added every day
✅ Live Leaderboard — Real-time competition
✅ Free Practice Mode — Get better before competing
✅ Refer & Earn — ₹200 per successful referral

For age 18+ only.
Not available in: Assam, Nagaland, Sikkim, Odisha, Telangana, Andhra Pradesh.

Support: support@quizarena.in
Website: quizarena.in
---

--- 5E: SCREENSHOTS ---
You need at least 2 screenshots.
Take screenshots on your Android phone or emulator showing:
1. Home page
2. Contest list page
3. Quiz playing screen
4. Results page
Upload them.

--- 5F: CONTENT RATING ---
Click "Start questionnaire"
- Real money: YES → select "Skill-based gaming"
- Violence: No
- Sexual: No
- Age: 18+

--- 5G: DATA SAFETY ---
Declare:
- Name: Collected
- Email: Collected
- Financial info: Collected for payments
- App activity: Collected for leaderboards

--- 5H: PRIVACY POLICY URL ---
Enter: https://quizarena.vercel.app/privacy

--- 5I: SUBMIT ---
Click "Submit for review"
Wait 3-14 days.
Google will email you when approved.

=====================================================
STEP 6 — CONTENT (Add Before Launch)
=====================================================

Your app needs real questions.
The seed only has sample questions.

--- ADD 200+ QUESTIONS VIA ADMIN ---
Go to your live app → /admin/quizzes
Create quizzes for EVERY category:
- General Knowledge (50 questions)
- Current Affairs (30 questions)
- Science (30 questions)
- History (20 questions)
- Geography (20 questions)
- Math & Aptitude (20 questions)
- Technology (20 questions)

EACH QUIZ NEEDS:
- 10-15 questions minimum
- Clear question text
- 4 options (A, B, C, D)
- Correct answer selected
- Explanation written

--- CREATE 10 CONTESTS FOR LAUNCH DAY ---
Go to /admin/contests → Create these:
1. Daily GK Challenge (FREE, prize: 100 coins)
2. Weekly Science Quiz (FREE, prize: 200 coins)
3. Tech Trivia (₹10 entry, prize: ₹100)
4. Current Affairs (₹20 entry, prize: ₹200)
5. Speed Quiz (₹50 entry, prize: ₹500)

Schedule start times for your launch day.

=====================================================
STEP 7 — BEFORE GOING LIVE CHECKLIST
=====================================================

Security:
[ ] Change JWT_SECRET to random 32+ character string
[ ] Razorpay LIVE keys added (not test keys)
[ ] MongoDB Atlas has strong password

Content:
[ ] 200+ questions added across all categories
[ ] 10+ contests ready to launch
[ ] ₹5,000+ in your account to pay prize winners

Legal:
[ ] Terms page updated with your company name
[ ] Privacy policy updated
[ ] Age 18+ checkbox on registration
[ ] Block restricted states from paid contests

Testing:
[ ] Tested full flow: register → join → play → win → withdraw
[ ] Tested Razorpay deposit with real ₹10
[ ] Tested withdrawal and you paid yourself

=====================================================
COST SUMMARY
=====================================================

One-time costs:
- Google Play Account: $25 (₹2,100)
- Company registration: ₹7,000 (optional but recommended)
- Domain name: ₹800/year

Monthly costs (once users grow):
- Railway: FREE → $5/month
- MongoDB Atlas: FREE → $9/month
- Upstash Redis: FREE (6,500 req/day)

Revenue:
- You keep 10% of every contest prize pool
- Example: 100 users × ₹50 entry = ₹500/contest revenue
- 10 contests/day = ₹5,000/day
- 30 days = ₹1,50,000/month

=====================================================
SUMMARY — DO THESE IN ORDER
=====================================================

TODAY:
1. Test app locally — make sure contests work
2. Add 50 questions to admin panel

THIS WEEK:
3. Sign up: GitHub, MongoDB Atlas, Railway, Vercel
4. Deploy backend to Railway
5. Deploy frontend to Vercel
6. Test live app works

NEXT WEEK:
7. Register Razorpay
8. Get business bank account
9. Add more questions (200+)

WEEK 3:
10. Install Android Studio + Java JDK
11. Build Android .aab file
12. Create Play Store account ($25)
13. Submit app

WEEK 4:
14. App approved on Play Store
15. Share link with friends
16. Create WhatsApp group for players
17. Run first paid contest

