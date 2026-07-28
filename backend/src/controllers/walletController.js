const Transaction = require('../models/Transaction')
const Wallet = require('../models/Wallet')
const User = require('../models/User')
const { claimDailyBonus } = require('../services/walletService')

// GET /wallet
exports.getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id })
    if (!wallet) wallet = await Wallet.create({ user: req.user._id })

    const user = await User.findById(req.user._id).select('streak lastLoginBonusDate coins')
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyAvailable = !user.lastLoginBonusDate || user.lastLoginBonusDate < today

    res.json({
      success: true,
      wallet: {
        winningBalance: wallet.winningBalance,
        bonusBalance: wallet.bonusBalance,
        totalBalance: wallet.totalBalance,
        // Legacy
        coins: user.coins,
      },
      streak: user.streak,
      dailyAvailable,
      transactions,
    })
  } catch (err) { next(err) }
}

// POST /wallet/daily-bonus
exports.claimDailyBonus = async (req, res, next) => {
  try {
    // claimDailyBonus (walletService) already atomically credits both
    // User.coins and Wallet.bonusBalance — do NOT credit the wallet again
    // here, that was double-crediting every claim.
    const result = await claimDailyBonus(req.user._id)
    if (!result.claimed) {
      return res.status(400).json({ success: false, message: 'Daily bonus already claimed today' })
    }

    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

// GET /wallet/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query
    const filter = { user: req.user._id }
    if (category) filter.category = category

    const total = await Transaction.countDocuments(filter)
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, transactions, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}
