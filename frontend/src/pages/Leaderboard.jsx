import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { leaderboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const PERIODS = [
  { key: 'daily',   label: 'Today'       },
  { key: 'weekly',  label: 'This Week'   },
  { key: 'monthly', label: 'This Month'  },
  { key: 'alltime', label: 'All Time'    },
]

export default function Leaderboard() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('alltime')
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    leaderboardAPI.get(period)
      .then(r => { setLeaderboard(r.data.leaderboard); setMyRank(r.data.myRank) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <span className="section-label mb-2 block">Rankings</span>
        <h1 className="text-4xl font-display font-extrabold text-white">Leaderboard</h1>
        {myRank && <p className="text-gray-400 mt-2">You're ranked <strong className="text-brand-500">#{myRank}</strong></p>}
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 justify-center mb-8 bg-[#111] p-1 rounded-xl">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p.key ? 'bg-white bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && leaderboard.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="font-display font-bold text-white mb-2">No entries yet</h3>
          <p className="text-gray-400">Be the first to play for this period!</p>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumIdx) => {
            const position = [2, 1, 3][podiumIdx]
            const heights = ['h-24', 'h-32', 'h-20']
            return (
              <motion.div
                key={entry.user?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <img
                  src={entry.user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${entry.user?.name}`}
                  className={`w-12 h-12 rounded-full ring-4 ${position === 1 ? 'ring-amber-400' : position === 2 ? 'ring-gray-400' : 'ring-orange-400'}`}
                  alt={entry.user?.name}
                />
                <div className="text-xs font-medium text-white text-center max-w-[70px] truncate">{entry.user?.name}</div>
                <div className={`w-20 rounded-t-xl flex items-center justify-center ${heights[podiumIdx]} ${
                  position === 1 ? 'bg-amber-400' : position === 2 ? 'bg-gray-400' : 'bg-orange-400'
                }`}>
                  <span className="text-white font-display font-extrabold">{['🥈','🥇','🥉'][podiumIdx]}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      {!loading && leaderboard.length > 0 && (
        <div className="d11-card overflow-hidden">
          {leaderboard.map((entry, i) => {
            const isMe = user && entry.user?._id === user._id
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 px-5 py-3.5 border-b last:border-0 border-gray-50 border-[#1e1e1e]/60 transition-colors ${
                  isMe ? 'bg-brand-50 dark:bg-brand-950/30' : 'hover:bg-[#222]/50'
                }`}
              >
                <div className="w-8 text-center font-display font-bold text-gray-400">
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                </div>
                <img
                  src={entry.user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${entry.user?.name}`}
                  className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900"
                  alt={entry.user?.name}
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-white'}`}>
                    {entry.user?.name} {isMe && '(You)'}
                  </div>
                  <div className="text-xs text-gray-400">Lv. {entry.user?.level || 1} • {entry.accuracy}% acc</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-brand-600 dark:text-brand-400">{entry.score?.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">pts</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
