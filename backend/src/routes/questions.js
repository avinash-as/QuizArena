// const express = require('express')
// const router = express.Router()
// const ctrl = require('../controllers/questionController')
// const { protect, adminOnly } = require('../middleware/auth')

// router.use(protect, adminOnly)
// router.get('/', ctrl.getQuestions)
// router.get('/:id', ctrl.getQuestion)
// router.post('/', ctrl.createQuestion)
// router.post('/bulk', ctrl.bulkCreateQuestions)
// router.post('/generate-quiz', ctrl.generateQuiz)
// router.put('/:id', ctrl.updateQuestion)
// router.delete('/:id', ctrl.deleteQuestion)

// module.exports = router



const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/questionController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')
const { createQuestionValidators, bulkQuestionsValidators } = require('../middleware/validators')

router.use(protect, adminOnly)
router.get('/', ctrl.getQuestions)
router.get('/:id', ctrl.getQuestion)
router.post('/', createQuestionValidators, validate, ctrl.createQuestion)
router.post('/bulk', bulkQuestionsValidators, validate, ctrl.bulkCreateQuestions)
router.post('/generate-quiz', ctrl.generateQuiz)
router.put('/:id', ctrl.updateQuestion)
router.delete('/:id', ctrl.deleteQuestion)

module.exports = router