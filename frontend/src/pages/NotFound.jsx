import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiHome } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-8xl mb-6 select-none"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        >
          🧩
        </motion.div>

        <h1 className="text-7xl font-display font-extrabold text-[#22c55e] mb-2">404</h1>
        <h2 className="text-2xl font-display font-bold text-white mb-3">
          Page not found
        </h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-8">
          Looks like this question isn't in our database. Try heading back to the arena.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-outline">
            <HiArrowLeft className="w-4 h-4" /> Go back
          </button>
          <Link to="/" className="btn-green">
            <HiHome className="w-4 h-4" /> Take me home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
