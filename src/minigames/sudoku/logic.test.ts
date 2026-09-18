import { describe, expect, it } from 'vitest'
import {
  SIZE,
  canPlace,
  conflictsAt,
  generatePuzzle,
  generateSolved,
  isComplete,
  isSolved,
} from './logic'
import type { Grid } from './logic'

const solved: Grid = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [5, 6, 1, 2, 3, 4],
  [3, 4, 5, 6, 1, 2],
  [6, 1, 2, 3, 4, 5],
]

describe('générateur', () => {
  it('produit toujours une grille complète et valide', () => {
    for (let essai = 0; essai < 20; essai += 1) {
      expect(isSolved(generateSolved(Math.random))).toBe(true)
    }
  })

  it('produit une grille différente d’une partie à l’autre', () => {
    const grilles = new Set(
      Array.from({ length: 10 }, () => JSON.stringify(generateSolved(Math.random))),
    )
    expect(grilles.size).toBeGreaterThan(1)
  })

  it('retire le nombre de cases demandé et marque les indices de départ', () => {
    const { puzzle, givens } = generatePuzzle(12, Math.random)
    const vides = puzzle.flat().filter((cell) => cell === 0).length
    expect(vides).toBe(12)
    expect(givens.flat().filter(Boolean)).toHaveLength(SIZE * SIZE - 12)
  })

  it('laisse une grille de départ toujours résolvable', () => {
    for (let essai = 0; essai < 10; essai += 1) {
      const { puzzle } = generatePuzzle(12, Math.random)
      // Chaque indice restant respecte les règles : la solution d'origine tient toujours.
      for (let row = 0; row < SIZE; row += 1) {
        for (let column = 0; column < SIZE; column += 1) {
          if (puzzle[row][column] !== 0) expect(conflictsAt(puzzle, row, column)).toBe(false)
        }
      }
    }
  })
})

describe('validation', () => {
  it('accepte une grille complète et valide', () => {
    expect(isSolved(solved)).toBe(true)
  })

  it('refuse une grille incomplète', () => {
    const trouee = solved.map((row) => [...row])
    trouee[0][0] = 0
    expect(isComplete(trouee)).toBe(false)
    expect(isSolved(trouee)).toBe(false)
  })

  it('refuse un doublon en ligne, en colonne ou dans un bloc', () => {
    const doublonLigne = solved.map((row) => [...row])
    doublonLigne[0][1] = 1
    expect(isSolved(doublonLigne)).toBe(false)
  })

  it('accepte une solution valide différente de celle générée', () => {
    // Deux lignes d'un même bloc échangées : grille différente, toujours valide.
    const autre = [solved[1], solved[0], ...solved.slice(2)]
    expect(JSON.stringify(autre)).not.toBe(JSON.stringify(solved))
    expect(isSolved(autre)).toBe(true)
  })
})

describe('conflits', () => {
  it('signale la case en conflit, et seulement elle', () => {
    const grille = solved.map((row) => [...row])
    grille[0][1] = 1
    expect(conflictsAt(grille, 0, 1)).toBe(true)
    expect(conflictsAt(grille, 2, 2)).toBe(false)
  })

  it('ne signale jamais une case vide', () => {
    const grille = solved.map((row) => [...row])
    grille[3][3] = 0
    expect(conflictsAt(grille, 3, 3)).toBe(false)
  })

  it('ne considère pas une case comme en conflit avec elle-même', () => {
    expect(canPlace(solved, 0, 0, solved[0][0])).toBe(true)
  })
})
