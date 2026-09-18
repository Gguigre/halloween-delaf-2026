import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { usePlayers } from '../firebase/usePlayers'
import { buildLeaderboard, progressPercent } from '../game/leaderboard'
import { usePlayerContext } from '../player/context'
import './LeaderboardPage.css'

export function LeaderboardPage() {
  const { session } = usePlayerContext()
  const { entries, failed, retry } = usePlayers()

  const rows = useMemo(() => buildLeaderboard(entries ?? []), [entries])
  const me = rows.find((row) => row.docId === session?.docId)

  if (failed && !entries) {
    return (
      <ErrorState
        title="Classement indisponible"
        message="On n'arrive pas à charger le classement. Vérifie ta connexion, puis réessaie."
        onRetry={retry}
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
