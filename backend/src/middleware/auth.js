const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password -refreshTokens')
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' })
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account suspended: ${user.banReason || 'Policy violation'}` })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const adminOnly = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' })
  }
  next()
}

const moderatorOrAdmin = (req, res, next) => {
  if (!['moderator', 'admin', 'super_admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' })
  }
  next()
}

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password -refreshTokens')
      if (user?.isActive && !user?.isBanned) req.user = user
    }
  } catch (_) {}
  next()
}

module.exports = { protect, adminOnly, superAdminOnly, moderatorOrAdmin, optionalAuth }
