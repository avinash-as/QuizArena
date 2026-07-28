import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineClipboardCopy } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState({ name: '', bio: '' })
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState({ text: '', type: '' })

  useEffect(() => {
    if (user) setForm({ name: user.name || '', bio: user.bio || '' })
  }, [user])

  if (!user) return <LoadingSpinner fullScreen />

  const handleSave = async () => {
    setSaving(true)
    try {
      await authAPI.updateProfile(form)
      await refreshUser()
      setEditing(false)
      setMsg({ text: 'Profile updated!', type: 'success' })
    } catch { setMsg({ text: 'Update failed', type: 'error' }) }
    finally { setSaving(false) }
  }

  const xp = user.xp || 0
  const level = user.level || 1
  const xpInLevel = xp % 500
  const xpPct = Math.round((xpInLevel / 500) * 100)
  const accuracy = user.totalQuestions > 0 ? Math.round((user.totalCorrect / user.totalQuestions) * 100) : 0

  const statRows = [
    { label: 'Quizzes',        value: user.totalQuizzesPlayed  || 0, hint: 'played' },
    { label: 'Contests',       value: user.totalContestsJoined || 0, hint: 'joined' },
    { label: 'Wins',           value: user.totalWins           || 0, hint: 'total' },
    { label: 'Score',          value: (user.totalScore || 0).toLocaleString(), hint: 'lifetime' },
    { label: 'Accuracy',       value: `${accuracy}%`, hint: 'avg' },
    { label: 'Streak',         value: `${user.streak || 0}d`, hint: 'current' },
    { label: 'Level',          value: level, hint: `${xp.toLocaleString()} XP` },
    { label: 'Rank',           value: user.totalWins >= 10 ? '🥇 Gold' : user.totalWins >= 5 ? '🥈 Silver' : '🥉 Bronze', hint: 'badge' },
  ]

  return (
    <div className="min-h-screen text-fg pb-24 lg:pb-8" data-testid="profile-page">
      {/* Banner */}
      <div className="h-40 relative overflow-hidden bg-gradient-to-br from-brand-900/40 via-elevated to-surface">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: 'linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar row */}
        <div className="-mt-16 flex items-end gap-4 mb-6 flex-wrap">
          <img
            src={user.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            data-testid="profile-avatar"
            className="w-28 h-28 rounded-2xl border-4 border-surface shadow-2xl bg-elevated"
          />
          <div className="pb-2 flex-1 min-w-0">
            {!editing ? (
              <div className="flex items-end justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black" data-testid="profile-name">{user.name}</h1>
                  <p className="text-muted text-sm">{user.email}</p>
                </div>
                <button onClick={() => setEditing(true)} data-testid="profile-edit"
                  className="btn-outline h-9 px-3 text-xs">
                  <HiOutlinePencil size={13} /> Edit profile
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="qa-input py-2 text-sm flex-1" data-testid="profile-name-input" />
                <button onClick={handleSave} disabled={saving} data-testid="profile-save"
                  className="w-9 h-9 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition flex items-center justify-center">
                  <HiOutlineCheck />
                </button>
                <button onClick={() => setEditing(false)}
                  className="w-9 h-9 rounded-lg bg-elevated border border-border text-muted hover:text-fg transition flex items-center justify-center">
                  <HiOutlineX />
                </button>
              </div>
            )}
          </div>
        </div>

        {msg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' : 'bg-coral-500/10 border-coral-500/30 text-coral-500'}`}>
            {msg.text}
          </div>
        )}

        {/* Bio */}
        {editing ? (
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Write a short bio…" rows={3}
            className="qa-input resize-none mb-6 text-sm" data-testid="profile-bio-input" />
        ) : user.bio ? (
          <div className="qa-card p-4 mb-6">
            <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{user.bio}</p>
          </div>
        ) : null}

        {/* Level + XP */}
        <div className="qa-card p-5 mb-6 relative overflow-hidden">
          <div aria-hidden className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl" />
          <div className="relative flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">Progress</p>
              <p className="text-lg font-black">Level {level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-brand-500 tabular-nums">{xpInLevel.toLocaleString()} / 500 XP</p>
              <p className="text-[11px] text-soft uppercase tracking-widest font-mono">to lvl {level + 1}</p>
            </div>
          </div>
          <div className="relative h-3 bg-subtle rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-gold-500" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statRows.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="qa-card p-4"
              data-testid={`stat-${s.label.toLowerCase()}`}
            >
              <p className="text-[11px] font-mono uppercase tracking-widest text-soft mb-1">{s.label}</p>
              <p className="text-xl font-black tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted mt-0.5">{s.hint}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        {user.achievements?.length > 0 && (
          <div className="qa-card p-5 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">🏅 Achievements <span className="text-xs font-normal text-muted">({user.achievements.length})</span></h2>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map(a => (
                <span key={a} className="badge-gold" data-testid="achievement-badge">🏆 {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Referral */}
        {user.referralCode && (
          <div className="qa-card p-5 mb-8 relative overflow-hidden border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-elevated to-elevated">
            <div className="relative">
              <h2 className="font-bold mb-1 flex items-center gap-2">🔗 Your referral code</h2>
              <p className="text-xs text-muted mb-3">Earn 🪙200 for every friend who joins a contest.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface border border-brand-500/30 rounded-xl px-4 py-2.5 font-mono text-brand-500 font-bold tracking-widest" data-testid="referral-code">
                  {user.referralCode}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(user.referralCode); setMsg({ text: 'Referral code copied!', type: 'success' }) }}
                  data-testid="copy-referral"
                  className="btn-green h-10 px-4"
                >
                  <HiOutlineClipboardCopy /> Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
