// const { body, param } = require('express-validator')

// // express-validator was already installed, and `validate` (in errorHandler.js)
// // already turns its results into a structured 400 response — but nothing in
// // the app actually defined any validation chains, so every route accepted
// // whatever shape of JSON was sent. These are deliberately scoped to the
// // endpoints with the most exposure: public auth endpoints (anyone can hit
// // them, no auth required) and the money-bearing contest fields (wrong types/
// // negative values there directly corrupt real-money data).

// const objectId = (field) =>
//   param(field).isMongoId().withMessage(`${field} must be a valid id`)

// exports.registerValidators = [
//   body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
//   body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
//   body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters'),
//   body('referralCode').optional().trim().isAlphanumeric().isLength({ max: 20 }).withMessage('Invalid referral code'),
// ]

// exports.loginValidators = [
//   body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
//   body('password').notEmpty().withMessage('Password is required'),
// ]

// exports.forgotPasswordValidators = [
//   body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
// ]

// exports.resetPasswordValidators = [
//   param('token').isHexadecimal().withMessage('Invalid reset token'),
//   body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters'),
// ]

// exports.updateProfileValidators = [
//   body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
//   body('bio').optional().trim().isLength({ max: 300 }).withMessage('Bio must be under 300 characters'),
//   body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
// ]

// exports.contestIdParamValidator = [objectId('id')]

// exports.createContestValidators = [
//   body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
//   body('quiz').optional().isMongoId().withMessage('quiz must be a valid id'),
//   body('entryFee').isFloat({ min: 0 }).withMessage('Entry fee must be 0 or more'),
//   body('prizePool').isFloat({ min: 0 }).withMessage('Prize pool must be 0 or more'),
//   body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
//   body('startTime').isISO8601().toDate().withMessage('startTime must be a valid date'),
//   body('endTime').isISO8601().toDate().withMessage('endTime must be a valid date')
//     .custom((endTime, { req }) => {
//       if (req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
//         throw new Error('endTime must be after startTime')
//       }
//       return true
//     }),
// ]

// // PUT allows partial updates, so fields are optional here but still type/range-checked when present.
// exports.updateContestValidators = [
//   body('title').optional().trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
//   body('entryFee').optional().isFloat({ min: 0 }).withMessage('Entry fee must be 0 or more'),
//   body('prizePool').optional().isFloat({ min: 0 }).withMessage('Prize pool must be 0 or more'),
//   body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
//   body('startTime').optional().isISO8601().toDate().withMessage('startTime must be a valid date'),
//   body('endTime').optional().isISO8601().toDate().withMessage('endTime must be a valid date'),
// ]

// exports.createQuestionValidators = [
//   body('text').trim().isLength({ min: 3, max: 1000 }).withMessage('Question text must be 3-1000 characters'),
//   body('options').isArray({ min: 2, max: 4 }).withMessage('Options must be an array of 2-4 items'),
//   body('options.*').trim().isLength({ min: 1, max: 300 }).withMessage('Each option must be 1-300 characters'),
//   body('correctIndex').isInt({ min: 0, max: 3 }).withMessage('correctIndex must be between 0 and 3')
//     .custom((correctIndex, { req }) => {
//       if (Array.isArray(req.body.options) && correctIndex >= req.body.options.length) {
//         throw new Error('correctIndex is out of range for the given options')
//       }
//       return true
//     }),
//   body('category').trim().notEmpty().withMessage('Category is required'),
//   body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
//   body('points').optional().isInt({ min: 0 }).withMessage('Points must be 0 or more'),
//   body('negativeMarks').optional().isFloat({ min: 0 }).withMessage('Negative marks must be 0 or more'),
//   body('timeLimit').optional().isInt({ min: 5 }).withMessage('Time limit must be at least 5 seconds'),
// ]

// exports.bulkQuestionsValidators = [
//   body('questions').isArray({ min: 1, max: 500 }).withMessage('questions must be an array of 1-500 items'),
//   body('questions.*.text').trim().isLength({ min: 3, max: 1000 }).withMessage('Each question needs text (3-1000 chars)'),
//   body('questions.*.options').isArray({ min: 2, max: 4 }).withMessage('Each question needs 2-4 options'),
//   body('questions.*.correctIndex').isInt({ min: 0, max: 3 }).withMessage('Each correctIndex must be 0-3'),
// ]





