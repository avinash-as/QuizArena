import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineSearch, HiArrowRight } from 'react-icons/hi'
import { FiClock, FiUsers, FiZap } from 'react-icons/fi'
import { contestAPI } from '../services/api'
import { CATEGORIES } from '../context/QuizContext'

const STATUS_TABS = [
  { key: '',          label: 'All' },
  { key: 'UPCOMING',  label: 'Upcoming' },
  { key: 'LIVE',      label: 'Live' },
  { key: 'COMPLETED', label: 'Completed' },
]

function ContestCard({ contest, index }) {
  const isLive     = ['LIVE','live'].includes(contest.status)
  const isUpcoming = ['UPCOMING','upcoming'].includes(contest.status)
  const isDone     = ['COMPLETED','completed'].includes(contest.status)
  const isFull     = contest.currentParticipants >= contest.maxParticipants
  const spotsLeft  = contest.maxParticipants - contest.currentParticipants
  const fillPct    = Math.min(100, (contest.currentParticipants / contest.maxParticipants) * 100)
  const isFree     = contest.entryFee === 0

  const accentColor =
    isLive     ? 'bg-brand-500' :
    isUpcoming ? 'bg-blue-500' :
                 'bg-soft/40'

  const catMeta = CATEGORIES.find(c => c.id === contest.category)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: index * 0.03, duration: 0.35 }}>
      <Link to={`/contests/${contest._id}`} className="qa-card-hover group block overflow-hidden relative">
        <div className={`h-1 w-full ${accentColor}`} />
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-500/8 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-4 relative">
          {/* Top row: status + category */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isLive     && <span className="badge-live"><span className="live-dot" />LIVE</span>}
              {isUpcoming && <span className="badge-upcoming">⏰ Upcoming</span>}
              {isDone     && <span className="badge-completed">✓ Ended</span>}
              {catMeta && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-soft flex items-center gap-1">
                  <span>{catMeta.emoji}</span>{catMeta.label}
                </span>
              )}
            </div>
            {contest.isFeatured && <span className="badge-gold">⭐ Featured</span>}
          </div>

          {/* Title */}
          <h3 className="font-bold text-fg text-[15px] mb-4 line-clamp-2 leading-snug group-hover:text-brand-500 transition-colors">
            {contest.title}
          </h3>

          {/* Prize + Entry */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 rounded-xl p-3 border border-brand-500/20 bg-brand-500/5 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-soft mb-1">Prize</p>
              <p className="prize-text text-base">🪙{(contest.prizePool || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 rounded-xl p-3 border border-border bg-subtle text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-soft mb-1">Entry</p>
              <p className={`text-base font-black ${isFree ? 'text-brand-500' : 'text-fg'}`}>
                {isFree ? 'FREE' : `🪙${contest.entryFee}`}
              </p>
            </div>
          </div>

          {/* Fill */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-muted flex items-center gap-1"><FiUsers className="w-3 h-3" />{contest.currentParticipants} joined</span>
              <span className={`font-semibold ${isFull ? 'text-coral-500' : 'text-soft'}`}>
                {isFull ? '🔴 FULL' : `${spotsLeft} left`}
              </span>
            </div>
            <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isFull ? 'bg-coral-500' : 'bg-brand-500'}`} style={{ width: `${fillPct}%` }} />
            </div>
          </div>

          {/* Time */}
          <p className="text-[11px] text-muted mb-4 flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {isLive ? 'Ends' : 'Starts'} · {new Date(isLive ? contest.endTime : contest.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>

          {/* CTA */}
          <div
            data-testid="contest-play-btn"
            className={`w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              isDone ? 'bg-subtle text-soft border border-border' :
              isFull ? 'bg-subtle text-soft border border-border' :
              isLive ? 'bg-brand-500 text-white group-hover:bg-brand-600 shadow-glow-brand' :
                       'bg-brand-500/10 text-brand-500 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white'
            }`}
          >
            {isDone ? 'View results' : isFull ? 'Contest full' : isLive ? <><FiZap /> Play now</> : 'View contest'}
            {!isDone && !isFull && <HiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ContestLobby() {
  const [contests, setContests]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [activeStatus, setActiveStatus]     = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch]                 = useState('')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (activeStatus)   params.status   = activeStatus
    if (activeCategory) params.category = activeCategory
    if (search)         params.search   = search
    contestAPI.getAll(params)
      .then(r => setContests(r.data.contests || []))
      .catch(() => setContests([]))
      .finally(() => setLoading(false))
  }, [activeStatus, activeCategory, search])

  const liveCount = useMemo(() => contests.filter(c => ['LIVE','live'].includes(c.status)).length, [contests])

  return (
    <div className="min-h-screen" data-testid="contests-page">
      {/* Header */}
      <div className="border-b border-border bg-elevated/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="section-label mb-2">Pitara</p>
              <h1 className="text-3xl sm:text-4xl font-black text-fg">Contest Lobby</h1>
              <p className="text-muted text-sm mt-1">
                {liveCount > 0 && <span className="text-brand-500 font-semibold">{liveCount} Live now · </span>}
                Join, play, and climb the leaderboard
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
              <input
                data-testid="contest-search"
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search contests…" className="qa-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mt-5 overflow-x-auto scrollbar-hide">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key} onClick={() => setActiveStatus(tab.key)}
                data-testid={`contests-tab-${tab.key.toLowerCase() || 'all'}`}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeStatus === tab.key
                    ? 'bg-brand-500 text-white shadow-glow-brand'
                    : 'bg-elevated text-muted border border-border hover:border-borderStrong hover:text-fg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1 mask-fade-r">
            <button
              onClick={() => setActiveCategory('')}
              data-testid="contests-cat-all"
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                !activeCategory ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'text-muted hover:text-fg border border-border hover:border-borderStrong'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id} onClick={() => setActiveCategory(cat.id)}
                data-testid={`contests-cat-${cat.id}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeCategory === cat.id ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'text-muted hover:text-fg border border-border hover:border-borderStrong'
                }`}
              >
                <span>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="contests-skeleton">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="qa-card overflow-hidden">
                <div className="skeleton h-1 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-14 rounded-full" />
                    <div className="skeleton h-5 w-20 rounded-full" />
                  </div>
                  <div className="skeleton h-5 w-4/5" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="skeleton h-14" />
                    <div className="skeleton h-14" />
                  </div>
                  <div className="skeleton h-1.5 w-full" />
                  <div className="skeleton h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && contests.length === 0 && (
          <div className="qa-card p-14 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="font-bold text-fg text-lg mb-2">No contests found</h3>
            <p className="text-muted">Try a different filter or check back soon.</p>
          </div>
        )}

        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contests.map((c, i) => <ContestCard key={c._id} contest={c} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
