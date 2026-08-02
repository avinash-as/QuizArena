const mongoose = require('mongoose')

const prizeBreakdownSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  label: { type: String, required: true },
  coins: { type: Number, required: true },
  percentage: { type: Number },
}, { _id: false })

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  entryFee: { type: Number, required: true, min: 0, default: 0 },
  prizePool: { type: Number, required: true, default: 0 },
  platformFeePercent: { type: Number, default: 10 },
  prizeBreakdown: [prizeBreakdownSchema],
  prizeTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'PrizeTemplate' },
  maxParticipants: { type: Number, required: true, default: 100 },
  currentParticipants: { type: Number, default: 0 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // auto-created on contest creation — see createContest
  targetQuestionCount: { type: Number, default: 5, min: 1, max: 100 }, // how many questions the admin plans to add; shown as a progress target in "Manage Questions", not a hard enforcement
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  },
  rules: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isFeatured: { type: Boolean, default: false },
  bannerColor: { type: String, default: 'from-violet-600 to-indigo-600' },
  prizesDistributed: { type: Boolean, default: false },
}, { timestamps: true })

contestSchema.methods.syncStatus = function () {
  const now = new Date()
  if (this.status === 'DRAFT' || this.status === 'CANCELLED') return
  if (now < this.startTime) this.status = 'UPCOMING'
  else if (now >= this.startTime && now <= this.endTime) this.status = 'LIVE'
  else if (now > this.endTime) this.status = 'COMPLETED'
}

contestSchema.index({ status: 1, startTime: 1 })
contestSchema.index({ category: 1 })
contestSchema.index({ isFeatured: 1 })

module.exports = mongoose.model('Contest', contestSchema)
