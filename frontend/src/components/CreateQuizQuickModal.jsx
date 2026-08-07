import { useState } from 'react'
import { quizAPI } from '../services/api'

const blankQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  marks: 1,
  negativeMarks: 0,
})

export default function CreateQuizQuickModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([blankQuestion()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateQuestion = (i, patch) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q))
  }
  const updateOption = (qi, oi, val) => {
    setQuestions(qs => qs.map((q, idx) => idx === qi
      ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) }
      : q))
  }
  const addQuestion = () => setQuestions(qs => [...qs, blankQuestion()])
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setError('')
    if (!title.trim()) return setError('Give the quiz a title')
    if (questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
      return setError('Fill in every question and all 4 options')
    }
    setSaving(true)
    try {
      const { data } = await quizAPI.create({ title, questions })
      onCreated(data.quiz)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the quiz')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="qa-card w-full max-w-xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
        <h2 className="text-lg font-black">Create a quick quiz</h2>

        <input
          className="qa-input w-full"
          placeholder="Quiz title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {questions.map((q, qi) => (
          <div key={qi} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-soft">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-coral-500 text-xs">Remove</button>
              )}
            </div>
            <input
              className="qa-input w-full"
              placeholder="Question text"
              value={q.text}
              onChange={e => updateQuestion(qi, { text: e.target.value })}
            />
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(qi, { correctIndex: oi })}
                />
                <input
                  className="qa-input w-full"
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button type="button" onClick={addQuestion} className="btn-secondary w-full">+ Add another question</button>

        {error && <p className="text-coral-500 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}