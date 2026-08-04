const Room = require('../models/Room')
const RoomParticipant = require('../models/RoomParticipant')
const roomEngine = require('../services/roomEngine')
const { cache } = require('../config/redis')

const isHost = (room, userId) => userId && room.host.toString() === userId.toString()

// Cache the finished leaderboard the same way Contest leaderboards are cached,
// so GET /api/rooms/:code/leaderboard right after a room ends doesn't have to
// re-run the sort/populate query.
const cacheLeaderboard = async (room, leaderboard) => {
  await cache.set(`lb:room:${room.code}`, JSON.stringify(leaderboard), 300)
}

// registerRoomHandlers is called once per connected socket from
// socket/index.js's existing io.on('connection', ...) — it only ADDS
// listeners to that socket, it doesn't replace anything already registered
// there (presence, contest:join, etc. keep working exactly as before).
const registerRoomHandlers = (io, socket) => {
  socket.on('room:join', async ({ code }) => {
    if (!code) return
    const roomCode = code.toUpperCase()
    socket.join(`room:${roomCode}`)

    const room = await Room.findOne({ code: roomCode })
      .select('title status currentParticipants maxParticipants locked currentQuestionIndex host code')
    if (!room) return socket.emit('room:error', { message: 'Room not found' })

    socket.emit('room:state', {
      title: room.title,
      status: room.status,
      currentParticipants: room.currentParticipants,
      maxParticipants: room.maxParticipants,
      locked: room.locked,
      isHost: isHost(room, socket.data.userId),
    })

    io.to(`room:${roomCode}`).emit('room:participant_count', { count: room.currentParticipants })
  })

  socket.on('room:leave', ({ code }) => {
    if (code) socket.leave(`room:${code.toUpperCase()}`)
  })

  socket.on('room:ready', async ({ code, ready }) => {
    if (!socket.data.userId || !code) return
    const room = await Room.findOne({ code: code.toUpperCase() }).select('_id code')
    if (!room) return
    await RoomParticipant.updateOne({ room: room._id, user: socket.data.userId }, { $set: { isReady: !!ready } })
    io.to(`room:${room.code}`).emit('room:participant_ready', { userId: socket.data.userId, ready: !!ready })
  })

  socket.on('room:start', async ({ code }) => {
    try {
      const room = await Room.findOne({ code: code.toUpperCase() })
      if (!room) return socket.emit('room:error', { message: 'Room not found' })
      if (!isHost(room, socket.data.userId)) return socket.emit('room:error', { message: 'Only the host can start the room' })
      if (room.status !== 'WAITING') return socket.emit('room:error', { message: `Cannot start a room that is ${room.status}` })

      io.to(`room:${room.code}`).emit('room:status', { status: 'STARTING' })
      await roomEngine.startRoom({ room, io, onLeaderboardUpdate: cacheLeaderboard })
    } catch (err) {
      socket.emit('room:error', { message: err.message })
    }
  })

  socket.on('room:pause', async ({ code }) => {
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room || !isHost(room, socket.data.userId) || room.status !== 'LIVE') return
    await roomEngine.pauseRoom({ room, io })
  })

  socket.on('room:resume', async ({ code }) => {
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room || !isHost(room, socket.data.userId) || room.status !== 'PAUSED') return
    await roomEngine.resumeRoom({ room, io, onLeaderboardUpdate: cacheLeaderboard })
  })

  socket.on('room:end', async ({ code }) => {
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room || !isHost(room, socket.data.userId)) return
    if (!['LIVE', 'PAUSED'].includes(room.status)) return
    await roomEngine.endRoom({ room, io, onLeaderboardUpdate: cacheLeaderboard })
  })

  socket.on('room:lock', async ({ code, locked }) => {
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room || !isHost(room, socket.data.userId)) return
    room.locked = !!locked
    await room.save()
    io.to(`room:${room.code}`).emit('room:lock_changed', { locked: room.locked })
  })

  socket.on('room:kick', async ({ code, userId }) => {
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room || !isHost(room, socket.data.userId) || !userId) return

    const removed = await RoomParticipant.findOneAndUpdate(
      { room: room._id, user: userId, kicked: false },
      { $set: { kicked: true, kickedAt: new Date() } },
      { new: true }
    )
    if (!removed) return
    await Room.updateOne({ _id: room._id }, { $inc: { currentParticipants: -1 } })
    io.to(`room:${room.code}`).emit('room:participant_removed', { userId })
  })

  socket.on('room:announcement', async ({ code, message }) => {
    if (!message?.trim()) return
    const room = await Room.findOne({ code: code.toUpperCase() }).select('host code')
    if (!room || !isHost(room, socket.data.userId)) return
    io.to(`room:${room.code}`).emit('room:announcement', { message: message.trim(), at: new Date() })
  })

  socket.on('room:answer:submit', async ({ code, questionId, chosenIndex }) => {
    try {
      if (!socket.data.userId) return socket.emit('room:error', { message: 'Login required' })
      const room = await Room.findOne({ code: code.toUpperCase() })
      if (!room) return socket.emit('room:error', { message: 'Room not found' })

      const result = await roomEngine.submitAnswer({
        room, userId: socket.data.userId, questionId, chosenIndex: chosenIndex ?? null,
      })
      socket.emit('room:answer:result', result)

      if (room.showLiveLeaderboard) {
        const top = await RoomParticipant.find({ room: room._id, kicked: false })
          .populate('user', 'name avatar')
          .sort({ score: -1, timeTakenMs: 1 })
          .limit(10)
        const ranked = top.map((p, i) => ({
          rank: i + 1, name: p.user?.name, avatar: p.user?.avatar, score: p.score,
        }))
        io.to(`room:${room.code}`).emit('room:leaderboard_update', ranked)
      }
    } catch (err) {
      socket.emit('room:error', { message: err.message })
    }
  })
}

module.exports = registerRoomHandlers
