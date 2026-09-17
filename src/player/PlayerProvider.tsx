import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchPlayer } from '../firebase/players'
import { playerDocId } from '../game/identity'
import { PlayerContext } from './context'
import type { PlayerContextValue, PlayerSession } from './context'
import { clearStoredIdentity, readStoredIdentity, writeStoredIdentity } from './storage'

type Status = PlayerContextValue['status']

const storedDocId = (): string | null => {
  const stored = readStoredIdentity()
  if (!stored) return null
  try {
    return playerDocId(stored.name, stored.pin)
  } catch {
    clearStoredIdentity()
    return null
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [knownDocId] = useState(storedDocId)
  const [status, setStatus] = useState<Status>(knownDocId ? 'loading' : 'anonymous')
  const [session, setSession] = useState<PlayerSession | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!knownDocId) return undefined

    let cancelled = false
    void (async () => {
      try {
        const player = await fetchPlayer(knownDocId)
        if (cancelled) return
        if (!player) {
          clearStoredIdentity()
          setStatus('anonymous')
          return
        }
        setSession({ docId: knownDocId, player })
        setStatus('ready')
      } catch {
        // Réseau coupé : surtout pas d'onboarding, le joueur créerait un doublon.
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [knownDocId, attempt])

  const signIn = useCallback((next: PlayerSession) => {
    writeStoredIdentity({ name: next.player.name, pin: next.player.pin })
    setSession(next)
    setStatus('ready')
  }, [])

  const reload = useCallback(async () => {
    if (!session) return
    const player = await fetchPlayer(session.docId)
    if (player) setSession({ docId: session.docId, player })
  }, [session])

  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((previous) => previous + 1)
  }, [])

  const value = useMemo<PlayerContextValue>(
    () => ({ status, session, signIn, reload, retry }),
    [status, session, signIn, reload, retry],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
