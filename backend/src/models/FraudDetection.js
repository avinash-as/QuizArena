const mongoose = require('mongoose')

const fraudDetectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  type: {
    type: String,
    enum: ['MULTIPLE_ACCOUNTS', 'MULTIPLE_LOGINS', 'TAB_SWITCH', 'IP_MISMATCH', 'FAST_SUBMISSION', 'SUSPICIOUS_PATTERN'],
    required: true,
  },
  reason: { type: String, required: true },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  ipAddress: { type: String },
  deviceFingerprint: { type: String },
  action: {
    type: String,
    enum: ['FLAGGED', 'WARNING', 'SUSPENDED', 'DISMISSED'],
    default: 'FLAGGED',
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
}, { timestamps: true })

fraudDetectionSchema.index({ user: 1, createdAt: -1 })
fraudDetectionSchema.index({ action: 1, riskScore: -1 })

module.exports = mongoose.model('FraudDetection', fraudDetectionSchema)
