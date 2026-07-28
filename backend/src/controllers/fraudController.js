const FraudDetection = require('../models/FraudDetection')
const User = require('../models/User')
const Notification = require('../models/Notification')

// Admin: GET /admin/fraud
exports.getFraudCases = async (req, res, next) => {
  try {
    const { action, type, page = 1, limit = 20 } = req.query
    const filter = {}
    if (action) filter.action = action
    if (type) filter.type = type

    const total = await FraudDetection.countDocuments(filter)
    const cases = await FraudDetection.find(filter)
      .populate('user', 'name email avatar suspiciousActivityScore')
      .populate('contest', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, cases, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}

// Admin: PUT /admin/fraud/:id
exports.resolveFraudCase = async (req, res, next) => {
  try {
    const { action, banUser, banReason } = req.body
    const fraudCase = await FraudDetection.findByIdAndUpdate(
      req.params.id,
      { action, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    ).populate('user', 'name email')

    if (!fraudCase) return res.status(404).json({ success: false, message: 'Case not found' })

    if (banUser) {
      await User.findByIdAndUpdate(fraudCase.user._id, {
        isBanned: true,
        banReason: banReason || 'Fraud detection violation',
      })

      await Notification.create({
        user: fraudCase.user._id,
        title: '🚫 Account Suspended',
        message: `Your account has been suspended. Reason: ${banReason || 'Policy violation'}`,
        type: 'system',
      })
    }

    res.json({ success: true, fraudCase })
  } catch (err) { next(err) }
}

// Admin: GET /admin/fraud/stats
exports.getFraudStats = async (req, res, next) => {
  try {
    const stats = await FraudDetection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avgRisk: { $avg: '$riskScore' } } },
    ])
    const highRisk = await FraudDetection.countDocuments({ riskScore: { $gte: 70 } })
    const unresolved = await FraudDetection.countDocuments({ action: 'FLAGGED' })
    res.json({ success: true, stats, highRisk, unresolved })
  } catch (err) { next(err) }
}
