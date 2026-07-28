const Referral = require('../models/Referral')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const Notification = require('../models/Notification')

const REFERRER_BONUS = parseInt(process.env.REFERRER_BONUS || '200')
const REFEREE_BONUS = parseInt(process.env.REFEREE_BONUS || '100')

/**
 * Process referral reward after referee completes their first contest.
 */
const processReferralReward = async (refereeId) => {
  const referral = await Referral.findOne({ referee: refereeId, status: 'PENDING' })
  if (!referral) return null

  // Reward referee
  let refereeWallet = await Wallet.findOne({ user: refereeId })
  if (!refereeWallet) refereeWallet = await Wallet.create({ user: refereeId })
  refereeWallet.bonusBalance += REFEREE_BONUS
  await refereeWallet.save()

  await Transaction.create({
    user: refereeId,
    type: 'credit',
    category: 'signup_bonus',
    amount: REFEREE_BONUS,
    balanceBefore: refereeWallet.bonusBalance - REFEREE_BONUS,
    balanceAfter: refereeWallet.bonusBalance,
    description: 'Referral bonus — welcome gift!',
  })

  // Reward referrer
  let referrerWallet = await Wallet.findOne({ user: referral.referrer })
  if (!referrerWallet) referrerWallet = await Wallet.create({ user: referral.referrer })
  referrerWallet.bonusBalance += REFERRER_BONUS
  await referrerWallet.save()

  await Transaction.create({
    user: referral.referrer,
    type: 'credit',
    category: 'signup_bonus',
    amount: REFERRER_BONUS,
    balanceBefore: referrerWallet.bonusBalance - REFERRER_BONUS,
    balanceAfter: referrerWallet.bonusBalance,
    description: `Referral reward — friend joined contest!`,
  })

  await Notification.create({
    user: referral.referrer,
    title: '🎁 Referral Bonus!',
    message: `Your referral joined a contest! You earned ${REFERRER_BONUS} bonus coins.`,
    type: 'wallet',
  })

  referral.status = 'REWARDED'
  referral.rewardedAt = new Date()
  referral.referrerBonus = REFERRER_BONUS
  referral.refereeBonus = REFEREE_BONUS
  await referral.save()

  return referral
}

module.exports = { processReferralReward }
