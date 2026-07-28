import { useState, useEffect, useCallback } from 'react'
import { quizAPI, questionAPI, contestAPI } from '../../services/api'

const EMPTY_QUESTION = {
  text: '', options: ['', '', '', ''], correctIndex: 0,
  explanation: '', difficulty: 'medium', points: 10, timeLimit: 30,
}

const CATEGORIES = ['javascript','react','nodejs','dsa','aptitude','general','current-affairs','science','history','geography','math','english']

/**
 * "Manage Questions" panel opened from a Contest card. Operates on the
 * Contest's linked Quiz (the Quiz layer is kept — this just makes managing
 * its questions feel like it happens directly on the contest):
 *   - If the contest has no quiz yet, one is created automatically on open.
 *   - Add a brand-new question directly.
 *   - Search + multi-select from the reusable Question Bank, import with
 *     server-side duplicate prevention.
 *   - Remove / reorder existing questions.
 * Calls onChanged(updatedContest) whenever the linked quiz or its question
 * count changes, so the contest card's live count stays in sync without a
 * full page reload.
 */
export default function QuestionManagerModal({ contest, onChanged, onClose }) {
  const [quiz, setQuiz]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [msg, setMsg]           = useState('')
  const [tab, setTab]           = useState('questions') // 'questions' | 'new' | 'bank'
  const [saving, setSaving]     = useState(false)

  // New-question form
  const [newQ, setNewQ] = useState(EMPTY_QUESTION)

  // Question bank search
  const [bankQuery, setBankQuery]   = useState('')
  const [bankCategory, setBankCategory] = useState('')
  const [bankResults, setBankResults]   = useState([])
  const [bankSelected, setBankSelected] = useState(new Set())
  const [bankLoading, setBankLoading]   = useState(false)

  const ensureQuizAndLoad = useCallback(async () => {
    setLoading(true); setError('')
    try {
      let quizId = contest.quiz?._id || contest.quiz
      if (!quizId) {
        // No quiz linked yet — create an empty one and link it to the contest.
        const { data } = await quizAPI.create({
          title: `${contest.title} — Quiz`,
          category: contest.category || 'general',
          questions: [],
        })
        quizId = data.quiz._id
        const upd = await contestAPI.update(contest._id, { quiz: quizId })
        onChanged?.(upd.data.contest)
      }
      const { data } = await quizAPI.getOne(quizId)
      setQuiz(data.quiz)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [contest, onChanged])

  useEffect(() => { ensureQuizAndLoad() }, [ensureQuizAndLoad])

  const refreshContestCount = async () => {
    try {
      const { data } = await contestAPI.getOne(contest._id)
      onChanged?.(data.contest)
    } catch (_) {}
  }

  // --- Add new question ---
  const handleAddNew = async () => {
    setError('')
    if (!newQ.text.trim()) { setError('Question text is required'); return }
    if (newQ.options.some(o => !o.trim())) { setError('All 4 options are required'); return }

    setSaving(true)
    try {
      const updated = { ...quiz, questions: [...quiz.questions, newQ] }
      const { data } = await quizAPI.update(quiz._id, updated)
      setQuiz(data.quiz)
      setNewQ(EMPTY_QUESTION)
      setMsg('✅ Question added')
      setTab('questions')
      refreshContestCount()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add question')
    } finally { setSaving(false) }
  }

  // --- Remove ---
  const handleRemove = async (questionId) => {
    if (!confirm('Remove this question from the quiz?')) return
    try {
      const { data } = await quizAPI.removeQuestion(quiz._id, questionId)
      setQuiz(data.quiz)
      refreshContestCount()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove question')
    }
  }

  // --- Reorder ---
  const move = async (index, dir) => {
    const newOrder = [...quiz.questions]
    const target = index + dir
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    setQuiz(p => ({ ...p, questions: newOrder })) // optimistic
    try {
      const { data } = await quizAPI.reorderQuestions(quiz._id, newOrder.map(q => q._id))
      setQuiz(data.quiz)
    } catch (e) {
      setError('Failed to save new order')
      ensureQuizAndLoad() // revert to server truth
    }
  }

  // --- Question bank search ---
  const searchBank = async () => {
    setBankLoading(true)
    try {
      const { data } = await questionAPI.getAll({
        search: bankQuery || undefined,
        category: bankCategory || undefined,
        limit: 30,
      })
      setBankResults(data.questions || [])
    } catch (_) {
      setBankResults([])
    } finally { setBankLoading(false) }
  }

  useEffect(() => { if (tab === 'bank') searchBank() }, [tab]) // eslint-disable-line

  const toggleBankSelect = (id) => {
    setBankSelected(p => {
      const next = new Set(p)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleImportSelected = async () => {
    if (bankSelected.size === 0) return
    setSaving(true); setError('')
    try {
      const { data } = await quizAPI.importFromBank(quiz._id, [...bankSelected])
      const { data: fresh } = await quizAPI.getOne(quiz._id)
      setQuiz(fresh.quiz)
      setBankSelected(new Set())
      setMsg(`✅ Added ${data.added} question${data.added === 1 ? '' : 's'}${data.skipped ? ` (${data.skipped} already in quiz, skipped)` : ''}`)
      setTab('questions')
      refreshContestCount()
    } catch (e) {
      setError(e.response?.data?.message || 'Import failed')
    } finally { setSaving(false) }
  }

  const alreadyInQuizIds = new Set((quiz?.questions || []).filter(q => q.sourceQuestionId).map(q => q.sourceQuestionId.toString()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Manage Questions</h2>
            <p className="text-xs text-gray-500">{contest.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : (
          <>
            <div className="flex gap-2 px-5 pt-4">
              {[
                { key: 'questions', label: `Questions (${quiz?.questions?.length || 0})` },
                { key: 'new',       label: '+ New Question' },
                { key: 'bank',      label: '🔍 Question Bank' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${tab === t.key ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {(error || msg) && (
              <div className={`mx-5 mt-3 p-2.5 rounded-lg text-xs ${error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
                {error || msg}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'questions' && (
                <div className="space-y-2">
                  {(!quiz?.questions || quiz.questions.length === 0) && (
                    <p className="text-center text-gray-500 py-10 text-sm">No questions yet. Add one or import from the Question Bank.</p>
                  )}
                  {quiz?.questions?.map((q, i) => (
                    <div key={q._id} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20 text-xs">▲</button>
                          <button onClick={() => move(i, 1)} disabled={i === quiz.questions.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 text-xs">▼</button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{i + 1}. {q.text}</p>
                          <div className="mt-1.5 grid grid-cols-2 gap-1">
                            {q.options.map((opt, oi) => (
                              <span key={oi} className={`text-xs px-2 py-1 rounded ${oi === q.correctIndex ? 'bg-green-500/15 text-green-400' : 'bg-[#1a1a1a] text-gray-500'}`}>
                                {oi === q.correctIndex && '✓ '}{opt}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 capitalize">{q.difficulty} · {q.points} pts · {q.timeLimit}s{q.sourceQuestionId ? ' · from bank' : ''}</p>
                        </div>
                        <button onClick={() => handleRemove(q._id)} className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'new' && (
                <div className="space-y-3">
                  <textarea value={newQ.text} onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))}
                    placeholder="Question text" rows={2} className="d11-input resize-none" />
                  <div className="space-y-2">
                    {newQ.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" checked={newQ.correctIndex === i} onChange={() => setNewQ(p => ({ ...p, correctIndex: i }))}
                          className="accent-green-500" />
                        <input value={opt} onChange={e => setNewQ(p => {
                          const options = [...p.options]; options[i] = e.target.value; return { ...p, options }
                        })} placeholder={`Option ${i + 1}`} className="d11-input flex-1" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">Select the radio button next to the correct option</p>
                  <input value={newQ.explanation} onChange={e => setNewQ(p => ({ ...p, explanation: e.target.value }))}
                    placeholder="Explanation (optional)" className="d11-input" />
                  <div className="grid grid-cols-3 gap-3">
                    <select value={newQ.difficulty} onChange={e => setNewQ(p => ({ ...p, difficulty: e.target.value }))} className="d11-input">
                      {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="number" value={newQ.points} onChange={e => setNewQ(p => ({ ...p, points: Number(e.target.value) }))}
                      placeholder="Points" className="d11-input" />
                    <input type="number" value={newQ.timeLimit} onChange={e => setNewQ(p => ({ ...p, timeLimit: Number(e.target.value) }))}
                      placeholder="Seconds" className="d11-input" />
                  </div>
                  <button onClick={handleAddNew} disabled={saving} className="btn-green w-full disabled:opacity-60">
                    {saving ? 'Adding…' : 'Add Question'}
                  </button>
                </div>
              )}

              {tab === 'bank' && (
                <div>
                  <div className="flex gap-2 mb-3">
                    <input value={bankQuery} onChange={e => setBankQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchBank()}
                      placeholder="Search question bank…" className="d11-input flex-1" />
                    <select value={bankCategory} onChange={e => setBankCategory(e.target.value)} className="d11-input w-40">
                      <option value="">All categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={searchBank} className="btn-outline px-4">Search</button>
                  </div>

                  {bankLoading ? (
                    <p className="text-center text-gray-500 py-8 text-sm">Searching…</p>
                  ) : bankResults.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">No matches. Try a different search or add a new question instead.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {bankResults.map(q => {
                        const already = alreadyInQuizIds.has(q._id)
                        return (
                          <label key={q._id} className={`flex items-start gap-3 p-3 rounded-xl border ${already ? 'border-[#2a2a2a] bg-[#111]/50 opacity-50' : 'border-[#2a2a2a] bg-[#111] cursor-pointer hover:border-green-500/30'}`}>
                            <input type="checkbox" disabled={already} checked={bankSelected.has(q._id)}
                              onChange={() => toggleBankSelect(q._id)} className="mt-1 accent-green-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white">{q.text}</p>
                              <p className="text-xs text-gray-600 mt-1 capitalize">{q.category} · {q.difficulty}{already ? ' · already in this quiz' : ''}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  <button onClick={handleImportSelected} disabled={saving || bankSelected.size === 0}
                    className="btn-green w-full disabled:opacity-40">
                    {saving ? 'Adding…' : `Add Selected (${bankSelected.size})`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="p-4 border-t border-[#2a2a2a] flex justify-end">
          <button onClick={onClose} className="btn-outline px-5 py-2">Done</button>
        </div>
      </div>
    </div>
  )
}
