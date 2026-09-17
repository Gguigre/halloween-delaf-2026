import { describe, expect, it } from 'vitest'
import { createSnakeState, placeApple, step, turn } from './logic'
import type { SnakeRules, SnakeState } from './logic'

const rules: SnakeRules = { gridSize: 10, targetApples: 3 }
const never = () => 0

const state = (overrides: Partial<SnakeState> = {}): SnakeState => ({
  snake: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ],
  direction: 'right',
  nextDirection: 'right',
  apple: { x: 9, y: 9 },
  eaten: 0,
  started: true,
  over: false,
  won: false,
  ...overrides,
})

describe('déplacement', () => {
  it('avance d’une case dans la direction courante', () => {
    const next = step(state(), rules, never)
    expect(next.snake[0]).toEqual({ x: 6, y: 5 })
  })

  it('garde la même longueur sans pomme', () => {
    const next = step(state(), rules, never)
    expect(next.snake).toHaveLength(3)
  })

  it('applique la direction demandée au pas suivant', () => {
    const tourne = turn(state(), 'up')
    expect(tourne.direction).toBe('right')
    const next = step(tourne, rules, never)
    expect(next.snake[0]).toEqual({ x: 5, y: 4 })
    expect(next.direction).toBe('up')
  })
})

describe('demi-tour', () => {
  it('ignore le demi-tour immédiat sans tuer le serpent', () => {
    const tourne = turn(state(), 'left')
    expect(tourne.nextDirection).toBe('right')
    const next = step(tourne, rules, never)
    expect(next.over).toBe(false)
    expect(next.snake[0]).toEqual({ x: 6, y: 5 })
  })

  it('ignore aussi un demi-tour demandé en deux appuis rapprochés', () => {
    // Droite → haut → droite inverse : sans direction différée, le serpent
    // se retournerait sur lui-même et mourrait sur place.
    const deuxAppuis = turn(turn(state(), 'up'), 'left')
    expect(deuxAppuis.nextDirection).toBe('up')
  })
})

describe('collisions', () => {
  it('meurt contre un mur', () => {
    const next = step(state({ snake: [{ x: 9, y: 5 }] }), rules, never)
    expect(next.over).toBe(true)
    expect(next.won).toBe(false)
  })

  it('meurt contre son propre corps', () => {
    const enroule = state({
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
      ],
      direction: 'right',
      nextDirection: 'right',
    })
    const next = step(enroule, rules, never)
    expect(next.over).toBe(true)
    expect(next.won).toBe(false)
  })

  it('accepte de suivre sa propre queue, qui libère sa case', () => {
    // La tête vise (6,5), occupée par le dernier segment : il part au même pas.
    const poursuite = state({
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
      ],
      direction: 'right',
      nextDirection: 'right',
    })
    const next = step(poursuite, rules, never)
    expect(next.over).toBe(false)
    expect(next.snake[0]).toEqual({ x: 6, y: 5 })
  })
})

describe('pommes et victoire', () => {
  it('s’allonge d’une case et compte la pomme mangée', () => {
    const next = step(state({ apple: { x: 6, y: 5 } }), rules, never)
    expect(next.eaten).toBe(1)
    expect(next.snake).toHaveLength(4)
  })

  it('replace la pomme ailleurs que sur le serpent', () => {
    const next = step(state({ apple: { x: 6, y: 5 } }), rules, () => 0.5)
    expect(next.snake.some((part) => part.x === next.apple.x && part.y === next.apple.y)).toBe(
      false,
    )
  })

  it('gagne dès que l’objectif est atteint', () => {
    const next = step(state({ apple: { x: 6, y: 5 }, eaten: 2 }), rules, never)
    expect(next.eaten).toBe(3)
    expect(next.won).toBe(true)
    expect(next.over).toBe(true)
  })

  it('ne rejoue plus rien une fois la partie finie', () => {
    const fini = state({ over: true, won: true })
    expect(step(fini, rules, never)).toBe(fini)
    expect(turn(fini, 'up')).toBe(fini)
  })
})

describe('départ', () => {
  it('n’avance pas tant que le joueur n’a rien demandé', () => {
    const immobile = createSnakeState(10, () => 0.5)
    expect(immobile.started).toBe(false)
    expect(step(immobile, rules, never)).toBe(immobile)
  })

  it('démarre à la première commande, y compris un demi-tour refusé', () => {
    const immobile = createSnakeState(10, () => 0.5)
    expect(turn(immobile, 'up').started).toBe(true)
    // Le demi-tour reste ignoré : il ne doit pas non plus lancer la partie.
    expect(turn(immobile, 'left').started).toBe(false)
  })
})

describe('placement initial', () => {
  it('place le serpent et une pomme sur des cases distinctes', () => {
    const initial = createSnakeState(15, () => 0.42)
    expect(initial.snake).toHaveLength(3)
    expect(
      initial.snake.some((part) => part.x === initial.apple.x && part.y === initial.apple.y),
    ).toBe(false)
  })

  it('ne place jamais la pomme hors de la grille', () => {
    const apple = placeApple([], 10, () => 0.999999)
    expect(apple.x).toBeLessThan(10)
    expect(apple.y).toBeLessThan(10)
  })
})
