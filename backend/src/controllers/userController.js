const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')
const { UserAchievement } = require('../models/Achievement')
const Notification = require('../models/Notification')

// GET /users/:id — public profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const achievements = await UserAchievement.find({ user: user._id }).populate('achievement')
    const recentContests = await Leaderboard.find({ user: user._id, period: 'contest' })
      .populate('contest', 'title category status')
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({ success: true, user, achievements, recentContests })
  } catch (err) {
    next(err)
  }
}

// GET /users/me/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const achievements = await UserAchievement.find({ user: user._id }).populate('achievement').limit(6)
    const recentActivity = await Leaderboard.find({ user: user._id, period: 'contest' })
      .populate('contest', 'title category')
      .sort({ createdAt: -1 })
      .limit(5)

    // Global rank
    const betterCount = await Leaderboard.countDocuments({ period: 'alltime', periodKey: 'all', score: { $gt: user.totalScore } })
    const globalRank = betterCount + 1

    res.json({
      success: true,
      stats: {
        totalQuizzesPlayed: user.totalQuizzesPlayed,
        totalContestsJoined: user.totalContestsJoined,
        totalWins: user.totalWins,
        accuracy: user.accuracy,
        coins: user.coins,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        globalRank,
      },
      achievements,
      recentActivity,
    })
  } catch (err) {
    next(err)
  }
}

// GET /users/me/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)

    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })

    res.json({ success: true, notifications })
  } catch (err) {
    next(err)
  }
}

// GET /users/me/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false })
    res.json({ success: true, count })
  } catch (err) {
    next(err)
  }
}

// Admin: GET /admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const filter = {}
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// Admin: PUT /admin/users/:id
exports.adminUpdateUser = async (req, res, next) => {
  try {
    const { role, isActive, coins } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, coins },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

// Admin: GET /admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalContests, activeContests] = await Promise.all([
      User.countDocuments(),
      require('../models/Contest').countDocuments(),
      require('../models/Contest').countDocuments({ status: 'live' }),
    ])

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt')

    res.json({
      success: true,
      analytics: { totalUsers, totalContests, activeContests, recentUsers },
    })
  } catch (err) {
    next(err)
  }
}

// GET /users/me/kyc-status — wallet + referral overview (KYC removed: no real-money
// cashout means no payout identity verification is needed)
exports.getAccountStatus = async (req, res, next) => {
  try {
    const Wallet = require('../models/Wallet')
    const Referral = require('../models/Referral')

    const [wallet, referralCount] = await Promise.all([
      Wallet.findOne({ user: req.user._id }),
      Referral.countDocuments({ referrer: req.user._id }),
    ])

    res.json({
      success: true,
      wallet: wallet ? {
        winningBalance: wallet.winningBalance,
        bonusBalance: wallet.bonusBalance,
        totalBalance: wallet.totalBalance,
      } : null,
      referralCode: req.user.referralCode,
      referralCount,
    })
  } catch (err) { next(err) }
}
