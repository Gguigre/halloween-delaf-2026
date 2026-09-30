import { describe, expect, it } from 'vitest'
import { buildStats, rate } from './stats'
import type { Content } from './stats'
import type { LeaderboardEntry } from './leaderboard'
import type { PlayerDoc } from './types'

const content: Content = {
  basic: ['B1', 'B2', 'B3'],
  quizzes: [
    { id: 'Q1', question: 'Facile ?', answer: 'oui' },
    { id: 'Q2', question: 'Dure ?', answer: 'non' },
  ],
  jokers: [
    { id: 'J1', game: 'snake', timeLimitSeconds: 90, config: {} },
    { id: 'J2', game: 'sudoku', timeLimitSeconds: 180, config: {} },
    { id: 'J3', game: 'sudoku', timeLimitSeconds: 180, config: {} },
  ],
}

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

describe('buildStats', () => {
  it('compte les joueurs et les scans de fantômes basiques', () => {
    const stats = buildStats(
      [joueur('a', { ghosts: ['B1', 'B2'] }), joueur('b', { ghosts: ['B1'] })],
      content,
    )
    expect(stats.players).toBe(2)
    expect(stats.basicScans).toBe(3)
  })

  it('ne compte pas deux fois un fantôme écrit en double', () => {
    const stats = buildStats([joueur('a', { ghosts: ['B1', 'B1'] })], content)
    expect(stats.basicScans).toBe(1)
  })

  it('agrège les victoires par mini-jeu, pas seulement par fantôme', () => {
    const stats = buildStats(
      [
        joueur('a', {
          jokers: [
            { id: 'J2', won: true, at: 1 },
            { id: 'J3', won: false, at: 2 },
          ],
        }),
        joueur('b', { jokers: [{ id: 'J2', won: false, at: 3 }] }),
      ],
      content,
    )
    const sudoku = stats.byGame.find((game) => game.game === 'sudoku')
    expect(sudoku).toEqual({ game: 'sudoku', attempts: 3, wins: 1 })
  })

  it('garde la victoire quand un joker a été écrit deux fois', () => {
    const stats = buildStats(
      [
        joueur('a', {
          jokers: [
            { id: 'J1', won: false, at: 1 },
            { id: 'J1', won: true, at: 2 },
          ],
        }),
      ],
      content,
    )
    expect(stats.byJoker.find((joker) => joker.id === 'J1')).toEqual({
      id: 'J1',
      game: 'snake',
      attempts: 1,
      wins: 1,
    })
  })

  it('mesure la réussite de chaque énigme', () => {
    const stats = buildStats(
      [
        joueur('a', { quizzes: [{ id: 'Q1', correct: true, at: 1 }] }),
        joueur('b', { quizzes: [{ id: 'Q1', correct: false, at: 2 }] }),
        joueur('c', { quizzes: [{ id: 'Q2', correct: false, at: 3 }] }),
      ],
      content,
    )
    expect(stats.byQuiz.find((quiz) => quiz.id === 'Q1')).toMatchObject({ attempts: 2, correct: 1 })
    expect(stats.byQuiz.find((quiz) => quiz.id === 'Q2')).toMatchObject({ attempts: 1, correct: 0 })
  })

  it('liste les fantômes que personne n’a jamais touchés', () => {
    const stats = buildStats(
      [
        joueur('a', {
          ghosts: ['B1'],
          quizzes: [{ id: 'Q1', correct: true, at: 1 }],
          jokers: [{ id: 'J1', won: true, at: 2 }],
        }),
      ],
      content,
    )
    expect(stats.neverFound.basic).toEqual(['B2', 'B3'])
    expect(stats.neverFound.quiz).toEqual(['Q2'])
    expect(stats.neverFound.joker).toEqual(['J2', 'J3'])
  })

  it('regroupe l’activité par jour, du plus ancien au plus récent', () => {
    const stats = buildStats(
      [
        joueur('a', {
          quizzes: [{ id: 'Q1', correct: true, at: Date.parse('2026-10-03T09:00:00Z') }],
          jokers: [
            { id: 'J1', won: true, at: Date.parse('2026-10-01T09:00:00Z') },
            { id: 'J2', won: false, at: Date.parse('2026-10-03T18:00:00Z') },
          ],
        }),
      ],
      content,
    )
    expect(stats.activity).toEqual([
      { day: '2026-10-01', actions: 1 },
      { day: '2026-10-03', actions: 2 },
    ])
  })

  it('ne casse pas sur une collection vide', () => {
    const stats = buildStats([], content)
    expect(stats.players).toBe(0)
    expect(stats.neverFound.basic).toHaveLength(3)
    expect(stats.activity).toEqual([])
  })
})

describe('rate', () => {
  it('calcule un pourcentage entier', () => {
    expect(rate(1, 4)).toBe(25)
    expect(rate(2, 3)).toBe(67)
  })

  it('renvoie 0 quand rien n’a été tenté, sans NaN', () => {
    expect(rate(0, 0)).toBe(0)
  })
})
