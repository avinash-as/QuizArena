const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. 'USER_BANNED', 'PRIZE_DISTRIBUTED'
  target: { type: String }, // collection:id
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true })

auditLogSchema.index({ actor: 1, createdAt: -1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
