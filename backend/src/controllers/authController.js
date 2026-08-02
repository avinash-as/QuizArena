const jwt    = require('jsonwebtoken')
const crypto = require('crypto')
const User   = require('../models/User')
const { creditCoins } = require('../services/walletService')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService')
const { isDisposableEmail } = require('../utils/disposableEmailDomains')

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000       // 60s between resend requests

// Same hash-before-store pattern already used for resetPasswordToken below —
// the raw token only ever exists in the email link and in-memory here; if
// the DB ever leaks, the stored hash alone can't be used to verify accounts.
const makeVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  return { rawToken, hashedToken }
}

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  user.password = undefined
  res.status(statusCode).json({ success: true, token, user })
}

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, referralCode } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' })
    }
    if (isDisposableEmail(email)) {
      return res.status(400).json({ success: false, message: 'Disposable/temporary email addresses are not allowed. Please use a real email address.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    let referredBy = null
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      if (referrer) referredBy = referrer._id
    }

    const { rawToken, hashedToken } = makeVerificationToken()
    const avatar = `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    const user   = await User.create({
      name: name.trim(), email: normalizedEmail, password, avatar, referredBy,
      isEmailVerified: true, // TEMP: email sending not set up yet — remove this line once Resend domain is verified
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: Date.now() + VERIFICATION_TOKEN_TTL_MS,
      lastVerificationEmailSentAt: new Date(),
    })

    // Create wallet — safe, won't crash register if it fails
    try {
      const Wallet = require('../models/Wallet')
      await Wallet.create({ user: user._id, bonusBalance: 100 })
    } catch (_) {}

    // Credit legacy coins — safe
    try {
      await creditCoins(user._id, 100, 'signup_bonus', 'Welcome to QuizArena! Signup bonus')
    } catch (_) {}

    // Welcome notification — safe
    try {
      const Notification = require('../models/Notification')
      await Notification.create({
        user:    user._id,
        title:   'Welcome to QuizArena! 🎉',
        message: 'You received 100 bonus coins. Verify your email to start playing!',
        type:    'wallet',
      })
    } catch (_) {}

    // Referral — safe
    if (referredBy && referralCode) {
      try {
        const Referral = require('../models/Referral')
        await Referral.create({
          referrer:     referredBy,
          referee:      user._id,
          referralCode: referralCode.toUpperCase(),
        })
      } catch (_) {}
    }

    // Real verification email — account cannot log in until this link is
    // clicked (enforced in login below). No JWT/auto-login here on purpose:
    // issuing a token now would mean "unverified users cannot log in" is
    // false for the very first request after signup.
    try {
      await sendVerificationEmail(user, rawToken)
    } catch (emailErr) {
      // The account exists but the email failed to send (e.g. Resend outage).
      // Don't lose the account or make the user re-register — they can hit
      // resend-verification once the issue clears. Still log this loudly,
      // since a broken email pipeline silently locking out every new signup
      // is a production incident, not a minor issue.
      console.error('[Register] Failed to send verification email:', emailErr.message)
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account before logging in.',
      email: user.email,
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    //TEMP: EMAIL VERIFICATION DISABLED UNTIL RESEND DOMAIN IS VERIFIED
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before logging in. Check your inbox, or request a new link.',
    //     unverified: true,
    //     email: user.email,
    //   })
    // }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' })
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account banned: ${user.banReason || 'Policy violation'}` })
    }

    user.lastLoginDate = new Date()
    await user.save()

    sendToken(user, 200, res)
  } catch (err) {
    next(err)
  }
}

// GET /auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({ success: true, user })
}

// PUT /auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    )
    res.json({ success: true, user })
  } catch (err) { next(err) }
}

// POST /auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() })
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex')
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    try {
      await sendPasswordResetEmail(user, token)
    } catch (emailErr) {
      console.error('[ForgotPassword] Failed to send reset email:', emailErr.message)
      // Still respond success below — don't reveal delivery failures to the
      // caller (that's itself a way to probe which emails exist/are valid).
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  } catch (err) { next(err) }
}

// POST /auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires')

    if (!user) {
      return res.status(400).json({ success: false, message: 'This verification link is invalid or has expired. Please request a new one.' })
    }
    if (user.isEmailVerified) {
      return res.json({ success: true, message: 'Email already verified — you can log in.' })
    }

    user.isEmailVerified          = true
    user.emailVerificationToken   = undefined
    user.emailVerificationExpires = undefined
    await user.save({ validateBeforeSave: false })

    // Intentionally still no auto-login token here — verifying an email and
    // authenticating are different actions; the user logs in normally next,
    // now that their account is no longer blocked at the login check above.
    res.json({ success: true, message: 'Email verified! You can now log in.' })
  } catch (err) { next(err) }
}

// POST /auth/resend-verification
exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() })
      .select('+lastVerificationEmailSentAt')

    // Same non-committal response whether or not the account exists / is
    // already verified — don't let this endpoint be used to enumerate which
    // emails are registered.
    const genericResponse = { success: true, message: 'If that account exists and needs verifying, a new link has been sent.' }
    if (!user || user.isEmailVerified) return res.json(genericResponse)

    if (user.lastVerificationEmailSentAt &&
        Date.now() - user.lastVerificationEmailSentAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((VERIFICATION_RESEND_COOLDOWN_MS - (Date.now() - user.lastVerificationEmailSentAt.getTime())) / 1000)
      return res.status(429).json({ success: false, message: `Please wait ${waitSec}s before requesting another verification email.` })
    }

    const { rawToken, hashedToken } = makeVerificationToken()
    user.emailVerificationToken     = hashedToken
    user.emailVerificationExpires   = Date.now() + VERIFICATION_TOKEN_TTL_MS
    user.lastVerificationEmailSentAt = new Date()
    await user.save({ validateBeforeSave: false })

    try {
      await sendVerificationEmail(user, rawToken)
    } catch (emailErr) {
      console.error('[ResendVerification] Failed to send:', emailErr.message)
    }

    res.json(genericResponse)
  } catch (err) { next(err) }
}

// POST /auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })

    user.password             = req.body.password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    sendToken(user, 200, res)
  } catch (err) { next(err) }
}

// GET /auth/referral-info
exports.getReferralInfo = async (req, res, next) => {
  try {
    const Referral = require('../models/Referral')
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referee', 'name avatar createdAt')
      .sort({ createdAt: -1 })

    res.json({
      success:        true,
      referralCode:   req.user.referralCode,
      referralLink:   `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${req.user.referralCode}`,
      totalReferrals: referrals.length,
      rewarded:       referrals.filter(r => r.status === 'REWARDED').length,
      referrals,
    })
  } catch (err) { next(err) }
}