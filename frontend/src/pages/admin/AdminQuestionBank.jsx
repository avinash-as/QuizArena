// import { useState, useEffect } from 'react'
// import { questionAPI } from '../../services/api'
// import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload } from 'react-icons/fi'

// const CATEGORIES = ['javascript','react','nodejs','dsa','aptitude','general','current-affairs','science','history','geography','math','english']
// const DIFFICULTIES = ['easy','medium','hard']

// export default function AdminQuestionBank() {
//   const [questions, setQuestions] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState({ category: '', difficulty: '', search: '' })
//   const [page, setPage] = useState(1)
//   const [pagination, setPagination] = useState({})
//   const [showForm, setShowForm] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [form, setForm] = useState({
//     text: '', options: ['','','',''], correctIndex: 0,
//     explanation: '', category: 'general', difficulty: 'medium',
//     tags: '', points: 10, timeLimit: 30,
//   })
//   const [msg, setMsg] = useState('')

//   const load = async () => {
//     setLoading(true)
//     try {
//       const { data } = await questionAPI.getAll({ ...filter, page, limit: 15 })
//       setQuestions(data.questions)
//       setPagination(data.pagination)
//     } catch {
//       setMsg('Failed to load questions')
//     } finally { setLoading(false) }
//   }

//   useEffect(() => { load() }, [filter, page])

//   const handleSubmit = async () => {
//     try {
//       const payload = {
//         ...form,
//         options: form.options.filter(o => o.trim()),
//         tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
//       }
//       if (editing) {
//         await questionAPI.update(editing._id, payload)
//         setMsg('Question updated')
//       } else {
//         await questionAPI.create(payload)
//         setMsg('Question created')
//       }
//       setShowForm(false)
//       setEditing(null)
//       load()
//     } catch (e) { setMsg(e.response?.data?.message || 'Error') }
//   }

//   const handleEdit = (q) => {
//     setEditing(q)
//     setForm({
//       text: q.text, options: q.options.concat(['','','','']).slice(0,4),
//       correctIndex: q.correctIndex, explanation: q.explanation || '',
//       category: q.category, difficulty: q.difficulty,
//       tags: q.tags?.join(', ') || '', points: q.points || 10, timeLimit: q.timeLimit || 30,
//     })
//     setShowForm(true)
//   }

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this question?')) return
//     await questionAPI.delete(id)
//     load()
//   }

//   const diffColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }

//   return (
//     <div className="min-h-screen bg-gray-950 text-white p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold">📚 Question Bank</h1>
//           <button onClick={() => { setEditing(null); setShowForm(true) }}
//             className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg font-medium transition">
//             <FiPlus /> Add Question
//           </button>
//         </div>

//         {msg && <div className="mb-4 p-3 bg-violet-900/50 border border-violet-500 rounded-lg">{msg}</div>}

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
//           <div className="relative">
//             <FiSearch className="absolute left-3 top-3 text-gray-400" />
//             <input value={filter.search} onChange={e => setFilter(f => ({...f, search: e.target.value}))}
//               placeholder="Search questions..." className="w-full bg-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm border border-gray-700 focus:border-violet-500 outline-none" />
//           </div>
//           <select value={filter.category} onChange={e => setFilter(f => ({...f, category: e.target.value}))}
//             className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
//             <option value="">All Categories</option>
//             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//           </select>
//           <select value={filter.difficulty} onChange={e => setFilter(f => ({...f, difficulty: e.target.value}))}
//             className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
//             <option value="">All Difficulties</option>
//             {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
//           </select>
//         </div>

