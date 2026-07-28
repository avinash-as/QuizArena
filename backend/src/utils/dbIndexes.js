/**
 * Ensure all MongoDB indexes are created at startup.
 * Run once on startup: require('./utils/dbIndexes')()
 */
const User = require('../models/User')
const Contest = require('../models/Contest')
const Quiz = require('../models/Quiz')
const Leaderboard = require('../models/Leaderboard')
const Transaction = require('../models/Transaction')
const QuizAttempt = require('../models/QuizAttempt')
const ContestParticipant = require('../models/ContestParticipant')
const Question = require('../models/Question')
const Wallet = require('../models/Wallet')
const FraudDetection = require('../models/FraudDetection')
const AuditLog = require('../models/AuditLog')
const Notification = require('../models/Notification')

const ensureIndexes = async () => {
  try {
    await Promise.all([
      User.syncIndexes(),
      Contest.syncIndexes(),
      Leaderboard.syncIndexes(),
      Transaction.syncIndexes(),
      QuizAttempt.syncIndexes(),
      ContestParticipant.syncIndexes(),
      Question.syncIndexes(),
      Wallet.syncIndexes(),
      FraudDetection.syncIndexes(),
      AuditLog.syncIndexes(),
      Notification.syncIndexes(),
    ])
    console.log('[DB] Indexes synced ✓')
  } catch (e) {
    console.error('[DB] Index sync error:', e.message)
  }
}

module.exports = ensureIndexes
