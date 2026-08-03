import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiArrowLeft } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [unverified, setUnverified] = useState(false)
  const [resendState, setResendState] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setUnverified(false); setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.response?.data?.unverified) {
        setUnverified(true)
        setError(err.response.data.message)
      } else {
        setError(err.response?.data?.message || 'Invalid email or password')
      }
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResendState('sending')
    try {
      await authAPI.resendVerification(email)
      setResendState('sent')
    } catch (_) {
      setResendState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-surface text-fg flex" data-testid="login-page">
      {/* Left showcase panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-brand-900/40 via-elevated to-surface">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold-500/10 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-xl shadow-glow-brand">Q</div>
          <span className="text-xl font-black">Quiz<span className="text-brand-500">Pitara</span></span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
          <h2 className="text-5xl font-black leading-[1.05] mb-5">
            Welcome<br /><span className="brand-text">back, player.</span>
          </h2>
          <p className="text-muted mb-8 text-lg max-w-md">Your next win is one login away. Contests are live 24/7.</p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[['🪙10L+','Prizes given'],['1000+','Daily contests'],['50K+','Active players'],['100%','Skill based']].map(([v,l]) => (
              <div key={l} className="qa-card px-4 py-3">
                <p className="text-lg font-black text-brand-500">{v}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted font-mono mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-soft">🔒 100% Secure · Skill-Based Gaming</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link to="/" className="btn-ghost h-9 px-3 text-xs" data-testid="back-to-home">
            <HiArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black">Q</div>
              <span className="font-black text-lg">Quiz<span className="text-brand-500">Pitara</span></span>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black mb-1">Sign in</h1>
            <p className="text-muted text-sm mb-8">Enter your details to continue playing.</p>
          </motion.div>

          {error && (
            <div className="mb-4 p-3 bg-coral-500/10 border border-coral-500/30 rounded-xl text-coral-500 text-sm" data-testid="login-error">
              {error}
              {unverified && (
                <div className="mt-2">
                  {resendState === 'sent' ? (
                    <span className="text-brand-500 text-xs font-semibold">✓ Verification email sent — check your inbox.</span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={resendState === 'sending'}
                      className="text-xs font-semibold text-brand-500 hover:underline disabled:opacity-60">
                      {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input
                  data-testid="login-email"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="qa-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
                <input
                  data-testid="login-password"
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required className="qa-input pl-10 pr-12"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft hover:text-fg">
                  {showPw ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs text-brand-500 font-semibold hover:underline">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" disabled={loading} data-testid="login-submit"
              className="btn-green w-full h-12 text-base mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            New here?{' '}
            <Link to="/register" data-testid="register-link" className="text-brand-500 font-bold hover:underline">Create free account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
