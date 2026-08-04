import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiUsers, FiLock, FiUnlock, FiCopy, FiCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../services/api'
import useRoomSocket from '../hooks/useRoomSocket'

export default function RoomLobby() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liveCount, setLiveCount] = useState(0)
  const [locked, setLocked] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [announceText, setAnnounceText] = useState('')

  const isHost = room && user && room.host?._id === user._id

  const loadRoom = useCallback(() => {
    roomAPI.getByCode(code).then(({ data }) => {
      setRoom(data.room)
      setHasJoined(data.hasJoined)
      setLiveCount(data.room.currentParticipants)
      setLocked(data.room.locked)
    }).catch(err => setError(err.response?.data?.message || 'Room not found'))
      .finally(() => setLoading(false))
  }, [code])

  useEffect(() => { loadRoom() }, [loadRoom])

  const { start, lock, announce } = useRoomSocket(code, {
    onParticipantCount: ({ count }) => setLiveCount(count),
    onLockChanged: ({ locked }) => setLocked(locked),
    onAnnouncement: ({ message }) => setAnnouncement(message),
    onStatus: ({ status }) => {
      if (status === 'LIVE') navigate(`/rooms/${code}/play`)
      if (status === 'CANCELLED') setError('The host cancelled this room')
    },
    onError: ({ message }) => setError(message),
  })

  const handleJoin = async (e) => {
    e?.preventDefault()
    setJoining(true)
    setError('')
    try {
      await roomAPI.join(code, passwordInput || undefined)
      setHasJoined(true)
      loadRoom()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join room')
    } finally {
      setJoining(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading room…</div>
  if (!room) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-fg font-semibold mb-2">Room not found</p>
      <p className="text-sm text-muted mb-4">{error || 'Check the code and try again.'}</p>
      <Link to="/rooms" className="btn-secondary">Back to Rooms</Link>
    </div>
  )

  if (room.status === 'LIVE') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-fg font-semibold mb-4">This room is already live.</p>
        <Link to={`/rooms/${code}/play`} className="btn-primary">Join in progress</Link>
      </div>
    )
  }
  if (room.status === 'COMPLETED') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-fg font-semibold mb-4">This room has ended.</p>
        <Link to={`/rooms/${code}/result`} className="btn-primary">View results</Link>
      </div>
    )
  }
  if (room.status === 'CANCELLED') {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-muted">This room was cancelled by the host.</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="qa-card p-5 mb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-black text-fg">{room.title}</h1>
            <p className="text-sm text-muted mt-1">Hosted by {room.host?.name} · {room.quiz?.title}</p>
          </div>
          <span className="badge-live shrink-0">Waiting…</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-muted mb-4">
          <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" />{liveCount}/{room.maxParticipants} joined</span>
          {locked ? <span className="flex items-center gap-1 text-coral-500"><FiLock className="w-3.5 h-3.5" />Locked</span>
                  : <span className="flex items-center gap-1"><FiUnlock className="w-3.5 h-3.5" />Open</span>}
        </div>

        <button onClick={copyLink} className="btn-secondary w-full inline-flex items-center justify-center gap-2 mb-1">
          {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
          <span className="font-mono tracking-widest">{room.code}</span> — {copied ? 'Copied!' : 'Copy join link'}
        </button>
      </div>

      {announcement && (
        <div className="qa-card p-3 mb-5 border-brand-500/30 bg-brand-500/5 text-sm text-fg">📢 {announcement}</div>
      )}

      {!hasJoined && !isHost ? (
        <form onSubmit={handleJoin} className="qa-card p-5 space-y-3">
          <p className="text-sm text-fg font-semibold">Join this room</p>
          {room.requiresPassword && (
            <input
              type="text" placeholder="Room password" value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)} className="qa-input w-full"
            />
          )}
          {error && <p className="text-coral-500 text-sm">{error}</p>}
          <button type="submit" disabled={joining} className="btn-primary w-full disabled:opacity-60">
            {joining ? 'Joining…' : 'Join Room'}
          </button>
        </form>
      ) : (
        <div className="qa-card p-5">
          <p className="text-sm text-muted mb-3">
            {isHost ? 'Start the room whenever your participants are ready.' : "You're in. Waiting for the host to start…"}
          </p>
          {isHost && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={start} className="btn-primary flex-1">Start Contest</button>
                <button onClick={() => lock(!locked)} className="btn-secondary flex-1">{locked ? 'Unlock' : 'Lock'} Room</button>
              </div>
              <div className="flex gap-2">
                <input
                  value={announceText} onChange={e => setAnnounceText(e.target.value)}
                  placeholder="Broadcast an announcement…" className="qa-input flex-1"
                />
                <button
                  onClick={() => { if (announceText.trim()) { announce(announceText); setAnnounceText('') } }}
                  className="btn-secondary shrink-0"
                >Send</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
