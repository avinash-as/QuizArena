const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  chosenIndex: { type: Number }, // null/undefined = skipped
  correct: { type: Boolean, default: false },
  timeTakenMs: { type: Number, default: 0 },
}, { _id: false })

const roomParticipantSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  isReady: { type: Boolean, default: false },
  kicked: { type: Boolean, default: false },
  kickedAt: { type: Date },

  // Answers keyed by question so a duplicate submit (double-click, two tabs)
  // for the same question is rejected rather than overwriting the score —
  // same duplicate-submission concern flagged in the Contest wallet/prize work.
  answers: [answerSchema],

  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  timeTakenMs: { type: Number, default: 0 }, // sum across answered questions
  accuracy: { type: Number, default: 0 },
  rank: { type: Number },

  joinedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }, // set when the room ends for this participant
}, { timestamps: true })

roomParticipantSchema.index({ room: 1, user: 1 }, { unique: true })
roomParticipantSchema.index({ room: 1, score: -1, timeTakenMs: 1 })
roomParticipantSchema.index({ user: 1, joinedAt: -1 })

module.exports = mongoose.model('RoomParticipant', roomParticipantSchema)
