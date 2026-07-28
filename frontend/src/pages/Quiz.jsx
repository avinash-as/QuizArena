import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiClock, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import { CATEGORIES } from '../context/QuizContext'

export default function Quiz() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState({})
  const [timeLeft, setTimeLeft]   = useState(30)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult]       = useState(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const category = CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, emoji: '📚' }

  // Fetch quizzes for this category
  useEffect(() => {
    setLoading(true)
    quizAPI.getAll({ category: categoryId, limit: 5 })
      .then(({ data }) => {
        const quizzes = data.quizzes || []
        if (quizzes.length === 0) {
          setError('No quizzes available for this category yet. Check back soon!')
          return
        }
        // Pick first available quiz with questions
        const quiz = quizzes.find(q => q.totalQuestions > 0) || quizzes[0]
        // Fetch full quiz with questions
        return quizAPI.practice(quiz._id)
      })
      .then(res => {
        if (!res) return
        const qs = res.data.quiz?.questions || []
        if (qs.length === 0) {
          setError('This quiz has no questions yet.')
          return
        }
        setQuestions(qs)
        startTimeRef.current = Date.now()
      })
      .catch(() => setError('Failed to load quiz. Please try again.'))
      .finally(() => setLoading(false))
  }, [categoryId])

  // Per-question timer
  useEffect(() => {
    if (loading || submitted || questions.length === 0) return
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          // Auto advance
          if (current < questions.length - 1) setCurrent(c => c + 1)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, loading, submitted])

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(a => ({ ...a, [questionId]: optionIndex }))
  }

  const handleSubmit = useCallback(() => {
    clearInterval(timerRef.current)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    let correct = 0
    const details = questions.map(q => {
      const chosen = answers[q._id] ?? null
      const isCorrect = chosen === q.correctIndex
      if (isCorrect) correct++
      return { questionId: q._id, correct: isCorrect, chosen, correctIndex: q.correctIndex, explanation: q.explanation, text: q.text, options: q.options }
    })
    const total = questions.length
    const score = Math.round((correct / total) * 1000)
    const accuracy = Math.round((correct / total) * 100)
    setResult({ score, correct, wrong: total - correct, total, accuracy, timeTaken, details })
    setSubmitted(true)
  }, [questions, answers])

  if (loading) return <LoadingSpinner fullScreen />

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate('/categories')} className="btn-green px-6 py-3">← Back to Categories</button>
      </div>
    </div>
  )

  // Results screen
  if (submitted && result) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{result.accuracy >= 80 ? '🏆' : result.accuracy >= 50 ? '👍' : '📚'}</div>
            <h1 className="text-3xl font-black text-white mb-1">
              {result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 50 ? 'Good Job!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-400">Practice round — {category.emoji} {category.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Score',    value: result.score,    color: 'text-[#22c55e]' },
              { label: 'Accuracy', value: `${result.accuracy}%`, color: 'text-[#facc15]' },
              { label: 'Correct',  value: `${result.correct}/${result.total}`, color: 'text-blue-400' },
              { label: 'Time',     value: `${result.timeTaken}s`, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="d11-card p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Answer review */}
          <div className="d11-card p-5 mb-6">
            <h3 className="font-bold text-white mb-4">Answer Review</h3>
            <div className="space-y-4">
              {result.details.map((d, i) => (
                <div key={i} className={`p-3 rounded-xl border ${d.correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <p className="text-sm text-white font-medium mb-2">{i+1}. {d.text}</p>
                  <div className="space-y-1">
                    {d.options?.map((opt, oi) => (
                      <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg ${
                        oi === d.correctIndex ? 'bg-green-500/20 text-green-300' :
                        oi === d.chosen && !d.correct ? 'bg-red-500/20 text-red-300' :
                        'text-gray-600'
                      }`}>
                        {String.fromCharCode(65+oi)}. {opt}
                        {oi === d.correctIndex && ' ✓'}
                        {oi === d.chosen && !d.correct && ' ✗'}
                      </div>
                    ))}
                  </div>
                  {d.explanation && <p className="text-xs text-gray-400 mt-2 italic">{d.explanation}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/categories')} className="btn-outline flex-1 py-3">← Categories</button>
            <button onClick={() => navigate('/contests')} className="btn-green flex-1 py-3">Join Contest 🏆</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const total = questions.length
  const pct = ((current + 1) / total) * 100
  const answered = Object.keys(answers).length
  const isLast = current === total - 1
  const urgency = timeLeft <= 10

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur border-b border-[#1a1a1a] px-4 py-3 ${urgency ? 'bg-red-950/90' : 'bg-[#0d0d0d]/90'}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/categories')} className="text-gray-500 hover:text-white transition">
              <FiArrowLeft />
            </button>
            <span className="text-sm font-medium text-gray-300">{category.emoji} {category.label}</span>
          </div>
          <div className={`flex items-center gap-2 font-mono font-black text-lg ${urgency ? 'text-red-400 animate-pulse' : 'text-[#22c55e]'}`}>
            <FiClock size={16} /> {timeLeft}s
          </div>
          <span className="text-xs text-gray-500">{answered}/{total} answered</span>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-2 h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col">
        <p className="text-xs text-gray-500 mb-3">Question {current + 1} of {total}</p>

        <div className="d11-card p-5 mb-5">
          <p className="text-lg font-semibold text-white leading-relaxed">{q?.text}</p>
        </div>

        <div className="grid gap-3 mb-8">
          {q?.options?.map((opt, i) => {
            const selected = answers[q._id] === i
            return (
              <button key={i} onClick={() => handleAnswer(q._id, i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  selected
                    ? 'border-[#22c55e] bg-[#22c55e]/10 text-white'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a] text-gray-300'
                }`}>
                <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-bold mr-3 ${
                  selected ? 'bg-[#22c55e] text-black' : 'bg-[#2a2a2a] text-gray-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {selected && <FiCheck className="inline ml-2 text-[#22c55e]" />}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-auto">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="btn-outline py-2.5 disabled:opacity-30 flex items-center gap-2">
            <FiArrowLeft /> Prev
          </button>

          {isLast ? (
            <button onClick={handleSubmit} className="btn-green flex-1 py-2.5 font-black">
              Submit Quiz ({answered}/{total})
            </button>
          ) : (
            <button onClick={() => setCurrent(c => c + 1)} className="btn-green flex-1 py-2.5 flex items-center justify-center gap-2">
              Next <FiArrowRight />
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === current ? 'bg-[#22c55e] text-black' :
                answers[questions[i]._id] !== undefined ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
