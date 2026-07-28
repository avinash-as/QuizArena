// const mongoose = require('mongoose')
// const bcrypt = require('bcryptjs')
// const crypto = require('crypto')

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true, minlength: 6, select: false },
//   avatar: { type: String, default: '' },
//   bio: { type: String, maxlength: 200, default: '' },
//   role: { type: String, enum: ['user', 'moderator', 'admin', 'super_admin'], default: 'user' },

//   // Stats
//   totalQuizzesPlayed: { type: Number, default: 0 },
//   totalContestsJoined: { type: Number, default: 0 },
//   totalWins: { type: Number, default: 0 },
//   totalScore: { type: Number, default: 0 },
//   totalCorrect: { type: Number, default: 0 },
//   totalQuestions: { type: Number, default: 0 },

//   // Engagement
//   streak: { type: Number, default: 0 },
//   lastLoginDate: { type: Date },
//   lastLoginBonusDate: { type: Date },
//   xp: { type: Number, default: 0 },
//   level: { type: Number, default: 1 },

//   // Legacy coins (kept for backward compat, wallet model is source of truth)
//   coins: { type: Number, default: 100 },

//   // Achievements
//   achievements: [{ type: String }],

//   // Referral
//   referralCode: { type: String, unique: true, sparse: true },
//   referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

//   // Password reset
//   resetPasswordToken: { type: String, select: false },
//   resetPasswordExpires: { type: Date, select: false },

//   // Refresh tokens
//   refreshTokens: { type: [String], select: false },

//   // Security
//   suspiciousActivityScore: { type: Number, default: 0 },
//   isBanned: { type: Boolean, default: false },
//   banReason: { type: String },

//   isActive: { type: Boolean, default: true },
// }, { timestamps: true })

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()
//   this.password = await bcrypt.hash(this.password, 12)
//   next()
// })

// // Generate unique referral code on creation
// userSchema.pre('save', async function (next) {
//   if (this.isNew && !this.referralCode) {
//     const code = crypto.randomBytes(4).toString('hex').toUpperCase()
//     this.referralCode = code
//   }
//   next()
// })

// userSchema.methods.comparePassword = async function (candidate) {
//   return bcrypt.compare(candidate, this.password)
// }

// userSchema.virtual('accuracy').get(function () {
//   if (!this.totalQuestions) return 0
//   return Math.round((this.totalCorrect / this.totalQuestions) * 100)
// })

// userSchema.methods.syncLevel = function () {
//   this.level = Math.floor(this.xp / 500) + 1
// }

// userSchema.set('toJSON', { virtuals: true })
// userSchema.index({ email: 1 })
// userSchema.index({ referralCode: 1 })
// userSchema.index({ role: 1 })

// module.exports = mongoose.model('User', userSchema)




const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  role: { type: String, enum: ['user', 'moderator', 'admin', 'super_admin'], default: 'user' },

  // Stats
  totalQuizzesPlayed: { type: Number, default: 0 },
  totalContestsJoined: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },

  // Engagement
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  lastLoginBonusDate: { type: Date },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  // Legacy coins (kept for backward compat, wallet model is source of truth)
  coins: { type: Number, default: 100 },

  // Achievements
  achievements: [{ type: String }],

  // Referral
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Password reset
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },

  // Refresh tokens
  refreshTokens: { type: [String], select: false },

  // Security
  suspiciousActivityScore: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },

  isActive: { type: Boolean, default: true },

  // Email verification — account is inert (can't log in) until this is true.
  // Token is stored hashed (same pattern as resetPasswordToken below) so a
  // leaked database dump can't be used to verify/hijack accounts directly.
  isEmailVerified:           { type: Boolean, default: false },
  emailVerificationToken:    { type: String, select: false },
  emailVerificationExpires:  { type: Date, select: false },
  lastVerificationEmailSentAt: { type: Date, select: false }, // resend rate-limit
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Generate unique referral code on creation
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    this.referralCode = code
  }
  next()
})

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.virtual('accuracy').get(function () {
  if (!this.totalQuestions) return 0
  return Math.round((this.totalCorrect / this.totalQuestions) * 100)
})

userSchema.methods.syncLevel = function () {
  this.level = Math.floor(this.xp / 500) + 1
}

userSchema.set('toJSON', { virtuals: true })
userSchema.index({ email: 1 })
userSchema.index({ referralCode: 1 })
userSchema.index({ role: 1 })

module.exports = mongoose.model('User', userSchema)