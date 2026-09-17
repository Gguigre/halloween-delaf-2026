import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FloatingGhost } from '../components/FloatingGhost'
import { ResultBanner } from '../components/ResultBanner'
import { logGameEvent } from '../firebase/firebase'
import { addBasicGhost } from '../firebase/players'
import { isBasicGhost } from '../game/content'
import { POINTS_BASIC } from '../game/scoring'
import { usePlayerContext, usePlayerSession } from '../player/context'

type Status = 'pending' | 'success' | 'error'

export function BasicGhostPage() {
  const { id = '' } = useParams()
  const { docId, player } = usePlayerSession()
  const { reload } = usePlayerContext()

  const known = isBasicGhost(id)
  // Figé au montage : sans ça, l'écriture qu'on vient de faire basculerait
  // l'écran de succès sur « déjà trouvé » (specs/05, specs/06).
  const [alreadyFound] = useState(() => player.ghosts?.includes(id) ?? false)
  const [status, setStatus] = useState<Status>(
    known && !alreadyFound ? 'pending' : 'success',
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!known || alreadyFound) return undefined

    let cancelled = false
    void (async () => {
      try {
        await addBasicGhost(docId, id)
        logGameEvent('basic_ghost_found', { ghost: id })
        try {
          await reload()
        } catch {
          // Le score se rafraîchira au prochain chargement : l'écriture, elle, est passée.
        }
        if (!cancelled) setStatus('success')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [docId, id, known, alreadyFound, attempt, reload])

  if (!known) {
    return (
      <div className="center">
        <FloatingGhost size={110} />
        <h1>Ce n'est pas un fantôme !</h1>
        <p>
          Ce QR code ne correspond à aucun fantôme du jeu. Montre-le à l'organisateur, il
          saura quoi en faire.
        </p>
        <p className="muted">Rassure-toi : ça ne t'a coûté aucun point.</p>
      </div>
    )
  }

  if (alreadyFound) {
    return (
      <div className="center">
        <FloatingGhost size={110} />
        <h1>Tu as déjà trouvé ce fantôme !</h1>
        <p>Celui-ci est déjà dans ta besace. Va en chercher un autre !</p>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="center">
        <FloatingGhost size={110} />
        <p className="pending">On attrape ce fantôme…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        message="On n'arrive pas à confirmer ce fantôme : ta connexion a lâché. Réessaie, tes points ne sont pas perdus."
        onRetry={() => {
          setStatus('pending')
          setAttempt((previous) => previous + 1)
        }}
      />
    )
  }

  return (
    <div>
      <FloatingGhost size={110} />
      <ResultBanner won delta={POINTS_BASIC} title="Fantôme attrapé !">
        <p>Un fantôme de plus à ton tableau de chasse.</p>
      </ResultBanner>
    </div>
  )
}
