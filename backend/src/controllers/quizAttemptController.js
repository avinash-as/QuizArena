// // const QuizAttempt         = require('../models/QuizAttempt')
// // const ContestParticipant  = require('../models/ContestParticipant')
// // const Contest             = require('../models/Contest')
// // const Quiz                = require('../models/Quiz')
// // const User                = require('../models/User')
// // const Leaderboard         = require('../models/Leaderboard')
// // const { checkAchievements }   = require('../services/achievementService')
// // const { processReferralReward } = require('../services/referralService')
// // const { recordTabSwitch, checkFastSubmission } = require('../middleware/antiCheat')

// // // POST /attempts/start — creates server-side timer
// // exports.startAttempt = async (req, res, next) => {
// //   try {
// //     const { contestId }       = req.body
// //     const ipAddress           = req.ip || req.headers['x-forwarded-for']
// //     const deviceFingerprint   = req.headers['x-device-fingerprint'] || ''

// //     const participant = await ContestParticipant.findOne({ contest: contestId, user: req.user._id })
// //     if (!participant) {
// //       return res.status(403).json({ success: false, message: 'You have not joined this contest' })
// //     }

// //     // Handle page refresh — return existing attempt
// //     const existingAttempt = await QuizAttempt.findOne({ user: req.user._id, contest: contestId })
// //     if (existingAttempt) {
// //       if (existingAttempt.status === 'SUBMITTED') {
// //         return res.status(400).json({ success: false, message: 'You have already submitted this quiz' })
// //       }
// //       const contest = await Contest.findById(contestId).populate('quiz')
// //       const quizData = contest.quiz.toObject()
// //       quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)
// //       return res.json({ success: true, attempt: existingAttempt, quiz: quizData, serverTime: new Date() })
// //     }

// //     const contest = await Contest.findById(contestId).populate('quiz')
// //     if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })
// //     if (!['LIVE', 'live'].includes(contest.status)) {
// //       return res.status(400).json({ success: false, message: 'Contest is not live' })
// //     }

// //     const timeLimit = contest.quiz.timeLimit || 600
// //     const endTime   = new Date(Date.now() + timeLimit * 1000)

// //     const attempt = await QuizAttempt.create({
// //       user: req.user._id, quiz: contest.quiz._id, contest: contestId,
// //       endTime, ipAddress, deviceFingerprint,
// //       userAgent: req.headers['user-agent'],
// //       status: 'STARTED',
// //     })

// //     const quizData = contest.quiz.toObject()
// //     quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)

// //     res.json({
// //       success: true,
// //       attempt: { _id: attempt._id, startTime: attempt.startTime, endTime: attempt.endTime },
// //       quiz: quizData,
// //       serverTime: new Date(),
// //     })
// //   } catch (err) { next(err) }
// // }

// // // POST /attempts/:id/submit
// // exports.submitAttempt = async (req, res, next) => {
// //   try {
// //     const { answers = {}, tabSwitchCount = 0 } = req.body
// //     const attempt = await QuizAttempt.findById(req.params.id)

// //     if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
// //     if (attempt.user.toString() !== req.user._id.toString()) {
// //       return res.status(403).json({ success: false, message: 'Unauthorized' })
// //     }
// //     if (attempt.status === 'SUBMITTED') {
// //       return res.status(400).json({ success: false, message: 'Already submitted' })
// //     }

// //     const isExpired = new Date() > attempt.endTime
// //     if (isExpired) attempt.status = 'EXPIRED'

// //     const quiz      = await Quiz.findById(attempt.quiz)
// //     const questions = quiz.questions

// //     const timeTaken = Math.round((Date.now() - attempt.startTime.getTime()) / 1000)

// //     // Anti-cheat (fire and forget)
// //     if (tabSwitchCount > 0) recordTabSwitch(req.user._id, attempt.contest, tabSwitchCount).catch(() => {})
// //     checkFastSubmission(req.user._id, attempt.contest, timeTaken, quiz.timeLimit).catch(() => {})

// //     // Server-side scoring — correct answers never trusted from client
// //     let correct = 0
// //     const details = questions.map(q => {
// //       const chosen    = answers[q._id.toString()] ?? null
// //       const isCorrect = chosen === q.correctIndex
// //       if (isCorrect) correct++
// //       return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex, explanation: q.explanation }
// //     })

