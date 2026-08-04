const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const Room = require('../models/Room')
const RoomParticipant = require('../models/RoomParticipant')
const Quiz = require('../models/Quiz')
const { cache } = require('../config/redis')

// 6-char, unambiguous alphabet (no 0/O/1/I) — matches the "share a short code
// or a link with a friend" flow described for Rooms, not a Mongo ObjectId.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const generateRoomCode = () => {
  let code = ''
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]
  return code
}

const withUniqueCode = async () => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode()
    if (!(await Room.exists({ code }))) return code
  }
  throw new Error('Could not generate a unique room code, try again')
}

// POST /api/rooms
exports.createRoom = async (req, res, next) => {
  try {
    const {
      title, description, quiz, maxParticipants, isPublic, password,
      scheduledAt, duration, shuffleQuestions, shuffleOptions,
      negativeMarking, allowLateJoin, showLiveLeaderboard, autoEnd,
    } = req.body

    const quizDoc = await Quiz.findById(quiz).select('totalQuestions questions')
    const questionCount = quizDoc ? (quizDoc.totalQuestions || quizDoc.questions?.length || 0) : 0
    if (!quizDoc || questionCount === 0) {
      return res.status(400).json({ success: false, message: 'Pick a quiz that has at least one question' })
    }

    const code = await withUniqueCode()
    const room = await Room.create({
      code,
      title,
      description,
      host: req.user._id,
      quiz,
      maxParticipants,
      isPublic: isPublic !== false,
      passwordHash: password ? await bcrypt.hash(password, 10) : null,
      scheduledAt: scheduledAt || null,
      duration,
      shuffleQuestions: !!shuffleQuestions,
      shuffleOptions: !!shuffleOptions,
      negativeMarking: !!negativeMarking,
      allowLateJoin: allowLateJoin !== false,
      showLiveLeaderboard: showLiveLeaderboard !== false,
      autoEnd: autoEnd !== false,
    })

    res.status(201).json({
      success: true,
      room,
      joinLink: `${process.env.CLIENT_URL || ''}/rooms/${room.code}`,
    })
  } catch (err) { next(err) }
}

// GET /api/rooms/:code  — lobby info. Password (if any) is not revealed;
// only whether one is required.
exports.getRoomByCode = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() })
      .populate('quiz', 'title totalQuestions category')
      .populate('host', 'name avatar')
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })

    let hasJoined = false
    if (req.user) {
      hasJoined = !!(await RoomParticipant.findOne({ room: room._id, user: req.user._id, kicked: false }))
    }

    const { passwordHash, ...safeRoom } = room.toObject()
    res.json({ success: true, room: { ...safeRoom, requiresPassword: !!passwordHash }, hasJoined })
  } catch (err) { next(err) }
}

// POST /api/rooms/:code/join
exports.joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() }).select('+passwordHash')
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })
    if (room.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'This room was cancelled' })
    if (room.status === 'COMPLETED') return res.status(400).json({ success: false, message: 'This room has already ended' })
    if (room.locked) return res.status(400).json({ success: false, message: 'This room is locked by the host' })
    if (room.status !== 'WAITING' && !room.allowLateJoin) {
      return res.status(400).json({ success: false, message: 'Late join is disabled for this room' })
    }

    if (room.passwordHash) {
      const ok = req.body.password && await bcrypt.compare(req.body.password, room.passwordHash)
      if (!ok) return res.status(401).json({ success: false, message: 'Incorrect room password' })
    }

    const already = await RoomParticipant.findOne({ room: room._id, user: req.user._id })
    if (already && !already.kicked) {
      return res.json({ success: true, message: 'Already joined', room })
    }
    if (already?.kicked) {
      return res.status(403).json({ success: false, message: 'You were removed from this room' })
    }

    // Atomic capacity check — same race-condition-safe pattern used for
    // Contest joins (findOneAndUpdate with a guard expression, not a
    // read-then-write check).
    const updated = await Room.findOneAndUpdate(
      { _id: room._id, $expr: { $lt: ['$currentParticipants', '$maxParticipants'] } },
      { $inc: { currentParticipants: 1 } },
      { new: true }
    )
    if (!updated) return res.status(400).json({ success: false, message: 'Room is full' })

    await RoomParticipant.create({ room: room._id, user: req.user._id })

    if (req.app.locals.socket) {
      req.app.locals.socket.emitRoomParticipantJoined(room.code, updated.currentParticipants)
    }

    res.json({ success: true, message: 'Joined room', room: updated })
  } catch (err) { next(err) }
}

// GET /api/rooms/my — rooms this user hosts
exports.myRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ host: req.user._id })
      .populate('quiz', 'title totalQuestions')
      .sort({ createdAt: -1 })
      .limit(100)
    res.json({ success: true, rooms })
  } catch (err) { next(err) }
}

// GET /api/rooms/joined — rooms this user has participated in
exports.joinedRooms = async (req, res, next) => {
  try {
    const participations = await RoomParticipant.find({ user: req.user._id })
      .populate({ path: 'room', populate: { path: 'quiz', select: 'title' } })
      .sort({ createdAt: -1 })
      .limit(100)
    const rooms = participations.filter(p => p.room).map(p => ({
      room: p.room, myScore: p.score, myRank: p.rank, submittedAt: p.submittedAt,
    }))
    res.json({ success: true, rooms })
  } catch (err) { next(err) }
}

// DELETE /api/rooms/:code — host cancels a room that hasn't started yet
exports.cancelRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() })
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can cancel this room' })
    }
    if (!['WAITING', 'STARTING'].includes(room.status)) {
      return res.status(400).json({ success: false, message: 'A live or completed room cannot be cancelled' })
    }
    room.status = 'CANCELLED'
    await room.save()
    if (req.app.locals.io) req.app.locals.io.to(`room:${room.code}`).emit('room:status', { status: 'CANCELLED' })
    res.json({ success: true, message: 'Room cancelled' })
  } catch (err) { next(err) }
}

// GET /api/rooms/:code/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() }).select('_id code')
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })

    const cacheKey = `lb:room:${room.code}`
    const cached = await cache.get(cacheKey)
    if (cached) return res.json({ success: true, leaderboard: JSON.parse(cached), cached: true })

    const participants = await RoomParticipant.find({ room: room._id, kicked: false })
      .populate('user', 'name avatar level')
      .sort({ score: -1, timeTakenMs: 1 })
      .limit(100)

    const ranked = participants.map((p, i) => ({
      rank: p.rank || i + 1, user: p.user, score: p.score,
      correctAnswers: p.correctAnswers, wrongAnswers: p.wrongAnswers,
      accuracy: p.accuracy, timeTakenMs: p.timeTakenMs,
    }))
    res.json({ success: true, leaderboard: ranked })
  } catch (err) { next(err) }
}

// GET /api/rooms/:code/result — the calling user's own result
exports.getMyResult = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() })
      .populate('quiz', 'title totalQuestions')
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' })

    const participant = await RoomParticipant.findOne({ room: room._id, user: req.user._id })
    if (!participant) return res.status(404).json({ success: false, message: 'You did not participate in this room' })

    res.json({
      success: true,
      room: { title: room.title, quiz: room.quiz, status: room.status },
      result: {
        score: participant.score,
        rank: participant.rank,
        correctAnswers: participant.correctAnswers,
        wrongAnswers: participant.wrongAnswers,
        skipped: participant.skipped,
        totalQuestions: room.quiz?.totalQuestions || 0,
        accuracy: participant.accuracy,
        timeTakenMs: participant.timeTakenMs,
      },
    })
  } catch (err) { next(err) }
}
