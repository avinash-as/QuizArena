import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome, HiOutlineCollection, HiOutlineStar,
  HiOutlineTrendingUp, HiOutlineUser,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

const ITEMS = [
  { to: '/',            label: 'Home',    icon: HiOutlineHome },
  { to: '/contests',    label: 'Play',    icon: HiOutlineCollection },
  { to: '/categories',  label: 'Practice',icon: HiOutlineStar },
  { to: '/leaderboard', label: 'Ranks',   icon: HiOutlineTrendingUp },
  { to: '/profile',     label: 'Me',      icon: HiOutlineUser, requiresAuth: true },
]

export default function BottomNav() {
  const { user } = useAuth()
  if (!user) return null // only for logged-in players

  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                isActive ? 'text-brand-500' : 'text-muted hover:text-fg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-9 h-8 rounded-lg flex items-center justify-center transition ${isActive ? 'bg-brand-500/10' : ''}`}>
                  <item.icon className="w-[18px] h-[18px]" />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
