// const Contest             = require('../models/Contest')
// const ContestParticipant  = require('../models/ContestParticipant')
// const Leaderboard         = require('../models/Leaderboard')
// const Quiz                = require('../models/Quiz')
// const User                = require('../models/User')
// const { debitCoins, debitWalletBalance } = require('../services/walletService')
// const { checkAchievements } = require('../services/achievementService')
// const { distributePrizes }  = require('../services/prizeService')
// const Transaction         = require('../models/Transaction')
// const { cache }           = require('../config/redis')

// const syncContestStatuses = async () => {
//   const now = new Date()
//   await Contest.updateMany({ status: 'UPCOMING', startTime: { $lte: now } }, { $set: { status: 'LIVE' } })
//   await Contest.updateMany({ status: { $in: ['UPCOMING', 'LIVE'] }, endTime: { $lte: now } }, { $set: { status: 'COMPLETED' } })
// }

// // GET /contests
// exports.getContests = async (req, res, next) => {
//   try {
//     const { status, category, search, page = 1, limit = 12 } = req.query
//     await syncContestStatuses()

//     const isAdmin = ['admin', 'super_admin'].includes(req.user?.role)
//     // Regular players never see DRAFT contests (unpublished/still being set
//     // up). Admins need to see them too — this same endpoint powers both the
//     // public contest lobby AND the admin contest list, and DRAFT is now the
//     // default status for a newly-created contest (questions get added
//     // after creation), so hiding drafts from admins would make a contest
//     // disappear from their own list right after creating it.
//     const filter = isAdmin ? {} : { status: { $ne: 'DRAFT' } }
//     if (status)    filter.status   = status
//     if (category)  filter.category = category
//     if (search)    filter.title    = { $regex: search, $options: 'i' }

//     const total    = await Contest.countDocuments(filter)
//     const contests = await Contest.find(filter)
//       .populate('quiz', 'title totalQuestions timeLimit')
//       .sort({ isFeatured: -1, startTime: 1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit))

//     res.json({ success: true, contests, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
//   } catch (err) { next(err) }
// }

// // GET /contests/:id
// exports.getContest = async (req, res, next) => {
//   try {
//     const contest = await Contest.findById(req.params.id)
//       .populate('quiz', 'title description totalQuestions timeLimit category')
//       .populate('createdBy', 'name')

//     if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })

//     const isAdmin = ['admin', 'super_admin'].includes(req.user?.role)
//     if (contest.status === 'DRAFT' && !isAdmin) {
//       return res.status(404).json({ success: false, message: 'Contest not found' })
//     }

//     let hasJoined = false
//     let myParticipant = null
//     if (req.user) {
//       myParticipant = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
//       hasJoined = !!myParticipant
//     }

//     res.json({ success: true, contest, hasJoined, myParticipant })
//   } catch (err) { next(err) }
// }

// // POST /contests/:id/join — atomic race condition fix
// exports.joinContest = async (req, res, next) => {
//   try {
//     // FIX: Atomic increment — only succeeds if spots available
//     const contest = await Contest.findOneAndUpdate(
//       {
//         _id:                 req.params.id,
//         status:              { $in: ['UPCOMING', 'LIVE'] },
//         $expr:               { $lt: ['$currentParticipants', '$maxParticipants'] },
//       },
//       { $inc: { currentParticipants: 1 }, $push: { participants: req.user._id } },
//       { new: true }
//     )

//     if (!contest) {
//       // Check why it failed
//       const existing = await Contest.findById(req.params.id)
//       if (!existing) return res.status(404).json({ success: false, message: 'Contest not found' })
//       if (!['UPCOMING', 'LIVE'].includes(existing.status)) {
//         return res.status(400).json({ success: false, message: 'Contest is not open for joining' })
//       }
//       return res.status(400).json({ success: false, message: 'Contest is full' })
//     }

//     // Check already joined
//     const alreadyJoined = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
//     if (alreadyJoined) {
//       // Rollback the atomic increment
//       await Contest.findByIdAndUpdate(contest._id, {
//         $inc: { currentParticipants: -1 },
//         $pull: { participants: req.user._id },
//       })
//       return res.status(400).json({ success: false, message: 'You have already joined this contest' })
//     }

//     // Debit entry fee — atomic, race-proof (see walletService.js)
//     if (contest.entryFee > 0) {
//       const walletDebit = await debitWalletBalance(
//         req.user._id,
//         contest.entryFee,
//         'contest_entry',
//         `Entry fee: ${contest.title}`,
//         contest._id,
//         'Contest'
//       )