// //     const total     = questions.length
// //     const timeBonus = Math.max(0, Math.round(((quiz.timeLimit - timeTaken) / quiz.timeLimit) * 200))
// //     const score     = Math.round((correct / total) * 1000) + timeBonus
// //     const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0

// //     attempt.status        = 'SUBMITTED'
// //     attempt.submittedAt   = new Date()
// //     attempt.score         = score
// //     attempt.correctAnswers = correct
// //     attempt.totalQuestions = total
// //     attempt.answers       = answers
// //     attempt.tabSwitchCount = tabSwitchCount
// //     await attempt.save()

// //     // Update ContestParticipant
// //     if (attempt.contest) {
// //       await ContestParticipant.findOneAndUpdate(
// //         { contest: attempt.contest, user: req.user._id },
// //         { score, submittedAt: new Date(), correctAnswers: correct, totalQuestions: total, timeTaken, accuracy },
// //       )
// //     }

// //     // FIX: Replace N+1 sequential queries with bulkWrite
// //     const now       = new Date()
// //     const dayKey    = now.toISOString().slice(0, 10)
// //     const weekNum   = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
// //     const weekKey   = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
// //     const monthKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

// //     const lbOps = [
// //       ...(attempt.contest ? [{ period: 'contest', periodKey: attempt.contest.toString(), contest: attempt.contest }] : []),
// //       { period: 'daily',   periodKey: dayKey },
// //       { period: 'weekly',  periodKey: weekKey },
// //       { period: 'monthly', periodKey: monthKey },
// //       { period: 'alltime', periodKey: 'all' },
// //     ].map(entry => ({
// //       updateOne: {
// //         filter: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
// //         update: {
// //           $max: { score },
// //           $set: { accuracy, timeTaken, correctAnswers: correct, totalQuestions: total, ...(entry.contest && { contest: entry.contest }) },
// //           $setOnInsert: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
// //         },
// //         upsert: true,
// //       },
// //     }))

// //     await Leaderboard.bulkWrite(lbOps)

// //     // Update user stats
// //     const user = await User.findById(req.user._id)
// //     const isFirstContest = user.totalContestsJoined === 0 && attempt.contest
// //     user.totalQuizzesPlayed += 1
// //     user.totalScore         += score
// //     user.totalCorrect       += correct
// //     user.totalQuestions     += total
// //     user.xp                 += Math.round(score / 10)
// //     user.syncLevel()
// //     await user.save()

// //     if (isFirstContest) processReferralReward(req.user._id).catch(() => {})

// //     const newAchievements = await checkAchievements(user)

// //     if (attempt.contest && req.app.locals.socket) {
// //       req.app.locals.socket.emitLeaderboardUpdate(attempt.contest.toString())
// //     }

// //     res.json({
// //       success: true,
// //       result:  { score, correct, wrong: total - correct, total, accuracy, timeTaken, details },
// //       newAchievements,
// //     })
// //   } catch (err) { next(err) }
// // }

// // // GET /attempts/contest/:contestId
// // exports.getAttemptStatus = async (req, res, next) => {
// //   try {
// //     const attempt = await QuizAttempt.findOne({
// //       user:    req.user._id,
// //       contest: req.params.contestId,
// //     }).select('status score submittedAt startTime endTime')
// //     res.json({ success: true, attempt })
// //   } catch (err) { next(err) }
// // }





// const QuizAttempt         = require('../models/QuizAttempt')
// const ContestParticipant  = require('../models/ContestParticipant')
// const Contest             = require('../models/Contest')
// const Quiz                = require('../models/Quiz')
// const User                = require('../models/User')
// const Leaderboard         = require('../models/Leaderboard')
// const { checkAchievements }   = require('../services/achievementService')
// const { processReferralReward } = require('../services/referralService')
// const { recordTabSwitch, checkFastSubmission } = require('../middleware/antiCheat')

// // POST /attempts/start — creates server-side timer
// exports.startAttempt = async (req, res, next) => {
//   try {
//     const { contestId }       = req.body
//     const ipAddress           = req.ip || req.headers['x-forwarded-for']
//     const deviceFingerprint   = req.headers['x-device-fingerprint'] || ''

//     const participant = await ContestParticipant.findOne({ contest: contestId, user: req.user._id })
//     if (!participant) {
//       return res.status(403).json({ success: false, message: 'You have not joined this contest' })
//     }

