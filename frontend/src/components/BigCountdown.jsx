import { useState, useEffect, useRef } from 'react'
import { syncServerTime, getSyncedNow } from '../utils/serverTime'

const pad = (n) => String(Math.max(0, n)).padStart(2, '0')

const splitTime = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

/**
 * Full-screen-style big countdown display.
 *
 * - Ticks down to `targetTime` every second, using server-synced time (see
 *   utils/serverTime.js) rather than the device's raw clock — a wrong
 *   device clock would otherwise show the wrong countdown for that user
 *   specifically, independent of any network issue.
 * - Calls `onComplete` exactly once when it reaches zero (guarded with a ref
 *   so it never double-fires from a re-render).
 * - If `targetTime` is already in the past when mounted, calls `onComplete`
 *   almost immediately (after a short tick) instead of showing 00:00:00
 *   forever — handles the case where the user opens this screen late.
 */
export default function BigCountdown({ targetTime, label, sublabel, onComplete, accentColor = '#22c55e' }) {
  const target = new Date(targetTime).getTime()
  const [now, setNow] = useState(getSyncedNow())
  const firedRef = useRef(false)

  useEffect(() => {
    syncServerTime().then(() => setNow(getSyncedNow()))
    // Re-sync periodically — a long countdown (e.g. waiting for a 30-minute
    // contest to end) shouldn't drift if the device clock's rate is slightly
    // off, and this also self-heals if the very first sync attempt failed.
    const resync = setInterval(() => syncServerTime(), 5 * 60 * 1000)
    const tick = setInterval(() => setNow(getSyncedNow()), 1000)
    return () => { clearInterval(tick); clearInterval(resync) }
  }, [])

  useEffect(() => {
    if (now >= target && !firedRef.current) {
      firedRef.current = true
      onComplete?.()
    }
  }, [now, target, onComplete])

  const remaining = target - now
  const { days, hours, minutes, seconds } = splitTime(remaining)
  const units = [
    ...(days > 0 ? [{ label: 'DAYS', value: days }] : []),
    { label: 'HRS', value: hours },
    { label: 'MIN', value: minutes },
    { label: 'SEC', value: seconds },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4 text-center">
      {label && <p className="text-gray-400 text-sm sm:text-base uppercase tracking-widest mb-2">{label}</p>}
      {sublabel && <p className="text-white text-lg sm:text-xl font-bold mb-8">{sublabel}</p>}

      <div className="flex items-center gap-3 sm:gap-6">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center">
              <div
                className="text-5xl sm:text-7xl md:text-8xl font-black tabular-nums rounded-2xl px-4 py-3 sm:px-6 sm:py-4"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40`, color: accentColor }}
              >
                {pad(u.value)}
              </div>
              <span className="text-xs text-gray-500 mt-2 tracking-widest">{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-3xl sm:text-5xl font-black text-gray-700 -mt-6">:</span>
            )}
          </div>
        ))}
      </div>

      {remaining <= 0 && (
        <p className="mt-8 text-[#22c55e] font-bold animate-pulse">Starting now…</p>
      )}
    </div>
  )
}
