import { createContext, useContext, useState, useRef } from 'react'
import { contestAPI } from '../services/api'

const QuizContext = createContext(null)

export const CATEGORIES = [
  { id: 'javascript',     label: 'JavaScript',     emoji: '🟨', color: 'from-yellow-500 to-orange-500' },
  { id: 'react',          label: 'React',           emoji: '⚛️',  color: 'from-cyan-500 to-blue-600'    },
  { id: 'nodejs',         label: 'Node.js',         emoji: '🟩', color: 'from-green-500 to-emerald-600' },
  { id: 'dsa',            label: 'DSA',             emoji: '🧮', color: 'from-violet-500 to-purple-600' },
  { id: 'aptitude',       label: 'Aptitude',        emoji: '🧠', color: 'from-pink-500 to-rose-600'     },
  { id: 'general',        label: 'General',         emoji: '🌍', color: 'from-teal-500 to-cyan-600'     },
  { id: 'current-affairs',label: 'Current Affairs', emoji: '📰', color: 'from-red-500 to-pink-600'      },
  { id: 'science',        label: 'Science',         emoji: '🔬', color: 'from-indigo-500 to-blue-600'   },
]

// Static placeholder for Home page hero — replaced by live data on Leaderboard page
export const LEADERBOARD = [
  { id: 'l1', rank: 1, badge: '🥇', name: 'Arjun S.',  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=arjun',  score: 9820, quizzes: 142 },
  { id: 'l2', rank: 2, badge: '🥈', name: 'Priya M.',  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=priya',  score: 9210, quizzes: 118 },
  { id: 'l3', rank: 3, badge: '🥉', name: 'Dev K.',    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=dev',    score: 8900, quizzes: 105 },
  { id: 'l4', rank: 4, badge: '#4', name: 'Ananya R.', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=ananya', score: 8450, quizzes: 98  },
  { id: 'l5', rank: 5, badge: '#5', name: 'Rohan T.',  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=rohan',  score: 8100, quizzes: 91  },
]

export function QuizProvider({ children }) {
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizResult, setQuizResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef(null)

  const startQuiz = (questions, contestId, timeLimit) => {
    setActiveQuiz({ questions, contestId, timeLimit })
    setAnswers({})
    setCurrentIndex(0)
    setQuizResult(null)
    timerRef.current = Date.now()
  }

  const answerQuestion = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const submitContest = async () => {
    if (!activeQuiz || submitting) return null
    setSubmitting(true)
    const timeTaken = Math.round((Date.now() - timerRef.current) / 1000)
    try {
      const { data } = await contestAPI.submit(activeQuiz.contestId, { answers, timeTaken })
      setQuizResult({ ...data.result, newAchievements: data.newAchievements })
      setActiveQuiz(null)
      return data
    } finally {
      setSubmitting(false)
    }
  }

  const clearQuiz = () => {
    setActiveQuiz(null)
    setAnswers({})
    setCurrentIndex(0)
    setQuizResult(null)
  }

  return (
    <QuizContext.Provider value={{
      activeQuiz, answers, currentIndex, setCurrentIndex,
      quizResult, submitting,
      startQuiz, answerQuestion, submitContest, clearQuiz,
    }}>
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be inside QuizProvider')
  return ctx
}
