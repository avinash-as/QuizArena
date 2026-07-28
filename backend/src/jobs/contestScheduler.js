let cron = null
try { cron = require('node-cron') } catch (_) {
  console.warn('[Scheduler] node-cron not found. Run: npm install node-cron')
}

const initScheduler = (socket) => {
  if (!cron) return

  let socketHandler = socket

  cron.schedule('* * * * *', async () => {
    try {
      const Contest = require('../models/Contest')
      const { distributePrizes } = require('../services/prizeService')
      const Notification = require('../models/Notification')
      const now = new Date()

      // --- UPCOMING -> LIVE ---
      // Fetch candidates, then transition each one with an atomic guarded
      // update (status must still be UPCOMING). This matters a lot once you
      // run more than one server process: node-cron runs independently
      // *inside each process*, so every instance ticks this job on its own
      // schedule. Without the guard, N instances would all read the same
      // "going live" contest, all flip it to LIVE, and all send the
      // notification + socket emit — users would get the same "contest
      // started" push N times. With the guard, only the first instance to
      // reach findOneAndUpdate actually wins (the rest get null back and
      // skip silently), so exactly one notification/emit happens no matter
      // how many instances are running.
      const goingLiveCandidates = await Contest.find({ status: 'UPCOMING', startTime: { $lte: now } }).select('_id')
      for (const { _id } of goingLiveCandidates) {
        const contest = await Contest.findOneAndUpdate(
          { _id, status: 'UPCOMING' },
          { $set: { status: 'LIVE' } },
          { new: true }
        ).select('_id title participants')
        if (!contest) continue // another instance already won this transition

        console.log(`[Scheduler] LIVE: ${contest.title}`)
        if (socketHandler) socketHandler.emitContestStarted(contest._id.toString())
        if (contest.participants.length > 0) {
          await Notification.insertMany(contest.participants.map(uid => ({
            user: uid, title: '🟢 Contest Started!',
            message: `"${contest.title}" is now LIVE!`, type: 'contest', link: `/contests/${contest._id}`,
          }))).catch(() => {})
        }
      }

      // --- LIVE -> COMPLETED ---
      // Same atomic-guard pattern. distributePrizes() already has its own
      // independent idempotency guard (prizesDistributed flip is atomic),
      // so prize payouts were already safe under duplicate scheduler ticks
      // — but the notification/socket-emit spam here was not, until now.
      const goingCompleteCandidates = await Contest.find({ status: 'LIVE', endTime: { $lte: now } }).select('_id')
      for (const { _id } of goingCompleteCandidates) {
        const contest = await Contest.findOneAndUpdate(
          { _id, status: 'LIVE' },
          { $set: { status: 'COMPLETED' } },
          { new: true }
        ).select('_id title prizesDistributed participants')
        if (!contest) continue // another instance already won this transition

        console.log(`[Scheduler] COMPLETED: ${contest.title}`)
        if (socketHandler) socketHandler.emitContestEnded(contest._id.toString())
        if (!contest.prizesDistributed) {
          distributePrizes(contest._id).catch(e => console.error(`Prize distribution error: ${e.message}`))
        }
      }
    } catch (e) { console.error('[Scheduler]', e.message) }
  })

  // Countdown ticks are read-only broadcasts (no state mutation), so
  // duplicate emits from multiple instances are harmless — the client just
  // gets the same countdown number more than once, which is a no-op
  // visually. No atomic guard needed here.
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const Contest = require('../models/Contest')
      const soon = new Date(Date.now() + 5 * 60 * 1000)
      const upcoming = await Contest.find({ status: 'UPCOMING', startTime: { $lte: soon, $gte: new Date() } }).select('_id startTime')
      for (const contest of upcoming) {
        const sec = Math.round((contest.startTime - Date.now()) / 1000)
        if (socketHandler && sec > 0) socketHandler.emitCountdown(contest._id.toString(), sec)
      }
    } catch (_) {}
  })

  console.log('[Scheduler] Initialized')
}

module.exports = { initScheduler }
