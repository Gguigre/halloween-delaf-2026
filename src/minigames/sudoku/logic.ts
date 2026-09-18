export type Random = () => number

/** 0 = case vide. Grille 6×6, blocs de 2 lignes × 3 colonnes (specs/11). */
export type Grid = number[][]

export const SIZE = 6
export const BLOCK_ROWS = 2
export const BLOCK_COLS = 3
export const SUDOKU_DEFAULTS = { cellsToRemove: 12 }

const shuffle = <T,>(items: T[], random: Random): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const emptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0))

/** Un chiffre peut-il être posé ici sans enfreindre ligne, colonne ou bloc ? */
export const canPlace = (grid: Grid, row: number, column: number, value: number): boolean => {
  for (let i = 0; i < SIZE; i += 1) {
    if (i !== column && grid[row][i] === value) return false
    if (i !== row && grid[i][column] === value) return false
  }

  const blockRow = Math.floor(row / BLOCK_ROWS) * BLOCK_ROWS
  const blockCol = Math.floor(column / BLOCK_COLS) * BLOCK_COLS
  for (let r = blockRow; r < blockRow + BLOCK_ROWS; r += 1) {
    for (let c = blockCol; c < blockCol + BLOCK_COLS; c += 1) {
      if ((r !== row || c !== column) && grid[r][c] === value) return false
    }
  }

  return true
}

const fill = (grid: Grid, index: number, random: Random): boolean => {
  if (index === SIZE * SIZE) return true
  const row = Math.floor(index / SIZE)
  const column = index % SIZE

  for (const value of shuffle([1, 2, 3, 4, 5, 6], random)) {
    if (!canPlace(grid, row, column, value)) continue
    grid[row][column] = value
    if (fill(grid, index + 1, random)) return true
    grid[row][column] = 0
  }

  return false
}

export const generateSolved = (random: Random): Grid => {
  const grid = emptyGrid()
  fill(grid, 0, random)
  return grid
}

/**
 * L'unicité de la solution n'est pas exigée : la victoire se juge sur la validité
 * de la grille remplie, pas sur sa correspondance avec la solution générée (specs/11).
 */
export const generatePuzzle = (
  cellsToRemove: number,
  random: Random,
): { puzzle: Grid; givens: boolean[][] } => {
  const solved = generateSolved(random)
  const puzzle = solved.map((row) => [...row])

  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => index),
    random,
  ).slice(0, Math.max(0, Math.min(SIZE * SIZE - 1, cellsToRemove)))

  for (const position of positions) {
    puzzle[Math.floor(position / SIZE)][position % SIZE] = 0
  }

  return {
    puzzle,
    givens: puzzle.map((row) => row.map((cell) => cell !== 0)),
  }
}

export const conflictsAt = (grid: Grid, row: number, column: number): boolean => {
  const value = grid[row][column]
  return value !== 0 && !canPlace(grid, row, column, value)
}

export const isComplete = (grid: Grid): boolean =>
  grid.every((row) => row.every((cell) => cell !== 0))

/** Valide contre les règles du Sudoku : une seconde solution valide est acceptée. */
export const isSolved = (grid: Grid): boolean => {
  if (!isComplete(grid)) return false
  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      if (!canPlace(grid, row, column, grid[row][column])) return false
    }
  }
  return true
}
