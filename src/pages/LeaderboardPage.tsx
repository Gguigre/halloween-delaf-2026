import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { subscribeToPlayers } from '../firebase/players'
import { buildLeaderboard, progressPercent } from '../game/leaderboard'
import type { LeaderboardEntry } from '../game/leaderboard'
import { usePlayerContext } from '../player/context'
import './LeaderboardPage.css'

export function LeaderboardPage() {
  const { session } = usePlayerContext()
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const start = () => {
      if (unsubscribe) return
      unsubscribe = subscribeToPlayers(
        (next) => {
          setEntries(next)
          setFailed(false)
        },
        () => setFailed(true),
      )
    }

    // Le jeu dure un mois : un onglet oublié en arrière-plan consommerait
    // du quota Firestore pour personne (specs/13).
    const stop = () => {
      unsubscribe?.()
      unsubscribe = null
    }

    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stop()
    }
  }, [attempt])

  const rows = useMemo(() => buildLeaderboard(entries ?? []), [entries])
  const me = rows.find((row) => row.docId === session?.docId)

  if (failed && !entries) {
    return (
      <ErrorState
        title="Classement indisponible"
        message="On n'arrive pas à charger le classement. Vérifie ta connexion, puis réessaie."
        onRetry={() => {
          setFailed(false)
          setAttempt((previous) => previous + 1)
        }}
      />
    )
  }

  if (!entries) {
    return (
      <div className="center">
        <FloatingGhost size={100} />
        <p className="pending">On compte les points…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="center">🏆 Classement</h1>

      {me && (
        <div className="card my-rank">
          <p className="my-rank-line">
            Tu es <strong>{me.rank === 1 ? '1er' : `${me.rank}e`}</strong> avec{' '}
            <strong className={me.score < 0 ? 'score-negative' : undefined}>
              {me.score} points
            </strong>
          </p>
          <div className="progress" aria-hidden="true">
            <div className="progress-bar" style={{ width: `${progressPercent(me.score)}%` }} />
          </div>
          <p className="muted">
            Ton code : <strong>{session?.player.pin}</strong>
          </p>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="center muted">Personne n'a encore attrapé de fantôme. À toi de jouer !</p>
      ) : (
        <ol className="board">
          {rows.map((row) => (
            <li
              key={row.docId}
              className={`board-row ${row.docId === session?.docId ? 'board-row-me' : ''}`}
            >
              <span className="board-rank">{row.rank}</span>
              <span className="board-name">
                {row.docId === session?.docId && '⭐ '}
                {row.name}
              </span>
              <span className={`board-score ${row.score < 0 ? 'score-negative' : ''}`}>
                {row.score}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="center muted">
        Un score peut être négatif : <Link to="/regles">c'est expliqué ici</Link>.
      </p>
    </div>
  )
}
