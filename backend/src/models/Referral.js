const mongoose = require('mongoose')

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'REWARDED'],
    default: 'PENDING',
  },
  rewardedAt: { type: Date },
  referrerBonus: { type: Number, default: 0 },
  refereeBonus: { type: Number, default: 0 },
}, { timestamps: true })

referralSchema.index({ referrer: 1 })
referralSchema.index({ referee: 1 }, { unique: true })
referralSchema.index({ referralCode: 1 })

module.exports = mongoose.model('Referral', referralSchema)
