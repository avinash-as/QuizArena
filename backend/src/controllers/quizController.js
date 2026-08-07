const Quiz = require('../models/Quiz')

const isAdmin = (req) => ['admin', 'super_admin'].includes(req.user?.role)

// GET /quizzes
exports.getQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query
    const filter = { isActive: true }
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    // Admins see correctIndex/explanation too (needed to edit quiz questions
    // without silently wiping out the correct answers on save). Everyone
    // else — including quiz-taking players — still gets them stripped.
    const hideAnswers = !isAdmin(req)
    let query = Quiz.find(filter)
    if (hideAnswers) query = query.select('-questions.correctIndex -questions.explanation')

    const total = await Quiz.countDocuments(filter)
    const quizzes = await query
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, quizzes, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// GET /quizzes/:id  — full quiz with questions (correct answers hidden from players)
exports.getQuiz = async (req, res, next) => {
  try {
    const hideAnswers = !isAdmin(req)
    let query = Quiz.findById(req.params.id)
    if (hideAnswers) query = query.select('-questions.correctIndex -questions.explanation')
    const quiz = await query
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })

    // Shuffle questions and options if requested
    if (req.query.shuffle === 'true') {
      quiz.questions.sort(() => Math.random() - 0.5)
    }

    res.json({ success: true, quiz })
  } catch (err) {
    next(err)
  }
}

// POST /admin/quizzes
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ success: true, quiz })
  } catch (err) {
    next(err)
  }
}

// PUT /admin/quizzes/:id
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })
    res.json({ success: true, quiz })
  } catch (err) {
    next(err)
  }
}

// DELETE /admin/quizzes/:id
exports.deleteQuiz = async (req, res, next) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Quiz deleted' })
  } catch (err) {
    next(err)
  }
}

// POST /admin/quizzes/:id/questions/import — add one or more Question Bank
// entries into this quiz. Dedupe happens here, server-side, against the
// quiz's current questions (by sourceQuestionId) — not left to the client —
// so a stale admin UI or two admins acting at once can't both add the same
// bank question twice.
exports.importQuestionsFromBank = async (req, res, next) => {
  try {
    const { questionIds } = req.body
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'questionIds array required' })
    }

    const Question = require('../models/Question')
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })

    const alreadyPresent = new Set(
      quiz.questions.filter(q => q.sourceQuestionId).map(q => q.sourceQuestionId.toString())
    )
    const toAdd = questionIds.filter(id => !alreadyPresent.has(id.toString()))

    const bankQuestions = await Question.find({ _id: { $in: toAdd } })

    for (const bq of bankQuestions) {
      quiz.questions.push({
        text: bq.text,
        options: bq.options,
        correctIndex: bq.correctIndex,
        explanation: bq.explanation || '',
        difficulty: bq.difficulty,
        points: bq.points || 10,
        negativeMarks: bq.negativeMarks || 0,
        timeLimit: bq.timeLimit || 30,
        sourceQuestionId: bq._id,
      })
    }

    await quiz.save()

    const skipped = questionIds.length - bankQuestions.length
    res.json({
      success: true,
      quiz,
      added: bankQuestions.length,
      skipped, // already present (duplicate) or not found
    })
  } catch (err) { next(err) }
}

// DELETE /admin/quizzes/:id/questions/:questionId
exports.removeQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })
    quiz.questions = quiz.questions.filter(q => q._id.toString() !== req.params.questionId)
    await quiz.save()
    res.json({ success: true, quiz })
  } catch (err) { next(err) }
}

// PUT /admin/quizzes/:id/questions/reorder — body: { orderedIds: [questionId, ...] }
exports.reorderQuestions = async (req, res, next) => {
  try {
    const { orderedIds } = req.body
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })

    if (!Array.isArray(orderedIds) || orderedIds.length !== quiz.questions.length) {
      return res.status(400).json({ success: false, message: 'orderedIds must include every question exactly once' })
    }

    const byId = new Map(quiz.questions.map(q => [q._id.toString(), q]))
    const reordered = orderedIds.map(id => byId.get(id.toString())).filter(Boolean)
    if (reordered.length !== quiz.questions.length) {
      return res.status(400).json({ success: false, message: 'orderedIds contains an unknown question id' })
    }

    quiz.questions = reordered
    await quiz.save()
    res.json({ success: true, quiz })
  } catch (err) { next(err) }
}

// GET /quizzes/:id/practice — practice mode includes correctIndex for client scoring
exports.getQuizForPractice = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })
    if (req.query.shuffle === 'true') {
      quiz.questions.sort(() => Math.random() - 0.5)
    }
    // Return correctIndex for practice (client-side scoring)
    // This is safe because practice has no real money — contests use attemptAPI
    res.json({ success: true, quiz })
  } catch (err) { next(err) }
}