const mongoose = require('mongoose')

const quizAttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toHexString(),
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }, // server-calculated deadline
  submittedAt: { type: Date },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  answers: { type: Map, of: Number }, // questionId -> chosenIndex
  ipAddress: { type: String },
  deviceFingerprint: { type: String },
  userAgent: { type: String },
  tabSwitchCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['STARTED', 'SUBMITTED', 'EXPIRED'],
    default: 'STARTED',
  },
}, { timestamps: true })

quizAttemptSchema.index({ user: 1, contest: 1 }, { unique: true, sparse: true })
quizAttemptSchema.index({ status: 1, endTime: 1 })
quizAttemptSchema.index({ contest: 1, score: -1 })

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema)