//         {/* Question Form Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//             <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
//               <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Question</h2>
//               <div className="space-y-4">
//                 <textarea value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))}
//                   placeholder="Question text" rows={3}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:border-violet-500 outline-none" />
//                 {form.options.map((opt, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <input type="radio" name="correct" checked={form.correctIndex === i}
//                       onChange={() => setForm(f => ({...f, correctIndex: i}))} className="accent-violet-500" />
//                     <input value={opt} onChange={e => {
//                       const opts = [...form.options]; opts[i] = e.target.value; setForm(f => ({...f, options: opts}))
//                     }} placeholder={`Option ${i+1}${form.correctIndex === i ? ' ✓ correct' : ''}`}
//                       className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
//                   </div>
//                 ))}
//                 <textarea value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))}
//                   placeholder="Explanation (shown after answer)" rows={2}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:border-violet-500 outline-none" />
//                 <div className="grid grid-cols-2 gap-3">
//                   <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
//                     className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
//                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//                   </select>
//                   <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}
//                     className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
//                     {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                   <input type="number" value={form.points} onChange={e => setForm(f => ({...f, points: +e.target.value}))}
//                     placeholder="Points" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
//                   <input type="number" value={form.timeLimit} onChange={e => setForm(f => ({...f, timeLimit: +e.target.value}))}
//                     placeholder="Time limit (s)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
//                 </div>
//                 <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
//                   placeholder="Tags (comma-separated)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
//                 <div className="flex gap-3 pt-2">
//                   <button onClick={handleSubmit} className="flex-1 bg-violet-600 hover:bg-violet-700 py-2 rounded-lg font-medium transition">
//                     {editing ? 'Update' : 'Create'}
//                   </button>
//                   <button onClick={() => setShowForm(false)} className="px-6 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition">
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Questions Table */}
//         {loading ? (
//           <div className="text-center py-20 text-gray-400">Loading...</div>
//         ) : (
//           <div className="space-y-2">
//             {questions.map(q => (
//               <div key={q._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-white font-medium line-clamp-2">{q.text}</p>
//                   <div className="flex items-center gap-3 mt-2 flex-wrap">
//                     <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{q.category}</span>
//                     <span className={`text-xs font-medium ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
//                     <span className="text-xs text-gray-500">{q.points} pts · {q.timeLimit}s</span>
//                     {q.tags?.map(t => <span key={t} className="text-xs bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded">{t}</span>)}
//                   </div>
//                 </div>
//                 <div className="flex gap-2 shrink-0">
//                   <button onClick={() => handleEdit(q)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
//                     <FiEdit2 size={14} />
//                   </button>
//                   <button onClick={() => handleDelete(q._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition">
//                     <FiTrash2 size={14} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {pagination.pages > 1 && (
//           <div className="flex justify-center gap-2 mt-6">
//             {Array.from({ length: pagination.pages }, (_, i) => (
//               <button key={i+1} onClick={() => setPage(i+1)}
//                 className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i+1 ? 'bg-violet-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
//                 {i+1}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }






import { useState, useEffect, useRef } from 'react'
import { questionAPI } from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload } from 'react-icons/fi'

// Minimal CSV parser for the question bulk-import format below. Handles
// quoted fields (so option/explanation text can safely contain commas) but
// deliberately doesn't pull in a full CSV library for one admin-only screen.
// Expected header row:
// text,option1,option2,option3,option4,correctIndex,explanation,category,difficulty,points,negativeMarks,timeLimit,tags
function parseCSV(raw) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (inQuotes) {
      if (c === '"' && raw[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') { inQuotes = false }
      else { field += c }
    } else if (c === '"') { inQuotes = true }
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && raw[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(v => v.trim() !== '')) rows.push(row)
      row = []
    } else { field += c }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  if (rows.length < 2) return []

  const header = rows[0].map(h => h.trim())
  return rows.slice(1).map(cols => {
    const get = (name) => {
      const idx = header.indexOf(name)
      return idx === -1 ? '' : (cols[idx] ?? '').trim()
    }
    return {
      text: get('text'),
      options: [get('option1'), get('option2'), get('option3'), get('option4')],
      correctIndex: Number(get('correctIndex')) || 0,
      explanation: get('explanation'),
      category: get('category') || 'general',
      difficulty: get('difficulty') || 'medium',
      points: Number(get('points')) || 10,
      negativeMarks: Number(get('negativeMarks')) || 0,
      timeLimit: Number(get('timeLimit')) || 30,
      tags: get('tags') ? get('tags').split('|').map(t => t.trim()).filter(Boolean) : [],
    }
  }).filter(q => q.text && q.options.every(o => o))
}

