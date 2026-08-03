import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendState, setResendState] = useState('idle') // idle | sending | sent

  useEffect(() => {
    let cancelled = false
    authAPI.verifyEmail(token)
      .then(({ data }) => { if (!cancelled) { setStatus('success'); setMessage(data.message) } })
      .catch(err => { if (!cancelled) { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.') } })
    return () => { cancelled = true }
  }, [token])

  const handleResend = async () => {
    if (!resendEmail) return
    setResendState('sending')
    try {
      await authAPI.resendVerification(resendEmail)
      setResendState('sent')
    } catch (_) {
      setResendState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e] flex items-center justify-center text-black font-black text-xl">Q</div>
          <span className="text-xl font-black text-white">Quiz<span className="text-[#22c55e]">Pitara</span></span>
        </Link>

        <div className="d11-card p-8">
          {status === 'verifying' && (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <h1 className="text-xl font-black text-white mb-2">Verifying your email…</h1>
              <p className="text-sm text-gray-400">One moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-4xl mb-4">✅</div>
              <h1 className="text-xl font-black text-white mb-2">Email verified!</h1>
              <p className="text-sm text-gray-400 mb-6">{message}</p>
              <Link to="/login" className="btn-green w-full justify-center inline-flex">Sign in</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <h1 className="text-xl font-black text-white mb-2">Link expired or invalid</h1>
              <p className="text-sm text-gray-400 mb-6">{message}</p>

              {resendState === 'sent' ? (
                <p className="text-[#22c55e] text-sm font-semibold">✓ New verification email sent — check your inbox.</p>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                    placeholder="you@example.com" className="d11-input text-center"
                  />
                  <button onClick={handleResend} disabled={resendState === 'sending' || !resendEmail}
                    className="btn-green w-full justify-center disabled:opacity-60">
                    {resendState === 'sending' ? 'Sending…' : 'Send a new verification link'}
                  </button>
                </div>
              )}

              <Link to="/login" className="block text-sm text-gray-500 hover:text-white mt-4">← Back to Sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
