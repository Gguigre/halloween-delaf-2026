import { useCallback, useEffect, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import type { SnakeConfig } from '../../game/types'
import type { MinigameProps } from '../types'
import { useCountdown } from '../useCountdown'
import { SNAKE_DEFAULTS, createSnakeState, samePoint, step, turn } from './logic'
import type { Direction } from './logic'
import './SnakeGame.css'

export function SnakeGame({ config, timeLimitSeconds, onFinish }: MinigameProps<SnakeConfig>) {
  const gridSize = config.gridSize ?? SNAKE_DEFAULTS.gridSize
  const targetApples = config.targetApples ?? SNAKE_DEFAULTS.targetApples
  const tickMs = config.tickMs ?? SNAKE_DEFAULTS.tickMs

  const [state, setState] = useState(() => createSnakeState(gridSize, Math.random))

  // `onFinish` doit être appelé une seule fois par montage : une victoire pile au
  // moment où le chrono tombe à zéro ne doit pas produire deux appels.
  const finished = useRef(false)
  const finish = useRef(onFinish)
  useEffect(() => {
    finish.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (!state.over || finished.current) return
    finished.current = true
    finish.current({ won: state.won })
  }, [state.over, state.won])

  const stop = useCallback(() => {
    setState((previous) => (previous.over ? previous : { ...previous, over: true, won: false }))
  }, [])

  const secondsLeft = useCountdown(timeLimitSeconds, stop)

  useEffect(() => {
    if (state.over) return undefined
    const timer = setInterval(() => {
      setState((previous) =>
        previous.over ? previous : step(previous, { gridSize, targetApples }, Math.random),
      )
    }, tickMs)
    return () => clearInterval(timer)
  }, [state.over, gridSize, targetApples, tickMs])

  const steer = useCallback((direction: Direction) => {
    setState((previous) => turn(previous, direction))
  }, [])

  // Le clavier n'est qu'un confort de développement, jamais la seule entrée possible.
  useEffect(() => {
    const keys: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = keys[event.key]
      if (direction) {
        event.preventDefault()
        steer(direction)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [steer])

  const cells = Array.from({ length: gridSize * gridSize }, (_, index) => {
    const point = { x: index % gridSize, y: Math.floor(index / gridSize) }
    if (samePoint(point, state.snake[0])) return 'head'
    if (state.snake.some((part) => samePoint(part, point))) return 'body'
    if (samePoint(point, state.apple)) return 'apple'
    return 'empty'
  })

  return (
    <div className="snake">
      <div className="snake-header">
        <Countdown secondsLeft={secondsLeft} />
        <span className="snake-goal">
          🍎 {state.eaten} / {targetApples}
        </span>
      </div>

      {!state.started && (
        <p className="snake-hint">Appuie sur une flèche pour lancer le serpent.</p>
      )}

      <div
        className="snake-grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        aria-label="Grille du serpent"
      >
        {cells.map((kind, index) => (
          <div key={index} className={`snake-cell snake-${kind}`} />
        ))}
      </div>

      <div className="snake-pad">
        <button type="button" className="snake-btn up" onClick={() => steer('up')}>
          ▲
        </button>
        <button type="button" className="snake-btn left" onClick={() => steer('left')}>
          ◀
        </button>
        <button type="button" className="snake-btn right" onClick={() => steer('right')}>
          ▶
        </button>
        <button type="button" className="snake-btn down" onClick={() => steer('down')}>
          ▼
        </button>
      </div>
    </div>
  )
}
