import { motion } from 'framer-motion'
import { HiCheckCircle, HiXCircle, HiClock, HiChartPie } from 'react-icons/hi'

export default function ResultCard({ result }) {
  const { score, correct, wrong, total, accuracy, timeSpent, category } = result

  const gradeColor =
    accuracy >= 80 ? 'text-green-500'
    : accuracy >= 50 ? 'text-amber-500'
    : 'text-red-500'

  const gradeLabel =
    accuracy >= 80 ? '🏆 Excellent!'
    : accuracy >= 50 ? '👍 Good job!'
    : '📚 Keep practicing!'

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="d11-card p-6 sm:p-8 text-center">
      {/* Score ring */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto mb-6"
      >
        <div className={`text-6xl font-display font-extrabold ${gradeColor}`}>
          {accuracy}%
        </div>
        <div className="text-base text-gray-400 mt-1">{gradeLabel}</div>
        <div className="text-sm text-gray-500 mt-0.5">
          {category?.label} Quiz
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatBox icon={<HiChartPie className="w-5 h-5 text-brand-500" />} value={score.toLocaleString()} label="Score" />
        <StatBox icon={<HiCheckCircle className="w-5 h-5 text-green-500" />} value={correct} label="Correct" />
        <StatBox icon={<HiXCircle className="w-5 h-5 text-red-400" />} value={wrong} label="Wrong" />
        <StatBox icon={<HiClock className="w-5 h-5 text-amber-500" />} value={formatTime(timeSpent)} label="Time" />
      </div>

      {/* Progress bar */}
      <div className="text-left">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Accuracy</span>
          <span>{correct}/{total} correct</span>
        </div>
        <div className="h-3 bg-[#111] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              accuracy >= 80 ? 'bg-green-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-[#111]">
      {icon}
      <div className="text-xl font-display font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}
