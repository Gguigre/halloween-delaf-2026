export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'
export type Random = () => number

export type SnakeRules = {
  gridSize: number
  targetApples: number
}

export type SnakeState = {
  snake: Point[] // tête en premier
  direction: Direction // direction du dernier déplacement
  nextDirection: Direction // direction demandée, appliquée au prochain pas
  apple: Point
  eaten: number
  started: boolean
  over: boolean
  won: boolean
}

export const SNAKE_DEFAULTS = { gridSize: 15, targetApples: 10, tickMs: 160 }

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y

export const placeApple = (occupied: Point[], gridSize: number, random: Random): Point => {
  const free: Point[] = []
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.some((point) => samePoint(point, { x, y }))) free.push({ x, y })
    }
  }
  if (free.length === 0) return occupied[0]
  return free[Math.min(free.length - 1, Math.floor(random() * free.length))]
}

export const createSnakeState = (gridSize: number, random: Random): SnakeState => {
  const middle = Math.floor(gridSize / 2)
  const snake = [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle },
  ]

  return {
    snake,
    direction: 'right',
    nextDirection: 'right',
    apple: placeApple(snake, gridSize, random),
    eaten: 0,
    started: false,
    over: false,
    won: false,
  }
}

/**
 * Le demi-tour est ignoré : sur une partie jouée au pouce, il ne servirait qu'à
 * tuer le serpent par inattention (specs/09). La direction demandée n'est appliquée
 * qu'au pas suivant, sinon deux appuis rapprochés permettraient de se retourner.
 */
export const turn = (state: SnakeState, direction: Direction): SnakeState => {
  if (state.over) return state
  if (direction === OPPOSITE[state.direction]) return state
  return { ...state, nextDirection: direction, started: true }
}

/**
 * Le serpent attend la première commande avant d'avancer : sinon il percute le mur
 * en une seconde, avant que le pouce ait atteint les flèches, et les 30 points
 * partent sans que le joueur ait joué. Le chrono, lui, tourne depuis le montage.
 */
export const step = (state: SnakeState, rules: SnakeRules, random: Random): SnakeState => {
  if (state.over || !state.started) return state

  const direction = state.nextDirection
  const delta = DELTAS[direction]
  const head = { x: state.snake[0].x + delta.x, y: state.snake[0].y + delta.y }

  const outside =
    head.x < 0 || head.y < 0 || head.x >= rules.gridSize || head.y >= rules.gridSize
  if (outside) return { ...state, direction, over: true, won: false }

  const eats = samePoint(head, state.apple)
  // Sans pomme, la queue libère sa case dans le même pas : la poursuivre est légal.
  const body = eats ? state.snake : state.snake.slice(0, -1)
  if (body.some((point) => samePoint(point, head))) {
    return { ...state, direction, over: true, won: false }
  }

  const snake = [head, ...body]
  const eaten = eats ? state.eaten + 1 : state.eaten
  const won = eaten >= rules.targetApples

  return {
    ...state,
    snake,
    direction,
    eaten,
    apple: eats && !won ? placeApple(snake, rules.gridSize, random) : state.apple,
    over: won,
    won,
  }
}
