# What Changed: Original → Upgraded

## Your original zip had 80 files.
## The upgraded zip has 126 files (46 new files added, nothing deleted).

---

## NEW BACKEND FILES (33 new files)

### 11 New Models
| File | What it does |
|------|-------------|
| models/Wallet.js | Separate deposit/winning/bonus balance per user |
| models/QuizAttempt.js | Server-side timer, one-submit-only, anti-cheat |
| models/ContestParticipant.js | Tracks every user's score per contest |
| models/Question.js | Question bank (category, difficulty, tags, explanation) |
| models/PrizeTemplate.js | Admin prize % templates (Rank1=50%, Rank2=30% etc) |
| models/Referral.js | Tracks who referred who |
| models/KYC.js | PAN, Aadhaar, bank details verification |
| models/Withdrawal.js | Withdrawal requests with admin approval flow |
| models/FraudDetection.js | Anti-cheat event store with risk scores |
| models/AuditLog.js | Logs every admin action |

### 6 New Controllers
| File | What it does |
|------|-------------|
| controllers/quizAttemptController.js | Start attempt, submit answers, check status |
| controllers/questionController.js | Question bank CRUD, bulk import, auto-generate quiz |
| controllers/kycController.js | Submit KYC, admin review |
| controllers/withdrawalController.js | Request withdrawal, admin approve/reject/pay |
| controllers/prizeTemplateController.js | Admin prize template management |
| controllers/fraudController.js | Admin fraud case review, ban users |

### 9 New Routes
| File | URL prefix |
|------|-----------|
| routes/attempts.js | /api/attempts |
| routes/questions.js | /api/questions |
| routes/kyc.js | /api/kyc |
| routes/withdrawals.js | /api/withdrawals |
| routes/prizeTemplates.js | /api/prize-templates |
| routes/fraud.js | /api/fraud |
| routes/admin.js | /api/admin |

### 2 New Services
| File | What it does |
|------|-------------|
| services/prizeService.js | Auto-distributes prizes when contest ends |
| services/referralService.js | Credits both users on first contest completion |

### 2 New Middleware
| File | What it does |
|------|-------------|
| middleware/antiCheat.js | Detects tab switches, fast submissions |
| middleware/auditLog.js | Records admin actions to AuditLog |

### 1 New Job
| File | What it does |
|------|-------------|
| jobs/contestScheduler.js | Cron every 1min: auto UPCOMING→LIVE→COMPLETED, auto prize distribution |

### 1 New Utility
| File | What it does |
|------|-------------|
| utils/dbIndexes.js | Creates all MongoDB indexes at startup for performance |

### Docker/DevOps Files
- backend/Dockerfile
- backend/ecosystem.config.js (PM2 cluster config)
- docker-compose.yml
- frontend/Dockerfile
- frontend/nginx.conf

---

## NEW FRONTEND FILES (11 new pages)

### 6 New Admin Pages
| Page | URL | What it does |
|------|-----|-------------|
| AdminQuestionBank.jsx | /admin/question-bank | Add/edit/delete questions, search/filter |
| AdminKYC.jsx | /admin/kyc | Review KYC submissions, verify/reject |
| AdminWithdrawals.jsx | /admin/withdrawals | Process withdrawal requests, mark paid |
| AdminFraud.jsx | /admin/fraud | View fraud cases, ban users |
| AdminAnalytics.jsx | /admin/analytics | Charts: daily signups, revenue, contest stats |
| AdminPrizeTemplates.jsx | /admin/prize-templates | Create prize % templates |

### 4 New Legal Pages
| Page | URL |
|------|-----|
| Terms.jsx | /terms |
| Privacy.jsx | /privacy |
| Refund.jsx | /refund |
| FairPlay.jsx | /fair-play |

---

## EXISTING FILES THAT WERE UPGRADED (not just copied)

| File | What changed |
|------|-------------|
| models/User.js | Added referralCode, referredBy, isBanned, RBAC roles, syncLevel() |
| models/Contest.js | Added DRAFT status, platformFeePercent, prizeTemplate, prizesDistributed |
| models/Transaction.js | Added withdrawal, deposit, refund categories |
| controllers/authController.js | Added referral on register, forgot/reset password, referral-info endpoint |
| controllers/contestController.js | Uses ContestParticipant, server-side scoring, prize distribution |
| controllers/walletController.js | Uses new Wallet model with 3 balance types |
| controllers/adminController.js | Full analytics, audit logs, credit coins, broadcast notifications |
| middleware/auth.js | Added adminOnly, superAdminOnly, moderatorOrAdmin, optionalAuth |
| socket/index.js | Contest countdown, participant joined, contest start/end events |
| config/redis.js | Full graceful fallback to in-memory cache when Redis unavailable |
| server.js | Mounts all 15 routes, starts scheduler, syncs DB indexes |
| routes/auth.js | Added forgot-password, reset-password, referral-info |
| routes/contests.js | Added distribute-prizes, optionalAuth for public routes |
| services/api.js (frontend) | All new API calls: attempts, questions, KYC, withdrawals, fraud, admin |
| routes/AppRoutes.jsx | All new page routes added |
| pages/QuizPlay.jsx | Server-side timer, tab-switch detection, anti-cheat |
| pages/Result.jsx | Full breakdown with achievements, answer review |
| pages/Wallet.jsx | 3-balance display, withdrawal request form, withdrawal history |
| backend/.env | Added REFERRER_BONUS, REFEREE_BONUS, MIN_WITHDRAWAL |
| backend/package.json | Added node-cron dependency |

---

## SUMMARY

Your original: Working skeleton — auth, basic contests, basic quiz, basic wallet
The upgrade: Full production platform — anti-cheat, KYC, withdrawals, prize distribution,
             referrals, question bank, fraud detection, real-time scheduler, Docker

Use ONLY the upgraded zip. Delete the original.
