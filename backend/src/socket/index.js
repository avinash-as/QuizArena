const Contest = require('../models/Contest')
const ContestParticipant = require('../models/ContestParticipant')
const { cache } = require('../config/redis')

// Live presence counter. Increments on socket connect, decrements on disconnect.
// Broadcast every 2s (idempotent) so the Home hero has a real, near-realtime number.
let liveCount = 0

const setupSocket = (io) => {
  // Auth middleware for socket — token is optional (public presence pings allowed)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (token) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.data.userId = decoded.id
      } catch (_) {}
    }
    next()
  })

  // Global heartbeat — every 3s broadcast the current live-user count.
  const broadcastPresence = () => io.emit('presence:count', { count: liveCount })
  const presenceInterval = setInterval(broadcastPresence, 3000)

  io.on('connection', (socket) => {
    liveCount += 1
    // Immediate pong so the connecting client gets the current number without waiting.
    socket.emit('presence:count', { count: liveCount })
    // Broadcast delta to everyone else (throttled by the interval).
    io.emit('presence:count', { count: liveCount })

    socket.on('contest:join', async ({ contestId }) => {
      socket.join(`contest:${contestId}`)
      const contest = await Contest.findById(contestId)
        .select('currentParticipants status startTime endTime title')
      if (contest) {
        socket.emit('contest:state', {
          currentParticipants: contest.currentParticipants,
          status: contest.status,
          startTime: contest.startTime,
          endTime: contest.endTime,
        })
      }
      const cached = await cache.get(`lb:contest:${contestId}`)
      if (cached) socket.emit('leaderboard:update', JSON.parse(cached))
    })

    socket.on('contest:leave', ({ contestId }) => socket.leave(`contest:${contestId}`))

    socket.on('leaderboard:subscribe', ({ period = 'alltime' }) => {
      socket.join(`leaderboard:${period}`)
    })

    socket.on('quiz:tab_switch', () => {
      socket.data.tabSwitches = (socket.data.tabSwitches || 0) + 1
    })

    socket.on('presence:request', () => socket.emit('presence:count', { count: liveCount }))

    socket.on('disconnect', () => {
      liveCount = Math.max(0, liveCount - 1)
      io.emit('presence:count', { count: liveCount })
    })
  })

  // Expose for a clean shutdown
  io.on('close', () => clearInterval(presenceInterval))

  return {
    getLiveCount: () => liveCount,

    emitParticipantJoined: (contestId, count) => {
      io.to(`contest:${contestId}`).emit('contest:participant_joined', { count })
    },

    emitLeaderboardUpdate: async (contestId) => {
      const participants = await ContestParticipant.find({ contest: contestId })
        .populate('user', 'name avatar')
        .sort({ score: -1, timeTaken: 1 })
        .limit(10)

      const ranked = participants.map((p, i) => ({
        rank: i + 1,
        name: p.user?.name,
        avatar: p.user?.avatar,
        score: p.score,
        accuracy: p.accuracy,
      }))

      await cache.set(`lb:contest:${contestId}`, JSON.stringify(ranked), 30)
      io.to(`contest:${contestId}`).emit('leaderboard:update', ranked)
    },

    emitContestStatus: (contestId, status) => {
      io.to(`contest:${contestId}`).emit('contest:status', { status })
    },

    emitCountdown: (contestId, secondsRemaining) => {
      io.to(`contest:${contestId}`).emit('contest:countdown', { secondsRemaining })
    },

    emitContestStarted: (contestId) => {
      io.to(`contest:${contestId}`).emit('contest:started', { contestId, startedAt: new Date() })
    },

    emitContestEnded: (contestId) => {
      io.to(`contest:${contestId}`).emit('contest:ended', { contestId, endedAt: new Date() })
    },
  }
}

module.exports = setupSocket