//     // Handle page refresh — return existing attempt
//     const existingAttempt = await QuizAttempt.findOne({ user: req.user._id, contest: contestId })
//     if (existingAttempt) {
//       if (existingAttempt.status === 'SUBMITTED') {
//         return res.status(400).json({ success: false, message: 'You have already submitted this quiz' })
//       }
//       const contest = await Contest.findById(contestId).populate('quiz')
//       const quizData = contest.quiz.toObject()
//       quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)
//       return res.json({ success: true, attempt: existingAttempt, quiz: quizData, serverTime: new Date() })
//     }

//     const contest = await Contest.findById(contestId).populate('quiz')
//     if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })
//     if (!['LIVE', 'live'].includes(contest.status)) {
//       return res.status(400).json({ success: false, message: 'Contest is not live' })
//     }

//     const timeLimit = contest.quiz.timeLimit || 600
//     const endTime   = new Date(Date.now() + timeLimit * 1000)

//     const attempt = await QuizAttempt.create({
//       user: req.user._id, quiz: contest.quiz._id, contest: contestId,
//       endTime, ipAddress, deviceFingerprint,
//       userAgent: req.headers['user-agent'],
//       status: 'STARTED',
//     })

//     const quizData = contest.quiz.toObject()
//     quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)

//     res.json({
//       success: true,
//       attempt: { _id: attempt._id, startTime: attempt.startTime, endTime: attempt.endTime },
//       quiz: quizData,
//       serverTime: new Date(),
//     })
//   } catch (err) { next(err) }
// }

// // POST /attempts/:id/submit
// exports.submitAttempt = async (req, res, next) => {
//   try {
//     const { answers = {}, tabSwitchCount = 0 } = req.body
//     const attempt = await QuizAttempt.findById(req.params.id)

//     if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
//     if (attempt.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' })
//     }
//     if (attempt.status === 'SUBMITTED') {
//       return res.status(400).json({ success: false, message: 'Already submitted' })
//     }
//     if (attempt.status === 'EXPIRED') {
//       return res.status(400).json({ success: false, message: 'This attempt already expired and cannot be resubmitted' })
//     }

//     // Grace period absorbs normal network/request latency only — NOT extra thinking time.
//     // attempt.endTime was computed server-side at attempts/start (Date.now() + timeLimit),
//     // so this is the one deadline that can never be manipulated from the client.
//     const GRACE_PERIOD_MS = 5000
//     const now       = new Date()
//     const isExpired = now.getTime() > attempt.endTime.getTime() + GRACE_PERIOD_MS

//     if (isExpired) {
//       attempt.status      = 'EXPIRED'
//       attempt.submittedAt = now
//       attempt.answers     = answers // keep for audit/dispute purposes, but score stays 0
//       await attempt.save()

//       if (attempt.contest) {
//         await ContestParticipant.findOneAndUpdate(
//           { contest: attempt.contest, user: req.user._id },
//           { score: 0, submittedAt: now, correctAnswers: 0, totalQuestions: 0, timeTaken: Math.round((now - attempt.startTime) / 1000), accuracy: 0 },
//         )
//       }

//       return res.status(400).json({
//         success: false,
//         message: 'Time is up — this attempt expired before it was submitted, so it was scored as 0.',
//         expired: true,
//       })
//     }

//     const quiz      = await Quiz.findById(attempt.quiz)
//     const questions = quiz.questions

//     // Clamp to the actual allowed duration so a late-but-within-grace submission
//     // can't claim extra time bonus for time it wasn't entitled to.
//     const rawTimeTaken = Math.round((now.getTime() - attempt.startTime.getTime()) / 1000)
//     const timeTaken     = Math.min(rawTimeTaken, quiz.timeLimit)

//     // Anti-cheat (fire and forget)
//     if (tabSwitchCount > 0) recordTabSwitch(req.user._id, attempt.contest, tabSwitchCount).catch(() => {})
//     checkFastSubmission(req.user._id, attempt.contest, timeTaken, quiz.timeLimit).catch(() => {})

