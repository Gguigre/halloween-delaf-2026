import { useMemo } from 'react'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { usePlayers } from '../firebase/usePlayers'
import { basicGhosts, jokerGhosts, quizGhosts } from '../game/content'
import { buildStats, rate } from '../game/stats'
import { GAME_LABELS } from '../minigames/catalogue'
import './StatsPage.css'

const formatDay = (day: string): string =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })

/** Page d'organisateur, en lecture seule, liée depuis aucun écran joueur. */
export function StatsPage() {
  const { entries, failed, retry } = usePlayers()

  const stats = useMemo(
    () =>
      buildStats(entries ?? [], {
        basic: basicGhosts,
        quizzes: quizGhosts,
        jokers: jokerGhosts,
      }),
    [entries],
  )

  if (failed && !entries) {
    return (
      <ErrorState
        title="Lecture impossible"
        message="On n'arrive pas à lire la collection. Vérifie la connexion, puis réessaie."
        onRetry={retry}
      />
    )
  }

  if (!entries) {
    return (
      <div className="center">
        <FloatingGhost size={90} />
        <p className="pending">Calcul des statistiques…</p>
      </div>
    )
  }

  const peak = Math.max(1, ...stats.activity.map((day) => day.actions))
  const playedGames = stats.byGame.filter((game) => game.attempts > 0)

  return (
    <div>
      <h1>Statistiques</h1>
      <p className="muted">
        {stats.players} joueur{stats.players > 1 ? 's' : ''} · {stats.basicScans} fantôme
        {stats.basicScans > 1 ? 's' : ''} blanc{stats.basicScans > 1 ? 's' : ''} trouvé
        {stats.basicScans > 1 ? 's' : ''}
      </p>

      <h2>Les mini-jeux sont-ils trop durs ?</h2>
      {playedGames.length === 0 ? (
        <p className="muted">Aucun joker tenté pour l'instant.</p>
      ) : (
        <table className="stats-table">
          <thead>
            <tr>
              <th>Jeu</th>
              <th>Tentatives</th>
              <th>Réussite</th>
            </tr>
          </thead>
          <tbody>
            {playedGames.map((game) => {
              const percent = rate(game.wins, game.attempts)
              return (
                <tr key={game.game}>
                  <td>{GAME_LABELS[game.game]}</td>
                  <td>{game.attempts}</td>
                  <td className={percent < 25 ? 'loss' : percent > 75 ? 'gain' : undefined}>
                    {game.wins} ({percent} %)
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <p className="muted">
        Sous 25 % de réussite, le jeu est probablement trop dur : les objectifs et les durées
        s'ajustent dans <code>jokerGhosts.json</code>.
      </p>

      <h2>Les énigmes</h2>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Réponse</th>
            <th>Tentées</th>
            <th>Justes</th>
          </tr>
        </thead>
        <tbody>
          {stats.byQuiz.map((quiz) => {
            const percent = rate(quiz.correct, quiz.attempts)
            return (
              <tr key={quiz.id}>
                <td>
                  {quiz.answer}
                  <span className="stats-id">{quiz.id}</span>
                </td>
                <td>{quiz.attempts}</td>
                <td className={quiz.attempts > 0 && percent < 30 ? 'loss' : undefined}>
                  {quiz.attempts === 0 ? '—' : `${quiz.correct} (${percent} %)`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2>Jamais trouvés</h2>
      <p className="muted">
        Un fantôme que personne n'a scanné après deux semaines est probablement mal caché, ou
        son QR ne fonctionne pas.
      </p>
      <div className="card">
        <p>
          <strong>Blancs</strong> : {stats.neverFound.basic.length} / {basicGhosts.length}
        </p>
        <p className="stats-ids">{stats.neverFound.basic.join(' · ') || 'tous trouvés 🎉'}</p>
        <p>
          <strong>Quiz</strong> : {stats.neverFound.quiz.length} / {quizGhosts.length}
        </p>
        <p className="stats-ids">{stats.neverFound.quiz.join(' · ') || 'tous trouvés 🎉'}</p>
        <p>
          <strong>Jokers</strong> : {stats.neverFound.joker.length} / {jokerGhosts.length}
        </p>
        <p className="stats-ids">{stats.neverFound.joker.join(' · ') || 'tous trouvés 🎉'}</p>
      </div>

      <h2>Activité</h2>
      {stats.activity.length === 0 ? (
        <p className="muted">Rien à afficher pour l'instant.</p>
      ) : (
        <div className="stats-activity">
          {stats.activity.map((day) => (
            <div key={day.day} className="stats-day">
              <span className="stats-day-label">{formatDay(day.day)}</span>
              <span className="stats-bar" style={{ width: `${(day.actions / peak) * 100}%` }} />
              <span className="stats-day-count">{day.actions}</span>
            </div>
          ))}
        </div>
      )}
      <p className="muted">
        Seuls les quiz et les jokers sont horodatés : les fantômes blancs ne comptent pas dans
        cette courbe, le modèle de données ne garde pas leur date.
      </p>
    </div>
  )
}
