// // const express = require('express')
// // const router = express.Router()
// // const ctrl = require('../controllers/authController')
// // const { protect } = require('../middleware/auth')

// // router.post('/register',        ctrl.register)
// // router.post('/login',           ctrl.login)
// // router.get('/me',               protect, ctrl.getMe)
// // router.put('/profile',          protect, ctrl.updateProfile)
// // router.post('/forgot-password', ctrl.forgotPassword)
// // router.post('/reset-password/:token', ctrl.resetPassword)
// // router.get('/referral-info',    protect, ctrl.getReferralInfo)

// // module.exports = router



// const express = require('express')
// const router = express.Router()
// const ctrl = require('../controllers/authController')
// const { protect } = require('../middleware/auth')
// const { validate } = require('../middleware/errorHandler')
// const {
//   registerValidators, loginValidators, forgotPasswordValidators,
//   resetPasswordValidators, updateProfileValidators,
// } = require('../middleware/validators')

// router.post('/register',        registerValidators, validate, ctrl.register)
// router.post('/login',           loginValidators, validate, ctrl.login)
// router.get('/me',               protect, ctrl.getMe)
// router.put('/profile',          protect, updateProfileValidators, validate, ctrl.updateProfile)
// router.post('/forgot-password', forgotPasswordValidators, validate, ctrl.forgotPassword)
// router.post('/reset-password/:token', resetPasswordValidators, validate, ctrl.resetPassword)
// router.get('/referral-info',    protect, ctrl.getReferralInfo)

// module.exports = router



const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')
const {
  registerValidators, loginValidators, forgotPasswordValidators,
  resetPasswordValidators, updateProfileValidators,
  resendVerificationValidators, verifyEmailTokenValidator,
} = require('../middleware/validators')

router.post('/register',        registerValidators, validate, ctrl.register)
router.post('/login',           loginValidators, validate, ctrl.login)
router.get('/me',               protect, ctrl.getMe)
router.put('/profile',          protect, updateProfileValidators, validate, ctrl.updateProfile)
router.post('/forgot-password', forgotPasswordValidators, validate, ctrl.forgotPassword)
router.post('/reset-password/:token', resetPasswordValidators, validate, ctrl.resetPassword)
router.post('/verify-email/:token',   verifyEmailTokenValidator, validate, ctrl.verifyEmail)
router.post('/resend-verification',   resendVerificationValidators, validate, ctrl.resendVerification)
router.get('/referral-info',    protect, ctrl.getReferralInfo)

module.exports = router