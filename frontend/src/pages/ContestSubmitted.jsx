import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiCheck, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi'
import { HiArrowRight, HiOutlineSparkles } from 'react-icons/hi'
import { contestAPI } from '../services/api'
import { useSocket } from '../context/SocketContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultView from '../components/ResultView'

// Shown immediately after a user submits their contest quiz. Because the
// contest may still be LIVE for other participants, we deliberately do NOT
// reveal the score/leaderboard until the contest ends — showing it early
// could let a submitter signal answers to those still playing (a real
// fairness/anti-cheat concern for a live-leaderboard contest).
//
// The screen has two phases:
//   1. WAITING  — animated countdown to contest.endTime, showing what will
//                 be revealed. Listens to `contest:ended` socket event so
//                 the reveal happens the instant the contest closes.
//   2. REVEAL   — full ResultView (same premium design used by /result).
export default function ContestSubmitted() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()      // { result, newAchievements } from QuizPlay
  const { socket } = useSocket()
  const [contest, setContest]  = useState(null)
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')
  const [now, setNow]          = useState(Date.now())
  const [revealed, setRevealed] = useState(false)
  const revealTimer = useRef(null)

  const load = useCallback(async () => {
    try {
      const { data } = await contestAPI.getOne(id)
      setContest(data.contest)
      if (['COMPLETED', 'completed'].includes(data.contest.status)) {
        setRevealed(true)
      }
    } catch (_) {
      setError('Could not load contest')
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  // Countdown tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // If a real result is in memory, auto-reveal the moment endTime passes.
  useEffect(() => {
    if (!contest || revealed) return
    const remain = new Date(contest.endTime).getTime() - Date.now()
    if (remain <= 0) { setRevealed(true); return }
    revealTimer.current = setTimeout(() => setRevealed(true), remain + 500)
    return () => clearTimeout(revealTimer.current)
  }, [contest, revealed])

  // Also flip to reveal on the socket "contest:ended" broadcast (immediate).
  useEffect(() => {
    if (!socket) return
    const onEnded = (payload) => {
      if (payload?.contestId === id) setRevealed(true)
    }
    socket.emit('contest:join', { contestId: id })
    socket.on('contest:ended', onEnded)
    return () => { socket.off('contest:ended', onEnded) }
  }, [socket, id])

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !contest) return (
    <div className="min-h-screen flex items-center justify-center text-muted">{error || 'Contest not found'}</div>
  )

  // === REVEAL PHASE — same premium ResultView the practice flow uses ===
  if (revealed && state?.result) {
    return (
      <div className="min-h-screen bg-surface pb-24 lg:pb-8">
        <ResultView
          result={state.result}
          newAchievements={state.newAchievements}
          contestId={id}
          onLeaderboard={() => navigate(`/contests/${id}`)}
          onMore={() => navigate('/contests')}
        />
      </div>
    )
  }
  // Revealed but state is gone (page refresh) — the contest page has the leaderboard.
  if (revealed) {
    navigate(`/contests/${id}`, { replace: true })
    return null
  }

  // === WAITING PHASE — countdown + "what to expect" ===
  const remainMs = Math.max(0, new Date(contest.endTime).getTime() - now)
  const totalMs  = Math.max(1, new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime())
  const elapsedPct = Math.min(100, Math.max(0, 100 - (remainMs / totalMs) * 100))
  const hh = Math.floor(remainMs / 3600000)
  const mm = Math.floor((remainMs % 3600000) / 60000)
  const ss = Math.floor((remainMs % 60000) / 1000)
  const fmt = n => String(n).padStart(2, '0')

  return (
    <div className="min-h-screen bg-surface text-fg py-10 px-4 pb-24 lg:pb-10" data-testid="contest-submitted-page">
      <div className="max-w-2xl mx-auto">
        {/* Submitted card */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="qa-card overflow-hidden relative mb-6"
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.22),_transparent_60%)]" />
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
              className="w-20 h-20 mx-auto rounded-full bg-brand-500 flex items-center justify-center mb-4 shadow-glow-brand"
            >
              <FiCheck className="w-11 h-11 text-white" strokeWidth={3.5} />
            </motion.div>
            <p className="section-label mb-2">Submitted</p>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Your quiz is locked in</h1>
            <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
              For fairness, results reveal when the contest ends and everyone has finished.
              Hang tight — you'll see your rank & winnings the moment the timer hits zero.
            </p>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="qa-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="section-label flex items-center gap-2"><FiClock className="w-3 h-3" /> Results reveal in</span>
            <span className="text-[11px] text-soft uppercase tracking-widest font-mono">{contest.title}</span>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4 my-6">
            {hh > 0 && (
              <>
                <TimeBlock v={fmt(hh)} label="Hours" />
                <span className="text-3xl sm:text-4xl font-black text-soft">:</span>
              </>
            )}
            <TimeBlock v={fmt(mm)} label="Minutes" />
            <span className="text-3xl sm:text-4xl font-black text-soft animate-pulse">:</span>
            <TimeBlock v={fmt(ss)} label="Seconds" pulse />
          </div>

          <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 via-brand-400 to-gold-500"
              animate={{ width: `${elapsedPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-soft uppercase tracking-widest font-mono mt-2">
            <span>started</span>
            <span>ends {new Date(contest.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </motion.div>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { icon: FiAward,       label: 'Your score',        color: 'brand'  },
            { icon: FiTrendingUp,  label: 'Your rank',         color: 'gold'   },
            { icon: FiUsers,       label: 'Prize breakdown',   color: 'accent' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="qa-card p-4 text-center"
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center border ${
                s.color === 'brand'  ? 'bg-brand-500/10 border-brand-500/25 text-brand-500' :
                s.color === 'gold'   ? 'bg-gold-500/10 border-gold-500/25 text-gold-500' :
                                        'bg-accent-500/10 border-accent-500/25 text-accent-500'
              }`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/contests/${id}`)}
            data-testid="submitted-view-contest"
            className="btn-outline h-11 justify-center"
          >
            View contest
          </button>
          <button
            onClick={() => navigate('/contests')}
            data-testid="submitted-more-contests"
            className="btn-green h-11 justify-center"
          >
            More contests <HiArrowRight />
          </button>
        </div>

        <p className="text-center text-xs text-soft mt-6 flex items-center justify-center gap-1.5">
          <HiOutlineSparkles className="w-3.5 h-3.5" /> Fair-play locked · anti-cheat active
        </p>
      </div>
    </div>
  )
}

function TimeBlock({ v, label, pulse }) {
  return (
    <div className="text-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={v}
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 18, opacity: 0 }}
          transition={{ duration: 0.24 }}
          className={`text-4xl sm:text-5xl font-black text-fg tabular-nums font-mono ${pulse ? 'text-brand-500' : ''}`}
        >
          {v}
        </motion.div>
      </AnimatePresence>
      <p className="text-[10px] text-soft uppercase tracking-widest font-mono mt-1">{label}</p>
    </div>
  )
}
