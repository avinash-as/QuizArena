import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineMenuAlt3, HiX, HiOutlineUser, HiOutlineLogout,
  HiOutlineTrendingUp, HiOutlineCog, HiOutlineViewGrid,
  HiOutlineCurrencyDollar, HiOutlineBell,
  HiOutlineHome, HiOutlineCollection, HiOutlineStar,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { notificationAPI } from '../services/api'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { to: '/',            label: 'Home',        icon: <HiOutlineHome className="w-4 h-4" /> },
  { to: '/contests',    label: 'Contests',    icon: <HiOutlineCollection className="w-4 h-4" /> },
  { to: '/categories',  label: 'Practice',    icon: <HiOutlineStar className="w-4 h-4" /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <HiOutlineTrendingUp className="w-4 h-4" /> },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    h(); window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (!user) return
    const fetch = () => notificationAPI.getAll()
      .then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 60000)
    return () => clearInterval(t)
  }, [user])

  const handleLogout = () => {
    logout(); setDropdownOpen(false); navigate('/')
  }

  return (
    <header
      data-testid="site-navbar"
      className={`sticky top-0 z-50 transition-[background,border,box-shadow] duration-300 ${
        scrolled ? 'glass border-b shadow-sm' : 'border-b border-transparent bg-surface/0'
      }`}
    >
      {/* Marquee promo bar */}
      <div className="bg-brand-500 text-black text-[11px] font-bold py-1.5 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex gap-10 mr-10">
              <span>🏆 CLIMB THE LEADERBOARD</span>
              <span>⚡ 1000+ DAILY QUIZZES</span>
              <span>🎯 100% SKILL BASED</span>
              <span>🪙 WIN BONUS COINS</span>
              <span>🔒 100% SECURE & SAFE</span>
              <span>🎁 REFERRAL BONUSES</span>
            </span>
          ))}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none shrink-0" data-testid="brand-logo">
          <div className="relative w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg shadow-glow-brand">
            Q
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold-500 border-2 border-surface" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-black tracking-tight text-fg">Quiz<span className="text-brand-500">Pitara</span></span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-soft">Skill · Speed · Reward</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to} end={l.to === '/'}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'text-brand-500 bg-brand-500/10'
                      : 'text-muted hover:text-fg hover:bg-subtle'
                  }`
                }
              >
                {l.icon} {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/wallet"
                data-testid="coin-balance"
                className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg bg-gold-500/10 border border-gold-500/25 text-gold-500 text-sm font-bold hover:bg-gold-500/20 transition"
              >
                🪙 {(user.coins || 0).toLocaleString()}
              </Link>

              <Link
                to="/dashboard"
                data-testid="notif-bell"
                className="relative w-9 h-9 rounded-lg text-muted hover:text-fg hover:bg-subtle flex items-center justify-center transition"
              >
                <HiOutlineBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-coral-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  data-testid="user-menu-trigger"
                  className="flex items-center gap-2 pl-1 pr-3 h-9 rounded-lg border border-border hover:border-borderStrong bg-elevated hover:bg-subtle transition"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-md"
                  />
                  <span className="text-sm font-semibold text-fg hidden md:block max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-64 bg-elevated border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                        data-testid="user-menu"
                      >
                        <div className="px-4 py-3.5 bg-subtle border-b border-border">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`}
                              className="w-10 h-10 rounded-lg ring-2 ring-brand-500/40"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-fg truncate">{user.name}</p>
                              <p className="text-xs text-muted truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-elevated border border-border">
                            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Balance</span>
                            <span className="text-gold-500 font-black">🪙 {(user.coins || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="p-1">
                          {[
                            { to: '/dashboard',   icon: <HiOutlineViewGrid className="w-4 h-4" />,       label: 'Dashboard' },
                            { to: '/profile',     icon: <HiOutlineUser className="w-4 h-4" />,            label: 'Profile' },
                            { to: '/wallet',      icon: <HiOutlineCurrencyDollar className="w-4 h-4" />,  label: 'Coin Wallet' },
                            { to: '/leaderboard', icon: <HiOutlineTrendingUp className="w-4 h-4" />,      label: 'Leaderboard' },
                          ].map(item => (
                            <Link
                              key={item.to} to={item.to}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-fg hover:bg-subtle transition"
                              data-testid={`user-menu-${item.label.toLowerCase().replace(/\s+/g,'-')}`}
                            >
                              <span className="text-soft">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          {(user.role === 'admin' || user.role === 'super_admin') && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-brand-500 hover:bg-brand-500/10 transition"
                              data-testid="user-menu-admin"
                            >
                              <HiOutlineCog className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border p-1">
                          <button
                            onClick={handleLogout}
                            data-testid="logout-button"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-coral-500 hover:bg-coral-500/10 transition"
                          >
                            <HiOutlineLogout className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" data-testid="signin-btn" className="btn-ghost text-sm h-9 px-3">Sign in</Link>
              <Link to="/register" data-testid="signup-btn" className="btn-green h-9 px-4">Get started</Link>
            </div>
          )}

          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden w-9 h-9 rounded-lg text-muted hover:text-fg hover:bg-subtle flex items-center justify-center transition"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX className="w-5 h-5" /> : <HiOutlineMenuAlt3 className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden bg-elevated border-b border-border"
            data-testid="mobile-menu"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <NavLink
                  key={l.to} to={l.to} end={l.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                      isActive ? 'text-brand-500 bg-brand-500/10' : 'text-muted hover:text-fg hover:bg-subtle'
                    }`}
                >
                  {l.icon} {l.label}
                </NavLink>
              ))}
              {!user && (
                <div className="pt-3 grid grid-cols-2 gap-2 border-t border-border mt-1">
                  <Link to="/login" className="btn-outline justify-center h-10" onClick={() => setMenuOpen(false)}>Sign in</Link>
                  <Link to="/register" className="btn-green justify-center h-10" onClick={() => setMenuOpen(false)}>Get started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
