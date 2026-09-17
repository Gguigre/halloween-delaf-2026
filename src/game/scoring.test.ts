import { describe, expect, it } from 'vitest'
import { MAX_SCORE, lastActionAt, scoreOf } from './scoring'
import type { PlayerDoc } from './types'

const player = (overrides: Partial<PlayerDoc> = {}): PlayerDoc => ({
  name: 'Julie',
  pin: '4271',
  ghosts: [],
  quizzes: [],
  jokers: [],
  createdAt: 1_000,
  ...overrides,
})

describe('scoreOf', () => {
  it('compte 10 points par fantôme basique', () => {
    expect(scoreOf(player({ ghosts: ['AB23CD', 'EF45GH'] }))).toBe(20)
  })

  it('compte +20 par quiz réussi et −10 par quiz raté', () => {
    const doc = player({
      quizzes: [
        { id: 'Q1', correct: true, at: 1 },
        { id: 'Q2', correct: false, at: 2 },
      ],
    })
    expect(scoreOf(doc)).toBe(10)
  })

  it('compte +50 par joker gagné et −30 par joker perdu', () => {
    const doc = player({
      jokers: [
        { id: 'J1', won: true, at: 1 },
        { id: 'J2', won: false, at: 2 },
      ],
    })
    expect(scoreOf(doc)).toBe(20)
  })

  it('additionne les cinq termes du barème', () => {
    const doc = player({
      ghosts: ['A', 'B', 'C'],
      quizzes: [
        { id: 'Q1', correct: true, at: 1 },
        { id: 'Q2', correct: false, at: 2 },
      ],
      jokers: [
        { id: 'J1', won: true, at: 3 },
        { id: 'J2', won: false, at: 4 },
      ],
    })
    expect(doc.ghosts.length * 10 + 20 - 10 + 50 - 30).toBe(scoreOf(doc))
    expect(scoreOf(doc)).toBe(60)
  })

  it('laisse le score devenir négatif, sans plancher à 0', () => {
    const doc = player({
      quizzes: [{ id: 'Q1', correct: false, at: 1 }],
      jokers: [{ id: 'J1', won: false, at: 2 }],
    })
    expect(scoreOf(doc)).toBe(-40)
  })

  it('ne compte pas deux fois un fantôme basique écrit en double', () => {
    expect(scoreOf(player({ ghosts: ['AB23CD', 'AB23CD'] }))).toBe(10)
  })

  it('ne compte qu’une fois un quiz écrit deux fois, en gardant la première tentative', () => {
    const doc = player({
      quizzes: [
        { id: 'Q1', correct: false, at: 1 },
        { id: 'Q1', correct: true, at: 2 },
      ],
    })
    expect(scoreOf(doc)).toBe(-10)
  })

  it('ne compte qu’une fois un joker, en gardant la victoire', () => {
    const doc = player({
      jokers: [
        { id: 'J1', won: false, at: 1 },
        { id: 'J1', won: true, at: 2 },
      ],
    })
    expect(scoreOf(doc)).toBe(50)
  })

  it('vaut 1900 au maximum théorique', () => {
    expect(MAX_SCORE).toBe(1900)
  })

  it('survit à un document dont les listes sont absentes', () => {
    const partial = { name: 'Julie', pin: '4271', createdAt: 1 } as PlayerDoc
    expect(scoreOf(partial)).toBe(0)
  })
})

describe('lastActionAt', () => {
  it('prend l’horodatage le plus récent, création comprise', () => {
    const doc = player({
      createdAt: 100,
      quizzes: [{ id: 'Q1', correct: true, at: 500 }],
      jokers: [{ id: 'J1', won: false, at: 300 }],
    })
    expect(lastActionAt(doc)).toBe(500)
  })

  it('retombe sur la création quand rien n’a été tenté', () => {
    expect(lastActionAt(player({ createdAt: 42 }))).toBe(42)
  })
})
