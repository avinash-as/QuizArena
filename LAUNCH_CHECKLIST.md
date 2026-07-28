# QuizArena — Play Store & App Store Launch Checklist

## STEP 1 — Generate App Icons (30 minutes)

Go to: https://www.appicon.co OR https://easyappicon.com

Upload one 1024x1024 PNG of your logo (green Q on black background).
Download the generated icon pack.

Place icons in: frontend/public/icons/
- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png
- icon-384.png
- icon-512.png

---

## STEP 2 — Deploy Your Backend (1-2 hours)

### Option A: Railway (easiest, free tier)
1. Go to railway.app
2. Connect GitHub repo
3. Add these environment variables:
   - MONGO_URI=<MongoDB Atlas connection string>
   - JWT_SECRET=<your 32+ char secret>
   - REDIS_URL=<Upstash Redis URL>
   - CLIENT_URL=https://yourdomain.com
   - RAZORPAY_KEY_ID=<your key>
   - RAZORPAY_KEY_SECRET=<your secret>
4. Deploy → Railway gives you a URL like https://quizarena-backend.up.railway.app

### Option B: Render (free)
1. Go to render.com > New Web Service
2. Connect GitHub, set build command: npm install
3. Set start command: npm start
4. Add same environment variables

### MongoDB Atlas (free 512MB):
1. Go to mongodb.com/atlas
2. Create free cluster
3. Get connection string → paste as MONGO_URI

### Upstash Redis (free):
1. Go to upstash.com
2. Create free Redis database
3. Get connection URL → paste as REDIS_URL

---

## STEP 3 — Deploy Frontend (30 minutes)

### Vercel (recommended):
1. Go to vercel.com
2. Import your GitHub repo
3. Set root directory to: frontend
4. Add env variable: VITE_API_URL=https://your-backend-url.railway.app/api
5. Deploy → you get https://quizarena.vercel.app

### OR Netlify:
1. Go to netlify.com
2. Drag and drop the frontend/dist folder (after npm run build)

---

## STEP 4 — Set Up Razorpay (1 hour)

1. Register at razorpay.com (need GST + bank account)
2. Complete business verification
3. Go to Settings > API Keys > Generate Test Key
4. Add keys to backend .env
5. Test with test cards: 4111 1111 1111 1111 CVV: any Date: any future
6. When ready for live: Activate account, get live keys

---

## STEP 5 — Convert to Android App with Capacitor (2 hours)

Install Capacitor in your frontend:
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "QuizArena" "in.quizarena.app" --web-dir dist
npm run build
npx cap add android
npx cap sync
npx cap open android
```

In Android Studio:
- Build > Generate Signed Bundle/APK
- Create keystore (save this file — you need it forever)
- Build release APK
- This is your Play Store file

---

## STEP 6 — Play Store Submission (2-3 hours)

1. Pay $25 one-time fee at play.google.com/console
2. Create new app: "QuizArena - Win Real Money"
3. Fill in:
   - App category: Games > Trivia
   - Target audience: 18+ (REQUIRED for real money)
   - Content rating: complete questionnaire
   - Data safety: declare what data you collect

4. Upload:
   - App bundle (.aab file from Android Studio)
   - Screenshots (minimum 2, at least one 16:9)
   - Feature graphic (1024x500 PNG)
   - App icon (512x512 PNG)

5. Store listing:
   - Title: QuizArena - Win Real Money Quizzes
   - Short description (80 chars): Play skill-based quizzes and win real cash prizes daily!
   - Full description: (see template below)

6. Real Money Gaming Declaration:
   - Select "Paid apps/in-app purchases"
   - Declare payment methods
   - Provide Terms of Service URL
   - Provide Privacy Policy URL

7. Submit for review → takes 3-7 days

---

## STEP 7 — App Store (iOS) Submission (3-4 hours)

1. Pay $99/year at developer.apple.com
2. Install Xcode on a Mac (required)
3. Add iOS to your Capacitor project:
   ```bash
   npx cap add ios
   npx cap sync
   npx cap open ios
   ```
4. In Xcode: Product > Archive > Distribute App
5. Submit via App Store Connect at appstoreconnect.apple.com

---

## STEP 8 — Required Legal Documents (Already in your app)

✅ Terms & Conditions — /terms
✅ Privacy Policy — /privacy
✅ Refund Policy — /refund
✅ Fair Play Policy — /fair-play

Host these at permanent URLs (your production domain).

---

## STEP 9 — Real Money Gaming Compliance (India)

For India, real money gaming requires:
- [ ] Company registration (Private Limited preferred)
- [ ] GST registration
- [ ] Bank account in company name
- [ ] Razorpay business verification
- [ ] Users from restricted states blocked: Assam, Nagaland, Sikkim, Odisha, Telangana, Andhra Pradesh
- [ ] Age verification (18+) on signup
- [ ] KYC before withdrawal (already built)
- [ ] TDS deduction on winnings above ₹10,000 (consult CA)

---

## Play Store Full Description Template

```
QuizArena - India's #1 Skill-Based Quiz Competition Platform

🏆 Win Real Cash Prizes Daily!
Join lakhs of players competing in daily quiz contests across General Knowledge, Science, Current Affairs, Sports, and more.

✅ 100% SKILL BASED - No luck, only knowledge
✅ INSTANT WITHDRAWALS - Winnings transferred to your bank in minutes
✅ DAILY CONTESTS - New contests every day with exciting prizes
✅ LIVE LEADERBOARD - Compete in real-time with players across India
✅ FREE TO PLAY - Join free contests and paid contests

HOW IT WORKS:
1. Create your free account and get ₹100 bonus coins
2. Join a quiz contest (free or paid)
3. Answer questions as fast and accurately as possible
4. Win cash prizes if you finish in top ranks
5. Withdraw your winnings directly to your bank account

FEATURES:
• 10+ categories: GK, Science, History, Sports, Tech, Mathematics
• Practice mode with unlimited free quizzes
• Daily login bonus and streak rewards
• Referral program - Earn ₹200 for every friend you refer
• KYC verification for secure withdrawals
• Anti-cheat technology for fair play

WITHDRAWALS:
Minimum withdrawal ₹100. Processed within 24-48 hours via IMPS/NEFT to your registered bank account.

This is a game of skill. Success depends on your knowledge and speed, not luck.

For 18+ only. Players from Assam, Nagaland, Sikkim, Odisha, Telangana and Andhra Pradesh are not eligible for paid contests.

Support: support@quizarena.in
```

---

## Estimated Timeline

Week 1: Deploy backend + frontend, set up Razorpay, generate icons
Week 2: Test everything, add 50+ questions, create 10 contests
Week 3: Submit to Play Store
Week 4: Play Store approval, soft launch, gather feedback
Month 2: App Store submission, marketing, user acquisition

---

## Estimated Costs

| Item | Cost |
|------|------|
| Google Play Developer Account | $25 one-time |
| Apple Developer Account | $99/year |
| Railway backend hosting | Free → $5/month |
| MongoDB Atlas | Free → $9/month |
| Upstash Redis | Free → $10/month |
| Vercel frontend | Free |
| Razorpay | 2% per transaction |
| Domain name | ₹800/year |
| **Total to launch** | **~$125 + ₹800** |

