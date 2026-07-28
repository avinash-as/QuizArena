const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/leaderboardController')
const { optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, ctrl.getLeaderboard)

module.exports = router
