import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineLightningBolt, HiOutlineStar, HiOutlineChartBar, HiOutlineFire,
  HiOutlineBell, HiOutlineCheck,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { notificationAPI, walletAPI, contestAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [wallet, setWallet]               = useState(null)
  const [recentContests, setRecentContests] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    Promise.all([
      notificationAPI.getAll().catch(() => ({ data: { notifications: [] } })),
      walletAPI.get().catch(() => ({ data: { wallet: null } })),
      contestAPI.getAll({ status: 'LIVE', limit: 3 }).catch(() => ({ data: { contests: [] } })),
    ]).then(([nRes, wRes, cRes]) => {
      setNotifications(nRes.data.notifications || [])
      setWallet(wRes.data.wallet)
      setRecentContests(cRes.data.contests || [])
    }).finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationAPI.markAllRead().catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  if (loading) return <LoadingSpinner fullScreen />

  const xp = user?.xp || 0
  const level = user?.level || 1
  const xpInLevel = xp % 500
  const xpPct = Math.round((xpInLevel / 500) * 100)

  const stats = [
    { icon: <HiOutlineLightningBolt />, label: 'Quizzes',   value: user?.totalQuizzesPlayed || 0,             color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/20' },
    { icon: <HiOutlineStar />,          label: 'Wins',      value: user?.totalWins || 0,                       color: 'text-gold-500',   bg: 'bg-gold-500/10   border-gold-500/20' },
    { icon: <HiOutlineChartBar />,      label: 'Score',     value: (user?.totalScore || 0).toLocaleString(),  color: 'text-accent-500', bg: 'bg-accent-500/10 border-accent-500/20' },
    { icon: <HiOutlineFire />,          label: 'Streak',    value: `${user?.streak || 0}d`,                    color: 'text-coral-500',  bg: 'bg-coral-500/10  border-coral-500/25' },
  ]

  const unread = notifications.filter(n => !n.isRead)

  return (
    <div className="min-h-screen text-fg pb-24 lg:pb-8" data-testid="dashboard-page">
      {/* Greeting header */}
      <div className="border-b border-border bg-elevated/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
              className="w-16 h-16 rounded-2xl ring-2 ring-brand-500/40"
              alt={user?.name}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black">Hey, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-muted text-sm">Level {level} · {xp.toLocaleString()} XP total</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-40 h-1.5 bg-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
                </div>
                <span className="text-xs text-muted">{xpInLevel}/500 to Lvl {level + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="qa-card p-4"
                  data-testid={`dashboard-stat-${s.label.toLowerCase()}`}
                >
                  <div className={`w-9 h-9 rounded-xl border ${s.bg} flex items-center justify-center text-lg ${s.color} mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-xl font-black tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Wallet mini */}
            {wallet && (
              <div className="qa-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">Wallet</h2>
                  <Link to="/wallet" className="text-xs text-brand-500 font-semibold hover:underline">View all →</Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-subtle border border-border rounded-xl p-3 text-center">
                    <p className="text-lg mb-1">💰</p>
                    <p className="text-lg font-black text-brand-500 tabular-nums">🪙 {(wallet.winningBalance || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted uppercase tracking-widest mt-0.5 font-mono">Winning</p>
                  </div>
                  <div className="bg-subtle border border-border rounded-xl p-3 text-center">
                    <p className="text-lg mb-1">🎁</p>
                    <p className="text-lg font-black text-gold-500 tabular-nums">🪙 {(wallet.bonusBalance || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted uppercase tracking-widest mt-0.5 font-mono">Bonus</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live contests */}
            {recentContests.length > 0 && (
              <div className="qa-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold flex items-center gap-2">
                    <span className="live-dot" /> Live now
                  </h2>
                  <Link to="/contests" className="text-xs text-brand-500 font-semibold hover:underline">All contests →</Link>
                </div>
                <div className="space-y-2">
                  {recentContests.map(c => (
                    <Link key={c._id} to={`/contests/${c._id}`}
                      data-testid="dashboard-live-contest"
                      className="flex items-center gap-4 p-3 rounded-xl bg-subtle border border-border hover:border-brand-500/40 transition group">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center">⚡</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-brand-500 transition">{c.title}</p>
                        <p className="text-xs text-muted">{c.currentParticipants}/{c.maxParticipants} players</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="prize-text text-sm">🪙{(c.prizePool || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted">{c.entryFee === 0 ? 'FREE' : `🪙${c.entryFee}`}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="qa-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  <HiOutlineBell className="text-brand-500" /> Notifications
                  {unread.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center">
                      {unread.length}
                    </span>
                  )}
                </h2>
                {unread.length > 0 && (
                  <button onClick={markAllRead} data-testid="mark-all-read"
                    className="text-xs text-muted hover:text-fg transition flex items-center gap-1">
                    <HiOutlineCheck /> Mark all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">No notifications yet</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {notifications.slice(0, 20).map(n => (
                    <div key={n._id}
                      data-testid="notif-row"
                      className={`p-3 rounded-xl text-sm transition ${
                        n.isRead ? 'bg-subtle border border-border' : 'bg-brand-500/5 border border-brand-500/20'
                      }`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
                        <div className="min-w-0">
                          <p className="font-semibold text-fg text-sm">{n.title}</p>
                          <p className="text-muted text-xs mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-soft text-[10px] mt-1.5">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="qa-card p-5">
              <h2 className="font-bold mb-4">Quick actions</h2>
              <div className="space-y-2">
                {[
                  { to: '/contests',    icon: '⚡', label: 'Join a contest' },
                  { to: '/categories',  icon: '🎯', label: 'Practice quiz' },
                  { to: '/wallet',      icon: '🪙', label: 'Coin wallet' },
                  { to: '/leaderboard', icon: '🏆', label: 'View leaderboard' },
                ].map(a => (
                  <Link key={a.to} to={a.to}
                    className="flex items-center gap-3 p-3 rounded-xl bg-subtle border border-border hover:border-brand-500/40 hover:bg-elevated transition group">
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-sm font-semibold text-fg">{a.label}</span>
                    <span className="ml-auto text-muted group-hover:text-brand-500 transition text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
