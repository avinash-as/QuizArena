const mongoose = require('mongoose')

const contestParticipantSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  rank: { type: Number },
  joinedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  entryFeePaid: { type: Number, default: 0 },
  prizeWon: { type: Number, default: 0 },
  prizeDistributed: { type: Boolean, default: false },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
}, { timestamps: true })

contestParticipantSchema.index({ contest: 1, user: 1 }, { unique: true })
contestParticipantSchema.index({ contest: 1, score: -1, timeTaken: 1 })
contestParticipantSchema.index({ user: 1, joinedAt: -1 })

module.exports = mongoose.model('ContestParticipant', contestParticipantSchema)