//       if (!walletDebit) {
//         // Combined wallet balance wasn't enough — fall back to legacy coins field
//         try {
//           await debitCoins(req.user._id, contest.entryFee, 'contest_entry', `Entry: ${contest.title}`, contest._id, 'Contest')
//         } catch (e) {
//           // Rollback the atomic slot increment — neither balance covered the entry fee
//           await Contest.findByIdAndUpdate(contest._id, {
//             $inc: { currentParticipants: -1 },
//             $pull: { participants: req.user._id },
//           })
//           return res.status(400).json({ success: false, message: 'Insufficient balance to join this contest' })
//         }
//       }
//     }

//     await ContestParticipant.create({ contest: contest._id, user: req.user._id, entryFeePaid: contest.entryFee })
//     await User.findByIdAndUpdate(req.user._id, { $inc: { totalContestsJoined: 1 } })

//     if (req.app.locals.socket) {
//       req.app.locals.socket.emitParticipantJoined(contest._id.toString(), contest.currentParticipants)
//     }

//     res.json({ success: true, message: 'Successfully joined the contest!', contest })
//   } catch (err) {
//     if (err.message === 'Insufficient coins') {
//       return res.status(400).json({ success: false, message: 'Insufficient balance' })
//     }
//     next(err)
//   }
// }

// // POST /contests/:id/submit (legacy)
// exports.submitContest = async (req, res, next) => {
//   try {
//     const { answers, timeTaken } = req.body
//     const contest = await Contest.findById(req.params.id).populate('quiz')
//     if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })
//     if (['COMPLETED', 'completed'].includes(contest.status)) {
//       return res.status(400).json({ success: false, message: 'Contest has ended' })
//     }

//     const participant = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
//     if (!participant) return res.status(403).json({ success: false, message: 'You have not joined this contest' })

//     const existing = await Leaderboard.findOne({ user: req.user._id, contest: contest._id })
//     if (existing) return res.status(400).json({ success: false, message: 'Already submitted' })

//     const { questions } = contest.quiz
//     let correct = 0
//     const details = questions.map(q => {
//       const chosen    = answers[q._id.toString()] ?? null
//       const isCorrect = chosen === q.correctIndex
//       if (isCorrect) correct++
//       return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex }
//     })

//     const total     = questions.length
//     const timeBonus = Math.max(0, Math.round(((contest.quiz.timeLimit - timeTaken) / contest.quiz.timeLimit) * 200))
//     const score     = Math.round((correct / total) * 1000) + timeBonus
//     const accuracy  = Math.round((correct / total) * 100)

//     participant.score          = score
//     participant.submittedAt    = new Date()
//     participant.correctAnswers = correct
//     participant.totalQuestions = total
//     participant.timeTaken      = timeTaken
//     participant.accuracy       = accuracy
//     await participant.save()

//     await Leaderboard.create({
//       user: req.user._id, contest: contest._id, score,
//       correctAnswers: correct, totalQuestions: total, timeTaken, accuracy,
//       period: 'contest', periodKey: contest._id.toString(),
//     })

//     const user = await User.findById(req.user._id)
//     user.totalQuizzesPlayed += 1
//     user.totalScore         += score
//     user.totalCorrect       += correct
//     user.totalQuestions     += total
//     user.xp                 += Math.round(score / 10)
//     user.syncLevel()
//     await user.save()

//     const newAchievements = await checkAchievements(user)

//     if (req.app.locals.socket) {
//       req.app.locals.socket.emitLeaderboardUpdate(contest._id.toString())
//     }

//     res.json({ success: true, result: { score, correct, wrong: total - correct, total, accuracy, timeTaken, details }, newAchievements })
//   } catch (err) { next(err) }
// }

// // GET /contests/:id/leaderboard
// exports.getContestLeaderboard = async (req, res, next) => {
//   try {
//     const cacheKey = `lb:contest:${req.params.id}`
//     const cached   = await cache.get(cacheKey)
//     if (cached) return res.json({ success: true, leaderboard: JSON.parse(cached), cached: true })

//     const participants = await ContestParticipant.find({ contest: req.params.id })
//       .populate('user', 'name avatar level')
//       .sort({ score: -1, timeTaken: 1 })
//       .limit(100)

//     const ranked = participants.map((p, i) => ({
//       rank: i + 1, user: p.user, score: p.score,
//       accuracy: p.accuracy, timeTaken: p.timeTaken, correctAnswers: p.correctAnswers,
//     }))

