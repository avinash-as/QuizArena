const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/adminController')
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/stats',           ctrl.getDashboardStats)
router.get('/users',           ctrl.getUsers)
router.put('/users/:id',       ctrl.updateUser)
router.post('/users/:id/credit-coins', ctrl.creditUserCoins)
router.post('/broadcast',      ctrl.broadcastNotification)
router.get('/analytics',       ctrl.getAnalytics)
router.get('/audit-logs',      ctrl.getAuditLogs)

module.exports = router
