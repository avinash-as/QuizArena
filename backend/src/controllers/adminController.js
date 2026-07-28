const User              = require('../models/User')
const Contest           = require('../models/Contest')
const Quiz              = require('../models/Quiz')
const Transaction       = require('../models/Transaction')
const Wallet            = require('../models/Wallet')
const FraudDetection    = require('../models/FraudDetection')
const ContestParticipant= require('../models/ContestParticipant')
const { creditCoins }   = require('../services/walletService')
const Notification      = require('../models/Notification')
const AuditLog          = require('../models/AuditLog')

// GET /admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalContests,
      totalQuizzes,
      totalTransactions,
      liveContests,
      fraudCases,
    ] = await Promise.all([
      User.countDocuments(),
      Contest.countDocuments(),
      Quiz.countDocuments(),
      Transaction.countDocuments(),
      Contest.countDocuments({ status: { $in: ['LIVE', 'live'] } }),
      FraudDetection.countDocuments({ action: 'FLAGGED' }),
    ])

    const recentUsers = await User.find()
      .sort({ createdAt: -1 }).limit(5)
      .select('name email avatar createdAt role')

    const recentContests = await Contest.find()
      .sort({ createdAt: -1 }).limit(5)
      .select('title status startTime entryFee currentParticipants')

    const coinsAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$coins' } } }])
    const totalCoins = coinsAgg[0]?.total || 0

    const revenueAgg = await Transaction.aggregate([
      { $match: { category: 'contest_entry', type: 'debit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalRevenue = revenueAgg[0]?.total || 0

    res.json({
      success: true,
      stats: {
        totalUsers, totalContests, totalQuizzes, totalTransactions,
        liveContests,
        unresolvedFraud: fraudCases,
        totalCoins, totalRevenue,
      },
      recentUsers,
      recentContests,
    })
  } catch (err) { next(err) }
}

// GET /admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, role, isActive } = req.query
    const filter = {}
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
    if (role)     filter.role     = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -refreshTokens -resetPasswordToken')

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}

// PUT /admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, isBanned, banReason } = req.body
    const update = {}
    if (role !== undefined)     update.role     = role
    if (isActive !== undefined) update.isActive  = isActive
    if (isBanned !== undefined) { update.isBanned = isBanned; update.banReason = banReason }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    await AuditLog.create({
      actor:     req.user._id,
      action:    'USER_UPDATED',
      target:    `user:${req.params.id}`,
      details:   update,
      ipAddress: req.ip,
    }).catch(() => {})

    res.json({ success: true, user })
  } catch (err) { next(err) }
}

// POST /admin/users/:id/credit-coins
exports.creditUserCoins = async (req, res, next) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount < 1) return res.status(400).json({ success: false, message: 'Invalid amount' })

    const { user, transaction } = await creditCoins(
      req.params.id, amount, 'admin_credit', reason || 'Admin credit'
    )

    await Notification.create({
      user:    user._id,
      title:   '💰 Coins Added!',
      message: `Admin added ${amount} coins. Reason: ${reason || 'Admin credit'}`,
      type:    'wallet',
    }).catch(() => {})

    res.json({ success: true, user, transaction })
  } catch (err) { next(err) }
}

// POST /admin/broadcast
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'system' } = req.body
    const users = await User.find({ isActive: true }).select('_id')
    const notifications = users.map(u => ({ user: u._id, title, message, type }))
    await Notification.insertMany(notifications)
    res.json({ success: true, message: `Sent to ${users.length} users` })
  } catch (err) { next(err) }
}

// GET /admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [dailySignups, contestStats, revenueByDay] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Contest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalParticipants: { $sum: '$currentParticipants' } } },
      ]),
      Transaction.aggregate([
        { $match: { category: 'contest_entry', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
    ])

    res.json({ success: true, analytics: { dailySignups, contestStats, revenueByDay } })
  } catch (err) { next(err) }
}

// GET /admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query
    const total = await AuditLog.countDocuments()
    const logs  = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}
