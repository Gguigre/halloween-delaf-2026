import { FloatingGhost } from '../components/FloatingGhost'

export function NotFoundPage() {
  return (
    <div className="center">
      <FloatingGhost size={120} />
      <h1>Rien à voir ici…</h1>
      <p>Ce fantôme s'est volatilisé, ou cette adresse n'existe pas.</p>
    </div>
  )
}
