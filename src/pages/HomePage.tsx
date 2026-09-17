import { Link } from 'react-router-dom'
import { FloatingGhost } from '../components/FloatingGhost'
import { scoreOf } from '../game/scoring'
import { usePlayerSession } from '../player/context'

export function HomePage() {
  const { player } = usePlayerSession()

  return (
    <div>
      <h1 className="center">🎃 Chasse aux fantômes</h1>
      <FloatingGhost size={120} />

      <div className="card center">
        <h2>Salut {player.name} !</h2>
        <p className="muted">
          Ton code : <strong>{player.pin}</strong>
        </p>
        <p>
          Tu as <strong>{scoreOf(player)} points</strong>.
        </p>
      </div>

      <p className="center">
        Des fantômes en papier sont cachés dans le service. Trouve-les, scanne leur QR code,
        marque des points !
      </p>

      <Link to="/leaderboard" className="btn btn-primary center">
        Voir le classement
      </Link>
      <Link to="/regles" className="btn btn-secondary center">
        Comment ça marche ?
      </Link>
    </div>
  )
}
