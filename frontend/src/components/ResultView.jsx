import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiTarget, FiClock, FiZap, FiTrendingUp } from 'react-icons/fi'
import { HiArrowRight } from 'react-icons/hi'

/**
 * ResultView renders the animated score-reveal experience used by both
 * `/result` (practice / instant reveal) and `/contests/:id/submitted`
 * (contest end-of-window reveal). Kept as a pure presentational
 * component so both flows share exactly the same "wow" moment.
 */
export default function ResultView({ result, newAchievements = [], contestId, onLeaderboard, onMore }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  const { score, correct, wrong, total, accuracy, timeTaken, details = [] } = result
  const pct = total > 0 ? (correct / total) * 100 : 0

  const grade = pct >= 90 ? { label: 'Excellent!',      color: 'text-gold-500',   emoji: '🏆', bg: 'from-gold-500/25 to-transparent' }
              : pct >= 70 ? { label: 'Great Job!',       color: 'text-brand-500',  emoji: '🥇', bg: 'from-brand-500/25 to-transparent' }
              : pct >= 50 ? { label: 'Good Effort',      color: 'text-blue-400',   emoji: '🥈', bg: 'from-blue-500/25 to-transparent' }
              :             { label: 'Keep Practicing',  color: 'text-muted',      emoji: '📚', bg: 'from-accent-500/20 to-transparent' }

  return (
    <div className="min-h-screen bg-surface text-fg py-10 px-4 pb-24 lg:pb-10" data-testid="result-view">
      <div className="max-w-2xl mx-auto">
        {/* Hero score */}
        <div className={`qa-card overflow-hidden relative mb-6 bg-gradient-to-br ${grade.bg}`}>
          <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.06]" />
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-6xl mb-3"
            >
              {grade.emoji}
            </motion.div>
            <p className={`text-2xl font-black mb-1 ${grade.color}`}>{grade.label}</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
              className="text-7xl sm:text-8xl font-black text-fg my-4 tabular-nums leading-none"
              data-testid="result-score"
            >
              {score}
            </motion.p>
            <p className="text-muted text-sm">points earned</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: FiTarget,      label: 'Correct',  value: correct,          color: 'text-brand-500', bg: 'bg-brand-500/10 border-brand-500/25' },
            { icon: FiZap,         label: 'Wrong',    value: wrong,            color: 'text-coral-500', bg: 'bg-coral-500/10 border-coral-500/25' },
            { icon: FiAward,       label: 'Accuracy', value: `${accuracy}%`,   color: 'text-accent-500', bg: 'bg-accent-500/10 border-accent-500/25' },
            { icon: FiClock,       label: 'Time',     value: `${timeTaken}s`,  color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/25' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
              className="qa-card p-4 text-center"
              data-testid={`result-stat-${s.label.toLowerCase()}`}
            >
              <div className={`w-9 h-9 mx-auto mb-2 rounded-xl border ${s.bg} flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
              <p className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-soft uppercase tracking-widest font-mono mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Accuracy bar */}
        <div className="qa-card p-5 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Performance</span>
            <span className="text-fg font-semibold tabular-nums">{correct}/{total} correct</span>
          </div>
          <div className="h-2.5 bg-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-gold-500"
              initial={{ width: 0 }}
              animate={{ width: show ? `${accuracy}%` : '0%' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Achievements */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="qa-card p-5 mb-6 border-gold-500/25 bg-gradient-to-r from-gold-500/10 to-transparent"
          >
            <h3 className="font-bold text-gold-500 mb-3 flex items-center gap-2">🏅 New achievements unlocked!</h3>
            <div className="flex flex-wrap gap-2">
              {newAchievements.map(a => (
                <span key={a} className="badge-gold" data-testid="new-achievement">🏆 {a}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Review */}
        {details.length > 0 && (
          <div className="qa-card p-5 mb-6">
            <h3 className="font-bold mb-4">Answer review</h3>
            <div className="space-y-2">
              {details.slice(0, 8).map((d, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${d.correct ? 'bg-brand-500/5 border-brand-500/20' : 'bg-coral-500/5 border-coral-500/20'}`}
                >
                  <span className="text-lg mt-0.5">{d.correct ? '✅' : '❌'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg">Q{i + 1}</p>
                    {!d.correct && d.explanation && (
                      <p className="text-xs text-muted mt-1 leading-relaxed">{d.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {contestId && (
            <button onClick={onLeaderboard} data-testid="result-leaderboard-btn" className="btn-outline h-11 justify-center">
              <FiTrendingUp /> Leaderboard
            </button>
          )}
          <button onClick={onMore} data-testid="result-more-btn" className={`btn-green h-11 justify-center ${!contestId ? 'col-span-2' : ''}`}>
            More contests <HiArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}
