import type { ReactNode } from 'react'
import './ResultBanner.css'

type Props = {
  won: boolean
  delta: number
  title?: string
  children?: ReactNode
}

const formatDelta = (delta: number) => `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`

export function ResultBanner({ won, delta, title, children }: Props) {
  const heading = title ?? (won ? 'Bravo !' : 'Dommage…')

  return (
    <div className={`result-banner ${won ? 'result-won' : 'result-lost'}`}>
      <div className="result-emoji">{won ? '🎉' : '💀'}</div>
      <h2 className="result-title">{heading}</h2>
      <p className="result-delta">
        {formatDelta(delta)} <span className="result-delta-unit">points</span>
      </p>
      {children && <div className="result-body">{children}</div>}
    </div>
  )
}
