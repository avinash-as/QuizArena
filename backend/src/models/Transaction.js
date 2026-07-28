const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  category: {
    type: String,
    enum: ['signup_bonus', 'daily_bonus', 'contest_entry', 'contest_prize', 'admin_credit', 'achievement_bonus', 'streak_bonus', 'referral_bonus'],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId },
  referenceModel: { type: String, enum: ['Contest', 'Achievement'] },
  // Legacy idempotency key field — no longer populated (real-money payments
  // removed). Left in place in case a future Google Play Billing purchase
  // flow for cosmetic/coin packs needs the same "insert wins the race"
  // idempotency pattern.
  gatewayPaymentId: { type: String, unique: true, sparse: true },
}, { timestamps: true })

transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ category: 1 })
transactionSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Transaction', transactionSchema)
