const mongoose = require('mongoose')

const leaderboardEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  score: { type: Number, required: true, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // seconds
  accuracy: { type: Number, default: 0 },
  rank: { type: Number },
  period: { type: String, enum: ['contest', 'daily', 'weekly', 'monthly', 'alltime'], default: 'contest' },
  periodKey: { type: String }, // e.g. "2024-W10" for weekly, "2024-03" for monthly
  prizeAwarded: { type: Boolean, default: false },
  prizeCoins: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true })

leaderboardEntrySchema.index({ contest: 1, score: -1 })
leaderboardEntrySchema.index({ period: 1, periodKey: 1, score: -1 })
leaderboardEntrySchema.index({ user: 1, period: 1 })

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema)
