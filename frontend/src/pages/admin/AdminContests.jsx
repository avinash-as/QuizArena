import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineGift, HiOutlineClipboardList } from 'react-icons/hi'
import { contestAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import QuestionManagerModal from '../../components/admin/QuestionManagerModal'

const toDatetimeLocal = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0, 16)
}

const EMPTY = {
  title: '', description: '', category: 'general', entryFee: 0,
  prizePool: 1000, maxParticipants: 100, targetQuestionCount: 5,
  startTime: '', endTime: '', status: 'DRAFT',
  isFeatured: false,
  prizeBreakdown: [
    { rank: 1, label: '1st Place', coins: 500, percentage: 50 },
    { rank: 2, label: '2nd Place', coins: 300, percentage: 30 },
    { rank: 3, label: '3rd Place', coins: 200, percentage: 20 },
  ],
}

const CATEGORIES = ['javascript','react','nodejs','dsa','aptitude','general','current-affairs','science','history','geography','math','english']
const STATUSES   = ['DRAFT','UPCOMING','LIVE','COMPLETED','CANCELLED']

function ContestModal({ initial, onSave, onClose }) {
  const [form, setForm]   = useState({
    ...EMPTY, ...initial,
    startTime: toDatetimeLocal(initial.startTime),
    endTime:   toDatetimeLocal(initial.endTime),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const setNum = f => e => setForm(p => ({ ...p, [f]: Number(e.target.value) }))
  const setBool= f => e => setForm(p => ({ ...p, [f]: e.target.checked }))

  const updatePrize = (i, field, val) => {
    setForm(p => {
      const pb = [...p.prizeBreakdown]
      pb[i] = { ...pb[i], [field]: field === 'label' ? val : Number(val) }
      return { ...p, prizeBreakdown: pb }
    })
  }

  const addPrizeTier = () => setForm(p => ({
    ...p,
    prizeBreakdown: [...p.prizeBreakdown, { rank: p.prizeBreakdown.length + 1, label: `Rank ${p.prizeBreakdown.length + 1}`, coins: 0, percentage: 0 }]
  }))

  const removePrizeTier = (i) => setForm(p => ({
    ...p, prizeBreakdown: p.prizeBreakdown.filter((_, idx) => idx !== i)
  }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (form.status !== 'DRAFT' && (!initial._id || !initial.quiz?.totalQuestions)) {
      setError('Add at least one question before publishing. Save as DRAFT first, then use "Manage Questions".')
      return
    }
    if (!form.startTime)    { setError('Start time is required'); return }
    if (!form.endTime)      { setError('End time is required'); return }

    const start = new Date(form.startTime)
    const end   = new Date(form.endTime)
    if (end <= start) { setError('End time must be after start time'); return }

    setSaving(true); setError('')
    try {
      await onSave({
        ...form,
        startTime: start.toISOString(),
        endTime:   end.toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contest')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-black text-white mb-5">
          {initial._id ? 'Edit Contest' : 'New Contest'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="Contest title" className="d11-input" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2}
              className="d11-input resize-none" placeholder="Brief description..." />
          </div>

          {/* Category + Quiz */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Category *</label>
              <select value={form.category} onChange={set('category')} className="d11-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Number of Questions</label>
              <input type="number" min="1" max="100" value={form.targetQuestionCount}
                onChange={setNum('targetQuestionCount')} className="d11-input" placeholder="e.g. 10" />
              <p className="text-xs text-gray-600 mt-1">Just a target — add the actual questions after saving, via "Manage Questions".</p>
            </div>
          </div>

          {/* Entry fee + Prize pool + Max participants */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Entry Fee (🪙)</label>
              <input type="number" value={form.entryFee} onChange={setNum('entryFee')} min="0" className="d11-input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Prize Pool (🪙)</label>
              <input type="number" value={form.prizePool} onChange={setNum('prizePool')} min="0" className="d11-input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Max Players</label>
              <input type="number" value={form.maxParticipants} onChange={setNum('maxParticipants')} min="2" className="d11-input" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Status</label>
            <select value={form.status} onChange={set('status')} className="d11-input">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-gray-600 mt-1">DRAFT is hidden from players — use it while you're still adding questions. Switch to UPCOMING once ready; it auto-switches to LIVE when startTime arrives.</p>
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Start Time *</label>
              <input type="datetime-local" value={form.startTime} onChange={set('startTime')} className="d11-input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">End Time *</label>
              <input type="datetime-local" value={form.endTime} onChange={set('endTime')} className="d11-input" />
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" id="featured" checked={form.isFeatured} onChange={setBool('isFeatured')}
              className="w-4 h-4 accent-green-500" />
            <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Mark as Featured contest</label>
          </div>

          {/* Prize breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Prize Breakdown</label>
              <button onClick={addPrizeTier} className="text-xs text-green-400 hover:text-green-300">+ Add Rank</button>
            </div>
            <div className="space-y-2">
              {form.prizeBreakdown.map((pb, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <input value={pb.label} onChange={e => updatePrize(i, 'label', e.target.value)}
                    placeholder="Label" className="d11-input text-xs py-2" />
                  <input type="number" value={pb.coins} onChange={e => updatePrize(i, 'coins', e.target.value)}
                    placeholder="🪙 amount" className="d11-input text-xs py-2" />
                  <input type="number" value={pb.percentage} onChange={e => updatePrize(i, 'percentage', e.target.value)}
                    placeholder="% of pool" className="d11-input text-xs py-2" />
                  <button onClick={() => removePrizeTier(i)}
                    className="text-red-400 hover:text-red-300 text-sm py-2 px-1">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Total %: {form.prizeBreakdown.reduce((s, p) => s + (Number(p.percentage) || 0), 0)}%
              {form.prizeBreakdown.reduce((s, p) => s + (Number(p.percentage) || 0), 0) !== 100 &&
                <span className="text-yellow-400 ml-2">⚠ Should add up to 100%</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[#2a2a2a]">
          <button onClick={onClose} className="btn-outline px-5 py-2.5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-green px-5 py-2.5 disabled:opacity-60">
            {saving ? 'Saving...' : initial._id ? 'Update Contest' : 'Create Contest'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminContests() {
  const [contests, setContests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [questionManager, setQuestionManager] = useState(null)
  const [msg, setMsg]           = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await contestAPI.getAll({ limit: 50 })
      setContests(data.contests || [])
    } catch { setMsg('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    if (form._id) await contestAPI.update(form._id, form)
    else          await contestAPI.create(form)
    await load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contest? This cannot be undone.')) return
    await contestAPI.delete(id)
    setContests(p => p.filter(c => c._id !== id))
  }

  const handleDistribute = async (id) => {
    if (!confirm('Distribute prizes for this contest? This cannot be reversed.')) return
    try {
      const { data } = await contestAPI.distributePrizes(id)
      setMsg(`✅ Prizes distributed to ${data.distributed} winners!`)
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.message || 'Distribution failed'}`)
    }
  }

  const handleContestChanged = (updatedContest) => {
    setContests(prev => prev.map(c => c._id === updatedContest._id ? updatedContest : c))
  }

  const statusColor = {
    LIVE:      'text-green-400 bg-green-500/10 border-green-500/20',
    UPCOMING:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
    COMPLETED: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    DRAFT:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="border-b border-[#1a1a1a] px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-green-400 uppercase tracking-widest font-bold mb-1">Admin</p>
            <h1 className="text-2xl font-black text-white">Manage Contests</h1>
          </div>
          <button onClick={() => setModal(EMPTY)} className="btn-green gap-2">
            <HiOutlinePlus /> New Contest
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {msg && (
          <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-gray-300">{msg}</div>
        )}

        {contests.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-gray-400 mb-6">No contests yet. Create your first one!</p>
            <button onClick={() => setModal(EMPTY)} className="btn-green">Create Contest</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contests.map((c, i) => (
              <motion.div key={c._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">

                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full border font-bold ${statusColor[c.status] || 'text-gray-400 bg-gray-500/10'}`}>
                    {c.status}
                  </span>
                  {c.isFeatured && <span className="text-xs text-yellow-400">⭐ Featured</span>}
                </div>

                <h3 className="font-bold text-white mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-xs text-gray-500 capitalize mb-3">{c.category}</p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                  <div className="bg-[#111] rounded-lg p-2">
                    <p className="text-green-400 font-black">🪙{(c.prizePool || 0).toLocaleString()}</p>
                    <p className="text-gray-600 mt-0.5">Prize</p>
                  </div>
                  <div className="bg-[#111] rounded-lg p-2">
                    <p className="text-white font-black">{c.entryFee === 0 ? 'FREE' : `🪙${c.entryFee}`}</p>
                    <p className="text-gray-600 mt-0.5">Entry</p>
                  </div>
                  <div className="bg-[#111] rounded-lg p-2">
                    <p className="text-white font-black">{c.currentParticipants}/{c.maxParticipants}</p>
                    <p className="text-gray-600 mt-0.5">Players</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                  <p>▶ {new Date(c.startTime).toLocaleString('en-IN')}</p>
                  <p>⏹ {new Date(c.endTime).toLocaleString('en-IN')}</p>
                </div>

                <div className="mb-4">
                  {(c.quiz?.totalQuestions || 0) === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                      ⚠ No questions yet
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                      ✓ {c.quiz.totalQuestions} question{c.quiz.totalQuestions === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  <button onClick={() => setQuestionManager(c)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-gray-300 hover:border-green-500/30 transition">
                    <HiOutlineClipboardList size={12} /> Manage Questions
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setModal(c)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-gray-300 hover:border-[#3a3a3a] transition">
                    <HiOutlinePencil size={12} /> Edit
                  </button>
                  {c.status === 'COMPLETED' && !c.prizesDistributed && (
                    <button onClick={() => handleDistribute(c._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400 hover:bg-yellow-500/20 transition">
                      <HiOutlineGift size={12} /> Give Prizes
                    </button>
                  )}
                  {c.prizesDistributed && (
                    <span className="flex-1 text-center py-2 text-xs text-green-400">✅ Prizes sent</span>
                  )}
                  <button onClick={() => handleDelete(c._id)}
                    className="py-2 px-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-red-400 hover:border-red-500/30 transition">
                    <HiOutlineTrash size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ContestModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {questionManager && (
        <QuestionManagerModal
          contest={questionManager}
          onChanged={handleContestChanged}
          onClose={() => { setQuestionManager(null); load() }}
        />
      )}
    </div>
  )
}
