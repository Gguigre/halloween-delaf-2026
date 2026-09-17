import type { ReactNode } from 'react'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { usePlayerContext } from './context'
import { Onboarding } from './Onboarding'

/**
 * Porte posée devant la route demandée, pas une redirection : le joueur qui vient de
 * scanner retrouve son fantôme une fois son identité réglée, sans rescanner (specs/04).
 */
export function RequireIdentity({ children }: { children: ReactNode }) {
  const { status, retry } = usePlayerContext()

  if (status === 'loading') return <FloatingGhost size={120} />

  if (status === 'error') {
    return (
      <ErrorState
        title="Le jeu ne répond pas"
        message="On n'arrive pas à retrouver ta partie. Vérifie ta connexion, puis réessaie."
        onRetry={retry}
      />
    )
  }

  if (status === 'anonymous') return <Onboarding />

  return <>{children}</>
}
