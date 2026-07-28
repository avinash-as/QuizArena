const express = require('express')
const router = express.Router()

router.use('/auth',           require('./auth'))
router.use('/contests',       require('./contests'))
router.use('/quizzes',        require('./quizzes'))
router.use('/leaderboard',    require('./leaderboard'))
router.use('/wallet',         require('./wallet'))
router.use('/users',          require('./users'))
router.use('/attempts',       require('./attempts'))
router.use('/questions',      require('./questions'))
router.use('/prize-templates',require('./prizeTemplates'))
router.use('/fraud',          require('./fraud'))

module.exports = router
