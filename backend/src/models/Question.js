const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
 category: { type: String, required: true, trim: true },
  subCategory: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String }],
  imageUrl: { type: String, default: '' },
  points: { type: Number, default: 10 },
  negativeMarks: { type: Number, default: 0, min: 0 }, // deducted from score on a wrong answer
  timeLimit: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  usedInQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timesUsed: { type: Number, default: 0 },
  correctRate: { type: Number, default: 0 }, // % users who got it right
}, { timestamps: true })

questionSchema.index({ category: 1, difficulty: 1, isActive: 1 })
questionSchema.index({ tags: 1 })

module.exports = mongoose.model('Question', questionSchema)