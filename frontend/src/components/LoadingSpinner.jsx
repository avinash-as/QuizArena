export default function LoadingSpinner({ fullScreen = false, size = 'md', label }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 border-r-brand-500 animate-spin`} />
      </div>
      {label && <p className="text-xs text-muted font-medium tracking-wide">{label}</p>}
    </div>
  )
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface" data-testid="loading-fullscreen">
        {spinner}
      </div>
    )
  }
  return <div className="flex items-center justify-center p-8" data-testid="loading-inline">{spinner}</div>
}
