const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/roomController')
const { protect, optionalAuth } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')
const {
  roomCodeParamValidator, createRoomValidators, joinRoomValidators,
} = require('../middleware/validators')

router.get('/my',     protect, ctrl.myRooms)
router.get('/joined', protect, ctrl.joinedRooms)

router.post('/',                    protect, createRoomValidators, validate, ctrl.createRoom)
router.get('/:code',                roomCodeParamValidator, validate, optionalAuth, ctrl.getRoomByCode)
router.post('/:code/join',          joinRoomValidators, validate, protect, ctrl.joinRoom)
router.delete('/:code',             roomCodeParamValidator, validate, protect, ctrl.cancelRoom)
router.get('/:code/leaderboard',    roomCodeParamValidator, validate, ctrl.getLeaderboard)
router.get('/:code/result',         roomCodeParamValidator, validate, protect, ctrl.getMyResult)

module.exports = router
