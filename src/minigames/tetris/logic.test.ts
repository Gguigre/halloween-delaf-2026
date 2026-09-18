import { describe, expect, it } from 'vitest'
import {
  clearLines,
  collides,
  createTetrisState,
  drop,
  emptyBoard,
  hardDrop,
  moveLeft,
  moveRight,
  rotate,
  rotateShape,
} from './logic'
import type { Board, TetrisRules, TetrisState } from './logic'

const rules: TetrisRules = { cols: 6, rows: 8, targetLines: 2 }
const firstShape = () => 0

const board = (rows: string[]): Board =>
  rows.map((row) => [...row].map((cell) => (cell === '#' ? 1 : 0)))

const state = (overrides: Partial<TetrisState> = {}): TetrisState => ({
  board: emptyBoard(rules),
  piece: { shape: [[1, 1, 1, 1]], x: 1, y: 0 },
  lines: 0,
  over: false,
  won: false,
  ...overrides,
})

describe('rotation', () => {
  it('tourne une forme d’un quart de tour horaire', () => {
    expect(
      rotateShape([
        [0, 3, 0],
        [3, 3, 3],
      ]),
    ).toEqual([
      [3, 0],
      [3, 3],
      [3, 0],
    ])
  })

  it('refuse une rotation qui sortirait du plateau, sans casser la pièce', () => {
    // Barre verticale collée au bord droit : à l'horizontale elle déborderait.
    const contreLeMur = state({ piece: { shape: [[1], [1], [1], [1]], x: 5, y: 0 } })
    expect(rotate(contreLeMur)).toBe(contreLeMur)
  })

  it('refuse une rotation qui entrerait en collision', () => {
    const bloque = state({
      board: board(['......', '......', '.#....', '.#....', '.#....', '......', '......', '......']),
      piece: { shape: [[1, 1, 1, 1]], x: 1, y: 1 },
    })
    expect(rotate(bloque)).toBe(bloque)
  })
})

describe('collisions', () => {
  it('détecte les bords et le fond', () => {
    const plateau = emptyBoard(rules)
    expect(collides(plateau, [[1]], -1, 0)).toBe(true)
    expect(collides(plateau, [[1]], 6, 0)).toBe(true)
    expect(collides(plateau, [[1]], 0, 8)).toBe(true)
    expect(collides(plateau, [[1]], 0, 0)).toBe(false)
  })

  it('détecte les cases déjà occupées', () => {
    const plateau = board(['......', '......', '......', '......', '......', '......', '......', '#.....'])
    expect(collides(plateau, [[1]], 0, 7)).toBe(true)
    expect(collides(plateau, [[1]], 1, 7)).toBe(false)
  })

  it('laisse une pièce dépasser en haut du plateau', () => {
    expect(collides(emptyBoard(rules), [[1]], 0, -1)).toBe(false)
  })
})

describe('déplacements', () => {
  it('bouge à gauche et à droite', () => {
    expect(moveLeft(state()).piece?.x).toBe(0)
    expect(moveRight(state()).piece?.x).toBe(2)
  })

  it('refuse de sortir du plateau', () => {
    const colle = state({ piece: { shape: [[1, 1, 1, 1]], x: 0, y: 0 } })
    expect(moveLeft(colle)).toBe(colle)
  })
})

describe('effacement de lignes', () => {
  it('retire une ligne pleine et fait descendre le reste', () => {
    const resultat = clearLines(board(['......', '......', '......', '......', '......', '......', '#.....', '######']))
    expect(resultat.cleared).toBe(1)
    expect(resultat.board).toHaveLength(8)
    expect(resultat.board[7]).toEqual([1, 0, 0, 0, 0, 0])
    expect(resultat.board[0].every((cell) => cell === 0)).toBe(true)
  })

  it('retire plusieurs lignes d’un coup', () => {
    const resultat = clearLines(board(['......', '......', '......', '......', '......', '......', '######', '######']))
    expect(resultat.cleared).toBe(2)
    expect(resultat.board.every((row) => row.every((cell) => cell === 0))).toBe(true)
  })

  it('ne touche à rien quand aucune ligne n’est pleine', () => {
    const resultat = clearLines(board(['......', '......', '......', '......', '......', '......', '......', '#####.']))
    expect(resultat.cleared).toBe(0)
  })
})

describe('chute et fin de partie', () => {
  it('descend la pièce d’une ligne', () => {
    expect(drop(state(), rules, firstShape).piece?.y).toBe(1)
  })

  it('verrouille la pièce arrivée au fond et en fait apparaître une autre', () => {
    const auFond = state({ piece: { shape: [[1, 1, 1, 1]], x: 1, y: 7 } })
    const apres = drop(auFond, rules, firstShape)
    expect(apres.board[7].filter((cell) => cell !== 0)).toHaveLength(4)
    expect(apres.piece?.y).toBe(0)
  })

  it('gagne dès que l’objectif de lignes est atteint', () => {
    const presqueGagne = state({
      lines: 1,
      board: board(['......', '......', '......', '......', '......', '......', '......', '##...#']),
      piece: { shape: [[1, 1, 1]], x: 2, y: 7 },
    })
    const apres = drop(presqueGagne, rules, firstShape)
    expect(apres.lines).toBe(2)
    expect(apres.won).toBe(true)
    expect(apres.over).toBe(true)
  })

  it('perd quand une nouvelle pièce ne peut plus apparaître', () => {
    // Plateau presque plein mais sans aucune ligne complète : rien à effacer,
    // donc la pièce suivante n'a plus de place pour apparaître.
    const empile = state({
      board: board(['#####.', '#####.', '#####.', '#####.', '#####.', '#####.', '#####.', '......']),
      piece: { shape: [[1]], x: 0, y: 7 },
      lines: 0,
    })
    const apres = drop(empile, rules, firstShape)
    expect(apres.over).toBe(true)
    expect(apres.won).toBe(false)
  })

  it('ne rejoue plus rien une fois la partie finie', () => {
    const fini = state({ over: true, won: false, piece: null })
    expect(drop(fini, rules, firstShape)).toBe(fini)
    expect(rotate(fini)).toBe(fini)
    expect(moveLeft(fini)).toBe(fini)
  })
})

describe('chute instantanée', () => {
  it('pose la pièce tout en bas d’un coup', () => {
    const apres = hardDrop(state(), rules, firstShape)
    expect(apres.board[7].filter((cell) => cell !== 0)).toHaveLength(4)
  })
})

describe('partie initiale', () => {
  it('démarre sur un plateau vide avec une pièce', () => {
    const initial = createTetrisState(rules, () => 0.5)
    expect(initial.board.every((row) => row.every((cell) => cell === 0))).toBe(true)
    expect(initial.piece).not.toBeNull()
    expect(initial.lines).toBe(0)
  })
})
