import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlineLogin } from 'react-icons/hi'
import { FiUsers, FiClock } from 'react-icons/fi'
import { roomAPI } from '../services/api'

const STATUS_STYLE = {
  WAITING: 'text-blue-500 bg-blue-500/10',
  STARTING: 'text-brand-500 bg-brand-500/10',
  LIVE: 'text-brand-500 bg-brand-500/10',
  PAUSED: 'text-gold-500 bg-gold-500/10',
  COMPLETED: 'text-soft bg-subtle',
  CANCELLED: 'text-coral-500 bg-coral-500/10',
}

function RoomRow({ room, meta }) {
  return (
    <Link to={`/rooms/${room.code}`} className="qa-card-hover flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-bold text-fg text-sm truncate">{room.title}</p>
        <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
          <span className="font-mono">{room.code}</span>
          {meta}
        </p>
      </div>
      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLE[room.status] || 'bg-subtle text-soft'}`}>
        {room.status}
      </span>
    </Link>
  )
}

export default function RoomsHub() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('hosted')
  const [hosted, setHosted] = useState([])
  const [joined, setJoined] = useState([])
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    Promise.all([roomAPI.myRooms(), roomAPI.joinedRooms()])
      .then(([my, j]) => { setHosted(my.data.rooms); setJoined(j.data.rooms) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleJoinByCode = (e) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setJoinError('')
    navigate(`/rooms/${code}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-fg">Live Rooms</h1>
          <p className="text-sm text-muted mt-1">Host or join a real-time quiz contest with friends.</p>
        </div>
        <Link to="/rooms/create" className="btn-primary inline-flex items-center gap-2 shrink-0">
          <HiOutlinePlus className="w-4 h-4" /> Create Room
        </Link>
      </div>

      <form onSubmit={handleJoinByCode} className="qa-card flex items-center gap-2 p-3 mb-8">
        <input
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          placeholder="Enter room code (e.g. ABC123)"
          maxLength={12}
          className="flex-1 bg-transparent outline-none text-sm font-mono uppercase tracking-widest px-2 text-fg placeholder:text-soft placeholder:normal-case placeholder:tracking-normal"
        />
        <button type="submit" className="btn-secondary inline-flex items-center gap-1.5 shrink-0">
          <HiOutlineLogin className="w-4 h-4" /> Join
        </button>
      </form>
      {joinError && <p className="text-coral-500 text-xs -mt-6 mb-6">{joinError}</p>}

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[{ key: 'hosted', label: 'My Rooms' }, { key: 'joined', label: 'Joined Rooms' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              tab === t.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted py-8 text-center">Loading rooms…</p>
      ) : tab === 'hosted' ? (
        hosted.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">You haven't hosted any rooms yet.</p>
        ) : (
          <div className="grid gap-2">
            {hosted.map((room, i) => (
              <motion.div key={room._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <RoomRow room={room} meta={<span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{room.currentParticipants}/{room.maxParticipants}</span>} />
              </motion.div>
            ))}
          </div>
        )
      ) : joined.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">You haven't joined any rooms yet.</p>
      ) : (
        <div className="grid gap-2">
          {joined.map(({ room, myScore, myRank }, i) => room && (
            <motion.div key={room._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <RoomRow room={room} meta={room.status === 'COMPLETED'
                ? <span>Score {myScore} · Rank #{myRank || '—'}</span>
                : <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />Waiting</span>} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
