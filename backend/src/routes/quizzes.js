const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/quizController')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, ctrl.getQuizzes)
router.get('/:id', optionalAuth, ctrl.getQuiz)

// GET /quizzes/:id/practice — returns correctIndex (for client-side practice scoring only)
// NOT used in contests (contests use server-side scoring via attempt API)
router.get('/:id/practice', ctrl.getQuizForPractice)

// Admin
router.post('/', protect, adminOnly, ctrl.createQuiz)
router.put('/:id', protect, adminOnly, ctrl.updateQuiz)
router.delete('/:id', protect, adminOnly, ctrl.deleteQuiz)
router.post('/:id/questions/import', protect, adminOnly, ctrl.importQuestionsFromBank)
router.delete('/:id/questions/:questionId', protect, adminOnly, ctrl.removeQuestion)
router.put('/:id/questions/reorder', protect, adminOnly, ctrl.reorderQuestions)

module.exports = router
