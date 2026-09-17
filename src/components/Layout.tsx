import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Layout.css'

type Props = {
  children: ReactNode
  /** Aucun écran ne doit être un cul-de-sac (specs/02). */
  footerLinks?: boolean
}

export function Layout({ children, footerLinks = true }: Props) {
  return (
    <div className="layout">
      <main className="layout-main">{children}</main>
      {footerLinks && (
        <nav className="layout-footer">
          <Link to="/leaderboard">🏆 Classement</Link>
          <Link to="/regles">📜 Règles</Link>
          <Link to="/">🎃 Accueil</Link>
        </nav>
      )}
    </div>
  )
}
