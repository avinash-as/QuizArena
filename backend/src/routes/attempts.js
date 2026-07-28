const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/quizAttemptController')
const { protect } = require('../middleware/auth')

router.post('/start', protect, ctrl.startAttempt)
router.post('/:id/submit', protect, ctrl.submitAttempt)
router.get('/contest/:contestId', protect, ctrl.getAttemptStatus)

module.exports = router
