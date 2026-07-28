import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'

export default function CategoryCard({ category, index = 0 }) {
  const { id, label, emoji, color, questions, players } = category
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        to={`/practice/${id}`}
        className="group qa-card-hover block p-5 relative overflow-hidden"
        data-testid={`category-card-${id}`}
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg mb-4`}>
          {emoji}
        </div>
        <h3 className="font-bold text-fg text-[15px] mb-1">{label}</h3>
        {(questions !== undefined || players !== undefined) && (
          <div className="flex items-center gap-2 text-xs text-muted mb-3">
            {questions !== undefined && <span>{questions} questions</span>}
            {questions !== undefined && players !== undefined && <span>·</span>}
            {players !== undefined && <span>{(players / 1000).toFixed(1)}K players</span>}
          </div>
        )}
        <div className="flex items-center justify-between">
          {players !== undefined ? (
            <div className="h-1.5 flex-1 mr-4 bg-subtle rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, (players / 15000) * 100)}%` }} />
            </div>
          ) : (
            <span className="text-xs text-muted">Start practicing</span>
          )}
          <span className="text-brand-500 group-hover:translate-x-1 transition-transform">
            <HiArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
