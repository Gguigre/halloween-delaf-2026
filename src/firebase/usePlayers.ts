import { useEffect, useState } from 'react'
import type { LeaderboardEntry } from '../game/leaderboard'
import { subscribeToPlayers } from './players'

type Players = {
  entries: LeaderboardEntry[] | null
  failed: boolean
  retry: () => void
}

/**
 * Abonnement temps réel à la collection, suspendu quand l'onglet passe en
 * arrière-plan : sur un mois, un onglet oublié consommerait du quota pour
 * personne (specs/13).
 */
export const usePlayers = (): Players => {
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

  return {
    entries,
    failed,
    retry: () => {
      setFailed(false)
      setAttempt((previous) => previous + 1)
    },
  }
}