//     await cache.set(cacheKey, JSON.stringify(ranked), 30)
//     res.json({ success: true, leaderboard: ranked })
//   } catch (err) { next(err) }
// }

// // Contests can be saved as DRAFT with an empty/placeholder quiz while an
// // admin is still building it out, but must not be publishable (any status
// // other than DRAFT) without at least one question — otherwise it could go
// // LIVE with nothing for players to answer.
// const assertContestReadyToPublish = async (status, quizId) => {
//   if (status === 'DRAFT' || !quizId) return
//   const Quiz = require('../models/Quiz')
//   const quiz = await Quiz.findById(quizId).select('totalQuestions questions')
//   const count = quiz ? (quiz.totalQuestions || quiz.questions?.length || 0) : 0
//   if (count === 0) {
//     const err = new Error('This contest\'s quiz has no questions yet. Add at least one question before publishing.')
//     err.statusCode = 400
//     throw err
//   }
// }

// // Admin: POST /contests
// exports.createContest = async (req, res, next) => {
//   try {
//     await assertContestReadyToPublish(req.body.status, req.body.quiz)
//     const contest = await Contest.create({ ...req.body, createdBy: req.user._id })
//     res.status(201).json({ success: true, contest })
//   } catch (err) { next(err) }
// }

// // Admin: PUT /contests/:id
// exports.updateContest = async (req, res, next) => {
//   try {
//     const existing = await Contest.findById(req.params.id).select('quiz status')
//     if (!existing) return res.status(404).json({ success: false, message: 'Contest not found' })

//     const nextStatus = req.body.status ?? existing.status
//     const nextQuiz   = req.body.quiz ?? existing.quiz
//     await assertContestReadyToPublish(nextStatus, nextQuiz)

//     const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//     res.json({ success: true, contest })
//   } catch (err) { next(err) }
// }

// // Admin: DELETE /contests/:id
// exports.deleteContest = async (req, res, next) => {
//   try {
//     await Contest.findByIdAndDelete(req.params.id)
//     res.json({ success: true, message: 'Contest deleted' })
//   } catch (err) { next(err) }
// }

// // Admin: POST /contests/:id/distribute-prizes
// exports.distributePrizes = async (req, res, next) => {
//   try {
//     const result = await distributePrizes(req.params.id, req.user._id)
//     res.json({ success: true, ...result })
//   } catch (err) {
//     if (err.message.includes('already distributed') || err.message.includes('must be completed')) {
//       return res.status(400).json({ success: false, message: err.message })
//     }
//     next(err)
//   }
// }





const Contest             = require('../models/Contest')
const ContestParticipant  = require('../models/ContestParticipant')
const Leaderboard         = require('../models/Leaderboard')
const Quiz                = require('../models/Quiz')
const User                = require('../models/User')
const { debitCoins, debitWalletBalance } = require('../services/walletService')
const { checkAchievements } = require('../services/achievementService')
const { distributePrizes }  = require('../services/prizeService')
const Transaction         = require('../models/Transaction')
const { cache }           = require('../config/redis')

const syncContestStatuses = async () => {
  const now = new Date()
  await Contest.updateMany({ status: 'UPCOMING', startTime: { $lte: now } }, { $set: { status: 'LIVE' } })
  await Contest.updateMany({ status: { $in: ['UPCOMING', 'LIVE'] }, endTime: { $lte: now } }, { $set: { status: 'COMPLETED' } })
}

// GET /contests
exports.getContests = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 12 } = req.query
    await syncContestStatuses()

    const isAdmin = ['admin', 'super_admin'].includes(req.user?.role)
    // Regular players never see DRAFT contests (unpublished/still being set
    // up). Admins need to see them too — this same endpoint powers both the
    // public contest lobby AND the admin contest list, and DRAFT is now the
    // default status for a newly-created contest (questions get added
    // after creation), so hiding drafts from admins would make a contest
    // disappear from their own list right after creating it.
    const filter = isAdmin ? {} : { status: { $ne: 'DRAFT' } }
    if (status)    filter.status   = status
    if (category)  filter.category = category
    if (search)    filter.title    = { $regex: search, $options: 'i' }

    const total    = await Contest.countDocuments(filter)
    const contests = await Contest.find(filter)
      .populate('quiz', 'title totalQuestions timeLimit')
      .sort({ isFeatured: -1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    res.json({ success: true, contests, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) { next(err) }
}

// GET /contests/:id
exports.getContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('quiz', 'title description totalQuestions timeLimit category')
      .populate('createdBy', 'name')

    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })

    const isAdmin = ['admin', 'super_admin'].includes(req.user?.role)
    if (contest.status === 'DRAFT' && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Contest not found' })
    }

    let hasJoined = false
    let myParticipant = null
    if (req.user) {
      myParticipant = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
      hasJoined = !!myParticipant
    }

    res.json({ success: true, contest, hasJoined, myParticipant })
  } catch (err) { next(err) }
}

