import { createContext, useContext } from 'react'
import type { PlayerDoc } from '../game/types'

export type PlayerSession = { docId: string; player: PlayerDoc }

export type PlayerContextValue = {
  status: 'loading' | 'anonymous' | 'ready' | 'error'
  session: PlayerSession | null
  signIn: (session: PlayerSession) => void
  reload: () => Promise<void>
  retry: () => void
}

export const PlayerContext = createContext<PlayerContextValue | null>(null)

export const usePlayerContext = (): PlayerContextValue => {
  const value = useContext(PlayerContext)
  if (!value) throw new Error('usePlayerContext doit être utilisé dans un PlayerProvider')
  return value
}

/** Raccourci pour les écrans placés derrière `RequireIdentity` : la session y est garantie. */
export const usePlayerSession = (): PlayerSession => {
  const { session } = usePlayerContext()
  if (!session) throw new Error('Aucune session joueur : écran mal protégé')
  return session
}
