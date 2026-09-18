import { useMemo, useState } from 'react'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { usePlayers } from '../firebase/usePlayers'
import { sanitize } from '../game/identity'
import { lastActionAt, scoreOf } from '../game/scoring'
import './AdminPage.css'

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Page d'organisateur, strictement en lecture seule (specs/18). Aucun écran joueur
 * n'y renvoie : on y accède en tapant l'URL.
 */
export function AdminPage() {
  const { entries, failed, retry } = usePlayers()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const needle = sanitize(search)
    return (entries ?? [])
      .map(({ docId, player }) => ({
        docId,
        name: player.name,
        pin: player.pin,
        score: scoreOf(player),
        basics: player.ghosts?.length ?? 0,
        quizzes: player.quizzes?.length ?? 0,
        quizzesOk: (player.quizzes ?? []).filter((quiz) => quiz.correct).length,
        jokers: player.jokers?.length ?? 0,
        jokersOk: (player.jokers ?? []).filter((joker) => joker.won).length,
        last: lastActionAt(player),
      }))
      .filter((row) => needle.length === 0 || sanitize(row.name).includes(needle))
      .sort((a, b) => b.score - a.score)
  }, [entries, search])

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
        <p className="pending">Chargement des joueurs…</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Organisateur</h1>
      <p className="muted">
        {entries.length} joueur{entries.length > 1 ? 's' : ''} · lecture seule, aucune
        modification possible depuis cette page.
      </p>

      <div className="field">
        <label htmlFor="search">Chercher un prénom</label>
        <input
          id="search"
          type="text"
          value={search}
          autoComplete="off"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <p className="muted">Aucun joueur ne correspond.</p>
      ) : (
        rows.map((row) => (
          <div key={row.docId} className="admin-row">
            <div className="admin-identity">
              <span className="admin-name">{row.name}</span>
              <span className="admin-pin">{row.pin}</span>
            </div>
            <p className="admin-details">
              {row.score} pts · 👻 {row.basics} · ❓ {row.quizzesOk}/{row.quizzes} · 🃏{' '}
              {row.jokersOk}/{row.jokers}
            </p>
            <p className="admin-meta">
              Dernière action : {formatDate(row.last)} · <code>{row.docId}</code>
            </p>
          </div>
        ))
      )}
    </div>
  )
}
