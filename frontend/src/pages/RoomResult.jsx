import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiAward, FiTarget, FiClock } from 'react-icons/fi'
import { roomAPI } from '../services/api'

export default function RoomResult() {
  const { code } = useParams()
  const [result, setResult] = useState(null)
  const [roomInfo, setRoomInfo] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([roomAPI.getMyResult(code), roomAPI.getLeaderboard(code)]).then(([mine, lb]) => {
      if (mine.status === 'fulfilled') {
        setResult(mine.value.data.result)
        setRoomInfo(mine.value.data.room)
      } else {
        setError(mine.reason?.response?.data?.message || 'No result found for you in this room')
      }
      if (lb.status === 'fulfilled') setLeaderboard(lb.value.data.leaderboard)
    }).finally(() => setLoading(false))
  }, [code])

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading results…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {roomInfo && <p className="text-sm text-muted mb-1">{roomInfo.title}</p>}
      <h1 className="text-2xl font-black text-fg mb-6">Contest Results</h1>

      {result ? (
        <>
          <div className="qa-card p-6 text-center mb-6">
            <p className="text-[11px] uppercase tracking-widest text-soft mb-1">Your Rank</p>
            <p className="text-4xl font-black prize-text mb-3">#{result.rank || '—'}</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-bold text-fg text-lg">{result.score}</p>
                <p className="text-[10px] text-soft uppercase">Score</p>
              </div>
              <div>
                <p className="font-bold text-fg text-lg">{result.accuracy}%</p>
                <p className="text-[10px] text-soft uppercase">Accuracy</p>
              </div>
              <div>
                <p className="font-bold text-fg text-lg">{result.correctAnswers}/{result.totalQuestions}</p>
                <p className="text-[10px] text-soft uppercase">Correct</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="qa-card p-3">
              <FiAward className="w-4 h-4 mx-auto mb-1 text-brand-500" />
              <p className="text-sm font-bold text-fg">{result.correctAnswers}</p>
              <p className="text-[10px] text-soft">Correct</p>
            </div>
            <div className="qa-card p-3">
              <FiTarget className="w-4 h-4 mx-auto mb-1 text-coral-500" />
              <p className="text-sm font-bold text-fg">{result.wrongAnswers}</p>
              <p className="text-[10px] text-soft">Wrong</p>
            </div>
            <div className="qa-card p-3">
              <FiClock className="w-4 h-4 mx-auto mb-1 text-soft" />
              <p className="text-sm font-bold text-fg">{Math.round((result.timeTakenMs || 0) / 1000)}s</p>
              <p className="text-[10px] text-soft">Time</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted mb-6">{error}</p>
      )}

      {leaderboard.length > 0 && (
        <div className="qa-card p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft mb-3">Leaderboard</p>
          <div className="space-y-2">
            {leaderboard.map(p => (
              <div key={p.rank} className="flex items-center justify-between text-sm">
                <span className="text-fg font-medium">#{p.rank} {p.user?.name || 'Player'}</span>
                <span className="font-bold text-brand-500">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/rooms" className="btn-secondary w-full text-center block">Back to Rooms</Link>
    </div>
  )
}
