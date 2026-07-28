// const express = require('express')
// const router = express.Router()
// const ctrl = require('../controllers/userController')
// const { protect, adminOnly } = require('../middleware/auth')

// // Must be before /:id
// router.get('/me/dashboard',      protect, ctrl.getDashboard)
// router.get('/me/notifications',  protect, ctrl.getNotifications)
// router.get('/me/unread-count',   protect, ctrl.getUnreadCount)

// // Admin routes (must be before /:id)
// router.get('/admin/users',       protect, adminOnly, ctrl.getAllUsers)
// router.put('/admin/users/:id',   protect, adminOnly, ctrl.adminUpdateUser)
// router.get('/admin/analytics',   protect, adminOnly, ctrl.getAnalytics)

// // Public profile
// router.get('/:id', ctrl.getProfile)

// module.exports = router

// router.get('/me/account-status', protect, ctrl.getAccountStatus)



const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/userController')
const { protect, adminOnly } = require('../middleware/auth')

// Notification routes — must be BEFORE /:id
router.put('/me/notifications/read-all', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification')
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false }) }
})

router.put('/me/notifications/:id/read', protect, async (req, res) => {
  try {
    const Notification = require('../models/Notification')
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    )
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false }) }
})

// User routes — must be before /:id
router.get('/me/dashboard',      protect, ctrl.getDashboard)
router.get('/me/notifications',  protect, ctrl.getNotifications)
router.get('/me/unread-count',   protect, ctrl.getUnreadCount)
router.get('/me/account-status', protect, ctrl.getAccountStatus)

// Admin routes — must be before /:id
router.get('/admin/users',       protect, adminOnly, ctrl.getAllUsers)
router.put('/admin/users/:id',   protect, adminOnly, ctrl.adminUpdateUser)
router.get('/admin/analytics',   protect, adminOnly, ctrl.getAnalytics)

// Public profile — must be LAST
router.get('/:id', ctrl.getProfile)

module.exports = router