const Notification = require('../models/Notification')

// GET /notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false })

    res.json({ success: true, notifications, unreadCount })
  } catch (err) {
    next(err)
  }
}

// PUT /notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}

// PUT /notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
