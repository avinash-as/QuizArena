// Server-authoritative live-question engine for Rooms.
//
// KNOWN LIMITATION (matches an existing pattern already flagged elsewhere in
// this codebase, e.g. the rate-limiter/Socket.IO-adapter fallbacks in
// server.js): per-question timers live in an in-memory Map on this process.
// With more than one server instance behind a load balancer, only the
// instance that received the `room:start` call runs the timer for that
// room. Fine for a single instance; if QuizArena ever scales horizontally,
// this needs to move to a Redis-backed scheduled job the same way the
// contest scheduler could.
const Room = require('../models/Room')
const RoomParticipant = require('../models/RoomParticipant')
const Quiz = require('../models/Quiz')

// roomId (string) -> { timer, questionStartedAt }
const activeTimers = new Map()

const clearRoomTimer = (roomId) => {
  const entry = activeTimers.get(roomId)
  if (entry?.timer) clearTimeout(entry.timer)
  activeTimers.delete(roomId)
}

// Strip the answer key before sending a question to clients.
const publicQuestion = (q, index, total) => ({
  index,
  total,
  questionId: q._id,
  text: q.text,
  options: q.options,
  timeLimit: q.timeLimit || 30,
  points: q.points || 10,
})

const buildQuestionOrder = (quiz, shuffle) => {
  const order = quiz.questions.map((_, i) => i)
  if (!shuffle) return order
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// Emits used throughout: room:question, room:question:ended, room:ended,
// room:status, leaderboard broadcast is left to the caller (socket handler)
// since it needs the io instance's room-emit helper already defined there.
const startRoom = async ({ room, io, onLeaderboardUpdate }) => {
  const quiz = await Quiz.findById(room.quiz)
  if (!quiz || !quiz.questions?.length) {
    throw Object.assign(new Error('This room\'s quiz has no questions'), { statusCode: 400 })
  }

  const order = buildQuestionOrder(quiz, room.shuffleQuestions)
  room.questionOrder = order
  room.currentQuestionIndex = 0
  room.status = 'LIVE'
  room.startedAt = new Date()
  await room.save()

  await runQuestion({ room, quiz, io, onLeaderboardUpdate })
  return room
}

const runQuestion = async ({ room, quiz, io, onLeaderboardUpdate }) => {
  const roomId = room._id.toString()
  clearRoomTimer(roomId)

  const qIndex = room.questionOrder[room.currentQuestionIndex]
  const question = quiz.questions[qIndex]
  const payload = publicQuestion(question, room.currentQuestionIndex, room.questionOrder.length)

  io.to(`room:${room.code}`).emit('room:question', payload)

  const timer = setTimeout(() => {
    advanceQuestion({ roomId: room._id, io, onLeaderboardUpdate }).catch(err =>
      console.error('[roomEngine] advanceQuestion failed:', err.message))
  }, (question.timeLimit || 30) * 1000 + 500) // small buffer for network/client clock drift

  activeTimers.set(roomId, { timer, questionStartedAt: Date.now() })
}

const advanceQuestion = async ({ roomId, io, onLeaderboardUpdate }) => {
  const room = await Room.findById(roomId)
  if (!room || room.status !== 'LIVE') return // paused/ended/cancelled elsewhere — nothing to do

  clearRoomTimer(roomId)
  io.to(`room:${room.code}`).emit('room:question:ended', { index: room.currentQuestionIndex })

  const isLast = room.currentQuestionIndex >= room.questionOrder.length - 1
  if (isLast) {
    return endRoom({ room, io, onLeaderboardUpdate })
  }

  room.currentQuestionIndex += 1
  await room.save()
  const quiz = await Quiz.findById(room.quiz)
  await runQuestion({ room, quiz, io, onLeaderboardUpdate })
}

const pauseRoom = async ({ room, io }) => {
  clearRoomTimer(room._id.toString())
  room.status = 'PAUSED'
  await room.save()
  io.to(`room:${room.code}`).emit('room:status', { status: 'PAUSED' })
}

const resumeRoom = async ({ room, io, onLeaderboardUpdate }) => {
  room.status = 'LIVE'
  await room.save()
  io.to(`room:${room.code}`).emit('room:status', { status: 'LIVE' })
  const quiz = await Quiz.findById(room.quiz)
  await runQuestion({ room, quiz, io, onLeaderboardUpdate })
}

// Finalize scoring for every participant and mark the room COMPLETED.
// Also used for an early host-triggered end (not just "ran out of questions").
const endRoom = async ({ room, io, onLeaderboardUpdate }) => {
  clearRoomTimer(room._id.toString())

  const participants = await RoomParticipant.find({ room: room._id, kicked: false })
    .sort({ score: -1, timeTakenMs: 1 })

  participants.forEach((p, i) => {
    p.rank = i + 1
    p.submittedAt = p.submittedAt || new Date()
  })
  await Promise.all(participants.map(p => p.save()))

  room.status = 'COMPLETED'
  room.endedAt = new Date()
  await room.save()

  const leaderboard = participants.slice(0, 100).map(p => ({
    rank: p.rank, user: p.user, score: p.score,
    correctAnswers: p.correctAnswers, wrongAnswers: p.wrongAnswers,
    accuracy: p.accuracy, timeTakenMs: p.timeTakenMs,
  }))

  io.to(`room:${room.code}`).emit('room:ended', { roomId: room._id, leaderboard })
  if (onLeaderboardUpdate) await onLeaderboardUpdate(room, leaderboard)
  return room
}

// Called from the socket handler when a participant submits an answer.
// Returns the per-question result (correct/incorrect + correctIndex) so the
// client can show immediate feedback — this is the only point at which the
// answer key for THIS question is revealed to that participant.
const submitAnswer = async ({ room, userId, questionId, chosenIndex }) => {
  if (room.status !== 'LIVE') {
    throw Object.assign(new Error('Room is not currently live'), { statusCode: 400 })
  }

  const quiz = await Quiz.findById(room.quiz).select('questions')
  const question = quiz.questions.id(questionId)
  if (!question) throw Object.assign(new Error('Question not found'), { statusCode: 404 })

  const participant = await RoomParticipant.findOne({ room: room._id, user: userId })
  if (!participant || participant.kicked) {
    throw Object.assign(new Error('Not an active participant in this room'), { statusCode: 403 })
  }

  const already = participant.answers.find(a => a.questionId.toString() === questionId)
  if (already) {
    throw Object.assign(new Error('Answer already submitted for this question'), { statusCode: 400 })
  }

  const timerEntry = activeTimers.get(room._id.toString())
  const timeTakenMs = timerEntry ? Date.now() - timerEntry.questionStartedAt : 0

  const isCorrect = chosenIndex === question.correctIndex
  let pointsAwarded = 0
  if (isCorrect) {
    pointsAwarded = question.points || 10
  } else if (room.negativeMarking && chosenIndex !== null && chosenIndex !== undefined) {
    pointsAwarded = -(question.negativeMarks || 0)
  }

  participant.answers.push({ questionId, chosenIndex, correct: isCorrect, timeTakenMs })
  participant.score += pointsAwarded
  if (isCorrect) participant.correctAnswers += 1
  else if (chosenIndex === null || chosenIndex === undefined) participant.skipped += 1
  else participant.wrongAnswers += 1
  participant.timeTakenMs += timeTakenMs
  const answeredCount = participant.answers.length
  participant.accuracy = answeredCount ? Math.round((participant.correctAnswers / answeredCount) * 100) : 0
  await participant.save()

  return {
    correct: isCorrect,
    correctIndex: question.correctIndex,
    pointsAwarded,
    scoreTotal: participant.score,
  }
}

module.exports = {
  startRoom, pauseRoom, resumeRoom, endRoom, advanceQuestion, submitAnswer, clearRoomTimer,
}
