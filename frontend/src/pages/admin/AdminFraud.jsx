import { useState, useEffect } from 'react'
import { fraudAPI } from '../../services/api'
import { FiAlertTriangle, FiShield } from 'react-icons/fi'

export default function AdminFraud() {
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('FLAGGED')
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [casesRes, statsRes] = await Promise.all([
        fraudAPI.getAll({ action: filter || undefined }),
        fraudAPI.getStats(),
      ])
      setCases(casesRes.data.cases)
      setStats(statsRes.data)
    } catch { setMsg('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const resolve = async (id, action, banUser = false) => {
    try {
      await fraudAPI.resolve(id, { action, banUser })
      setMsg('Case resolved')
      load()
    } catch (e) { setMsg(e.response?.data?.message || 'Error') }
  }

  const riskColor = (score) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🛡️ Fraud Detection</h1>

        {msg && <div className="mb-4 p-3 bg-violet-900/50 border border-violet-500 rounded-lg">{msg}</div>}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
              <p className="text-sm text-gray-400 mt-1">High Risk (70+)</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.unresolved}</p>
              <p className="text-sm text-gray-400 mt-1">Unresolved</p>
            </div>
            {stats.stats?.slice(0, 2).map(s => (
              <div key={s._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-violet-400">{s.count}</p>
                <p className="text-sm text-gray-400 mt-1">{s._id.replace(/_/g,' ')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {['FLAGGED','WARNING','SUSPENDED','DISMISSED',''].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s ? 'bg-violet-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
          <div className="space-y-4">
            {cases.map(c => (
              <div key={c._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <img src={c.user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${c.user?.name}`}
                        className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium">{c.user?.name}</p>
                        <p className="text-xs text-gray-400">{c.user?.email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-yellow-300">{c.type.replace(/_/g,' ')}</p>
                    <p className="text-sm text-gray-400 mt-1">{c.reason}</p>
                    {c.contest && <p className="text-xs text-gray-500 mt-1">Contest: {c.contest?.title}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${riskColor(c.riskScore)}`}>{c.riskScore}</p>
                    <p className="text-xs text-gray-500">risk score</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {c.action === 'FLAGGED' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => resolve(c._id, 'DISMISSED')}
                      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">Dismiss</button>
                    <button onClick={() => resolve(c._id, 'WARNING')}
                      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm transition">Warn User</button>
                    <button onClick={() => resolve(c._id, 'SUSPENDED', true)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition">Ban User</button>
                  </div>
                )}
              </div>
            ))}
            {cases.length === 0 && <div className="text-center py-20 text-gray-500">No fraud cases found</div>}
          </div>
        )}
      </div>
    </div>
  )
}
