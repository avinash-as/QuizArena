import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { attemptAPI } from '../services/api'
import { FiClock, FiAlertCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi'

export default function QuizPlay() {
  const { contestId } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const timerRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    attemptAPI.start(contestId)
      .then(({ data }) => {
        setAttempt(data.attempt)
        setQuiz(data.quiz)
        const remaining = Math.max(0, Math.floor((new Date(data.attempt.endTime) - new Date(data.serverTime)) / 1000))
        setTimeLeft(remaining)
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to start quiz'))
      .finally(() => setLoading(false))
  }, [contestId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null])

  useEffect(() => {
    const onBlur = () => {
      setTabSwitches(n => n + 1)
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) onBlur() })
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onBlur)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(a => ({ ...a, [questionId]: optionIndex }))
  }

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || !attempt) return
    if (!autoSubmit && Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      // eslint-disable-next-line no-alert
      if (!confirm('You have unanswered questions. Submit anyway?')) return
    }
    setSubmitting(true)
    clearInterval(timerRef.current)
    try {
      const { data } = await attemptAPI.submit(attempt._id, { answers, tabSwitchCount: tabSwitches })
      navigate(`/contests/${contestId}/submitted`, { state: { result: data.result, newAchievements: data.newAchievements, contestId } })
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed')
      setSubmitting(false)
    }
  }, [attempt, answers, tabSwitches, quiz, submitting, navigate, contestId])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  const answeredCount = Object.keys(answers).length
  const total = quiz?.questions?.length || 0
  const questionPct = total > 0 ? ((current + 1) / total) * 100 : 0
  const urgency = timeLeft !== null && timeLeft < 60

  if (loading) return (
    <div className="min-h-screen bg-surface text-fg flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
        </div>
        <p className="text-sm text-muted">Starting your quiz…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-surface text-fg flex items-center justify-center px-6">
      <div className="qa-card p-8 max-w-sm text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="font-bold mb-2">Something went wrong</p>
        <p className="text-coral-500 text-sm mb-5">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-outline w-full justify-center h-11">Go back</button>
      </div>
    </div>
  )

  const q = quiz?.questions?.[current]

  return (
    <div className="min-h-screen bg-surface text-fg flex flex-col" data-testid="quizplay-page">
      {/* Sticky header */}
      <div className={`sticky top-0 z-20 border-b backdrop-blur-xl transition-colors ${urgency ? 'bg-coral-500/10 border-coral-500/30' : 'bg-elevated/80 border-border'}`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted">
              Question <span className="text-fg font-bold">{current + 1}</span> / {total}
            </div>
          </div>

          <div className={`flex items-center gap-2 font-mono text-lg font-black tabular-nums ${urgency ? 'text-coral-500 animate-pulse' : 'text-fg'}`} data-testid="quiz-timer">
            <FiClock size={16} />
            {timeLeft !== null ? fmt(timeLeft) : '--:--'}
          </div>

          <div className="text-[11px] uppercase tracking-widest font-mono text-muted whitespace-nowrap">
            <span className="text-brand-500 font-bold">{answeredCount}</span>/{total} done
          </div>
        </div>
        {/* Progress */}
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="h-1 bg-subtle rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${urgency ? 'bg-coral-500' : 'bg-brand-500'}`}
              animate={{ width: `${questionPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Tab-switch warning */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-coral-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-2xl"
          >
            <FiAlertCircle /> Tab switch detected · {tabSwitches}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question body */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {q && (
          <>
            <motion.div
              key={q._id}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              className="qa-card p-6 mb-5"
            >
              {q.imageUrl && <img src={q.imageUrl} alt="Question" className="w-full rounded-xl mb-4 max-h-56 object-contain bg-subtle" />}
              <p className="text-[11px] font-mono uppercase tracking-widest text-brand-500 mb-2">{q.points || 10} pts</p>
              <p className="text-lg font-bold leading-relaxed">{q.text}</p>
            </motion.div>

            <div className="grid gap-2.5 mb-8" data-testid="quiz-options">
              {q.options?.map((opt, i) => {
                const selected = answers[q._id] === i
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(q._id, i)}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    data-testid={`quiz-option-${i}`}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      selected
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow-brand'
                        : 'border-border bg-elevated hover:border-borderStrong hover:bg-subtle'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center shrink-0 mt-0.5 ${selected ? 'bg-brand-500 text-white' : 'bg-subtle text-muted border border-border'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-[15px] font-medium leading-relaxed ${selected ? 'text-fg' : 'text-muted'}`}>{opt}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                data-testid="quiz-prev"
                className="btn-outline h-11 px-5"
              >
                <FiArrowLeft /> Previous
              </button>

              {current < total - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} data-testid="quiz-next" className="btn-green h-11 px-6">
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  data-testid="quiz-submit"
                  className="btn-green h-11 px-6"
                >
                  {submitting ? 'Submitting…' : '✅ Submit quiz'}
                </button>
              )}
            </div>

            {/* Question map */}
            <div className="qa-card p-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-3">Question map</p>
              <div className="flex flex-wrap gap-1.5">
                {quiz?.questions?.map((qq, i) => {
                  const answered = answers[qq._id] !== undefined
                  return (
                    <button
                      key={qq._id}
                      onClick={() => setCurrent(i)}
                      data-testid={`quiz-nav-${i}`}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition ${
                        i === current
                          ? 'bg-brand-500 text-white ring-2 ring-brand-500/40'
                          : answered
                          ? 'bg-brand-500/15 text-brand-500 border border-brand-500/25'
                          : 'bg-subtle text-muted border border-border hover:text-fg'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
