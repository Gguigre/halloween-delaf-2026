export type Shape = number[][]
export type Board = number[][]
export type Random = () => number

export type Piece = {
  shape: Shape
  x: number
  y: number
}

export type TetrisRules = {
  cols: number
  rows: number
  targetLines: number
}

export type TetrisState = {
  board: Board
  piece: Piece | null
  lines: number
  over: boolean
  won: boolean
}

export const TETRIS_DEFAULTS = { cols: 8, rows: 14, targetLines: 3, dropMs: 700 }

/** Les sept tétrominos classiques, la valeur servant aussi de couleur. */
export const SHAPES: Shape[] = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
  ],
]

export const emptyBoard = (rules: TetrisRules): Board =>
  Array.from({ length: rules.rows }, () => Array.from({ length: rules.cols }, () => 0))

/** Rotation horaire simple : pas de SRS ni de rattrapage contre les murs (specs/10). */
export const rotateShape = (shape: Shape): Shape =>
  shape[0].map((_, column) => shape.map((row) => row[column]).reverse())

export const collides = (board: Board, shape: Shape, x: number, y: number): boolean => {
  for (let row = 0; row < shape.length; row += 1) {
    for (let column = 0; column < shape[row].length; column += 1) {
      if (shape[row][column] === 0) continue
      const boardY = y + row
      const boardX = x + column
      if (boardX < 0 || boardX >= board[0].length || boardY >= board.length) return true
      if (boardY >= 0 && board[boardY][boardX] !== 0) return true
    }
  }
  return false
}

export const spawnPiece = (rules: TetrisRules, random: Random): Piece => {
  const shape = SHAPES[Math.min(SHAPES.length - 1, Math.floor(random() * SHAPES.length))]
  return { shape, x: Math.floor((rules.cols - shape[0].length) / 2), y: 0 }
}

export const merge = (board: Board, piece: Piece): Board => {
  const next = board.map((row) => [...row])
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value === 0) return
      const y = piece.y + rowIndex
      const x = piece.x + columnIndex
      if (y >= 0 && y < next.length && x >= 0 && x < next[0].length) next[y][x] = value
    })
  })
  return next
}

export const clearLines = (board: Board): { board: Board; cleared: number } => {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = board.length - kept.length
  const empty = Array.from({ length: cleared }, () => board[0].map(() => 0))
  return { board: [...empty, ...kept], cleared }
}

export const createTetrisState = (rules: TetrisRules, random: Random): TetrisState => ({
  board: emptyBoard(rules),
  piece: spawnPiece(rules, random),
  lines: 0,
  over: false,
  won: false,
})

const moved = (state: TetrisState, dx: number, dy: number): TetrisState => {
  if (state.over || !state.piece) return state
  const { shape, x, y } = state.piece
  if (collides(state.board, shape, x + dx, y + dy)) return state
  return { ...state, piece: { shape, x: x + dx, y: y + dy } }
}

export const moveLeft = (state: TetrisState): TetrisState => moved(state, -1, 0)
export const moveRight = (state: TetrisState): TetrisState => moved(state, 1, 0)

export const rotate = (state: TetrisState): TetrisState => {
  if (state.over || !state.piece) return state
  const shape = rotateShape(state.piece.shape)
  // Une rotation impossible est simplement refusée, la pièce reste intacte.
  if (collides(state.board, shape, state.piece.x, state.piece.y)) return state
  return { ...state, piece: { ...state.piece, shape } }
}

/** Verrouille la pièce, efface les lignes pleines et fait apparaître la suivante. */
const lock = (state: TetrisState, rules: TetrisRules, random: Random): TetrisState => {
  if (!state.piece) return state
  const { board, cleared } = clearLines(merge(state.board, state.piece))
  const lines = state.lines + cleared

  if (lines >= rules.targetLines) {
    return { board, piece: null, lines, over: true, won: true }
  }

  const piece = spawnPiece(rules, random)
  if (collides(board, piece.shape, piece.x, piece.y)) {
    return { board, piece: null, lines, over: true, won: false }
  }

  return { board, piece, lines, over: false, won: false }
}

/** Un pas de chute : la pièce descend, ou se verrouille si elle ne peut plus. */
export const drop = (state: TetrisState, rules: TetrisRules, random: Random): TetrisState => {
  if (state.over || !state.piece) return state
  const descended = moved(state, 0, 1)
  if (descended !== state) return descended
  return lock(state, rules, random)
}

/** Indispensable en format chronométré : sans elle, le joueur passe son temps à attendre. */
export const hardDrop = (state: TetrisState, rules: TetrisRules, random: Random): TetrisState => {
  if (state.over || !state.piece) return state
  let current = state
  for (;;) {
    const next = moved(current, 0, 1)
    if (next === current) break
    current = next
  }
  return lock(current, rules, random)
}
