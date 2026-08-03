import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiCheck } from 'react-icons/hi'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PW_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter',  test: v => /[A-Z]/.test(v) },
  { label: 'One number',            test: v => /\d/.test(v) },
]

export default function ResetPassword() {
  const { token } = useParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm)      { setError('Passwords do not match'); return }
    if (password.length < 8)       { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await authAPI.resetPassword(token, password)
      // Backend issues a fresh token+user on successful reset — sign the
      // user in immediately rather than sending them back to /login, same
      // as most reset-password flows (they just proved account ownership).
      if (data.token) {
        localStorage.setItem('qa_token', data.token)
        setUser(data.user)
      }
      setDone(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e] flex items-center justify-center text-black font-black text-xl">Q</div>
          <span className="text-xl font-black text-white">Quiz<span className="text-[#22c55e]">Pitara</span></span>
        </Link>

        {done ? (
          <div className="d11-card p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-black text-white mb-2">Password reset!</h1>
            <p className="text-sm text-gray-400">Taking you to QuizPitara…</p>
          </div>
        ) : (
          <div className="d11-card p-8">
            <h1 className="text-2xl font-black text-white mb-1">Set a new password</h1>
            <p className="text-sm text-gray-400 mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password" required className="d11-input pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPw ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    {PW_RULES.map(r => (
                      <div key={r.label} className={`flex items-center gap-2 text-xs ${r.test(password) ? 'text-[#22c55e]' : 'text-gray-600'}`}>
                        <HiCheck className={`w-3.5 h-3.5 ${r.test(password) ? 'opacity-100' : 'opacity-30'}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password" required className="d11-input pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-green w-full py-3.5 text-base mt-2 disabled:opacity-60">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-white">← Back to Sign in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
