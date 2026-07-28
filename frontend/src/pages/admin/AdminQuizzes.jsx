import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'
import { quizAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const EMPTY_QUIZ = { title: '', description: '', category: 'javascript', difficulty: 'medium', timeLimit: 300, questions: [] }
const EMPTY_Q = { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', points: 10, difficulty: 'medium', timeLimit: 30 }

function QuizModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial, questions: initial.questions || [] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedQ, setExpandedQ] = useState(null)

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }))
  const setNum = f => e => setForm(prev => ({ ...prev, [f]: Number(e.target.value) }))

  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, { ...EMPTY_Q }] }))
    setExpandedQ(form.questions.length)
  }

  const updateQ = (qi, field, val) => {
    setForm(prev => {
      const qs = [...prev.questions]
      qs[qi] = { ...qs[qi], [field]: val }
      return { ...prev, questions: qs }
    })
  }

  const updateOption = (qi, oi, val) => {
    setForm(prev => {
      const qs = [...prev.questions]
      const opts = [...qs[qi].options]
      opts[oi] = val
      qs[qi] = { ...qs[qi], options: opts }
      return { ...prev, questions: qs }
    })
  }

  const removeQ = (qi) => setForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qi) }))

  const handleSave = async () => {
    if (!form.title) { setError('Title is required'); return }
    if (form.questions.length === 0) { setError('Add at least one question'); return }
    setSaving(true); setError('')
    try { await onSave(form); onClose() }
    catch (err) { setError(err.response?.data?.message || 'Failed to save') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="d11-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-display font-bold text-xl text-white mb-5">
          {initial._id ? 'Edit Quiz' : 'New Quiz'}
        </h2>
        {error && <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl">{error}</div>}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
            <input value={form.title} onChange={set('title')} className="d11-input" placeholder="Quiz title" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea value={form.description} onChange={set('description')} className="d11-input h-16 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
            <select value={form.category} onChange={set('category')} className="d11-input">
              {['javascript','react','nodejs','dsa','aptitude','general','current-affairs','science'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Difficulty</label>
            <select value={form.difficulty} onChange={set('difficulty')} className="d11-input">
              {['easy','medium','hard','mixed'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Time Limit (seconds)</label>
            <input type="number" value={form.timeLimit} onChange={setNum('timeLimit')} className="d11-input" min="30" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-white">Questions ({form.questions.length})</h3>
            <button onClick={addQuestion} className="btn-outline text-xs gap-1"><HiOutlinePlus className="w-3.5 h-3.5" /> Add Question</button>
          </div>

          <div className="space-y-3">
            {form.questions.map((q, qi) => (
              <div key={qi} className="border border-gray-200 border-[#2a2a2a] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 bg-[#111] cursor-pointer" onClick={() => setExpandedQ(expandedQ === qi ? null : qi)}>
                  <span className="text-sm font-medium text-gray-700 text-gray-300 truncate">
                    Q{qi+1}: {q.text || 'New question'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); removeQ(qi) }} className="text-red-400 hover:text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                    {expandedQ === qi ? <HiOutlineChevronUp className="w-4 h-4 text-gray-400" /> : <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedQ === qi && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Question Text</label>
                      <textarea value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)} className="d11-input h-16 resize-none" placeholder="Enter question..." />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQ(qi, 'correctIndex', oi)} className="accent-brand-500 shrink-0" />
                          <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} className="d11-input text-xs py-2" placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Explanation (optional)</label>
                      <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} className="d11-input text-xs" placeholder="Why is this the correct answer?" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Points</label>
                        <input type="number" value={q.points} onChange={e => updateQ(qi, 'points', Number(e.target.value))} className="d11-input py-1 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Difficulty</label>
                        <select value={q.difficulty} onChange={e => updateQ(qi, 'difficulty', e.target.value)} className="d11-input py-1 text-xs">
                          {['easy','medium','hard'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Time (s)</label>
                        <input type="number" value={q.timeLimit} onChange={e => updateQ(qi, 'timeLimit', Number(e.target.value))} className="d11-input py-1 text-xs" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-green disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = () => {
    setLoading(true)
    quizAPI.getAll({ limit: 50 }).then(r => setQuizzes(r.data.quizzes)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    if (form._id) await quizAPI.update(form._id, form)
    else await quizAPI.create(form)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return
    await quizAPI.delete(id)
    setQuizzes(prev => prev.filter(q => q._id !== id))
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="section-label mb-1 block">Admin</span>
          <h1 className="text-3xl font-display font-extrabold text-white">Manage Quizzes</h1>
        </div>
        <button onClick={() => setModal(EMPTY_QUIZ)} className="btn-green gap-2">
          <HiOutlinePlus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map(q => (
          <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="d11-card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 capitalize">{q.category}</span>
              <div className="flex gap-1">
                <button onClick={() => setModal(q)} className="btn-ghost p-1"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(q._id)} className="btn-ghost p-1 text-red-400"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-display font-bold text-white mb-1">{q.title}</h3>
            <p className="text-xs text-gray-500 text-gray-400 mb-3 line-clamp-2">{q.description}</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>📝 {q.totalQuestions} questions</span>
              <span>⏱ {q.timeLimit}s</span>
              <span className="capitalize">• {q.difficulty}</span>
            </div>
          </motion.div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-500">No quizzes yet. Create one!</div>
        )}
      </div>

      {modal && <QuizModal initial={modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  )
}
