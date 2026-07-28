// const Leaderboard = require('../models/Leaderboard')

// const getPeriodKey = (period) => {
//   const now = new Date()
//   if (period === 'daily') return now.toISOString().slice(0, 10)
//   if (period === 'weekly') {
//     const week = Math.ceil(now.getDate() / 7)
//     return `${now.getFullYear()}-W${week}`
//   }
//   if (period === 'monthly') {
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
//   }
//   return 'all'
// }

// // GET /leaderboard?period=daily|weekly|monthly|alltime
// exports.getLeaderboard = async (req, res, next) => {
//   try {
//     const period = req.query.period || 'alltime'
//     const limit = Math.min(Number(req.query.limit) || 50, 100)
//     const periodKey = getPeriodKey(period)

//     const entries = await Leaderboard.find({ period, periodKey })
//       .populate('user', 'name avatar level coins streak')
//       .sort({ score: -1, timeTaken: 1 })
//       .limit(limit)

//     const ranked = entries.map((e, i) => ({
//       rank: i + 1,
//       user: e.user,
//       score: e.score,
//       accuracy: e.accuracy,
//       timeTaken: e.timeTaken,
//       correctAnswers: e.correctAnswers,
//     }))

//     // If authenticated, find the current user's rank
//     let myRank = null
//     if (req.user) {
//       const myEntry = entries.findIndex(e => e.user?._id?.toString() === req.user._id.toString())
//       if (myEntry !== -1) myRank = myEntry + 1
//     }

//     res.json({ success: true, leaderboard: ranked, myRank, period, periodKey })
//   } catch (err) {
//     next(err)
//   }
// }






const Leaderboard = require('../models/Leaderboard')

const getPeriodKey = (period) => {
  const now = new Date()
  if (period === 'daily') return now.toISOString().slice(0, 10)
  if (period === 'weekly') {
    const week = Math.ceil(now.getDate() / 7)
    return `${now.getFullYear()}-W${week}`
  }
  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  return 'all'
}

// GET /leaderboard?period=daily|weekly|monthly|alltime
exports.getLeaderboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'alltime'
    const limit = Math.min(Number(req.query.limit) || 50, 100)
    const periodKey = getPeriodKey(period)

    const entries = await Leaderboard.find({ period, periodKey })
      .populate('user', 'name avatar level coins streak')
      .sort({ score: -1, timeTaken: 1 })
      .limit(limit)
      .lean()

    const ranked = entries.map((e, i) => ({
      rank: i + 1,
      user: e.user,
      score: e.score,
      accuracy: e.accuracy,
      timeTaken: e.timeTaken,
      correctAnswers: e.correctAnswers,
    }))

    // If authenticated, find the current user's rank
    let myRank = null
    if (req.user) {
      const myEntry = entries.findIndex(e => e.user?._id?.toString() === req.user._id.toString())
      if (myEntry !== -1) myRank = myEntry + 1
    }

    res.json({ success: true, leaderboard: ranked, myRank, period, periodKey })
  } catch (err) {
    next(err)
  }
}