import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomAPI, quizAPI } from '../services/api'

const initialForm = {
  title: '',
  description: '',
  quiz: '',
  maxParticipants: 50,
  isPublic: true,
  password: '',
  scheduledAt: '',
  duration: 0,
  shuffleQuestions: false,
  shuffleOptions: false,
  negativeMarking: false,
  allowLateJoin: true,
  showLiveLeaderboard: true,
  autoEnd: true,
}

function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5 cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-fg">{label}</span>
        {hint && <span className="block text-[11px] text-muted mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition shrink-0 ${checked ? 'bg-brand-500' : 'bg-subtle border border-border'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

export default function CreateRoom() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    quizAPI.getAll({ limit: 100 }).then(r => setQuizzes(r.data.quizzes || [])).catch(() => {})
  }, [])

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('Give the room a name')
    if (!form.quiz) return setError('Choose a quiz for this room')

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        password: form.isPublic ? undefined : form.password,
        scheduledAt: form.scheduledAt || undefined,
      }
      const { data } = await roomAPI.create(payload)
      navigate(`/rooms/${data.room.code}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black text-fg mb-1">Create a Live Room</h1>
      <p className="text-sm text-muted mb-6">Set it up, share the code, start whenever everyone's in.</p>

      <form onSubmit={handleSubmit} className="qa-card p-5 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Contest name</label>
          <input className="qa-input w-full" value={form.title} onChange={e => set('title')(e.target.value)} placeholder="e.g. Friday JS Sprint" maxLength={120} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Description (optional)</label>
          <textarea className="qa-input w-full" rows={2} value={form.description} onChange={e => set('description')(e.target.value)} maxLength={500} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Quiz</label>
          <select className="qa-input w-full" value={form.quiz} onChange={e => set('quiz')(e.target.value)}>
            <option value="">Select a quiz…</option>
            {quizzes.map(q => (
              <option key={q._id} value={q._id}>{q.title} ({q.totalQuestions} questions)</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Max participants</label>
            <input type="number" min={2} max={500} className="qa-input w-full" value={form.maxParticipants} onChange={e => set('maxParticipants')(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Scheduled time (optional)</label>
            <input type="datetime-local" className="qa-input w-full" value={form.scheduledAt} onChange={e => set('scheduledAt')(e.target.value)} />
          </div>
        </div>

        <div className="divide-y divide-border">
          <Toggle label="Public room" hint="Anyone with the code can join without a password" checked={form.isPublic} onChange={set('isPublic')} />
          {!form.isPublic && (
            <div className="py-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-soft mb-1.5">Room password</label>
              <input type="text" className="qa-input w-full" value={form.password} onChange={e => set('password')(e.target.value)} placeholder="4+ characters" />
            </div>
          )}
          <Toggle label="Shuffle questions" checked={form.shuffleQuestions} onChange={set('shuffleQuestions')} />
          <Toggle label="Shuffle options" checked={form.shuffleOptions} onChange={set('shuffleOptions')} />
          <Toggle label="Negative marking" hint="Uses each question's negative-marks value" checked={form.negativeMarking} onChange={set('negativeMarking')} />
          <Toggle label="Allow late join" hint="Participants can join after the room has started" checked={form.allowLateJoin} onChange={set('allowLateJoin')} />
          <Toggle label="Show live leaderboard" checked={form.showLiveLeaderboard} onChange={set('showLiveLeaderboard')} />
          <Toggle label="Auto-end after last question" checked={form.autoEnd} onChange={set('autoEnd')} />
        </div>

        {error && <p className="text-coral-500 text-sm">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? 'Creating…' : 'Create Room'}
        </button>
      </form>
    </div>
  )
}
