import { describe, expect, it } from 'vitest'
import { buildLeaderboard, progressPercent } from './leaderboard'
import type { LeaderboardEntry } from './leaderboard'
import type { PlayerDoc } from './types'

const entry = (docId: string, overrides: Partial<PlayerDoc>): LeaderboardEntry => ({
  docId,
  player: {
    name: docId,
    pin: '1234',
    ghosts: [],
    quizzes: [],
    jokers: [],
    createdAt: 1_000,
    ...overrides,
  },
})

describe('buildLeaderboard', () => {
  it('trie par score décroissant', () => {
    const rows = buildLeaderboard([
      entry('julie', { ghosts: ['A'] }),
      entry('marek', { ghosts: ['A', 'B', 'C'] }),
      entry('zoe', { ghosts: ['A', 'B'] }),
    ])
    expect(rows.map((row) => row.docId)).toEqual(['marek', 'zoe', 'julie'])
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3])
  })

  it('départage les ex æquo en mettant le plus ancien devant', () => {
    const rows = buildLeaderboard([
      entry('tardif', { ghosts: ['A'], quizzes: [{ id: 'Q', correct: true, at: 9_000 }] }),
      entry('rapide', { ghosts: ['A'], quizzes: [{ id: 'Q', correct: true, at: 2_000 }] }),
    ])
    expect(rows.map((row) => row.docId)).toEqual(['rapide', 'tardif'])
  })

  it('classe un score négatif en dernier, sans le tronquer', () => {
    const rows = buildLeaderboard([
      entry('malchanceux', { jokers: [{ id: 'J', won: false, at: 5 }] }),
      entry('prudent', { ghosts: ['A'] }),
    ])
    expect(rows[1].score).toBe(-30)
    expect(rows.map((row) => row.docId)).toEqual(['prudent', 'malchanceux'])
  })

  it('garde le prénom tel qu’il a été saisi', () => {
    const rows = buildLeaderboard([entry('jose-4271', { name: 'José' })])
    expect(rows[0].name).toBe('José')
  })

  it('ne casse pas sur une collection vide', () => {
    expect(buildLeaderboard([])).toEqual([])
  })
})

describe('progressPercent', () => {
  it('borne la barre entre 0 et 100%', () => {
    expect(progressPercent(-40)).toBe(0)
    expect(progressPercent(0)).toBe(0)
    expect(progressPercent(1_900)).toBe(100)
    expect(progressPercent(5_000)).toBe(100)
  })

  it('situe un score intermédiaire proportionnellement', () => {
    expect(progressPercent(950)).toBe(50)
  })
})