const { body, param } = require('express-validator')

// express-validator was already installed, and `validate` (in errorHandler.js)
// already turns its results into a structured 400 response — but nothing in
// the app actually defined any validation chains, so every route accepted
// whatever shape of JSON was sent. These are deliberately scoped to the
// endpoints with the most exposure: public auth endpoints (anyone can hit
// them, no auth required) and the money-bearing contest fields (wrong types/
// negative values there directly corrupt real-money data).

const objectId = (field) =>
  param(field).isMongoId().withMessage(`${field} must be a valid id`)

exports.registerValidators = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters'),
  body('referralCode').optional().trim().isAlphanumeric().isLength({ max: 20 }).withMessage('Invalid referral code'),
]

exports.loginValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
]

exports.forgotPasswordValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
]

exports.resendVerificationValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
]

exports.verifyEmailTokenValidator = [
  param('token').isHexadecimal().withMessage('Invalid verification token'),
]

exports.resetPasswordValidators = [
  param('token').isHexadecimal().withMessage('Invalid reset token'),
  body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters'),
]

exports.updateProfileValidators = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().trim().isLength({ max: 300 }).withMessage('Bio must be under 300 characters'),
  body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
]

exports.contestIdParamValidator = [objectId('id')]

exports.createContestValidators = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('targetQuestionCount').optional().isInt({ min: 1, max: 100 }).withMessage('Number of questions must be between 1 and 100'),
  body('entryFee').isFloat({ min: 0 }).withMessage('Entry fee must be 0 or more'),
  body('prizePool').isFloat({ min: 0 }).withMessage('Prize pool must be 0 or more'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('startTime').isISO8601().toDate().withMessage('startTime must be a valid date'),
  body('endTime').isISO8601().toDate().withMessage('endTime must be a valid date')
    .custom((endTime, { req }) => {
      if (req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error('endTime must be after startTime')
      }
      return true
    }),
]

// PUT allows partial updates, so fields are optional here but still type/range-checked when present.
exports.updateContestValidators = [
  body('title').optional().trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('entryFee').optional().isFloat({ min: 0 }).withMessage('Entry fee must be 0 or more'),
  body('prizePool').optional().isFloat({ min: 0 }).withMessage('Prize pool must be 0 or more'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('startTime').optional().isISO8601().toDate().withMessage('startTime must be a valid date'),
  body('endTime').optional().isISO8601().toDate().withMessage('endTime must be a valid date'),
]

exports.createQuestionValidators = [
  body('text').trim().isLength({ min: 3, max: 1000 }).withMessage('Question text must be 3-1000 characters'),
  body('options').isArray({ min: 2, max: 4 }).withMessage('Options must be an array of 2-4 items'),
  body('options.*').trim().isLength({ min: 1, max: 300 }).withMessage('Each option must be 1-300 characters'),
  body('correctIndex').isInt({ min: 0, max: 3 }).withMessage('correctIndex must be between 0 and 3')
    .custom((correctIndex, { req }) => {
      if (Array.isArray(req.body.options) && correctIndex >= req.body.options.length) {
        throw new Error('correctIndex is out of range for the given options')
      }
      return true
    }),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be 0 or more'),
  body('negativeMarks').optional().isFloat({ min: 0 }).withMessage('Negative marks must be 0 or more'),
  body('timeLimit').optional().isInt({ min: 5 }).withMessage('Time limit must be at least 5 seconds'),
]

exports.bulkQuestionsValidators = [
  body('questions').isArray({ min: 1, max: 500 }).withMessage('questions must be an array of 1-500 items'),
  body('questions.*.text').trim().isLength({ min: 3, max: 1000 }).withMessage('Each question needs text (3-1000 chars)'),
  body('questions.*.options').isArray({ min: 2, max: 4 }).withMessage('Each question needs 2-4 options'),
  body('questions.*.correctIndex').isInt({ min: 0, max: 3 }).withMessage('Each correctIndex must be 0-3'),
]