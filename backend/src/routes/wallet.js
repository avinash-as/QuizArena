const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/walletController')
const { protect } = require('../middleware/auth')

router.get('/', protect, ctrl.getWallet)
router.post('/daily-bonus', protect, ctrl.claimDailyBonus)
router.get('/transactions', protect, ctrl.getTransactions)

module.exports = router
