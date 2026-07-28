const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['contest', 'achievement', 'wallet', 'system', 'result'],
    default: 'system',
  },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // optional deep link
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
