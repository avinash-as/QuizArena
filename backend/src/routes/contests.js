// const express = require('express')
// const router = express.Router()
// const ctrl = require('../controllers/contestController')
// const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

// router.get('/',            optionalAuth, ctrl.getContests)
// router.get('/:id',         optionalAuth, ctrl.getContest)
// router.get('/:id/leaderboard', ctrl.getContestLeaderboard)

// router.post('/:id/join',   protect, ctrl.joinContest)
// router.post('/:id/submit', protect, ctrl.submitContest)

// // Admin only
// router.post('/',                         protect, adminOnly, ctrl.createContest)
// router.put('/:id',                       protect, adminOnly, ctrl.updateContest)
// router.delete('/:id',                    protect, adminOnly, ctrl.deleteContest)
// router.post('/:id/distribute-prizes',    protect, adminOnly, ctrl.distributePrizes)

// module.exports = router




// const express = require('express')
// const router = express.Router()
// const ctrl = require('../controllers/contestController')
// const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

// router.get('/',            optionalAuth, ctrl.getContests)
// router.get('/:id',         optionalAuth, ctrl.getContest)
// router.get('/:id/leaderboard', ctrl.getContestLeaderboard)

// router.post('/:id/join',   protect, ctrl.joinContest)

// // NOTE: POST /:id/submit (ctrl.submitContest) is intentionally NOT mounted.
// // It's legacy code from before the /api/attempts system existed. Nothing in
// // the current frontend calls it (QuizPlay.jsx uses attemptAPI.start/submit,
// // which enforces a real server-side deadline). Left live, this endpoint was
// // a reachable, authenticated way to bypass the timer entirely — it trusted
// // a client-supplied `timeTaken` with no expiry check at all, meaning anyone
// // could call it directly (no UI needed) and fabricate a fast submission for
// // a fake time bonus. Since it's real-money scoring, closing the route is the
// // correct fix rather than patching a path the product no longer uses.
// // The controller function is left in place, unexported from routing, for
// // reference — do not re-mount it without adding the same server-side
// // endTime + expiry enforcement that controllers/quizAttemptController.js has.

// // Admin only
// router.post('/',                         protect, adminOnly, ctrl.createContest)
// router.put('/:id',                       protect, adminOnly, ctrl.updateContest)
// router.delete('/:id',                    protect, adminOnly, ctrl.deleteContest)
// router.post('/:id/distribute-prizes',    protect, adminOnly, ctrl.distributePrizes)

// module.exports = router



const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/contestController')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')
const {
  contestIdParamValidator, createContestValidators, updateContestValidators,
} = require('../middleware/validators')

router.get('/',            optionalAuth, ctrl.getContests)
router.get('/:id',         contestIdParamValidator, validate, optionalAuth, ctrl.getContest)
router.get('/:id/leaderboard', contestIdParamValidator, validate, ctrl.getContestLeaderboard)

router.post('/:id/join',   contestIdParamValidator, validate, protect, ctrl.joinContest)

// NOTE: POST /:id/submit (ctrl.submitContest) is intentionally NOT mounted.
// It's legacy code from before the /api/attempts system existed. Nothing in
// the current frontend calls it (QuizPlay.jsx uses attemptAPI.start/submit,
// which enforces a real server-side deadline). Left live, this endpoint was
// a reachable, authenticated way to bypass the timer entirely — it trusted
// a client-supplied `timeTaken` with no expiry check at all, meaning anyone
// could call it directly (no UI needed) and fabricate a fast submission for
// a fake time bonus. Since it's real-money scoring, closing the route is the
// correct fix rather than patching a path the product no longer uses.
// The controller function is left in place, unexported from routing, for
// reference — do not re-mount it without adding the same server-side
// endTime + expiry enforcement that controllers/quizAttemptController.js has.

// Admin only
router.post('/',                         protect, adminOnly, createContestValidators, validate, ctrl.createContest)
router.put('/:id',                       protect, adminOnly, contestIdParamValidator, updateContestValidators, validate, ctrl.updateContest)
router.delete('/:id',                    protect, adminOnly, contestIdParamValidator, validate, ctrl.deleteContest)
router.post('/:id/distribute-prizes',    protect, adminOnly, contestIdParamValidator, validate, ctrl.distributePrizes)

module.exports = router