const User        = require('../models/User')
const Wallet       = require('../models/Wallet')
const Transaction  = require('../models/Transaction')

const BONUS_CATEGORIES = ['signup_bonus', 'daily_bonus', 'streak_bonus', 'referral_bonus', 'achievement_bonus', 'admin_credit']

/**
 * Credit coins to a user — atomic $inc on both User.coins and the relevant
 * Wallet balance field. No read-modify-write, so concurrent credits can never
 * silently overwrite each other (the "lost update" problem).
 */
const creditCoins = async (userId, amount, category, description, referenceId = null, referenceModel = null) => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid credit amount')

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { coins: amount } },
    { new: true }
  )
  if (!updatedUser) throw new Error('User not found')

  if (BONUS_CATEGORIES.includes(category)) {
    await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { bonusBalance: amount } },
      { upsert: true }
    )
  } else if (category === 'contest_prize') {
    await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { winningBalance: amount, totalWon: amount } },
      { upsert: true }
    )
  }

  const transaction = await Transaction.create({
    user:           userId,
    type:           'credit',
    category,
    amount,
    balanceBefore:  updatedUser.coins - amount,
    balanceAfter:   updatedUser.coins,
    description,
    reference:      referenceId,
    referenceModel,
  })

  return { user: updatedUser, transaction }
}

/**
 * Debit coins from the legacy User.coins balance. Atomic: the filter itself
 * requires coins >= amount, so the update simply fails (returns null) under
 * insufficient balance instead of ever going negative — no separate
 * check-then-write race window.
 */
const debitCoins = async (userId, amount, category, description, referenceId = null, referenceModel = null) => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid debit amount')

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  )
  if (!updatedUser) {
    const exists = await User.exists({ _id: userId })
    if (!exists) throw new Error('User not found')
    throw new Error('Insufficient coins')
  }

  if (category === 'contest_entry') {
    // Mirror the debit into the Wallet model too (bonus first, then winning),
    // clamped at 0 so it never goes negative even if Wallet and User.coins
    // have drifted out of sync from older data.
    await Wallet.findOneAndUpdate(
      { user: userId },
      [
        { $set: { _fromBonus: { $min: [{ $ifNull: ['$bonusBalance', 0] }, amount] } } },
        {
          $set: {
            bonusBalance:   { $max: [0, { $subtract: [{ $ifNull: ['$bonusBalance', 0] }, '$_fromBonus'] }] },
            winningBalance: { $max: [0, { $subtract: [{ $ifNull: ['$winningBalance', 0] }, { $subtract: [amount, '$_fromBonus'] }] }] },
          },
        },
        { $unset: '_fromBonus' },
      ],
      { upsert: true }
    )
  }

  const transaction = await Transaction.create({
    user:           userId,
    type:           'debit',
    category,
    amount,
    balanceBefore:  updatedUser.coins + amount,
    balanceAfter:   updatedUser.coins,
    description,
    reference:      referenceId,
    referenceModel,
  })

  return { user: updatedUser, transaction }
}

/**
 * Atomically debit the Wallet model's bonusBalance + winningBalance combined
 * (bonus spent first, then winnings) — used for contest entry fees when the
 * user has enough in the Wallet model even if User.coins is insufficient.
 * Returns the updated wallet on success, or null if the combined balance was
 * insufficient (caller can then fall back to debitCoins on the legacy field).
 * The $expr guard in the filter and the update both run as a single atomic
 * operation, so two concurrent entries can never both succeed against a
 * balance that only covers one of them.
 */
const debitWalletBalance = async (userId, amount, category, description, referenceId = null, referenceModel = null) => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid debit amount')

  const before = await Wallet.findOne({ user: userId })
  const beforeTotal = before ? before.bonusBalance + before.winningBalance : 0

  const wallet = await Wallet.findOneAndUpdate(
    {
      user: userId,
      $expr: { $gte: [{ $add: [{ $ifNull: ['$bonusBalance', 0] }, { $ifNull: ['$winningBalance', 0] }] }, amount] },
    },
    [
      { $set: { _fromBonus: { $min: ['$bonusBalance', amount] } } },
      {
        $set: {
          bonusBalance:   { $subtract: ['$bonusBalance', '$_fromBonus'] },
          winningBalance: { $subtract: ['$winningBalance', { $subtract: [amount, '$_fromBonus'] }] },
        },
      },
      { $unset: '_fromBonus' },
    ],
    { new: true }
  )

  if (!wallet) return null // insufficient combined balance — caller decides fallback

  await Transaction.create({
    user:           userId,
    type:           'debit',
    category,
    amount,
    balanceBefore:  beforeTotal,
    balanceAfter:   wallet.bonusBalance + wallet.winningBalance,
    description,
    reference:      referenceId,
    referenceModel,
  })

  return wallet
}

/**
 * Claim daily login bonus. The "already claimed today" check and the claim
 * itself happen in one atomic findOneAndUpdate — if two requests land at the
 * same instant, only one can match the filter (lastLoginBonusDate < today),
 * so double-claiming is impossible regardless of timing.
 */
const claimDailyBonus = async (userId) => {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const current = await User.findById(userId)
  if (!current) throw new Error('User not found')

  const newStreak = (current.lastLoginDate && current.lastLoginDate >= yesterday)
    ? (current.streak || 0) + 1
    : 1

  const bonusCoins  = parseInt(process.env.DAILY_BONUS_COINS || '50')
  const streakBonus = Math.min(newStreak - 1, 6) * 10
  const totalBonus  = bonusCoins + streakBonus

  // Atomic guard: only succeeds if nobody has already claimed today for this user.
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { lastLoginBonusDate: { $exists: false } },
        { lastLoginBonusDate: { $lt: today } },
      ],
    },
    {
      $inc: { coins: totalBonus },
      $set: { lastLoginDate: now, lastLoginBonusDate: now, streak: newStreak },
    },
    { new: true }
  )

  if (!updatedUser) {
    const fresh = await User.findById(userId)
    return { claimed: false, coins: 0, balance: fresh ? fresh.coins : 0 }
  }

  await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { bonusBalance: totalBonus } },
    { upsert: true }
  )

  await Transaction.create({
    user:         userId,
    type:         'credit',
    category:     'daily_bonus',
    amount:       totalBonus,
    balanceBefore: updatedUser.coins - totalBonus,
    balanceAfter:  updatedUser.coins,
    description:  `Daily login bonus${streakBonus > 0 ? ` + ${streakBonus} streak bonus (day ${newStreak})` : ''}`,
  })

  return { claimed: true, coins: totalBonus, streak: newStreak, balance: updatedUser.coins }
}

module.exports = { creditCoins, debitCoins, debitWalletBalance, claimDailyBonus }
