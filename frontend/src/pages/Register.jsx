import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiCheck, HiArrowLeft } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const PW_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter',  test: v => /[A-Z]/.test(v) },
  { label: 'One number',            test: v => /\d/.test(v) },
]

const PERKS = [
  ['🎁', '🪙100 welcome bonus on signup'],
  ['⚡', 'Instant access to 1000+ contests'],
  ['🏆', 'Win real cash prizes daily'],
  ['🔗', 'Earn 🪙200 for every friend you refer'],
]

export default function Register() {
  const { register } = useAuth()
  const [params]     = useSearchParams()

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', referral: params.get('ref') || '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [registered, setRegistered] = useState(false)

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.referral || undefined)
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-surface text-fg flex items-center justify-center px-4" data-testid="register-success">
        <div className="w-full max-w-sm text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-xl">Q</div>
            <span className="text-xl font-black">Quiz<span className="text-brand-500">Arena</span></span>
          </Link>
          <div className="qa-card p-8">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-2xl font-black mb-2">Check your email</h1>
            <p className="text-sm text-muted mb-6">
              We've sent a verification link to <strong className="text-fg">{form.email}</strong>.
              Click it to activate your account — then log in.
            </p>
            <Link to="/login" className="btn-green w-full justify-center inline-flex h-12">Back to Sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-fg flex" data-testid="register-page">
      {/* Left showcase panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-accent-600/25 via-elevated to-surface">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-500/15 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-xl shadow-glow-brand">Q</div>
          <span className="text-xl font-black">Quiz<span className="text-brand-500">Arena</span></span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 text-xs font-bold mb-5">
            🎁 🪙100 welcome bonus
          </div>
          <h2 className="text-5xl font-black leading-[1.05] mb-5">
            Start winning<br /><span className="brand-text">in minutes.</span>
          </h2>
          <p className="text-muted mb-8 text-lg max-w-md">Free to join. Free to play. Real prizes to win.</p>

          <div className="space-y-3 max-w-md">
            {PERKS.map(([icon, text], i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="qa-card px-4 py-3 flex items-center gap-3"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-fg font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-soft">🔒 Your data is 100% secure and encrypted</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link to="/" className="btn-ghost h-9 px-3 text-xs" data-testid="back-to-home"><HiArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm py-10">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black">Q</div>
              <span className="font-black text-lg">Quiz<span className="text-brand-500">Arena</span></span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-500 text-xs font-bold mb-4">
            🎁 Get 🪙100 bonus on signup
          </div>
          <h1 className="text-3xl font-black mb-1">Create account</h1>
          <p className="text-muted text-sm mb-6">Free forever. No credit card needed.</p>

          {error && (
            <div className="mb-4 p-3 bg-coral-500/10 border border-coral-500/30 rounded-xl text-coral-500 text-sm" data-testid="register-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Full name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input data-testid="register-name" value={form.name} onChange={set('name')} placeholder="Your full name" required minLength={2} className="qa-input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input data-testid="register-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="qa-input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input data-testid="register-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Create a strong password" required className="qa-input pl-10 pr-12" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft hover:text-fg">
                  {showPw ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {PW_RULES.map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(form.password) ? 'text-brand-500' : 'text-soft'}`}>
                      <HiCheck className={`w-3.5 h-3.5 ${r.test(form.password) ? 'opacity-100' : 'opacity-30'}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Confirm password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input data-testid="register-confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" required className="qa-input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Referral code (optional)</label>
              <input data-testid="register-referral" value={form.referral} onChange={set('referral')} placeholder="Enter referral code" className="qa-input uppercase" />
            </div>

            <button type="submit" disabled={loading} data-testid="register-submit" className="btn-green w-full h-12 text-base mt-2">
              {loading ? 'Creating account…' : 'Create account · Get 🪙100 🎁'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-[11px] text-soft mt-3">
            By registering you agree to our{' '}
            <Link to="/terms" className="text-muted hover:text-fg">Terms</Link> &{' '}
            <Link to="/privacy" className="text-muted hover:text-fg">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