//     // Server-side scoring — correct answers never trusted from client.
//     // Each question's own `points`/`negativeMarks` are honored here (previously
//     // every question was scored as an equal 1/total share and negativeMarks
//     // was ignored entirely, so an admin's per-question point values and
//     // negative-marking settings had no actual effect on the result).
//     let correct  = 0
//     let rawScore = 0
//     const details = questions.map(q => {
//       const chosen     = answers[q._id.toString()] ?? null
//       const isCorrect  = chosen === q.correctIndex
//       const isAttempted = chosen !== null && chosen !== undefined
//       if (isCorrect) {
//         correct++
//         rawScore += (q.points ?? 10)
//       } else if (isAttempted) {
//         rawScore -= (q.negativeMarks ?? 0)
//       }
//       return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex, explanation: q.explanation }
//     })

//     const total       = questions.length
//     const maxRawScore = questions.reduce((sum, q) => sum + (q.points ?? 10), 0) || 1
//     const timeBonus   = Math.max(0, Math.round(((quiz.timeLimit - timeTaken) / quiz.timeLimit) * 200))
//     // Normalize raw points to the existing 0–1000 scale so leaderboards across
//     // quizzes with different point totals stay comparable, then clamp at 0 —
//     // a bad negative-marking run shouldn't produce a negative leaderboard score.
//     const score     = Math.max(0, Math.round((rawScore / maxRawScore) * 1000)) + timeBonus
//     const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0

//     attempt.status        = 'SUBMITTED'
//     attempt.submittedAt   = new Date()
//     attempt.score         = score
//     attempt.correctAnswers = correct
//     attempt.totalQuestions = total
//     attempt.answers       = answers
//     attempt.tabSwitchCount = tabSwitchCount
//     await attempt.save()

//     // Update ContestParticipant
//     if (attempt.contest) {
//       await ContestParticipant.findOneAndUpdate(
//         { contest: attempt.contest, user: req.user._id },
//         { score, submittedAt: new Date(), correctAnswers: correct, totalQuestions: total, timeTaken, accuracy },
//       )
//     }

//     // FIX: Replace N+1 sequential queries with bulkWrite
//     const dayKey    = now.toISOString().slice(0, 10)
//     const weekNum   = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
//     const weekKey   = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
//     const monthKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

//     const lbOps = [
//       ...(attempt.contest ? [{ period: 'contest', periodKey: attempt.contest.toString(), contest: attempt.contest }] : []),
//       { period: 'daily',   periodKey: dayKey },
//       { period: 'weekly',  periodKey: weekKey },
//       { period: 'monthly', periodKey: monthKey },
//       { period: 'alltime', periodKey: 'all' },
//     ].map(entry => ({
//       updateOne: {
//         filter: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
//         update: {
//           $max: { score },
//           $set: { accuracy, timeTaken, correctAnswers: correct, totalQuestions: total, ...(entry.contest && { contest: entry.contest }) },
//           $setOnInsert: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
//         },
//         upsert: true,
//       },
//     }))

//     await Leaderboard.bulkWrite(lbOps)

//     // Update user stats
//     const user = await User.findById(req.user._id)
//     const isFirstContest = user.totalContestsJoined === 0 && attempt.contest
//     user.totalQuizzesPlayed += 1
//     user.totalScore         += score
//     user.totalCorrect       += correct
//     user.totalQuestions     += total
//     user.xp                 += Math.round(score / 10)
//     user.syncLevel()
//     await user.save()

//     if (isFirstContest) processReferralReward(req.user._id).catch(() => {})

//     const newAchievements = await checkAchievements(user)

//     if (attempt.contest && req.app.locals.socket) {
//       req.app.locals.socket.emitLeaderboardUpdate(attempt.contest.toString())
//     }

//     res.json({
//       success: true,
//       result:  { score, correct, wrong: total - correct, total, accuracy, timeTaken, details },
//       newAchievements,
//     })
//   } catch (err) { next(err) }
// }

// // GET /attempts/contest/:contestId
// exports.getAttemptStatus = async (req, res, next) => {
//   try {
//     const attempt = await QuizAttempt.findOne({
//       user:    req.user._id,
//       contest: req.params.contestId,
//     }).select('status score submittedAt startTime endTime')
//     res.json({ success: true, attempt })
//   } catch (err) { next(err) }
// }




