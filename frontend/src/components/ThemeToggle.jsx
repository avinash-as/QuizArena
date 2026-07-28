import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label="Toggle theme"
      className={`relative overflow-hidden rounded-lg border border-border bg-elevated hover:bg-subtle transition-colors ${compact ? 'w-9 h-9' : 'h-9 w-9'} flex items-center justify-center text-fg`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -14, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
          className="text-fg"
        >
          {dark ? <HiOutlineSun className="w-4.5 h-4.5" size={18} /> : <HiOutlineMoon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
