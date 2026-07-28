import { useState, useEffect } from 'react'
import { prizeTemplateAPI } from '../../services/api'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function AdminPrizeTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name: '', description: '', platformFeePercent: 10,
    ranks: [{ rankFrom: 1, rankTo: 1, label: '1st Place', percentage: 50 }],
  })

  const load = async () => {
    setLoading(true)
    try { const { data } = await prizeTemplateAPI.getAll(); setTemplates(data.templates) }
    catch { setMsg('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addRank = () => setForm(f => ({
    ...f, ranks: [...f.ranks, { rankFrom: f.ranks.length + 1, rankTo: f.ranks.length + 1, label: `Rank ${f.ranks.length + 1}`, percentage: 0 }]
  }))

  const handleSubmit = async () => {
    const totalPct = form.ranks.reduce((s, r) => s + Number(r.percentage), 0)
    if (totalPct > 100) { setMsg('Total percentage exceeds 100%'); return }
    try {
      await prizeTemplateAPI.create(form)
      setMsg('Template created')
      setShowForm(false)
      load()
    } catch (e) { setMsg(e.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return
    await prizeTemplateAPI.delete(id)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🏆 Prize Templates</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg font-medium transition">
            <FiPlus /> New Template
          </button>
        </div>

        {msg && <div className="mb-4 p-3 bg-violet-900/50 border border-violet-500 rounded-lg">{msg}</div>}

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="font-semibold mb-4">Create Prize Template</h2>
            <div className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Template name (e.g. Top 3)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={form.platformFeePercent} onChange={e => setForm(f => ({...f, platformFeePercent: +e.target.value}))}
                placeholder="Platform fee %" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />

              <div className="space-y-3">
                {form.ranks.map((rank, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input type="number" value={rank.rankFrom} onChange={e => {
                      const ranks = [...form.ranks]; ranks[i].rankFrom = +e.target.value; setForm(f => ({...f, ranks}))
                    }} placeholder="From rank" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                    <input type="number" value={rank.rankTo} onChange={e => {
                      const ranks = [...form.ranks]; ranks[i].rankTo = +e.target.value; setForm(f => ({...f, ranks}))
                    }} placeholder="To rank" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                    <input value={rank.label} onChange={e => {
                      const ranks = [...form.ranks]; ranks[i].label = e.target.value; setForm(f => ({...f, ranks}))
                    }} placeholder="Label" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                    <input type="number" value={rank.percentage} onChange={e => {
                      const ranks = [...form.ranks]; ranks[i].percentage = +e.target.value; setForm(f => ({...f, ranks}))
                    }} placeholder="%" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
                <button onClick={addRank} className="text-sm text-violet-400 hover:text-violet-300">+ Add rank tier</button>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition">Create</button>
                <button onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <div key={t._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-xs text-gray-500">Platform fee: {t.platformFeePercent}%</p>
                  </div>
                  <button onClick={() => handleDelete(t._id)} className="text-gray-500 hover:text-red-400 transition">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {t.ranks.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Rank {r.rankFrom}{r.rankTo !== r.rankFrom ? `-${r.rankTo}` : ''}: {r.label}</span>
                      <span className="font-medium text-violet-400">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
