import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiUsers } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../services/api'
import useRoomSocket from '../hooks/useRoomSocket'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function RoomPlay() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [status, setStatus] = useState('LIVE')
  const [leaderboard, setLeaderboard] = useState([])
  const tickRef = useRef(null)

  useEffect(() => {
    roomAPI.getByCode(code).then(({ data }) => setRoom(data.room)).catch(() => {})
  }, [code])

  const isHost = room && user && room.host?._id === user._id

  const startTimer = (seconds) => {
    clearInterval(tickRef.current)
    setTimeLeft(seconds)
    tickRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(tickRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const { pause, resume, end, submitAnswer } = useRoomSocket(code, {
    onQuestion: (q) => {
      setQuestion(q)
      setSelected(null)
      setAnswerResult(null)
      startTimer(q.timeLimit)
    },
    onQuestionEnded: () => clearInterval(tickRef.current),
    onAnswerResult: (r) => setAnswerResult(r),
    onLeaderboard: (lb) => setLeaderboard(lb),
    onStatus: ({ status: s }) => setStatus(s),
    onEnded: () => navigate(`/rooms/${code}/result`),
  })

  useEffect(() => () => clearInterval(tickRef.current), [])

  const handleAnswer = (index) => {
    if (selected !== null || answerResult) return // one answer per question
    setSelected(index)
    submitAnswer(question.questionId, index)
  }

  if (!room) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted">{room.title}</p>
          {question && <p className="text-[11px] text-soft font-mono">Question {question.index + 1} / {question.total}</p>}
        </div>
        {status === 'PAUSED' && <span className="badge-upcoming">Paused</span>}
        {question && (
          <span className={`flex items-center gap-1.5 font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-coral-500' : 'text-fg'}`}>
            <FiClock className="w-4 h-4" />{timeLeft}s
          </span>
        )}
      </div>

      {question && (
        <div className="h-1.5 bg-subtle rounded-full overflow-hidden mb-6">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${((question.index + 1) / question.total) * 100}%` }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {question ? (
          <motion.div key={question.questionId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="qa-card p-5 mb-4">
              <p className="text-lg font-bold text-fg leading-snug">{question.text}</p>
            </div>

            <div className="grid gap-2.5">
              {question.options.map((opt, i) => {
                const isChosen = selected === i
                const isRevealedCorrect = answerResult && i === answerResult.correctIndex
                const isRevealedWrong = answerResult && isChosen && !answerResult.correct
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={`qa-card p-4 text-left flex items-center gap-3 transition disabled:cursor-default ${
                      isRevealedCorrect ? 'border-brand-500 bg-brand-500/10' :
                      isRevealedWrong ? 'border-coral-500 bg-coral-500/10' :
                      isChosen ? 'border-brand-500' : ''
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-subtle flex items-center justify-center text-xs font-bold text-soft shrink-0">
                      {OPTION_LETTERS[i]}
                    </span>
                    <span className="text-sm font-semibold text-fg">{opt}</span>
                  </button>
                )
              })}
            </div>

            {answerResult && (
              <p className={`text-sm font-semibold mt-4 ${answerResult.correct ? 'text-brand-500' : 'text-coral-500'}`}>
                {answerResult.correct ? `Correct! +${answerResult.pointsAwarded} pts` : 'Not quite — waiting for the next question.'}
              </p>
            )}
            {selected !== null && !answerResult && <p className="text-sm text-muted mt-4">Answer locked in…</p>}
          </motion.div>
        ) : (
          <div className="qa-card p-8 text-center text-muted">Waiting for the next question…</div>
        )}
      </AnimatePresence>

      {room.showLiveLeaderboard && leaderboard.length > 0 && (
        <div className="qa-card p-4 mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft mb-2 flex items-center gap-1.5"><FiUsers className="w-3.5 h-3.5" />Live Leaderboard</p>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 5).map(p => (
              <div key={p.rank} className="flex items-center justify-between text-sm">
                <span className="text-fg">#{p.rank} {p.name}</span>
                <span className="font-bold text-brand-500">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isHost && (
        <div className="flex gap-2 mt-6">
          {status === 'PAUSED'
            ? <button onClick={resume} className="btn-primary flex-1">Resume</button>
            : <button onClick={pause} className="btn-secondary flex-1">Pause</button>}
          <button onClick={end} className="btn-danger flex-1">End Contest</button>
        </div>
      )}
    </div>
  )
}
