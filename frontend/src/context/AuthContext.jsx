import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

// Single source of truth for the auth token key across the whole app.
const TOKEN_KEY = 'qa_token'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data
  }, [])

  // Registration doesn't auto-login — email verification is required first.
  const register = useCallback(async (name, email, password, referralCode) => {
    const { data } = await authAPI.register(name, email, password, referralCode)
    return data
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me()
      setUser(data.user)
    } catch (_) {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export { TOKEN_KEY }
