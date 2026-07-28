import { motion } from 'framer-motion'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizCard({ question, chosen, onAnswer, showResult = false }) {
  const { question: text, options, correct } = question

  const getOptionClass = (idx) => {
    const base = 'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer'

    if (!showResult) {
      if (chosen === idx) {
        return `${base} border-brand-500 bg-brand-50 dark:bg-brand-950`
      }
      return `${base} border-gray-100 border-[#2a2a2a] bg-[#1a1a1a]
              hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-950/30`
    }

    // Result mode
    if (idx === correct) return `${base} border-green-500 bg-green-50 dark:bg-green-950/40`
    if (idx === chosen && chosen !== correct) return `${base} border-red-400 bg-red-50 dark:bg-red-950/40`
    return `${base} border-gray-100 border-[#2a2a2a] opacity-50`
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="d11-card p-6 sm:p-8"
    >
      <p className="text-lg sm:text-xl font-display font-bold text-white leading-snug mb-6">
        {text}
      </p>

      <div className="grid gap-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !showResult && onAnswer && onAnswer(question.id, idx)}
            disabled={showResult}
            className={getOptionClass(idx)}
          >
            <span className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-display font-bold ${
              chosen === idx && !showResult
                ? 'bg-brand-500 text-white'
                : showResult && idx === correct
                  ? 'bg-green-500 text-white'
                  : showResult && idx === chosen && chosen !== correct
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-100 bg-[#2a2a2a] text-gray-300'
            }`}>
              {OPTION_LABELS[idx]}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{opt}</span>
          </button>
        ))}
      </div>

      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800"
        >
          <p className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Explanation</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
