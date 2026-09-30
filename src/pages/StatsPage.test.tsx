import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LeaderboardEntry } from '../game/leaderboard'
import type { PlayerDoc } from '../game/types'

const players = vi.hoisted(() => ({ entries: null as LeaderboardEntry[] | null }))

vi.mock('../firebase/usePlayers', () => ({
  usePlayers: () => ({ entries: players.entries, failed: false, retry: () => {} }),
}))

const { StatsPage } = await import('./StatsPage')

const joueur = (docId: string, overrides: Partial<PlayerDoc>): LeaderboardEntry => ({
  docId,
  player: {
    name: docId,
    pin: '1234',
    ghosts: [],
    quizzes: [],
    jokers: [],
    createdAt: Date.parse('2026-10-01T10:00:00Z'),
    ...overrides,
  },
})

describe('StatsPage', () => {
  beforeEach(() => {
    players.entries = null
  })

  it('affiche un écran d’attente tant que rien n’est chargé', () => {
    render(<StatsPage />)
    expect(screen.getByText(/Calcul des statistiques/)).toBeInTheDocument()
  })

  it('affiche le taux de réussite des mini-jeux réellement tentés', () => {
    players.entries = [
      joueur('a', {
        jokers: [
          { id: '5ER5ZP', won: true, at: Date.parse('2026-10-02T10:00:00Z') },
          { id: 'K9GZ3J', won: false, at: Date.parse('2026-10-02T11:00:00Z') },
        ],
      }),
      joueur('b', { jokers: [{ id: '5ER5ZP', won: false, at: Date.parse('2026-10-03T10:00:00Z') }] }),
    ]

    render(<StatsPage />)

    expect(screen.getByText('Snake')).toBeInTheDocument()
    // 1 victoire sur 3 tentatives de snake.
    expect(screen.getByText('1 (33 %)')).toBeInTheDocument()
    // Les jeux jamais tentés ne polluent pas le tableau.
    expect(screen.queryByText('Sudoku')).not.toBeInTheDocument()
  })

  it('compte les joueurs et les fantômes blancs', () => {
    players.entries = [joueur('a', { ghosts: ['YMT58A', 'DWHJB3'] }), joueur('b', { ghosts: ['YMT58A'] })]
    render(<StatsPage />)
    expect(screen.getByText(/2 joueurs · 3 fantômes blancs trouvés/)).toBeInTheDocument()
  })

  it('n’affiche jamais de pourcentage sur une énigme jamais tentée', () => {
    players.entries = [joueur('a', {})]
    render(<StatsPage />)
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
