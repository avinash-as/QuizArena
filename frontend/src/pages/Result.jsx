import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ResultView from '../components/ResultView'

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state?.result) navigate('/contests', { replace: true })
  }, [state, navigate])

  if (!state?.result) return null
  const { result, newAchievements = [], contestId } = state
  return (
    <div data-testid="result-page">
      <ResultView
        result={result}
        newAchievements={newAchievements}
        contestId={contestId}
        onLeaderboard={() => navigate(`/contests/${contestId}`)}
        onMore={() => navigate('/contests')}
      />
    </div>
  )
}
