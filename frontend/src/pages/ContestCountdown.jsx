import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contestAPI } from '../services/api'
import BigCountdown from '../components/BigCountdown'
import LoadingSpinner from '../components/LoadingSpinner'

// Full-screen "waiting room" shown after a user joins a contest that hasn't
// started yet. Ticks down to contest.startTime; once the countdown hits
// zero, it polls the backend every few seconds until the contest actually
// flips to LIVE (the scheduler cron runs once a minute — see
// backend/src/jobs/contestScheduler.js — so there can be up to a ~1 minute
// gap between "countdown says 0" and "status says LIVE"; this poll bridges
// that gap instead of leaving the user stuck on 00:00:00).
export default function ContestCountdown() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pollRef = useRef(null)

  const fetchContest = useCallback(async () => {
    try {
      const { data } = await contestAPI.getOne(id)
      setContest(data.contest)
      if (!data.hasJoined) {
        navigate(`/contests/${id}`, { replace: true })
        return
      }
      if (['LIVE', 'live'].includes(data.contest.status)) {
        navigate(`/quiz/${id}`, { replace: true })
        return
      }
      if (['COMPLETED', 'completed', 'CANCELLED', 'cancelled'].includes(data.contest.status)) {
        navigate(`/contests/${id}`, { replace: true })
        return
      }
      return data.contest
    } catch (e) {
      setError('Could not load contest')
      return null
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchContest() }, [fetchContest])

  const handleCountdownComplete = useCallback(() => {
    // Countdown hit zero but contest may not have flipped to LIVE yet
    // (scheduler runs on a ~1 minute cron tick) — poll until it does.
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      const c = await fetchContest()
      if (c && ['LIVE', 'live'].includes(c.status)) {
        clearInterval(pollRef.current)
      }
    }, 3000)
  }, [fetchContest])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !contest) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">{error || 'Contest not found'}</div>
  )

  return (
    <BigCountdown
      targetTime={contest.startTime}
      label="Your contest starts at"
      sublabel={`${contest.title} · ${new Date(contest.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`}
      onComplete={handleCountdownComplete}
    />
  )
}
