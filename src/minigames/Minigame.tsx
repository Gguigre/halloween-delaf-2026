import { useEffect } from 'react'
import type { JokerGhost } from '../game/types'
import { SnakeGame } from './snake/SnakeGame'
import { SudokuGame } from './sudoku/SudokuGame'
import { TetrisGame } from './tetris/TetrisGame'
import { WordleGame } from './wordle/WordleGame'
import { pickWord } from './wordle/logic'
import type { MinigameResult } from './types'

type Props = {
  ghost: JokerGhost
  docId: string
  onFinish: (result: MinigameResult) => void
}

export function Minigame({ ghost, docId, onFinish }: Props) {
  // Pendant une partie, un appui involontaire sur la navigation coûterait 30 points.
  useEffect(() => {
    document.body.classList.add('playing')
    return () => document.body.classList.remove('playing')
  }, [])

  switch (ghost.game) {
    case 'snake':
      return (
        <SnakeGame
          config={ghost.config}
          timeLimitSeconds={ghost.timeLimitSeconds}
          onFinish={onFinish}
        />
      )
    case 'tetris':
      return (
        <TetrisGame
          config={ghost.config}
          timeLimitSeconds={ghost.timeLimitSeconds}
          onFinish={onFinish}
        />
      )
    case 'sudoku':
      return (
        <SudokuGame
          config={ghost.config}
          timeLimitSeconds={ghost.timeLimitSeconds}
          onFinish={onFinish}
        />
      )
    case 'wordle':
      return (
        <WordleGame
          config={{
            word: pickWord(ghost.config.words, docId, ghost.id),
            maxAttempts: ghost.config.maxAttempts,
          }}
          timeLimitSeconds={ghost.timeLimitSeconds}
          onFinish={onFinish}
        />
      )
  }
}
