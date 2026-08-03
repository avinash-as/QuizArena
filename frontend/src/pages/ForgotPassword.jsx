import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMail } from 'react-icons/hi'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="text-2xl font-display font-extrabold text-[#22c55e] block text-center mb-8">
          ⚡ QuizPitara
        </Link>

        {sent ? (
          <div className="d11-card p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-400 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="btn-green w-full justify-center">Back to Sign in</Link>
          </div>
        ) : (
          <div className="d11-card p-8">
            <h1 className="text-2xl font-display font-extrabold text-white mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-400 mb-6">Enter your email to get a reset link.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Email address</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="d11-input pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-green w-full justify-center py-3 disabled:opacity-60">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-brand-500 hover:text-brand-600 font-medium">← Back to Sign in</Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