const QuizAttempt         = require('../models/QuizAttempt')
const ContestParticipant  = require('../models/ContestParticipant')
const Contest             = require('../models/Contest')
const Quiz                = require('../models/Quiz')
const User                = require('../models/User')
const Leaderboard         = require('../models/Leaderboard')
const { checkAchievements }   = require('../services/achievementService')
const { processReferralReward } = require('../services/referralService')
const { recordTabSwitch, checkFastSubmission } = require('../middleware/antiCheat')

// POST /attempts/start — creates server-side timer
exports.startAttempt = async (req, res, next) => {
  try {
    const { contestId }       = req.body
    const ipAddress           = req.ip || req.headers['x-forwarded-for']
    const deviceFingerprint   = req.headers['x-device-fingerprint'] || ''

    const participant = await ContestParticipant.findOne({ contest: contestId, user: req.user._id })
    if (!participant) {
      return res.status(403).json({ success: false, message: 'You have not joined this contest' })
    }

    // Handle page refresh — return existing attempt
    const existingAttempt = await QuizAttempt.findOne({ user: req.user._id, contest: contestId })
    if (existingAttempt) {
      if (existingAttempt.status === 'SUBMITTED') {
        return res.status(400).json({ success: false, message: 'You have already submitted this quiz' })
      }
      const contest = await Contest.findById(contestId).populate('quiz')
      const quizData = contest.quiz.toObject()
      quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)
      return res.json({ success: true, attempt: existingAttempt, quiz: quizData, serverTime: new Date() })
    }

    const contest = await Contest.findById(contestId).populate('quiz')
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' })
    if (!['LIVE', 'live'].includes(contest.status)) {
      return res.status(400).json({ success: false, message: 'Contest is not live' })
    }

    const timeLimit = contest.quiz.timeLimit || 600
    const endTime   = new Date(Date.now() + timeLimit * 1000)

    const attempt = await QuizAttempt.create({
      user: req.user._id, quiz: contest.quiz._id, contest: contestId,
      endTime, ipAddress, deviceFingerprint,
      userAgent: req.headers['user-agent'],
      status: 'STARTED',
    })

    const quizData = contest.quiz.toObject()
    quizData.questions = quizData.questions.map(({ correctIndex, explanation, ...safe }) => safe)

    res.json({
      success: true,
      attempt: { _id: attempt._id, startTime: attempt.startTime, endTime: attempt.endTime },
      quiz: quizData,
      serverTime: new Date(),
    })
  } catch (err) { next(err) }
}

