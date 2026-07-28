// const Question = require('../models/Question')

// // GET /questions — admin only
// exports.getQuestions = async (req, res, next) => {
//   try {
//     const { category, difficulty, search, isActive, page = 1, limit = 20 } = req.query
//     const filter = {}
//     if (category) filter.category = category
//     if (difficulty) filter.difficulty = difficulty
//     if (isActive !== undefined) filter.isActive = isActive === 'true'
//     if (search) filter.text = { $regex: search, $options: 'i' }

//     const total = await Question.countDocuments(filter)
//     const questions = await Question.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit))

//     res.json({ success: true, questions, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
//   } catch (err) { next(err) }
// }

// // GET /questions/:id
// exports.getQuestion = async (req, res, next) => {
//   try {
//     const q = await Question.findById(req.params.id)
//     if (!q) return res.status(404).json({ success: false, message: 'Question not found' })
//     res.json({ success: true, question: q })
//   } catch (err) { next(err) }
// }

// // POST /questions — admin only
// exports.createQuestion = async (req, res, next) => {
//   try {
//     const question = await Question.create({ ...req.body, createdBy: req.user._id })
//     res.status(201).json({ success: true, question })
//   } catch (err) { next(err) }
// }

// // POST /questions/bulk — bulk import
// exports.bulkCreateQuestions = async (req, res, next) => {
//   try {
//     const { questions } = req.body
//     if (!Array.isArray(questions) || questions.length === 0) {
//       return res.status(400).json({ success: false, message: 'Questions array required' })
//     }
//     const withAuthor = questions.map(q => ({ ...q, createdBy: req.user._id }))
//     const created = await Question.insertMany(withAuthor, { ordered: false })
//     res.status(201).json({ success: true, created: created.length })
//   } catch (err) { next(err) }
// }

// // PUT /questions/:id
// exports.updateQuestion = async (req, res, next) => {
//   try {
//     const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//     if (!q) return res.status(404).json({ success: false, message: 'Question not found' })
//     res.json({ success: true, question: q })
//   } catch (err) { next(err) }
// }

// // DELETE /questions/:id
// exports.deleteQuestion = async (req, res, next) => {
//   try {
//     await Question.findByIdAndDelete(req.params.id)
//     res.json({ success: true, message: 'Question deleted' })
//   } catch (err) { next(err) }
// }

// // POST /questions/generate-quiz — generate a quiz from question bank
// exports.generateQuiz = async (req, res, next) => {
//   try {
//     const { category, difficulty, count = 10, randomize = true } = req.body

//     const filter = { isActive: true }
//     if (category) filter.category = category
//     if (difficulty) filter.difficulty = difficulty

//     const total = await Question.countDocuments(filter)
//     if (total < count) {
//       return res.status(400).json({ success: false, message: `Only ${total} questions available matching criteria` })
//     }

//     let questions
//     if (randomize) {
//       questions = await Question.aggregate([
//         { $match: filter },
//         { $sample: { size: Number(count) } },
//       ])
//     } else {
//       questions = await Question.find(filter).limit(Number(count))
//     }

//     res.json({ success: true, questions, total })
//   } catch (err) { next(err) }
// }






const Question = require('../models/Question')

// GET /questions — admin only
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, search, isActive, page = 1, limit = 20 } = req.query
    const filter = {}
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) filter.text = { $regex: search, $options: 'i' }

    const total = await Question.countDocuments(filter)
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    res.json({ success: true, questions, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}

// GET /questions/:id
exports.getQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id)
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' })
    res.json({ success: true, question: q })
  } catch (err) { next(err) }
}

// POST /questions — admin only
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ success: true, question })
  } catch (err) { next(err) }
}

// POST /questions/bulk — bulk import
exports.bulkCreateQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions array required' })
    }
    const withAuthor = questions.map(q => ({ ...q, createdBy: req.user._id }))
    const created = await Question.insertMany(withAuthor, { ordered: false })
    res.status(201).json({ success: true, created: created.length })
  } catch (err) { next(err) }
}

// PUT /questions/:id
exports.updateQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' })
    res.json({ success: true, question: q })
  } catch (err) { next(err) }
}

// DELETE /questions/:id
exports.deleteQuestion = async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Question deleted' })
  } catch (err) { next(err) }
}

// POST /questions/generate-quiz — generate a quiz from question bank
exports.generateQuiz = async (req, res, next) => {
  try {
    const { category, difficulty, count = 10, randomize = true } = req.body

    const filter = { isActive: true }
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    const total = await Question.countDocuments(filter)
    if (total < count) {
      return res.status(400).json({ success: false, message: `Only ${total} questions available matching criteria` })
    }

    let questions
    if (randomize) {
      questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: Number(count) } },
      ])
    } else {
      questions = await Question.find(filter).limit(Number(count))
    }

    res.json({ success: true, questions, total })
  } catch (err) { next(err) }
}