// POST /contests/:id/join — atomic race condition fix
exports.joinContest = async (req, res, next) => {
  try {
    // FIX: Atomic increment — only succeeds if spots available
    const contest = await Contest.findOneAndUpdate(
      {
        _id:                 req.params.id,
        status:              { $in: ['UPCOMING', 'LIVE'] },
        $expr:               { $lt: ['$currentParticipants', '$maxParticipants'] },
      },
      { $inc: { currentParticipants: 1 }, $push: { participants: req.user._id } },
      { new: true }
    )

    if (!contest) {
      // Check why it failed
      const existing = await Contest.findById(req.params.id)
      if (!existing) return res.status(404).json({ success: false, message: 'Contest not found' })
      if (!['UPCOMING', 'LIVE'].includes(existing.status)) {
        return res.status(400).json({ success: false, message: 'Contest is not open for joining' })
      }
      return res.status(400).json({ success: false, message: 'Contest is full' })
    }

    // Check already joined
    const alreadyJoined = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
    if (alreadyJoined) {
      // Rollback the atomic increment
      await Contest.findByIdAndUpdate(contest._id, {
        $inc: { currentParticipants: -1 },
        $pull: { participants: req.user._id },
      })
      return res.status(400).json({ success: false, message: 'You have already joined this contest' })
    }

    // Debit entry fee — atomic, race-proof (see walletService.js)
    if (contest.entryFee > 0) {
      const walletDebit = await debitWalletBalance(
        req.user._id,
        contest.entryFee,
        'contest_entry',
        `Entry fee: ${contest.title}`,
        contest._id,
        'Contest'
      )

      if (!walletDebit) {
        // Combined wallet balance wasn't enough — fall back to legacy coins field
        try {
          await debitCoins(req.user._id, contest.entryFee, 'contest_entry', `Entry: ${contest.title}`, contest._id, 'Contest')
        } catch (e) {
          // Rollback the atomic slot increment — neither balance covered the entry fee
          await Contest.findByIdAndUpdate(contest._id, {
            $inc: { currentParticipants: -1 },
            $pull: { participants: req.user._id },
          })
          return res.status(400).json({ success: false, message: 'Insufficient balance to join this contest' })
        }
      }
    }

    await ContestParticipant.create({ contest: contest._id, user: req.user._id, entryFeePaid: contest.entryFee })
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalContestsJoined: 1 } })

    if (req.app.locals.socket) {
      req.app.locals.socket.emitParticipantJoined(contest._id.toString(), contest.currentParticipants)
    }

    res.json({ success: true, message: 'Successfully joined the contest!', contest })
  } catch (err) {
    if (err.message === 'Insufficient coins') {
      return res.status(400).json({ success: false, message: 'Insufficient balance' })
    }
    next(err)
  }
}

// POST /contests/:id/submit (legacy)
exports.submitContest = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body
    const contest = await Contest.findById(req.params.id).populate('quiz')
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })
    if (['COMPLETED', 'completed'].includes(contest.status)) {
      return res.status(400).json({ success: false, message: 'Contest has ended' })
    }

    const participant = await ContestParticipant.findOne({ contest: contest._id, user: req.user._id })
    if (!participant) return res.status(403).json({ success: false, message: 'You have not joined this contest' })

    const existing = await Leaderboard.findOne({ user: req.user._id, contest: contest._id })
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted' })

    const { questions } = contest.quiz
    let correct = 0
    const details = questions.map(q => {
      const chosen    = answers[q._id.toString()] ?? null
      const isCorrect = chosen === q.correctIndex
      if (isCorrect) correct++
      return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex }
    })

    const total     = questions.length
    const timeBonus = Math.max(0, Math.round(((contest.quiz.timeLimit - timeTaken) / contest.quiz.timeLimit) * 200))
    const score     = Math.round((correct / total) * 1000) + timeBonus
    const accuracy  = Math.round((correct / total) * 100)

    participant.score          = score
    participant.submittedAt    = new Date()
    participant.correctAnswers = correct
    participant.totalQuestions = total
    participant.timeTaken      = timeTaken
    participant.accuracy       = accuracy
    await participant.save()

    await Leaderboard.create({
      user: req.user._id, contest: contest._id, score,
      correctAnswers: correct, totalQuestions: total, timeTaken, accuracy,
      period: 'contest', periodKey: contest._id.toString(),
    })

    const user = await User.findById(req.user._id)
    user.totalQuizzesPlayed += 1
    user.totalScore         += score
    user.totalCorrect       += correct
    user.totalQuestions     += total
    user.xp                 += Math.round(score / 10)
    user.syncLevel()
    await user.save()

    const newAchievements = await checkAchievements(user)

    if (req.app.locals.socket) {
      req.app.locals.socket.emitLeaderboardUpdate(contest._id.toString())
    }

    res.json({ success: true, result: { score, correct, wrong: total - correct, total, accuracy, timeTaken, details }, newAchievements })
  } catch (err) { next(err) }
}

