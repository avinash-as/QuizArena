import api from '../services/api'

// Tracks the offset between this device's clock and the server's clock, so
// countdown timers (contest start/end) stay correct even when a user's
// phone/laptop clock is wrong — which is more common than it sounds
// (unset auto-time-zone, manually-changed clocks, stale VMs, etc). Without
// this, a countdown computed purely from `Date.now()` would show the wrong
// remaining time for those users, independent of any network issue.
//
// Approach: hit GET /api/time, measure round-trip time, and estimate the
// server's clock position at the moment the response arrived (assuming
// roughly symmetric request/response latency — good enough for a countdown
// display, not attempting NTP-grade precision). Takes a few samples and
// keeps the one with the lowest round-trip time, since that sample has the
// least latency-driven error.

let offsetMs = 0        // serverTime - clientTime, in ms
let syncedOnce = false
let syncPromise = null

const sampleOnce = async () => {
  const t0 = Date.now()
  const { data } = await api.get('/time')
  const t1 = Date.now()
  const rtt = t1 - t0
  // Best single-point estimate of "server time when the response arrived":
  // reported server time (captured server-side roughly at t0+rtt/2) plus
  // half the round trip.
  const estimatedServerTimeAtT1 = data.serverTime + rtt / 2
  return { offset: estimatedServerTimeAtT1 - t1, rtt }
}

export const syncServerTime = (samples = 3) => {
  if (syncPromise) return syncPromise
  syncPromise = (async () => {
    try {
      const results = await Promise.all(
        Array.from({ length: samples }, () => sampleOnce().catch(() => null))
      )
      const valid = results.filter(Boolean)
      if (valid.length === 0) return offsetMs // keep previous/zero offset if all samples failed
      const best = valid.reduce((a, b) => (a.rtt < b.rtt ? a : b))
      offsetMs = best.offset
      syncedOnce = true
      return offsetMs
    } finally {
      syncPromise = null
    }
  })()
  return syncPromise
}

// Current time, corrected for the client/server clock offset. Falls back to
// plain Date.now() (offset 0) until the first sync completes — this still
// converges to correct once synced, and a countdown target is an absolute
// server timestamp regardless, so an uncorrected first second or two of
// display is a minor, self-correcting cosmetic issue, not a functional one.
export const getSyncedNow = () => Date.now() + offsetMs

export const isSynced = () => syncedOnce
