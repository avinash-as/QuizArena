import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiSearch, HiAdjustments } from 'react-icons/hi'
import CategoryCard from '../components/CategoryCard'
import { CATEGORIES } from '../context/QuizContext'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'questions', label: 'Most questions' },
  { value: 'az', label: 'A → Z' },
]

export default function Categories() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')

  const filtered = useMemo(() => {
    let cats = CATEGORIES.filter(c =>
      c.label.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'popular')   cats.sort((a, b) => b.players - a.players)
    if (sort === 'questions') cats.sort((a, b) => b.questions - a.questions)
    if (sort === 'az')        cats.sort((a, b) => a.label.localeCompare(b.label))
    return cats
  }, [search, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="section-label mb-3 block">Browse all</span>
        <h1 className="text-4xl font-display font-extrabold text-white mb-2">Quiz categories</h1>
        <p className="text-gray-400">Pick a category and prove what you know.</p>
      </motion.div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="d11-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <HiAdjustments className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="d11-input w-auto py-2.5 pr-8 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-5 font-mono">
        {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'} found
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-white mb-2">No categories found</h3>
          <p className="text-gray-400 text-sm">Try a different search term.</p>
          <button
            onClick={() => setSearch('')}
            className="btn-outline mt-4"
          >
            Clear search
          </button>
        </motion.div>
      )}
    </div>
  )
}