// GET /contests/:id/leaderboard
exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const cacheKey = `lb:contest:${req.params.id}`
    const cached   = await cache.get(cacheKey)
    if (cached) return res.json({ success: true, leaderboard: JSON.parse(cached), cached: true })

    const participants = await ContestParticipant.find({ contest: req.params.id })
      .populate('user', 'name avatar level')
      .sort({ score: -1, timeTaken: 1 })
      .limit(100)

    const ranked = participants.map((p, i) => ({
      rank: i + 1, user: p.user, score: p.score,
      accuracy: p.accuracy, timeTaken: p.timeTaken, correctAnswers: p.correctAnswers,
    }))

    await cache.set(cacheKey, JSON.stringify(ranked), 30)
    res.json({ success: true, leaderboard: ranked })
  } catch (err) { next(err) }
}

// Contests can be saved as DRAFT with an empty/placeholder quiz while an
// admin is still building it out, but must not be publishable (any status
// other than DRAFT) without at least one question — otherwise it could go
// LIVE with nothing for players to answer.
const assertContestReadyToPublish = async (status, quizId) => {
  if (status === 'DRAFT' || !quizId) return
  const Quiz = require('../models/Quiz')
  const quiz = await Quiz.findById(quizId).select('totalQuestions questions')
  const count = quiz ? (quiz.totalQuestions || quiz.questions?.length || 0) : 0
  if (count === 0) {
    const err = new Error('This contest\'s quiz has no questions yet. Add at least one question before publishing.')
    err.statusCode = 400
    throw err
  }
}

// Admin: POST /contests
// Every contest gets its own Quiz automatically — the admin never picks one
// from a dropdown. `targetQuestionCount` is just a heads-up display value for
// "Manage Questions" (e.g. "3 of 5 added"); publishing still only requires
// >=1 real question, enforced below via assertContestReadyToPublish.
exports.createContest = async (req, res, next) => {
  try {
    const { quiz: _ignoredQuiz, ...body } = req.body // quiz is never client-supplied anymore

    const createdQuiz = await Quiz.create({
      title: `${body.title || 'Contest'} — Quiz`,
      category: body.category || 'general',
      questions: [],
    })

    if (body.status && body.status !== 'DRAFT') {
      await assertContestReadyToPublish(body.status, createdQuiz._id)
    }

    const contest = await Contest.create({ ...body, quiz: createdQuiz._id, createdBy: req.user._id })
    res.status(201).json({ success: true, contest })
  } catch (err) { next(err) }
}

// Admin: PUT /contests/:id
exports.updateContest = async (req, res, next) => {
  try {
    const existing = await Contest.findById(req.params.id).select('quiz status')
    if (!existing) return res.status(404).json({ success: false, message: 'Contest not found' })

    // quiz is set once at creation and managed via QuestionManagerModal —
    // never accept it from a generic contest edit form.
    const { quiz: _ignoredQuiz, ...body } = req.body

    const nextStatus = body.status ?? existing.status
    await assertContestReadyToPublish(nextStatus, existing.quiz)

    const contest = await Contest.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
    res.json({ success: true, contest })
  } catch (err) { next(err) }
}

// Admin: DELETE /contests/:id
exports.deleteContest = async (req, res, next) => {
  try {
    await Contest.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Contest deleted' })
  } catch (err) { next(err) }
}

// Admin: POST /contests/:id/distribute-prizes
exports.distributePrizes = async (req, res, next) => {
  try {
    const result = await distributePrizes(req.params.id, req.user._id)
    res.json({ success: true, ...result })
  } catch (err) {
    if (err.message.includes('already distributed') || err.message.includes('must be completed')) {
      return res.status(400).json({ success: false, message: err.message })
    }
    next(err)
  }
}