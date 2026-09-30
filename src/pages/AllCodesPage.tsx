import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { basicGhosts, jokerGhosts, quizGhosts } from '../game/content'
import { artFor, jokerArt, quizArt } from '../game/ghostArt'
import type { GhostArt } from '../game/ghostArt'
import './AllCodesPage.css'

type Filter = 'all' | 'basic' | 'quiz' | 'joker'

/**
 * L'URL encodée dépend de l'adresse d'où la page est ouverte : ouverte en local,
 * elle produit des QR qui pointent vers localhost. Imprimer une page d'essai et la
 * scanner avec deux téléphones avant tout tirage en série (specs/15).
 */
const ghostUrl = (route: string, id: string): string =>
  `${window.location.origin}${import.meta.env.BASE_URL}#/${route}/${id}`

/**
 * Marge de silence autour du QR, en fraction du repère mesuré : sur un aplat de
 * couleur pleine (quiz, joker), rien ne sépare sinon le code du violet ou de
 * l'orange. Invisible sur les fantômes basiques, déjà blancs à cet endroit.
 */
const QUIET_ZONE_RATIO = 0.08

const SECTIONS = [
  {
    key: 'basic' as const,
    title: 'Fantômes basiques',
    route: 'ghost',
    ids: basicGhosts,
    art: (index: number) => artFor(index),
  },
  {
    key: 'quiz' as const,
    title: 'Fantômes quiz',
    route: 'quiz',
    ids: quizGhosts.map((g) => g.id),
    art: () => quizArt,
  },
  {
    key: 'joker' as const,
    title: 'Fantômes joker',
    route: 'joker',
    ids: jokerGhosts.map((g) => g.id),
    art: () => jokerArt,
  },
]

function GhostCard({ id, url, art }: { id: string; url: string; art: GhostArt }) {
  const { box } = art
  const pad = {
    x: box.x - QUIET_ZONE_RATIO * box.w,
    y: box.y - QUIET_ZONE_RATIO * box.h,
    w: box.w * (1 + 2 * QUIET_ZONE_RATIO),
    h: box.h * (1 + 2 * QUIET_ZONE_RATIO),
  }

  return (
    <figure className="ghost-card">
      <div className="ghost-card-art">
        <img src={art.src} alt="" />
        <div
          className="ghost-card-pad"
          style={{ left: `${pad.x}%`, top: `${pad.y}%`, width: `${pad.w}%`, height: `${pad.h}%` }}
        >
          {/* `size` fixe un viewBox carré ; le CSS l'étire à la taille du repère
              mesuré — le contenu du QR reste net, vectoriel. */}
          <QRCodeSVG value={url} level="M" size={256} className="ghost-card-qr" />
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
          <div className="all-codes-grid">
            {section.ids.map((id, index) => (
              <GhostCard
                key={id}
                id={id}
                url={ghostUrl(section.route, id)}
                art={section.art(index)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
