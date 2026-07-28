const mongoose = require('mongoose')

const prizeRankSchema = new mongoose.Schema({
  rankFrom: { type: Number, required: true },
  rankTo: { type: Number, required: true },
  label: { type: String, required: true },
  percentage: { type: Number, required: true }, // % of prize pool
}, { _id: false })

const prizeTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Top 3", "Top 10"
  description: { type: String, default: '' },
  ranks: [prizeRankSchema],
  platformFeePercent: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('PrizeTemplate', prizeTemplateSchema)
