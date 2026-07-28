import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineUsers, HiOutlineClock, HiOutlineShieldCheck, HiOutlineTrendingUp } from 'react-icons/hi'
import { contestAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ContestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  // useQuiz not needed - QuizPlay handles quiz loading
  const [contest, setContest]     = useState(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading]     = useState(true)
  const [joining, setJoining]     = useState(false)
  const [error, setError]         = useState('')
  const [tab, setTab]             = useState('overview')

  useEffect(() => {
    Promise.all([contestAPI.getOne(id), contestAPI.getLeaderboard(id)])
      .then(([cr, lr]) => {
        setContest(cr.data.contest)
        setHasJoined(cr.data.hasJoined)
        setLeaderboard(lr.data.leaderboard || [])
      })
      .catch(() => setError('Contest not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return }
    setJoining(true); setError('')
    try {
      await contestAPI.join(id)
      setHasJoined(true)
      await refreshUser()
      setContest(p => ({ ...p, currentParticipants: p.currentParticipants + 1 }))
      if (isUpcoming) navigate(`/contests/${id}/countdown`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join')
    } finally { setJoining(false) }
  }

  const handleStartQuiz = () => {
    // QuizPlay.jsx fetches the quiz itself via the attempt API
    // Just navigate to the contest quiz page
    navigate(`/quiz/${contest._id}`)
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!contest) return <div className="min-h-screen flex items-center justify-center text-gray-500">{error || 'Contest not found'}</div>

  const isLive     = ['LIVE','live'].includes(contest.status)
  const isUpcoming = ['UPCOMING','upcoming'].includes(contest.status)
  const isDone     = ['COMPLETED','completed'].includes(contest.status)
  const isFull     = contest.currentParticipants >= contest.maxParticipants
  const fillPct    = Math.min(100, (contest.currentParticipants / contest.maxParticipants) * 100)

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1f0a 0%, #052e16 100%)', borderBottom: '1px solid #22c55e20' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(34,197,94,0.15),_transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {isLive && <span className="badge-live"><span className="live-dot" />LIVE</span>}
                {isUpcoming && <span className="badge-upcoming">⏰ UPCOMING</span>}
                {isDone && <span className="badge-completed">✓ ENDED</span>}
                <span className="text-xs text-gray-400 capitalize px-2 py-0.5 bg-black/30 rounded-full border border-white/10">{contest.category}</span>
                {contest.isFeatured && <span className="text-xs text-[#facc15] font-bold">⭐ FEATURED</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{contest.title}</h1>
              {contest.description && <p className="text-gray-400 max-w-lg">{contest.description}</p>}
            </div>

            {/* Action box */}
            <div className="bg-black/40 border border-[#22c55e]/20 rounded-2xl p-5 w-full sm:w-72 shrink-0">
              <div className="text-center mb-5">
                <p className="text-xs text-gray-500 mb-1">PRIZE POOL</p>
                <p className="text-4xl font-black prize-text">🪙{(contest.prizePool || 0).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="text-center bg-black/30 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Entry</p>
                  <p className="font-black text-white">{contest.entryFee === 0 ? <span className="text-[#22c55e]">FREE</span> : `🪙${contest.entryFee}`}</p>
                </div>
                <div className="text-center bg-black/30 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Players</p>
                  <p className="font-black text-white">{contest.currentParticipants}/{contest.maxParticipants}</p>
                </div>
              </div>

              {/* Fill bar */}
              <div className="mb-5">
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-[#22c55e]'}`} style={{ width: `${fillPct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 text-center">
                  {isFull ? '🔴 Contest Full' : `${contest.maxParticipants - contest.currentParticipants} spots remaining`}
                </p>
              </div>

              {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

              {!isDone && (
                hasJoined ? (
                  isLive ? (
                    <button onClick={handleStartQuiz} className="btn-green w-full text-base py-3">
                      ⚡ Play Now
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/contests/${id}/countdown`)}
                      className="w-full text-center py-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] font-bold text-sm hover:bg-[#22c55e]/20 transition">
                      ✅ Joined — View Countdown
                    </button>
                  )
                ) : (
                  <button onClick={handleJoin} disabled={joining || isFull || (!isLive && !isUpcoming)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      isFull ? 'bg-[#1e1e1e] text-gray-500 cursor-not-allowed' : 'btn-green'
                    }`}>
                    {joining ? 'Joining...' : isFull ? 'Contest Full' : `Join Contest${contest.entryFee > 0 ? ` — 🪙${contest.entryFee}` : ' — FREE'}`}
                  </button>
                )
              )}
              {isDone && hasJoined && (
                <button onClick={() => setTab('leaderboard')} className="btn-outline w-full py-3">
                  View My Rank
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d]/80 sticky top-[57px] z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {['overview', 'prizes', 'leaderboard', 'rules'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-bold capitalize border-b-2 transition-all ${
                  tab === t ? 'border-[#22c55e] text-[#22c55e]' : 'border-transparent text-gray-500 hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="d11-card p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><HiOutlineClock className="text-[#22c55e]" /> Schedule</h3>
              <div className="space-y-3">
                {[
                  { label: 'Start Time', value: new Date(contest.startTime).toLocaleString('en-IN') },
                  { label: 'End Time',   value: new Date(contest.endTime).toLocaleString('en-IN') },
                  { label: 'Status',     value: contest.status },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-sm text-gray-500">{r.label}</span>
                    <span className="text-sm font-semibold text-white capitalize">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="d11-card p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><HiOutlineTrendingUp className="text-[#22c55e]" /> Quiz Info</h3>
              <div className="space-y-3">
                {[
                  { label: 'Questions',   value: contest.quiz?.totalQuestions || '—' },
                  { label: 'Time Limit',  value: contest.quiz?.timeLimit ? `${contest.quiz.timeLimit}s` : '—' },
                  { label: 'Category',    value: contest.category },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-sm text-gray-500">{r.label}</span>
                    <span className="text-sm font-semibold text-white capitalize">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRIZES */}
        {tab === 'prizes' && (
          <div className="max-w-md">
            <h3 className="font-bold text-white mb-4">Prize Breakdown</h3>
            <div className="space-y-3">
              {(contest.prizeBreakdown || []).map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${
                  i === 0 ? 'bg-[#facc15]/10 border border-[#facc15]/30' :
                  i === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                  i === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                  'd11-card'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${p.rank}`}</span>
                    <span className="font-semibold text-white">{p.label}</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${i === 0 ? 'prize-text' : 'text-white'}`}>🪙{(p.coins || 0).toLocaleString()}</p>
                    {p.percentage && <p className="text-xs text-gray-500">{p.percentage}% of pool</p>}
                  </div>
                </div>
              ))}
              {(!contest.prizeBreakdown || contest.prizeBreakdown.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-8">Prize breakdown will be available soon.</p>
              )}
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {tab === 'leaderboard' && (
          <div>
            <h3 className="font-bold text-white mb-4">
              {isDone ? 'Final Rankings' : 'Live Leaderboard'}
            </h3>
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No submissions yet. Be the first!</p>
              </div>
            ) : (
              <div className="d11-card overflow-hidden">
                {leaderboard.map((entry, i) => (
                  <div key={entry.user?._id || i}
                    className={`flex items-center gap-4 px-5 py-3.5 ${i < leaderboard.length - 1 ? 'border-b border-[#1e1e1e]' : ''} ${
                      entry.user?._id === user?._id ? 'bg-[#22c55e]/5 border-l-2 border-l-[#22c55e]' : 'hover:bg-white/2'
                    } transition`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                      i === 0 ? 'bg-[#facc15] text-black' :
                      i === 1 ? 'bg-gray-400 text-black' :
                      i === 2 ? 'bg-orange-600 text-white' :
                      'bg-[#2a2a2a] text-gray-400'
                    }`}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                    </div>
                    <img src={entry.user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${entry.user?.name}`}
                      className="w-9 h-9 rounded-full border border-[#2a2a2a] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {entry.user?.name || 'Player'}
                        {entry.user?._id === user?._id && <span className="ml-2 text-[10px] text-[#22c55e]">YOU</span>}
                      </p>
                      <p className="text-xs text-gray-500">Accuracy: {entry.accuracy || 0}%</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-[#22c55e]">{(entry.score || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RULES */}
        {tab === 'rules' && (
          <div className="max-w-lg d11-card p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><HiOutlineShieldCheck className="text-[#22c55e]" /> Contest Rules</h3>
            <ul className="space-y-3">
              {(contest.rules?.length > 0 ? contest.rules : [
                'Answer all questions within the time limit',
                'Higher score + faster submission = better rank',
                'No external aids or internet lookup allowed',
                'Tab switching is monitored and penalized',
                'One attempt per user per contest',
                'Prizes distributed within 24 hours of contest end',
              ]).map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}