const CATEGORIES = ['javascript','react','nodejs','dsa','aptitude','general','current-affairs','science','history','geography','math','english']
const DIFFICULTIES = ['easy','medium','hard']

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: '', difficulty: '', search: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    text: '', options: ['','','',''], correctIndex: 0,
    explanation: '', category: 'general', difficulty: 'medium',
    tags: '', points: 10, negativeMarks: 0, timeLimit: 30,
  })
  const [msg, setMsg] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await questionAPI.getAll({ ...filter, page, limit: 15 })
      setQuestions(data.questions)
      setPagination(data.pagination)
    } catch {
      setMsg('Failed to load questions')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter, page])

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        options: form.options.filter(o => o.trim()),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      if (editing) {
        await questionAPI.update(editing._id, payload)
        setMsg('Question updated')
      } else {
        await questionAPI.create(payload)
        setMsg('Question created')
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch (e) { setMsg(e.response?.data?.message || 'Error') }
  }

  const handleEdit = (q) => {
    setEditing(q)
    setForm({
      text: q.text, options: q.options.concat(['','','','']).slice(0,4),
      correctIndex: q.correctIndex, explanation: q.explanation || '',
      category: q.category, difficulty: q.difficulty,
      tags: q.tags?.join(', ') || '', points: q.points || 10,
      negativeMarks: q.negativeMarks || 0, timeLimit: q.timeLimit || 30,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await questionAPI.delete(id)
    load()
  }

  const handleCSVSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file next time
    if (!file) return

    setImporting(true)
    setMsg('')
    try {
      const text = await file.text()
      const questions = parseCSV(text)
      if (questions.length === 0) {
        setMsg('No valid rows found. Check the header row matches: text,option1,option2,option3,option4,correctIndex,explanation,category,difficulty,points,negativeMarks,timeLimit,tags')
        return
      }
      const { data } = await questionAPI.bulkCreate({ questions })
      setMsg(`Imported ${data.created} of ${questions.length} question(s) from CSV`)
      setPage(1)
      load()
    } catch (err) {
      setMsg(err.response?.data?.message || 'CSV import failed')
    } finally {
      setImporting(false)
    }
  }

  const diffColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📚 Question Bank</h1>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleCSVSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50">
              <FiUpload /> {importing ? 'Importing…' : 'Import CSV'}
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true) }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg font-medium transition">
              <FiPlus /> Add Question
            </button>
          </div>
        </div>

        {msg && <div className="mb-4 p-3 bg-violet-900/50 border border-violet-500 rounded-lg">{msg}</div>}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input value={filter.search} onChange={e => setFilter(f => ({...f, search: e.target.value}))}
              placeholder="Search questions..." className="w-full bg-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm border border-gray-700 focus:border-violet-500 outline-none" />
          </div>
          <select value={filter.category} onChange={e => setFilter(f => ({...f, category: e.target.value}))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filter.difficulty} onChange={e => setFilter(f => ({...f, difficulty: e.target.value}))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Question Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <h2 className="text-xl font-bold mb-4">{editing ? 'Edit' : 'Add'} Question</h2>
              <div className="space-y-4">
                <textarea value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))}
                  placeholder="Question text" rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:border-violet-500 outline-none" />
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" name="correct" checked={form.correctIndex === i}
                      onChange={() => setForm(f => ({...f, correctIndex: i}))} className="accent-violet-500" />
                    <input value={opt} onChange={e => {
                      const opts = [...form.options]; opts[i] = e.target.value; setForm(f => ({...f, options: opts}))
                    }} placeholder={`Option ${i+1}${form.correctIndex === i ? ' ✓ correct' : ''}`}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                ))}
                <textarea value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))}
                  placeholder="Explanation (shown after answer)" rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:border-violet-500 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="number" value={form.points} onChange={e => setForm(f => ({...f, points: +e.target.value}))}
                    placeholder="Points" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="number" min="0" value={form.negativeMarks} onChange={e => setForm(f => ({...f, negativeMarks: +e.target.value}))}
                    placeholder="Negative marks (0 = none)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="number" value={form.timeLimit} onChange={e => setForm(f => ({...f, timeLimit: +e.target.value}))}
                    placeholder="Time limit (s)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
                  placeholder="Tags (comma-separated)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} className="flex-1 bg-violet-600 hover:bg-violet-700 py-2 rounded-lg font-medium transition">
                    {editing ? 'Update' : 'Create'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-6 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-2">
            {questions.map(q => (
              <div key={q._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium line-clamp-2">{q.text}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{q.category}</span>
                    <span className={`text-xs font-medium ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                    <span className="text-xs text-gray-500">
                      {q.points} pts{q.negativeMarks > 0 && ` · −${q.negativeMarks} if wrong`} · {q.timeLimit}s
                    </span>
                    {q.tags?.map(t => <span key={t} className="text-xs bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded">{t}</span>)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(q)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i+1 ? 'bg-violet-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
