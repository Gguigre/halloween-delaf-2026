import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { basicGhosts, jokerGhosts, quizGhosts } from '../game/content'
import { BASIC_QR_BOX, basicArtFor } from '../game/ghostArt'
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

/** Simple étiquette : QR nu et identifiant, tant qu'aucun visuel n'est fourni. */
function QrOnly({ id, url }: { id: string; url: string }) {
  return (
    <figure className="qr">
      <QRCodeSVG value={url} size={128} level="M" />
      <figcaption>{id}</figcaption>
    </figure>
  )
}

/**
 * Le QR est posé en direct sur l'illustration, à l'emplacement du repère mesuré
 * sur les visuels fournis (`BASIC_QR_BOX`) : jamais une image de QR figée, pour
 * qu'une correction de `base` (specs/01) reste sans effet sur le matériel déjà
 * dessiné.
 */
function GhostCard({ id, url, art }: { id: string; url: string; art: string }) {
  return (
    <figure className="ghost-card">
      <div className="ghost-card-art">
        <img src={art} alt="" />
        <div
          className="ghost-card-qr"
          style={{
            left: `${BASIC_QR_BOX.x}%`,
            top: `${BASIC_QR_BOX.y}%`,
            width: `${BASIC_QR_BOX.w}%`,
            height: `${BASIC_QR_BOX.h}%`,
          }}
        >
          {/* `size` fixe un viewBox carré ; le CSS l'étire ensuite à la taille du
              repère mesuré sur le visuel — le contenu du QR reste net, vectoriel. */}
          <QRCodeSVG value={url} level="M" size={256} />
        </div>
      </div>
      <figcaption>{id}</figcaption>
    </figure>
  )
}

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
          <div
            className={`all-codes-grid ${section.key === 'basic' ? 'all-codes-grid-art' : ''}`}
          >
            {section.ids.map((id, index) =>
              section.key === 'basic' ? (
                <GhostCard
                  key={id}
                  id={id}
                  url={ghostUrl(section.route, id)}
                  art={basicArtFor(index)}
                />
              ) : (
                <QrOnly key={id} id={id} url={ghostUrl(section.route, id)} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
