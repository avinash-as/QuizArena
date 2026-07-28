import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiPlay } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { value: '50K+', label: 'Active Players' },
  { value: '1.2M', label: 'Quizzes Played' },
  { value: '140+', label: 'Categories' },
  { value: '99.9%', label: 'Uptime' },
]

const floatVariants = {
  initial: {},
  animate: {
    y: [0, -14, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Ambient background blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-brand-400/20 dark:bg-brand-600/10 blur-3xl" />
        <div className="absolute top-24 -right-20 w-[420px] h-[420px] rounded-full bg-accent-400/15 dark:bg-accent-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="section-label mb-4 block">The #1 quiz platform</span>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-display font-extrabold leading-[1.1] tracking-tight text-white">
              Challenge your mind.{' '}
              <span className="text-[#22c55e]">Climb the ranks.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              Compete in real-time quizzes across hundreds of categories. Earn XP,
              unlock achievements, and prove you're the smartest in the room.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link to="/categories" className="btn-green text-base px-6 py-3">
                  <HiPlay className="w-5 h-5" /> Play now
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-green text-base px-6 py-3">
                    Start for free <HiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/categories" className="btn-outline text-base px-6 py-3">
                    Browse categories
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-6">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-display font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            className="hidden lg:flex justify-center"
            variants={floatVariants}
            initial="initial"
            animate="animate"
          >
            <div className="relative w-[420px] h-[420px]">
              {/* Main card */}
              <div className="absolute inset-0 card p-8 flex flex-col justify-between shadow-2xl dark:shadow-brand-900/30">
                <div>
                  <div className="text-xs font-mono text-brand-500 font-medium mb-3">QUESTION 4 of 10</div>
                  <div className="w-full bg-[#111] rounded-full h-1.5 mb-6">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white leading-snug">
                    What is the largest planet in our solar system?
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Saturn', 'Jupiter', 'Neptune', 'Uranus'].map((opt, i) => (
                    <div
                      key={opt}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all cursor-default ${
                        i === 1
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                          : 'border-gray-100 border-[#2a2a2a] text-gray-700 dark:text-gray-300 bg-[#111]'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating XP badge */}
              <motion.div
                className="absolute -top-5 -right-5 bg-brand-500 text-white rounded-2xl px-4 py-2 text-sm font-display font-bold shadow-lg"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                +150 XP 🎉
              </motion.div>

              {/* Floating streak badge */}
              <motion.div
                className="absolute -bottom-4 -left-4 card px-4 py-2.5 flex items-center gap-2 shadow-xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-xs text-gray-400">Current streak</div>
                  <div className="text-sm font-display font-bold text-white">7 days</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
