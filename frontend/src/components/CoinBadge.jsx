export default function CoinBadge({ amount, size = 'sm', className = '' }) {
  const sizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-sm px-2 py-1', md: 'text-base px-3 py-1.5' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-display font-bold ${sizes[size]} ${className}`}>
      🪙 {typeof amount === 'number' ? amount.toLocaleString() : amount}
    </span>
  )
}
