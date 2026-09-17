import { useEffect } from 'react'
import type { JokerGhost } from '../game/types'
import { SnakeGame } from './snake/SnakeGame'
import type { MinigameResult } from './types'

type Props = {
  ghost: JokerGhost
  onFinish: (result: MinigameResult) => void
}

export function Minigame({ ghost, onFinish }: Props) {
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
    default:
      return null
  }
}
