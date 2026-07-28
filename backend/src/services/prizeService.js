// const Contest            = require('../models/Contest')
// const ContestParticipant = require('../models/ContestParticipant')
// const Wallet             = require('../models/Wallet')
// const Transaction        = require('../models/Transaction')
// const Notification       = require('../models/Notification')
// const User               = require('../models/User')
// const AuditLog           = require('../models/AuditLog')

// const distributePrizes = async (contestId, adminId = null) => {
//   const contest = await Contest.findById(contestId)
//   if (!contest) throw new Error('Contest not found')
//   if (!['COMPLETED', 'completed'].includes(contest.status)) {
//     throw new Error('Contest must be completed before distributing prizes')
//   }

//   // Atomically claim the right to distribute prizes for this contest. The
//   // filter requires prizesDistributed to not already be true, and the update
//   // sets it true in the same operation — so if this function is somehow
//   // called twice concurrently (double-click on the admin button, a retried
//   // request, the scheduler and an admin racing each other), only one call can
//   // ever win this document, and the loser bails out immediately, before
//   // paying anyone. This is what actually prevents double payout — the old
//   // "check contest.prizesDistributed, then set it later" pattern did not.
//   const claimed = await Contest.findOneAndUpdate(
//     { _id: contestId, status: { $in: ['COMPLETED', 'completed'] }, prizesDistributed: { $ne: true } },
//     { $set: { prizesDistributed: true } },
//     { new: true }
//   )
//   if (!claimed) {
//     throw new Error('Prizes already distributed for this contest')
//   }

//   const participants = await ContestParticipant.find({ contest: contestId })
//     .sort({ score: -1, timeTaken: 1, joinedAt: 1 })

//   // Assign ranks
//   for (let i = 0; i < participants.length; i++) {
//     participants[i].rank = i + 1
//     await participants[i].save()
//   }

//   const { prizeBreakdown = [], prizePool = 0, platformFeePercent = 10 } = contest
//   const netPrizePool = prizePool * (1 - platformFeePercent / 100)
//   const winners = []

//   for (const prize of prizeBreakdown) {
//     const participant = participants[prize.rank - 1]
//     if (!participant) continue

//     // Support BOTH coins field AND percentage field
//     let prizeAmount = 0
//     if (prize.percentage && prize.percentage > 0) {
//       prizeAmount = Math.round((prize.percentage / 100) * netPrizePool)
//     } else if (prize.coins && prize.coins > 0) {
//       prizeAmount = prize.coins
//     }
//     if (prizeAmount <= 0) continue

//     // Atomic $inc — no read-modify-write, so per-participant credits can never
//     // be lost even if this ever runs concurrently with another wallet update
//     // for the same user (e.g. a deposit landing at the same moment).
//     const wallet = await Wallet.findOneAndUpdate(
//       { user: participant.user },
//       { $inc: { winningBalance: prizeAmount, totalWon: prizeAmount } },
//       { upsert: true, new: true }
//     )

//     await Transaction.create({
//       user:           participant.user,
//       type:           'credit',
//       category:       'contest_prize',
//       amount:         prizeAmount,
//       balanceBefore:  wallet.winningBalance - prizeAmount,
//       balanceAfter:   wallet.winningBalance,
//       description:    `${prize.label} prize: ${contest.title}`,
//       reference:      contest._id,
//       referenceModel: 'Contest',
//     })

//     await User.findByIdAndUpdate(participant.user, {
//       $inc: { coins: prizeAmount, totalWins: prize.rank === 1 ? 1 : 0 }
//     })

//     await Notification.create({
//       user:    participant.user,
//       title:   '🏆 You Won a Prize!',
//       message: `You finished ${prize.label} in "${contest.title}" and earned ₹${prizeAmount}!`,
//       type:    'wallet',
//       link:    `/contests/${contest._id}`,
//     })

//     participant.prizeWon        = prizeAmount
//     participant.prizeDistributed = true
//     await participant.save()

//     winners.push({ userId: participant.user, rank: prize.rank, prizeAmount })
//   }

//   await AuditLog.create({
//     actor:   adminId,
//     action:  'PRIZE_DISTRIBUTED',
//     target:  `contest:${contestId}`,
//     details: { winners: winners.length, totalDistributed: winners.reduce((s, w) => s + w.prizeAmount, 0) },
//   }).catch(() => {})

//   return { distributed: winners.length, winners }
// }

// module.exports = { distributePrizes }





