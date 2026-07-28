const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/fraudController')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)
router.get('/', ctrl.getFraudCases)
router.get('/stats', ctrl.getFraudStats)
router.put('/:id', ctrl.resolveFraudCase)

module.exports = router
