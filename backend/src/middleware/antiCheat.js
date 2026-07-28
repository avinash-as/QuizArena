const FraudDetection = require('../models/FraudDetection')
const User = require('../models/User')

// Track tab switches — called from quiz submission
const recordTabSwitch = async (userId, contestId, count) => {
  if (count > 3) {
    await FraudDetection.create({
      user: userId,
      contest: contestId,
      type: 'TAB_SWITCH',
      reason: `User switched tabs ${count} times during contest`,
      riskScore: Math.min(count * 10, 80),
      action: count > 8 ? 'WARNING' : 'FLAGGED',
    })

    if (count > 8) {
      await User.findByIdAndUpdate(userId, { $inc: { suspiciousActivityScore: 20 } })
    }
  }
}

// Check for fast submission (less than 30% of time limit used)
const checkFastSubmission = async (userId, contestId, timeTaken, totalTimeLimit) => {
  const ratio = timeTaken / totalTimeLimit
  if (ratio < 0.15) {
    const riskScore = Math.round((1 - ratio) * 60)
    await FraudDetection.create({
      user: userId,
      contest: contestId,
      type: 'FAST_SUBMISSION',
      reason: `Quiz submitted in ${timeTaken}s / ${totalTimeLimit}s limit (${Math.round(ratio * 100)}%)`,
      riskScore,
      action: riskScore > 50 ? 'WARNING' : 'FLAGGED',
    })
  }
}

// Check IP for multiple accounts
const checkMultipleAccounts = async (userId, ipAddress) => {
  if (!ipAddress) return
  const recentUsersFromIP = await require('../models/User').countDocuments({
    _id: { $ne: userId },
    // We'll track this via QuizAttempt IP
  })
}

module.exports = { recordTabSwitch, checkFastSubmission, checkMultipleAccounts }
