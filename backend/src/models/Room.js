const mongoose = require('mongoose')

// Room = a user-hosted, real-time "join by code/link" quiz session (Zoom-style).
// Deliberately NOT the same collection as Contest — Contest is an admin-created,
// scheduled, real-money tournament (entryFee/prizePool/prizeBreakdown). Rooms are
// free, any-user-hosted, and controlled live by the host (start/pause/kick/lock).
// Mixing the two would either corrupt the real-money contest flow or force this
// feature to inherit fields (entryFee, prizePool) that make no sense for it.
const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 500 },

  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },

  maxParticipants: { type: Number, default: 50, min: 2, max: 500 },
  currentParticipants: { type: Number, default: 0 },

  isPublic: { type: Boolean, default: true },
  passwordHash: { type: String, default: null, select: false },

  scheduledAt: { type: Date, default: null }, // null = start-anytime (host-triggered)
  duration: { type: Number, default: 0 }, // minutes, informational only — the real clock is per-question timers

  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  negativeMarking: { type: Boolean, default: false },
  allowLateJoin: { type: Boolean, default: true },
  showLiveLeaderboard: { type: Boolean, default: true },
  autoEnd: { type: Boolean, default: true }, // auto-transition to COMPLETED after the last question

  locked: { type: Boolean, default: false }, // host can lock to stop new joins without cancelling

  status: {
    type: String,
    enum: ['WAITING', 'STARTING', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'WAITING',
  },

  currentQuestionIndex: { type: Number, default: -1 }, // -1 = not started
  // Snapshot of question order/shuffle applied at start time, so a late-joiner
  // or a page refresh mid-contest sees the exact same sequence everyone else does.
  questionOrder: [{ type: Number }], // indices into quiz.questions

  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true })

roomSchema.index({ host: 1, createdAt: -1 })
roomSchema.index({ status: 1 })

module.exports = mongoose.model('Room', roomSchema)
