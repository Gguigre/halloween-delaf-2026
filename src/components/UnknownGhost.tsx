import { FloatingGhost } from './FloatingGhost'

export function UnknownGhost() {
  return (
    <div className="center">
      <FloatingGhost size={110} />
      <h1>Ce n'est pas un fantôme !</h1>
      <p>
        Ce QR code ne correspond à aucun fantôme du jeu. Montre-le à l'organisateur, il saura
        quoi en faire.
      </p>
      <p className="muted">Rassure-toi : ça ne t'a coûté aucun point.</p>
    </div>
  )
}
