import { Link } from 'react-router-dom'
import { FloatingGhost } from '../components/FloatingGhost'
import { Layout } from '../components/Layout'

export function NotFoundPage() {
  return (
    <Layout footerLinks={false}>
      <FloatingGhost size={120} />
      <h1 style={{ textAlign: 'center' }}>Rien à voir ici...</h1>
      <p style={{ textAlign: 'center' }}>
        Ce fantôme s'est volatilisé, ou cette adresse n'existe pas.
      </p>
      <p style={{ textAlign: 'center' }}>
        <Link to="/">Retour à l'accueil</Link>
      </p>
    </Layout>
  )
}
