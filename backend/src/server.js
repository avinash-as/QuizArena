require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')

const connectDB = require('./config/db')
const { connectRedis } = require('./config/redis')
const setupSocket = require('./socket')
const { errorHandler } = require('./middleware/errorHandler')
const ensureIndexes = require('./utils/dbIndexes')
const { initScheduler } = require('./jobs/contestScheduler')

// A genuinely uncaught error anywhere outside Express's own request cycle
// (a stray unhandled promise rejection, a bug in a fire-and-forget .catch-less
// call, etc.) would otherwise crash the whole process and take down every
// in-flight request/socket with it. These don't fix the underlying bug, but
// they stop one bad async call from being a full outage — log loudly and
// keep serving. process.exit is intentionally NOT called here: killing the
// process on every stray rejection would turn a minor bug into a real outage
// under a process manager that doesn't restart fast enough, which is worse
// than logging and continuing for a quiz/contest app.
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err)
})

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

const socketHandler = setupSocket(io)
app.locals.io = io
app.locals.socket = socketHandler

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))
// 10kb was too small for admin payloads — a quiz with a realistic number of
// questions (text + 4 options + explanation each) or a bulk question-bank
// upload routinely exceeds that and was being rejected with a 413 "request
// entity too large" error before ever reaching the controller. 2mb comfortably
// covers a large quiz/bulk upload while still bounding request size.
app.use(express.json({ limit: '2mb' }))
// Strips any request key starting with "$" or containing "." from body/params/
// query (e.g. { "email": { "$gt": "" } } as a login payload) — the classic
// NoSQL-injection shape against Mongo. Without this, a crafted body could
// turn a Mongoose `findOne({ email })` into an operator injection.
app.use(mongoSanitize())
// Guards against HTTP Parameter Pollution — e.g. ?category=a&category=b
// being read as an array where a controller expects a single string,
// which can bypass filters or produce unexpected query behavior.
app.use(hpp())
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  uptime: Math.round(process.uptime()),
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
}))

// Used by the frontend to compute a client-clock-vs-server-clock offset, so
// countdown timers (contest start/end) are correct even when a user's
// device clock is wrong — deliberately separate from /api/health, since
// health-check responses are sometimes cached by load balancers/monitoring
// tools, which would make them unreliable for time sync. No-cache headers
// here just in case something in front of this ever tries to cache it too.
app.get('/api/time', (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ serverTime: Date.now() })
})

// Rate limiters, route mounting, and the Socket.IO adapter are all wired up
// inside start() below, AFTER Redis connects — not at module load time.
// Rate limiters need a live Redis client to use a shared store; building
// them before Redis connects would silently fall back to per-instance
// in-memory counting, which is exactly the bug this fixes.
const buildLimiter = (redisClient, opts) => {
  if (redisClient?.isOpen) {
    const { RedisStore } = require('rate-limit-redis')
    return rateLimit({
      ...opts,
      store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: `rl:${opts.prefix || 'default'}:`,
      }),
    })
  }
  console.warn(`[RateLimit] No Redis — "${opts.prefix}" limiter is per-instance only. Fine for a single instance, not for horizontally-scaled production.`)
  return rateLimit(opts)
}

const start = async () => {
  await connectDB()
  const redisClient = await connectRedis()
  await ensureIndexes()
  initScheduler(socketHandler)

  // --- Rate limiting (shared Redis store when available) ---
  // Without a shared store, each server instance counts requests
  // independently — run 5 instances behind a load balancer and your
  // "300 requests / 15 min" limit silently becomes ~1500, since a client's
  // requests get spread across instances that don't know about each
  // other's counts.
  const limiter        = buildLimiter(redisClient, { windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false, prefix: 'api' })
  const authLimiter     = buildLimiter(redisClient, { windowMs: 15 * 60 * 1000, max: 15, prefix: 'auth' })
  const submitLimiter   = buildLimiter(redisClient, { windowMs: 60 * 1000, max: 5, prefix: 'submit' })
  // Separate, tighter limiter for resend-verification — the per-user 60s
  // cooldown in the controller stops one account from spamming itself, but
  // this stops someone hammering the endpoint across many different email
  // addresses to burn through Resend's send quota / spam other people's inboxes.
  const verifyLimiter  = buildLimiter(redisClient, { windowMs: 15 * 60 * 1000, max: 5, prefix: 'verify' })

  app.use('/api', limiter)
  app.use('/api/auth/login',    authLimiter)
  app.use('/api/auth/register', authLimiter)
  app.use('/api/auth/resend-verification', verifyLimiter)
  app.use('/api/attempts/:id/submit', submitLimiter)

  // --- Routes ---
  app.use('/api/auth',            require('./routes/auth'))
  app.use('/api/contests',        require('./routes/contests'))
  app.use('/api/quizzes',         require('./routes/quizzes'))
  app.use('/api/leaderboard',     require('./routes/leaderboard'))
  app.use('/api/wallet',          require('./routes/wallet'))
  app.use('/api/users',           require('./routes/users'))
  app.use('/api/attempts',        require('./routes/attempts'))
  app.use('/api/questions',       require('./routes/questions'))
  app.use('/api/prize-templates', require('./routes/prizeTemplates'))
  app.use('/api/admin',           require('./routes/admin'))
  app.use('/api/fraud',           require('./routes/fraud'))

  app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }))
  app.use(errorHandler)

  // --- Socket.IO Redis adapter ---
  // Socket.IO only broadcasts to sockets connected to the SAME process by
  // default. With more than one server instance behind a load balancer, a
  // user on instance A would never see a room broadcast (contest state,
  // leaderboard updates) triggered from instance B. The Redis adapter fixes
  // this by using Redis pub/sub to relay events across all instances, so
  // `io.to(room).emit(...)` reaches every connected user no matter which
  // instance they landed on.
  if (redisClient?.isOpen) {
    try {
      const { createAdapter } = require('@socket.io/redis-adapter')
      const pubClient = redisClient.duplicate()
      const subClient = redisClient.duplicate()
      await Promise.all([pubClient.connect(), subClient.connect()])
      io.adapter(createAdapter(pubClient, subClient))
      console.log('[Socket.IO] Redis adapter attached — cross-instance broadcast enabled ✓')
    } catch (e) {
      console.warn('[Socket.IO] Redis adapter setup failed, falling back to single-instance mode:', e.message)
    }
  } else {
    console.warn('[Socket.IO] No Redis connection — real-time events will only reach users on THIS instance. Fine for local dev / a single instance, not safe for horizontally-scaled production.')
  }

  const PORT = process.env.PORT || 5000
  server.listen(PORT, () => {
    console.log(`🚀 QuizArena API — port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
  })
}

start().catch(err => { console.error('Startup error:', err); process.exit(1) })