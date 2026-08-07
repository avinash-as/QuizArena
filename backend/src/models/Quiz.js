const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
  negativeMarks: { type: Number, default: 0, min: 0 }, // deducted from score on a wrong answer
  timeLimit: { type: Number, default: 30 }, // seconds per question
  // If this question was imported from the reusable Question Bank, tracks
  // which bank entry it came from — used to prevent adding the same bank
  // question into a quiz twice.
  sourceQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
}, { _id: true })

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
 category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  questions: [questionSchema],
  totalQuestions: { type: Number, default: 0 },
  timeLimit: { type: Number, default: 600 }, // total quiz time in seconds
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  playCount: { type: Number, default: 0 },
}, { timestamps: true })

// Sync totalQuestions before save
quizSchema.pre('save', function (next) {
  this.totalQuestions = this.questions.length
  next()
})

module.exports = mongoose.model('Quiz', quizSchema)