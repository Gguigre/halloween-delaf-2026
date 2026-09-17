import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { ResultBanner } from '../components/ResultBanner'
import { UnknownGhost } from '../components/UnknownGhost'
import { logGameEvent } from '../firebase/firebase'
import { markJokerWon, startJokerAttempt } from '../firebase/players'
import { findJokerGhost } from '../game/content'
import { POINTS_JOKER_LOSE, POINTS_JOKER_WIN } from '../game/scoring'
import { Minigame } from '../minigames/Minigame'
import { AVAILABLE_GAMES, GAME_LABELS, goalOf } from '../minigames/catalogue'
import type { MinigameResult } from '../minigames/types'
import { usePlayerContext, usePlayerSession } from '../player/context'

type Phase = 'briefing' | 'starting' | 'start-failed' | 'playing' | 'saving' | 'save-failed' | 'done'

export function JokerGhostPage() {
  const { id = '' } = useParams()
  const { docId, player } = usePlayerSession()
  const { reload } = usePlayerContext()
  const ghost = findJokerGhost(id)

  // Figé au montage, comme les autres écrans de scan (specs/05).
  const [previous] = useState(() => player.jokers?.find((joker) => joker.id === id))

  const [phase, setPhase] = useState<Phase>('briefing')
  const [won, setWon] = useState(false)

  if (!ghost) return <UnknownGhost />
  if (previous) return <JokerResult won={previous.won} replay />

  const playable = AVAILABLE_GAMES.includes(ghost.game)

  // Le lancement engage : sans cette écriture, un joueur qui voit qu'il va perdre
  // fermerait l'onglet sans jamais payer les 30 points (specs/08).
  const start = async () => {
    setPhase('starting')
    try {
      await startJokerAttempt(docId, id)
      logGameEvent('joker_started', { ghost: id, game: ghost.game })
      setPhase('playing')
    } catch {
      setPhase('start-failed')
    }
  }

  const save = async () => {
    setPhase('saving')
    try {
      await markJokerWon(docId, id)
      try {
        await reload()
      } catch {
        // Le score se rafraîchira au prochain chargement : la victoire est enregistrée.
      }
      setPhase('done')
    } catch {
      setPhase('save-failed')
    }
  }

  const onFinish = (result: MinigameResult) => {
    setWon(result.won)
    logGameEvent('joker_finished', { ghost: id, game: ghost.game, won: result.won })
    if (!result.won) {
      // La tentative perdue est déjà enregistrée : rien à réécrire.
      setPhase('done')
      return
    }
    void save()
  }

  if (phase === 'playing') return <Minigame ghost={ghost} onFinish={onFinish} />

  if (phase === 'starting' || phase === 'saving') {
    return (
      <div className="center">
        <FloatingGhost size={110} />
        <p className="pending">{phase === 'starting' ? 'On prépare la partie…' : 'On enregistre ta victoire…'}</p>
      </div>
    )
  }

  if (phase === 'start-failed') {
    return (
      <ErrorState
        message="Impossible de lancer la partie : ta connexion a lâché. Rien n'a été enregistré, tu peux réessayer."
        onRetry={() => void start()}
      />
    )
  }

  // Le joueur a gagné ses points : il doit pouvoir les récupérer (specs/08).
  if (phase === 'save-failed') {
    return (
      <div>
        <JokerResult won />
        <ErrorState
          title="Victoire pas encore enregistrée"
          message="Tu as gagné, mais la connexion a lâché avant qu'on puisse l'enregistrer. Réessaie pour récupérer tes points."
          onRetry={() => void save()}
        />
      </div>
    )
  }

  if (phase === 'done') return <JokerResult won={won} />

  return (
    <div>
      <h1 className="center">🃏 Fantôme joker</h1>

      <div className="card">
        <h2>{GAME_LABELS[ghost.game]}</h2>
        <p>
          Objectif : <strong>{goalOf(ghost)}</strong>
        </p>
        <p>
          Temps : <strong>{ghost.timeLimitSeconds} secondes</strong>
        </p>
        <p>
          Gagné : <strong className="gain">+50 points</strong> · Perdu :{' '}
          <strong className="loss">−30 points</strong>
        </p>
      </div>

      <div className="card card-warning">
        <p>
          <strong>Une fois lancé, quitter la partie compte comme une défaite.</strong>
        </p>
        <p className="muted">
          Tu peux partir maintenant sans rien perdre et revenir scanner ce fantôme plus tard.
          Lance seulement quand tu es tranquille.
        </p>
      </div>

      {playable ? (
        <button type="button" className="btn btn-primary" onClick={() => void start()}>
          Je lance la partie
        </button>
      ) : (
        <p className="center muted">Ce mini-jeu n'est pas encore prêt. Reviens bientôt !</p>
      )}
    </div>
  )
}

function JokerResult({ won, replay = false }: { won: boolean; replay?: boolean }) {
  return (
    <div>
      {replay && <p className="center muted">Tu as déjà tenté ce fantôme joker.</p>}
      <ResultBanner
        won={won}
        delta={won ? POINTS_JOKER_WIN : POINTS_JOKER_LOSE}
        title={won ? 'Bravo !' : 'Dommage…'}
      >
        <p>{won ? 'Joli coup, ce joker t’a rapporté gros.' : 'Ce joker t’a coûté cher. Il en reste d’autres à tenter !'}</p>
      </ResultBanner>
    </div>
  )
}