// POST /attempts/:id/submit
exports.submitAttempt = async (req, res, next) => {
  try {
    const { answers = {}, tabSwitchCount = 0 } = req.body
    const attempt = await QuizAttempt.findById(req.params.id)

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    if (attempt.status === 'SUBMITTED') {
      return res.status(400).json({ success: false, message: 'Already submitted' })
    }
    if (attempt.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'This attempt already expired and cannot be resubmitted' })
    }

    // Grace period absorbs normal network/request latency only — NOT extra thinking time.
    // attempt.endTime was computed server-side at attempts/start (Date.now() + timeLimit),
    // so this is the one deadline that can never be manipulated from the client.
    const GRACE_PERIOD_MS = 5000
    const now       = new Date()
    const isExpired = now.getTime() > attempt.endTime.getTime() + GRACE_PERIOD_MS

    if (isExpired) {
      attempt.status      = 'EXPIRED'
      attempt.submittedAt = now
      attempt.answers     = answers // keep for audit/dispute purposes, but score stays 0
      await attempt.save()

      if (attempt.contest) {
        await ContestParticipant.findOneAndUpdate(
          { contest: attempt.contest, user: req.user._id },
          { score: 0, submittedAt: now, correctAnswers: 0, totalQuestions: 0, timeTaken: Math.round((now - attempt.startTime) / 1000), accuracy: 0 },
        )
      }

      return res.status(400).json({
        success: false,
        message: 'Time is up — this attempt expired before it was submitted, so it was scored as 0.',
        expired: true,
      })
    }

    const quiz      = await Quiz.findById(attempt.quiz)
    const questions = quiz.questions

    // Clamp to the actual allowed duration so a late-but-within-grace submission
    // can't claim extra time bonus for time it wasn't entitled to.
    const rawTimeTaken = Math.round((now.getTime() - attempt.startTime.getTime()) / 1000)
    const timeTaken     = Math.min(rawTimeTaken, quiz.timeLimit)

    // Anti-cheat (fire and forget)
    if (tabSwitchCount > 0) recordTabSwitch(req.user._id, attempt.contest, tabSwitchCount).catch(() => {})
    checkFastSubmission(req.user._id, attempt.contest, timeTaken, quiz.timeLimit).catch(() => {})

    // Server-side scoring — correct answers never trusted from client.
    // Each question's own `points`/`negativeMarks` are honored here (previously
    // every question was scored as an equal 1/total share and negativeMarks
    // was ignored entirely, so an admin's per-question point values and
    // negative-marking settings had no actual effect on the result).
    let correct  = 0
    let rawScore = 0
    const details = questions.map(q => {
      const chosen     = answers[q._id.toString()] ?? null
      const isCorrect  = chosen === q.correctIndex
      const isAttempted = chosen !== null && chosen !== undefined
      if (isCorrect) {
        correct++
        rawScore += (q.points ?? 10)
      } else if (isAttempted) {
        rawScore -= (q.negativeMarks ?? 0)
      }
      return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex, explanation: q.explanation }
    })

    const total       = questions.length
    const maxRawScore = questions.reduce((sum, q) => sum + (q.points ?? 10), 0) || 1
    const timeBonus   = Math.max(0, Math.round(((quiz.timeLimit - timeTaken) / quiz.timeLimit) * 200))
    // Normalize raw points to the existing 0–1000 scale so leaderboards across
    // quizzes with different point totals stay comparable, then clamp at 0 —
    // a bad negative-marking run shouldn't produce a negative leaderboard score.
    const score     = Math.max(0, Math.round((rawScore / maxRawScore) * 1000)) + timeBonus
    const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0

    attempt.status        = 'SUBMITTED'
    attempt.submittedAt   = new Date()
    attempt.score         = score
    attempt.correctAnswers = correct
    attempt.totalQuestions = total
    attempt.answers       = answers
    attempt.tabSwitchCount = tabSwitchCount
    await attempt.save()

    // Update ContestParticipant
    if (attempt.contest) {
      await ContestParticipant.findOneAndUpdate(
        { contest: attempt.contest, user: req.user._id },
        { score, submittedAt: new Date(), correctAnswers: correct, totalQuestions: total, timeTaken, accuracy },
      )
    }

    // FIX: Replace N+1 sequential queries with bulkWrite
    const dayKey    = now.toISOString().slice(0, 10)
    const weekNum   = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
    const weekKey   = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
    const monthKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const lbOps = [
      ...(attempt.contest ? [{ period: 'contest', periodKey: attempt.contest.toString(), contest: attempt.contest }] : []),
      { period: 'daily',   periodKey: dayKey },
      { period: 'weekly',  periodKey: weekKey },
      { period: 'monthly', periodKey: monthKey },
      { period: 'alltime', periodKey: 'all' },
    ].map(entry => ({
      updateOne: {
        filter: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
        update: {
          $max: { score },
          $set: { accuracy, timeTaken, correctAnswers: correct, totalQuestions: total, ...(entry.contest && { contest: entry.contest }) },
          $setOnInsert: { user: req.user._id, period: entry.period, periodKey: entry.periodKey },
        },
        upsert: true,
      },
    }))

    await Leaderboard.bulkWrite(lbOps)

    // Update user stats
    const user = await User.findById(req.user._id)
    const isFirstContest = user.totalContestsJoined === 0 && attempt.contest
    user.totalQuizzesPlayed += 1
    user.totalScore         += score
    user.totalCorrect       += correct
    user.totalQuestions     += total
    user.xp                 += Math.round(score / 10)
    user.syncLevel()
    await user.save()

    if (isFirstContest) processReferralReward(req.user._id).catch(() => {})

    const newAchievements = await checkAchievements(user)

    if (attempt.contest && req.app.locals.socket) {
      req.app.locals.socket.emitLeaderboardUpdate(attempt.contest.toString())
    }

    res.json({
      success: true,
      result:  { score, correct, wrong: total - correct, total, accuracy, timeTaken, details },
      newAchievements,
    })
  } catch (err) { next(err) }
}

// GET /attempts/contest/:contestId
exports.getAttemptStatus = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      user:    req.user._id,
      contest: req.params.contestId,
    }).select('status score submittedAt startTime endTime')
    res.json({ success: true, attempt })
  } catch (err) { next(err) }
}