import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiArrowRight, HiOutlineLightningBolt, HiOutlineShieldCheck,
  HiOutlineChartBar, HiOutlineSparkles, HiOutlineClock,
} from 'react-icons/hi'
import { FiPlay, FiTrendingUp, FiUsers, FiDollarSign, FiAward } from 'react-icons/fi'
import { contestAPI, leaderboardAPI } from '../services/api'
import { CATEGORIES } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

/* ============ Small building blocks ============ */
function Stat({ value, label, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.06 }}
      className="qa-card px-4 py-3.5 flex items-center gap-3"
      data-testid={`hero-stat-${index}`}
    >
      <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-black text-fg leading-none">{value}</div>
        <div className="text-[11px] text-muted mt-1 uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  )
}

function ContestCard({ c, i }) {
  const filled = Math.min(100, ((c.currentParticipants || 0) / (c.maxParticipants || 1)) * 100)
  const isFree = (c.entryFee || 0) === 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: i * 0.06, duration: 0.35 }}
    >
      <Link
        to={`/contests/${c._id}`}
        data-testid={`live-contest-${i}`}
        className="group block qa-card-hover p-4 relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-brand-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-start justify-between mb-3">
          <span className="badge-live"><span className="live-dot" />LIVE</span>
          <span className="text-[10px] text-soft uppercase tracking-widest font-mono">{c.category || 'General'}</span>
        </div>
        <h3 className="relative font-bold text-fg text-[15px] mb-4 line-clamp-2 leading-snug group-hover:text-brand-500 transition-colors">
          {c.title}
        </h3>
        <div className="relative flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] text-soft uppercase tracking-widest font-mono mb-1">Prize Pool</p>
            <p className="prize-text text-xl">🪙{(c.prizePool || 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-soft uppercase tracking-widest font-mono mb-1">Entry</p>
            <p className={`text-sm font-bold ${isFree ? 'text-brand-500' : 'text-fg'}`}>{isFree ? 'FREE' : `🪙${c.entryFee}`}</p>
          </div>
        </div>
        <div className="relative w-full h-1.5 bg-subtle rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all" style={{ width: `${filled}%` }} />
        </div>
        <div className="relative mt-2 flex items-center justify-between text-[11px] text-muted">
          <span className="font-medium">{c.currentParticipants || 0}/{c.maxParticipants || 0} players</span>
          <span className="text-brand-500 font-semibold flex items-center gap-1">
            Join <HiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/* ============ Home ============ */
export default function Home() {
  const { user } = useAuth()
  const { liveCount } = useSocket()
  const [liveContests, setLiveContests] = useState([])
  const [topPlayers, setTopPlayers]     = useState([])
  const [loading, setLoading]           = useState(true)

  const startCta = user ? { to: '/contests', label: 'Enter the Arena' } : { to: '/register', label: 'Play Free — Get 🪙100' }

  useEffect(() => {
    Promise.allSettled([
      contestAPI.getAll({ status: 'LIVE', limit: 4 }).then(r => setLiveContests(r.data.contests || [])),
      leaderboardAPI.get('alltime', 5).then(r => setTopPlayers(r.data.leaderboard || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const STATS = useMemo(() => ([
    { value: '50K+',  label: 'Players',   icon: FiUsers },
    { value: '₹10L+', label: 'Prizes',    icon: FiDollarSign },
    { value: '1K+',   label: 'Contests',  icon: HiOutlineSparkles },
    { value: '100%',  label: 'Skill',     icon: FiAward },
  ]), [])

  return (
    <div className="relative" data-testid="home-page">

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        {/* ambient blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute top-10 -right-24 w-[420px] h-[420px] rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">

            {/* LEFT — copy */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-500 text-xs font-bold mb-6"
                data-testid="live-presence"
              >
                <span className="live-dot" />
                <span className="tabular-nums">{(liveCount || 1247).toLocaleString()}</span> player{liveCount === 1 ? '' : 's'} in the arena right now
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-fg mb-5"
              >
                Play smarter.<br/>
                <span className="brand-text">Win bigger.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-base sm:text-lg text-muted max-w-xl mb-8 leading-relaxed"
              >
                India's most rewarding <span className="text-fg font-semibold">skill-based quiz</span> platform.
                Join daily contests, sharpen your mind, and cash out real prizes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link to={startCta.to} data-testid="hero-primary-cta" className="btn-green h-12 px-6 text-[15px]">
                  <FiPlay className="w-4 h-4" /> {startCta.label}
                </Link>
                <Link to="/contests" data-testid="hero-secondary-cta" className="btn-outline h-12 px-6 text-[15px]">
                  View Live Contests <HiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map((s, i) => <Stat key={s.label} {...s} index={i} />)}
              </div>
            </div>

            {/* RIGHT — animated quiz preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotate: 4 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              className="lg:col-span-5 hidden lg:block relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* conic ring accent */}
                <div className="absolute -inset-4 rounded-[2.5rem] ring-conic opacity-30 blur-2xl animate-pulse-slow" />

                {/* main card */}
                <div className="relative qa-card p-6 h-full flex flex-col justify-between overflow-hidden">
                  {/* subtle grid pattern */}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                       style={{ backgroundImage: 'linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="badge-live"><span className="live-dot" />LIVE</span>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-gold-500">
                        <HiOutlineClock className="w-4 h-4" />
                        <span className="tabular-nums">00:23</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-soft mb-2">Question 4 / 10</p>
                    <div className="h-1.5 w-full bg-subtle rounded-full overflow-hidden mb-5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400"
                        initial={{ width: '10%' }}
                        animate={{ width: '40%' }}
                        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-fg leading-snug">
                      Which planet has the strongest gravitational pull in our solar system?
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-6">
                    {[
                      { t: 'Saturn',  ok: false },
                      { t: 'Jupiter', ok: true  },
                      { t: 'Neptune', ok: false },
                      { t: 'Uranus',  ok: false },
                    ].map((o, i) => (
                      <motion.div
                        key={o.t}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.08 }}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          o.ok
                            ? 'border-brand-500 bg-brand-500/10 text-brand-500 shadow-glow-brand'
                            : 'border-border bg-subtle text-muted'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {o.t}
                        {o.ok && <span className="ml-1">✓</span>}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating XP chip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  className="absolute -top-4 -right-3 px-3 py-2 rounded-xl bg-gold-500 text-black text-sm font-black shadow-glow-gold"
                >
                  +150 XP 🎉
                </motion.div>

                {/* Floating streak badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.25 }}
                  className="absolute -bottom-3 -left-4 qa-card px-3 py-2 flex items-center gap-2 shadow-card-hover"
                >
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-soft font-mono">Streak</div>
                    <div className="text-sm font-black text-fg">7 days</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ LIVE CONTESTS ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="section-label mb-2">Battle-ready</p>
            <h2 className="text-2xl sm:text-3xl font-black text-fg">Live Contests</h2>
          </div>
          <Link to="/contests" data-testid="view-all-contests" className="text-sm text-brand-500 font-semibold hover:underline flex items-center gap-1 whitespace-nowrap">
            View all <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="qa-card p-4">
                <div className="skeleton h-4 w-16 mb-3" />
                <div className="skeleton h-5 w-3/4 mb-4" />
                <div className="skeleton h-8 w-24 mb-4" />
                <div className="skeleton h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : liveContests.length === 0 ? (
          <div className="qa-card p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <HiOutlineLightningBolt className="w-8 h-8" />
            </div>
            <p className="text-fg font-semibold text-lg mb-2">No live contests right now</p>
            <p className="text-muted text-sm mb-5">New contests drop every hour. Check back soon or explore practice mode.</p>
            <Link to="/categories" className="btn-outline">Practice mode</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveContests.map((c, i) => <ContestCard key={c._id} c={c} i={i} />)}
          </div>
        )}
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Simple & Fast</p>
          <h2 className="text-3xl sm:text-4xl font-black text-fg">Play in 3 steps</h2>
          <p className="text-muted mt-3 max-w-md mx-auto">From joining a contest to cashing your winnings — the whole loop takes minutes.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '01', icon: '🎯', title: 'Pick a contest',     desc: 'Choose from hundreds of live and upcoming skill-based contests across categories.' },
            { step: '02', icon: '⚡', title: 'Answer & compete',   desc: 'Speed + accuracy. No luck, no chance. Every second and every answer counts.' },
            { step: '03', icon: '🏆', title: 'Win & withdraw',     desc: 'Top rankers earn real cash prizes. Instant, secure payout to your account.' },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="qa-card p-6 relative overflow-hidden group"
              data-testid={`how-step-${i}`}
            >
              <div className="absolute -top-6 -right-4 text-[110px] font-black text-fg/[0.04] select-none pointer-events-none leading-none">{s.step}</div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-fg text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="section-label mb-2">Explore</p>
            <h2 className="text-2xl sm:text-3xl font-black text-fg">Practice by category</h2>
          </div>
          <Link to="/categories" className="text-sm text-brand-500 font-semibold hover:underline flex items-center gap-1">
            All categories <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 8).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/practice/${cat.id}`}
                className="qa-card-hover group relative block p-5 overflow-hidden"
                data-testid={`category-${cat.id}`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${cat.color} transition-opacity duration-300 mix-blend-overlay`} style={{ filter: 'brightness(0.5)' }} />
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg mb-3`}>
                    {cat.emoji}
                  </div>
                  <h3 className="font-bold text-fg text-[15px] mb-1">{cat.label}</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    Start practicing <HiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ TOP PLAYERS ═══════ */}
      {topPlayers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="section-label mb-2">Hall of Fame</p>
              <h2 className="text-2xl sm:text-3xl font-black text-fg">Top players</h2>
            </div>
            <Link to="/leaderboard" className="text-sm text-brand-500 font-semibold hover:underline flex items-center gap-1">
              Full leaderboard <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="qa-card overflow-hidden divide-y divide-border">
            {topPlayers.map((p, i) => {
              const rankBadge = ['🥇','🥈','🥉'][i] || `#${i+1}`
              const highlight = i === 0
              return (
                <div
                  key={p._id || i}
                  data-testid={`top-player-${i}`}
                  className={`flex items-center gap-4 px-4 sm:px-5 py-3.5 transition-colors ${highlight ? 'bg-gold-500/[0.04]' : 'hover:bg-subtle/70'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                    i === 0 ? 'bg-gold-500 text-black' :
                    i === 1 ? 'bg-fg/60 text-surface' :
                    i === 2 ? 'bg-gold-600 text-white' :
                    'bg-subtle text-muted'
                  }`}>
                    {rankBadge}
                  </div>
                  <img
                    src={p.user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${p.user?.name || i}`}
                    alt=""
                    className="w-10 h-10 rounded-lg border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-fg truncate">{p.user?.name || 'Player'}</p>
                    <p className="text-[11px] text-muted">Level {p.user?.level || 1} · {p.contestsWon || 0} wins</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-brand-500 tabular-nums">{(p.score || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-soft uppercase tracking-widest font-mono">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══════ TRUST STRIP ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: HiOutlineShieldCheck, title: '100% Secure',      desc: 'Bank-grade encryption & fraud protection on every play.' },
            { icon: HiOutlineChartBar,    title: 'Skill-Based',       desc: 'Every question tests knowledge & speed. No luck involved.' },
            { icon: HiOutlineLightningBolt, title: 'Instant Payouts', desc: 'Winnings hit your wallet the moment a contest ends.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="qa-card p-5 flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-fg mb-1">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center border border-brand-500/25"
             style={{ background: 'linear-gradient(135deg, rgb(5 46 22 / 0.9) 0%, rgb(6 78 59 / 0.7) 60%, rgb(4 47 33 / 0.8) 100%)' }}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
          <div aria-hidden className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold-500/15 blur-3xl rounded-full" />
          <div className="relative">
            <FiTrendingUp className="w-8 h-8 text-brand-500 mx-auto mb-4" />
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-brand-500 mb-3">Join 50,000+ winners</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to <span className="brand-text">win?</span>
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto text-base">
              Create a free account and get 🪙100 bonus coins instantly. Your first contest is on us.
            </p>
            <Link to={user ? '/contests' : '/register'} data-testid="cta-primary" className="btn-green h-12 px-8 text-[15px] inline-flex">
              {user ? 'Play Now' : 'Create Free Account'} <HiArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-white/50 text-xs mt-4">Games of skill · 18+ only · Play responsibly</p>
          </div>
        </div>
      </section>
    </div>
  )
}