const Contest            = require('../models/Contest')
const ContestParticipant = require('../models/ContestParticipant')
const Wallet             = require('../models/Wallet')
const Transaction        = require('../models/Transaction')
const Notification       = require('../models/Notification')
const User               = require('../models/User')
const AuditLog           = require('../models/AuditLog')

const distributePrizes = async (contestId, adminId = null) => {
  const contest = await Contest.findById(contestId)
  if (!contest) throw new Error('Contest not found')
  if (!['COMPLETED', 'completed'].includes(contest.status)) {
    throw new Error('Contest must be completed before distributing prizes')
  }

  // Atomically claim the right to distribute prizes for this contest. The
  // filter requires prizesDistributed to not already be true, and the update
  // sets it true in the same operation — so if this function is somehow
  // called twice concurrently (double-click on the admin button, a retried
  // request, the scheduler and an admin racing each other), only one call can
  // ever win this document, and the loser bails out immediately, before
  // paying anyone. This is what actually prevents double payout — the old
  // "check contest.prizesDistributed, then set it later" pattern did not.
  const claimed = await Contest.findOneAndUpdate(
    { _id: contestId, status: { $in: ['COMPLETED', 'completed'] }, prizesDistributed: { $ne: true } },
    { $set: { prizesDistributed: true } },
    { new: true }
  )
  if (!claimed) {
    throw new Error('Prizes already distributed for this contest')
  }

  const participants = await ContestParticipant.find({ contest: contestId })
    .sort({ score: -1, timeTaken: 1, joinedAt: 1 })

  // Assign ranks in-memory (participants is already sorted above), then
  // persist all of them in one round-trip instead of one .save() per
  // participant — at real Dream11-scale participant counts, sequential
  // saves here would turn prize distribution into thousands of blocking
  // DB writes for a single contest.
  participants.forEach((p, i) => { p.rank = i + 1 })
  if (participants.length > 0) {
    await ContestParticipant.bulkWrite(
      participants.map(p => ({
        updateOne: { filter: { _id: p._id }, update: { $set: { rank: p.rank } } },
      }))
    )
  }

  const { prizeBreakdown = [], prizePool = 0, platformFeePercent = 10 } = contest
  const netPrizePool = prizePool * (1 - platformFeePercent / 100)
  const winners = []

  for (const prize of prizeBreakdown) {
    const participant = participants[prize.rank - 1]
    if (!participant) continue

    // Support BOTH coins field AND percentage field
    let prizeAmount = 0
    if (prize.percentage && prize.percentage > 0) {
      prizeAmount = Math.round((prize.percentage / 100) * netPrizePool)
    } else if (prize.coins && prize.coins > 0) {
      prizeAmount = prize.coins
    }
    if (prizeAmount <= 0) continue

    // Atomic $inc — no read-modify-write, so per-participant credits can never
    // be lost even if this ever runs concurrently with another wallet update
    // for the same user (e.g. a deposit landing at the same moment).
    const wallet = await Wallet.findOneAndUpdate(
      { user: participant.user },
      { $inc: { winningBalance: prizeAmount, totalWon: prizeAmount } },
      { upsert: true, new: true }
    )

    await Transaction.create({
      user:           participant.user,
      type:           'credit',
      category:       'contest_prize',
      amount:         prizeAmount,
      balanceBefore:  wallet.winningBalance - prizeAmount,
      balanceAfter:   wallet.winningBalance,
      description:    `${prize.label} prize: ${contest.title}`,
      reference:      contest._id,
      referenceModel: 'Contest',
    })

    await User.findByIdAndUpdate(participant.user, {
      $inc: { coins: prizeAmount, totalWins: prize.rank === 1 ? 1 : 0 }
    })

    await Notification.create({
      user:    participant.user,
      title:   '🏆 You Won a Prize!',
      message: `You finished ${prize.label} in "${contest.title}" and earned ₹${prizeAmount}!`,
      type:    'wallet',
      link:    `/contests/${contest._id}`,
    })

    participant.prizeWon        = prizeAmount
    participant.prizeDistributed = true
    await participant.save()

    winners.push({ userId: participant.user, rank: prize.rank, prizeAmount })
  }

  await AuditLog.create({
    actor:   adminId,
    action:  'PRIZE_DISTRIBUTED',
    target:  `contest:${contestId}`,
    details: { winners: winners.length, totalDistributed: winners.reduce((s, w) => s + w.prizeAmount, 0) },
  }).catch(() => {})

  return { distributed: winners.length, winners }
}

module.exports = { distributePrizes }