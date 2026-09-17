export type SnakeConfig = {
  gridSize?: number
  targetApples?: number
  tickMs?: number
}

export type TetrisConfig = {
  cols?: number
  rows?: number
  targetLines?: number
  dropMs?: number
}

export type SudokuConfig = {
  cellsToRemove?: number
}

export type WordleConfig = {
  words: string[]
  maxAttempts?: number
}

export type JokerGame = 'snake' | 'tetris' | 'sudoku' | 'wordle'

export type JokerGhost =
  | { id: string; game: 'snake'; timeLimitSeconds: number; config: SnakeConfig }
  | { id: string; game: 'tetris'; timeLimitSeconds: number; config: TetrisConfig }
  | { id: string; game: 'sudoku'; timeLimitSeconds: number; config: SudokuConfig }
  | { id: string; game: 'wordle'; timeLimitSeconds: number; config: WordleConfig }

export type QuizGhost = {
  id: string
  question: string
  answer: string
  acceptedAnswers?: string[]
}

export type QuizResult = { id: string; correct: boolean; at: number }
export type JokerResult = { id: string; won: boolean; at: number }

export type PlayerDoc = {
  name: string
  pin: string
  ghosts: string[]
  quizzes: QuizResult[]
  jokers: JokerResult[]
  createdAt: number
}
