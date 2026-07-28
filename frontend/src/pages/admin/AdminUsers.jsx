import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getUsers({ search, limit: 50 })
      .then(r => setUsers(r.data.users))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const handleEdit = (user) => {
    setEditingId(user._id)
    setEditForm({ role: user.role, isActive: user.isActive, coins: user.coins })
  }

  const handleSave = async (id) => {
    setSaving(true)
    try {
      const { data } = await adminAPI.updateUser(id, editForm)
      setUsers(prev => prev.map(u => u._id === id ? data.user : u))
      setEditingId(null)
    } catch {}
    setSaving(false)
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="section-label mb-1 block">Admin</span>
          <h1 className="text-3xl font-display font-extrabold text-white">Manage Users</h1>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="d11-input max-w-xs"
        />
      </div>

      <div className="d11-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 border-[#1e1e1e] bg-gray-50 bg-[#111]/50">
              <tr>
                {['User','Email','Role','Coins','Quizzes','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-[#111] hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full" alt="" />
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {editingId === u._id ? (
                      <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="d11-input py-1 text-xs">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400' : 'bg-gray-100 bg-[#111] text-gray-600 text-gray-300'}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === u._id ? (
                      <input type="number" value={editForm.coins} onChange={e => setEditForm(f => ({ ...f, coins: Number(e.target.value) }))} className="d11-input py-1 w-24 text-xs" />
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">🪙{u.coins?.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-gray-300">{u.totalQuizzesPlayed}</td>
                  <td className="px-4 py-3">
                    {editingId === u._id ? (
                      <select value={editForm.isActive.toString()} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === 'true' }))} className="d11-input py-1 text-xs">
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === u._id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(u._id)} disabled={saving} className="btn-green py-1 px-2 text-xs">{saving ? '…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="btn-ghost py-1 px-2 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(u)} className="btn-ghost py-1 px-2 text-xs">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-10 text-gray-500">No users found</div>}
        </div>
      </div>
    </div>
  )
}
