import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { basicGhosts, jokerGhosts, quizGhosts } from '../game/content'
import './AllCodesPage.css'

type Filter = 'all' | 'basic' | 'quiz' | 'joker'

/**
 * L'URL encodée dépend de l'adresse d'où la page est ouverte : ouverte en local,
 * elle produit des QR qui pointent vers localhost. Imprimer une page d'essai et la
 * scanner avec deux téléphones avant tout tirage en série (specs/15).
 */
const ghostUrl = (route: string, id: string): string =>
  `${window.location.origin}${import.meta.env.BASE_URL}#/${route}/${id}`

const SECTIONS = [
  { key: 'basic' as const, title: 'Fantômes basiques', route: 'ghost', ids: basicGhosts },
  { key: 'quiz' as const, title: 'Fantômes quiz', route: 'quiz', ids: quizGhosts.map((g) => g.id) },
  {
    key: 'joker' as const,
    title: 'Fantômes joker',
    route: 'joker',
    ids: jokerGhosts.map((g) => g.id),
  },
]

export function AllCodesPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = SECTIONS.filter((section) => filter === 'all' || filter === section.key)
  const total = shown.reduce((sum, section) => sum + section.ids.length, 0)

  return (
    <div className="all-codes">
      <div className="all-codes-toolbar">
        <h1>QR codes à imprimer</h1>
        <div className="all-codes-filters">
          {(
            [
              ['all', 'Tous'],
              ['basic', 'Basiques'],
              ['quiz', 'Quiz'],
              ['joker', 'Jokers'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`btn ${filter === key ? 'btn-primary' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="muted">
          {total} QR code{total > 1 ? 's' : ''} · Avant tout tirage en série : imprimer une
          seule page, la scanner avec deux téléphones, et vérifier qu'elle ouvre bien le site
          déployé et non un serveur local.
        </p>
        <p className="muted">
          Adresse encodée : <code>{ghostUrl('ghost', 'XXXXXX')}</code>
        </p>
      </div>

      {shown.map((section) => (
        <section key={section.key} className="all-codes-section">
          <h2>{section.title}</h2>
          <div className="all-codes-grid">
            {section.ids.map((id) => (
              <figure key={id} className="qr">
                <QRCodeSVG value={ghostUrl(section.route, id)} size={128} level="M" />
                <figcaption>{id}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
