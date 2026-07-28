import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  // Keep tailwind's legacy `dark` class in sync with data-theme for any
  // downstream `dark:` variants still in the tree.
  useEffect(() => {
    const sync = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark'
      document.documentElement.classList.toggle('dark', t === 'dark')
    }
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <QuizProvider>
              <AppRoutes />
            </QuizProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
