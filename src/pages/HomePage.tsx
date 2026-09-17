import { FloatingGhost } from '../components/FloatingGhost'
import { Layout } from '../components/Layout'

export function HomePage() {
  return (
    <Layout>
      <h1 style={{ textAlign: 'center' }}>🎃 Chasse aux fantômes</h1>
      <FloatingGhost size={140} />
      <p style={{ textAlign: 'center' }}>
        Des fantômes sont cachés dans le service. Trouve-les, scanne-les, marque des points !
      </p>
    </Layout>
  )
}
