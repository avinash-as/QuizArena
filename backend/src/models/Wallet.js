const mongoose = require('mongoose')

// Pure virtual-currency wallet. No real-money deposit or withdrawal —
// coins here can never be redeemed, transferred, or cashed out for real
// value, which is what keeps QuizPitara an "Online Social Game" rather than
// an "Online Money Game" under India's Promotion and Regulation of Online
// Gaming Act, 2025. Do not reintroduce a deposit/withdrawal balance without
// legal review.
const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  winningBalance: { type: Number, default: 0 },   // Coins won from contests
  bonusBalance: { type: Number, default: 100 },   // Signup/daily/streak bonus coins
  totalWon: { type: Number, default: 0 },         // Lifetime coins won (stats only)
}, { timestamps: true })

walletSchema.virtual('totalBalance').get(function () {
  return this.winningBalance + this.bonusBalance
})

walletSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Wallet', walletSchema)
