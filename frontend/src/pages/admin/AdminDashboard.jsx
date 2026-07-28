import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="d11-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-display font-extrabold text-white">{value ?? '—'}</div>
        <div className="text-sm text-gray-500 text-gray-400">{label}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setAnalytics(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="section-label mb-1 block">Admin Panel</span>
        <h1 className="text-3xl font-display font-extrabold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"     value={analytics?.totalUsers}    icon="👥" color="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard label="Total Contests"  value={analytics?.totalContests}  icon="🏆" color="bg-amber-100 dark:bg-amber-900/30" />
        <StatCard label="Live Contests"   value={analytics?.activeContests} icon="⚡" color="bg-green-100 dark:bg-green-900/30" />
        <StatCard label="Total Quizzes"   value={analytics?.totalQuizzes}   icon="📝" color="bg-violet-100 dark:bg-violet-900/30" />
      </div>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/admin/contests', emoji: '🏟️', label: 'Manage Contests', sub: 'Create, edit, delete contests' },
          { to: '/admin/quizzes',  emoji: '📋', label: 'Manage Quizzes',  sub: 'Create and manage quizzes'   },
          { to: '/admin/users',    emoji: '👥', label: 'Manage Users',    sub: 'View and manage users'        },
        ].map(a => (
          <Link key={a.to} to={a.to} className="d11-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <span className="text-3xl">{a.emoji}</span>
            <div>
              <div className="font-display font-bold text-white group-hover:text-brand-500 transition-colors">{a.label}</div>
              <div className="text-xs text-gray-500 text-gray-400">{a.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      {analytics?.recentUsers?.length > 0 && (
        <div className="d11-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 border-[#1e1e1e]">
            <h2 className="font-display font-bold text-white">Recent Signups</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {analytics.recentUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <div className="text-sm font-medium text-white">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
