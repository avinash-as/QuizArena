import { motion } from 'framer-motion'
import { HiTrendingUp } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

export default function LeaderboardTable({ entries }) {
  const { user } = useAuth()

  return (
    <div className="d11-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 border-[#1e1e1e]">
              <th className="py-4 px-5 text-left text-xs font-mono font-medium uppercase tracking-widest text-gray-500 w-16">Rank</th>
              <th className="py-4 px-5 text-left text-xs font-mono font-medium uppercase tracking-widest text-gray-500">Player</th>
              <th className="py-4 px-5 text-right text-xs font-mono font-medium uppercase tracking-widest text-gray-500">Quizzes</th>
              <th className="py-4 px-5 text-right text-xs font-mono font-medium uppercase tracking-widest text-gray-500">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isMe = entry.id === user?.id
              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-gray-50 border-[#1e1e1e]/60 last:border-0 transition-colors ${
                    isMe
                      ? 'bg-brand-50/60 dark:bg-brand-950/20'
                      : 'hover:bg-[#222]/40'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-5">
                    {entry.badge ? (
                      <span className="text-xl">{entry.badge}</span>
                    ) : (
                      <span className={`font-mono font-medium ${entry.rank <= 3 ? 'text-brand-500' : 'text-gray-500'}`}>
                        #{entry.rank}
                      </span>
                    )}
                  </td>

                  {/* Player */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 ring-2 ring-white dark:ring-gray-800"
                      />
                      <div>
                        <div className="font-medium text-white flex items-center gap-1.5">
                          {entry.name}
                          {isMe && (
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Quizzes */}
                  <td className="py-4 px-5 text-right text-gray-600 dark:text-gray-400 font-mono">
                    {entry.quizzes.toLocaleString()}
                  </td>

                  {/* Score */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <HiTrendingUp className={`w-4 h-4 ${entry.rank <= 3 ? 'text-brand-500' : 'text-gray-400'}`} />
                      <span className={`font-display font-bold ${entry.rank <= 3 ? 'text-brand-600 dark:text-brand-400' : 'text-white'}`}>
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
